var express = require('express');
var router = express.Router();
var { PrismaClient } = require('@prisma/client');
var prisma = new PrismaClient();
var auth = require('../../middlewares/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const jobService = require('./job.service');

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
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: fileFilter
});

// Helper function
function calculateMatchScore(studentSkills, jobSkills) {
  if (!studentSkills || !jobSkills) return 50;
  const sSkills = Array.isArray(studentSkills) 
    ? studentSkills.map(s => s.name?.toLowerCase() || '') 
    : [];
  const jSkills = jobSkills.toLowerCase().split(',').map(s => s.trim());
  if (jSkills.length === 0) return 50;
  const matchCount = jSkills.filter(skill => 
    sSkills.some(s => s.includes(skill) || skill.includes(s))
  ).length;
  return Math.round((matchCount / jSkills.length) * 100);
}

// ========== JOB ROUTES ==========

// GET /api/jobs/approved — Students see approved jobs
router.get('/approved', auth, async function(req, res) {
  try {
    console.log('📡 Fetching approved jobs for student:', req.user.id);
    
    const jobs = await prisma.job.findMany({
      where: { 
        status: 'approved'
      },
      orderBy: { createdAt: 'desc' }
    });
    
    console.log(`✅ Found ${jobs.length} approved jobs`);
    res.json({ jobs });
  } catch (err) {
    console.error('Error fetching approved jobs:', err);
    res.status(500).json({ error: err.message, jobs: [] });
  }
});

// GET /api/jobs/all — College TPO sees ALL jobs for approval
router.get('/all', auth, async function(req, res) {
  try {
    // Only College TPO can access this
    if (req.user.role !== 'COLLEGE') {
      return res.status(403).json({ error: 'Access denied. Only college TPO can view all jobs.' });
    }
    
    const jobs = await prisma.job.findMany({
      include: {
        postedByUser: {
          select: {
            id: true,
            fullName: true,
            email: true,
            company: true
          }
        },
        applications: {
          select: {
            id: true,
            status: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    console.log(`✅ Found ${jobs.length} total jobs for approval`);
    res.json({ jobs });
  } catch (err) {
    console.error('Error fetching all jobs:', err);
    res.status(500).json({ error: err.message, jobs: [] });
  }
});

// GET /api/jobs - Alternative endpoint
router.get('/', auth, async function(req, res) {
  try {
    const jobs = await prisma.job.findMany({
      where: { status: 'approved' },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ jobs });
  } catch (err) {
    res.json({ jobs: [] });
  }
});

// GET /api/jobs/my-jobs - Employer sees their own jobs
router.get('/my-jobs', auth, async function(req, res) {
  try {
    if (req.user.role !== 'EMPLOYER') {
      return res.status(403).json({ error: 'Only employers can view their jobs' });
    }
    
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
                department: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json({ jobs });
  } catch (err) {
    console.error('Error fetching employer jobs:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/jobs/:id/status — College TPO approves/rejects job
router.put('/:id/status', auth, async function(req, res) {
  try {
    // Only College TPO can update status
    if (req.user.role !== 'COLLEGE') {
      return res.status(403).json({ error: 'Access denied. Only college TPO can update job status.' });
    }
    
    const { status } = req.body;
    
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    const job = await prisma.job.update({
      where: { id: req.params.id },
      data: { status: status }
    });
    
    console.log(`✅ Job ${job.id} status updated to ${status}`);
    res.json(job);
  } catch (err) {
    console.error('Error updating job status:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/jobs - Employer creates a job
router.post('/', auth, async function(req, res) {
  try {
    console.log('📡 Creating job for employer:', req.user.id);
    
    // Check if user is employer
    if (req.user.role !== 'EMPLOYER') {
      return res.status(403).json({ error: 'Only employers can post jobs' });
    }
    
    // Create the job with pending status
    const job = await prisma.job.create({
      data: {
        title: req.body.title,
        company: req.user.company || req.body.company,
        location: req.body.location || 'Remote',
        type: req.body.type || 'Full-time',
        salaryMin: parseInt(req.body.salaryMin) || 0,
        salaryMax: parseInt(req.body.salaryMax) || 0,
        description: req.body.description,
        requirements: req.body.requirements || '',
        skills: req.body.skills,
        deadline: new Date(req.body.deadline),
        maxApplicants: parseInt(req.body.maxApplicants) || 50,
        collegeId: req.body.collegeId || null,
        postedBy: req.user.id,
        status: 'pending'
      }
    });
    
    console.log('✅ Job created successfully:', job.id);
    res.status(201).json(job);
  } catch (err) {
    console.error('Error creating job:', err);
    res.status(500).json({ error: err.message });
  }
});

// ========== APPLICATION ROUTES ==========

// POST /api/applications/apply
// POST /api/applications/apply - Student applies for a job
router.post('/applications/apply', auth, upload.single('resume'), async function(req, res) {
  try {
    console.log('📝 Application submission received');
    console.log('Request body:', req.body);
    console.log('Uploaded file:', req.file);
    
    if (req.user.role !== 'STUDENT') {
      return res.status(403).json({ error: 'Only students can apply for jobs' });
    }
    
    const { jobId, studentName, studentEmail, college, department } = req.body;
    
    // Validate required fields
    if (!jobId) {
      return res.status(400).json({ error: 'Job ID is required' });
    }
    
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
      console.log(`✅ Resume saved: ${resumePath}`);
    } else {
      console.log('⚠️ No resume file uploaded');
      // Allow application without resume? If required, return error
      // return res.status(400).json({ error: 'Resume is required' });
    }
    
    // Calculate match score
    const matchScore = calculateMatchScore(req.user.skills, job.skills);
    
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
        matchScore: matchScore
      }
    });
    
    console.log('✅ Application created successfully:', application.id);
    res.status(201).json({ 
      success: true, 
      message: 'Application submitted successfully',
      application: application 
    });
  } catch (err) {
    console.error('Error applying for job:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/applications/my
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
    res.status(500).json({ error: err.message });
  }
});

// GET /api/jobs/employer/applications
router.get('/employer/applications', auth, async function(req, res) {
  try {
    if (req.user.role !== 'EMPLOYER') {
      return res.status(403).json({ error: 'Only employers can view applications' });
    }
    
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
    res.status(500).json({ error: err.message });
  }
});

// GET /api/applications/:id/resume
router.get('/applications/:id/resume', auth, async function(req, res) {
  try {
    const application = await prisma.jobApplication.findUnique({
      where: { id: req.params.id }
    });
    
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }
    
    const job = await prisma.job.findUnique({ where: { id: application.jobId } });
    const isEmployer = req.user.role === 'EMPLOYER' && job?.postedBy === req.user.id;
    const isStudent = req.user.role === 'STUDENT' && application.studentId === req.user.id;
    
    if (!isEmployer && !isStudent) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    if (!application.resume || !fs.existsSync(application.resume)) {
      return res.status(404).json({ error: 'Resume file not found' });
    }
    
    res.download(application.resume, application.resumeFileName || 'resume.pdf');
  } catch (err) {
    console.error('Error downloading resume:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/applications/:id/status
router.put('/applications/:id/status', auth, async function(req, res) {
  try {
    if (req.user.role !== 'EMPLOYER') {
      return res.status(403).json({ error: 'Only employers can update application status' });
    }
    
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
    
    res.json(updated);
  } catch (err) {
    console.error('Error updating application status:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;