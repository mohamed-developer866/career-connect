var express = require('express');
var router = express.Router();
var { PrismaClient } = require('@prisma/client');
var prisma = new PrismaClient();
var auth = require('../../middlewares/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/resumes/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['.pdf', '.doc', '.docx'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF, DOC, DOCX files are allowed'));
  }
};

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
  fileFilter: fileFilter
});

// ========== APPLICATION ROUTES ==========

// POST /api/applications/apply — Student applies with file upload
router.post('/applications/apply', auth, upload.single('resume'), async function(req, res) {
  try {
    if (req.user.role !== 'STUDENT') {
      return res.status(403).json({ error: 'Only students can apply for jobs' });
    }
    
    const { jobId, studentName, studentEmail, college, department } = req.body;
    
    // Check if already applied
    const existingApplication = await prisma.jobApplication.findFirst({
      where: {
        jobId: jobId,
        studentId: req.user.id
      }
    });
    
    if (existingApplication) {
      return res.status(400).json({ error: 'You have already applied for this job', alreadyApplied: true });
    }
    
    // Get job details
    const job = await prisma.job.findUnique({
      where: { id: jobId }
    });
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    if (job.status !== 'approved') {
      return res.status(400).json({ error: 'This job is not available for applications' });
    }
    
    // Save resume file info
    let resumePath = null;
    let resumeFileName = null;
    if (req.file) {
      resumePath = req.file.path;
      resumeFileName = req.file.originalname;
    }
    
    // Create application
    const application = await prisma.jobApplication.create({
      data: {
        jobId: jobId,
        studentId: req.user.id,
        studentName: studentName || req.user.fullName,
        studentEmail: studentEmail || req.user.email,
        college: college || req.user.college,
        department: department || req.user.department,
        resume: resumePath,
        resumeFileName: resumeFileName,
        status: 'Applied',
        matchScore: calculateMatchScore(req.user.skills, job.skills)
      }
    });
    
    console.log('✅ Application created:', application.id);
    res.status(201).json(application);
  } catch (err) {
    console.error('Error applying for job:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/applications/my — Get student's applications
router.get('/applications/my', auth, async function(req, res) {
  try {
    if (req.user.role !== 'STUDENT') {
      return res.status(403).json({ error: 'Only students can view their applications' });
    }
    
    const applications = await prisma.jobApplication.findMany({
      where: { studentId: req.user.id },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            company: true,
            location: true,
            type: true,
            salaryMin: true,
            salaryMax: true,
            deadline: true
          }
        }
      },
      orderBy: { appliedAt: 'desc' }
    });
    
    res.json(applications);
  } catch (err) {
    console.error('Error fetching applications:', err);
    res.status(500).json({ error: err.message, applications: [] });
  }
});

// GET /api/jobs/employer/applications — Employer sees all applications for their jobs with resume download
router.get('/employer/applications', auth, async function(req, res) {
  try {
    if (req.user.role !== 'EMPLOYER') {
      return res.status(403).json({ error: 'Only employers can view applications' });
    }
    
    // Get all jobs posted by this employer
    const jobs = await prisma.job.findMany({
      where: { postedBy: req.user.id },
      include: {
        applications: {
          include: {
            student: {
              select: {
                id: true,
                fullName: true,
                email: true,
                college: true,
                department: true,
                skills: true
              }
            }
          },
          orderBy: { appliedAt: 'desc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json({ jobs });
  } catch (err) {
    console.error('Error fetching employer applications:', err);
    res.status(500).json({ error: err.message, jobs: [] });
  }
});

// GET /api/applications/:id/resume — Download resume file
router.get('/applications/:id/resume', auth, async function(req, res) {
  try {
    const application = await prisma.jobApplication.findUnique({
      where: { id: req.params.id }
    });
    
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }
    
    // Check if user is authorized (employer who owns the job or the student themselves)
    const job = await prisma.job.findUnique({
      where: { id: application.jobId }
    });
    
    const isEmployer = req.user.role === 'EMPLOYER' && job?.postedBy === req.user.id;
    const isStudent = req.user.role === 'STUDENT' && application.studentId === req.user.id;
    
    if (!isEmployer && !isStudent) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    if (!application.resume || !fs.existsSync(application.resume)) {
      return res.status(404).json({ error: 'Resume file not found' });
    }
    
    // Send file for download
    res.download(application.resume, application.resumeFileName || 'resume.pdf');
  } catch (err) {
    console.error('Error downloading resume:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/applications/:id/status — Employer updates application status
router.put('/applications/:id/status', auth, async function(req, res) {
  try {
    if (req.user.role !== 'EMPLOYER') {
      return res.status(403).json({ error: 'Only employers can update application status' });
    }
    
    // Check if employer owns the job
    const application = await prisma.jobApplication.findUnique({
      where: { id: req.params.id },
      include: { job: true }
    });
    
    if (!application || application.job.postedBy !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    const updated = await prisma.jobApplication.update({
      where: { id: req.params.id },
      data: { status: req.body.status }
    });
    
    console.log('✅ Application status updated:', req.params.id, '→', req.body.status);
    res.json(updated);
  } catch (err) {
    console.error('Error updating application status:', err);
    res.status(500).json({ error: err.message });
  }
});

// ... rest of your existing routes (GET /api/jobs/approved, etc.)

module.exports = router;