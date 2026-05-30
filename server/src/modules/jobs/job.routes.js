var express = require('express');
var router = express.Router();
var { PrismaClient } = require('@prisma/client');
var prisma = new PrismaClient();
var auth = require('../../middlewares/auth');

// POST /api/jobs — HR posts a job
router.post('/', auth, async function(req, res) {
  try {
    if (req.user.role !== 'EMPLOYER') {
      return res.status(403).json({ error: 'Only employers can post jobs' });
    }
    var job = await prisma.job.create({
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
        collegeId: req.body.collegeId || null, // null = all colleges
        postedBy: req.user.id,
        status: 'pending'
      }
    });
    res.status(201).json(job);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/jobs/employer — HR sees their own jobs with applications
router.get('/employer', auth, async function(req, res) {
  try {
    var jobs = await prisma.job.findMany({
      where: { postedBy: req.user.id },
      include: { 
        applications: { include: { student: { select: { fullName: true, email: true, college: true, department: true } } } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ jobs });
  } catch (err) {
    res.json({ jobs: [] });
  }
});

// GET /api/jobs/all — TPO sees ALL jobs
router.get('/all', auth, async function(req, res) {
  try {
    var jobs = await prisma.job.findMany({
      include: { 
        applications: true,
        postedByUser: { select: { fullName: true, company: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ jobs });
  } catch (err) {
    res.json({ jobs: [] });
  }
});

// GET /api/jobs — Students see only approved jobs
router.get('/', auth, async function(req, res) {
  try {
    var jobs = await prisma.job.findMany({
      where: { 
        status: 'approved',
        OR: [
          { collegeId: null },
          { collegeId: req.user.college }
        ]
      },
      include: { applications: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ jobs });
  } catch (err) {
    res.json({ jobs: [] });
  }
});

// GET /api/jobs/approved — Students see approved jobs
// GET /api/jobs/approved — Students see approved jobs
router.get('/approved', auth, async function(req, res) {
  try {
    // Debug logging
    console.log('=== STUDENT VIEWING JOBS ===');
    console.log('Student ID:', req.user.id);
    console.log('Student College:', req.user.college);
    console.log('Student Role:', req.user.role);
    
    // Get all approved jobs
    var jobs = await prisma.job.findMany({
      where: { 
        status: 'approved'
      },
      include: { 
        applications: {
          where: { studentId: req.user.id },
          select: { id: true, status: true }
        },
        postedByUser: { select: { fullName: true, company: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    console.log(`Found ${jobs.length} total approved jobs`);
    
    // Return jobs
    res.json({ jobs: jobs });
  } catch (err) {
    console.error('Error in /approved:', err);
    res.status(500).json({ error: err.message, jobs: [] });
  }
});

// PUT /api/jobs/:id/status — TPO approves/rejects job
router.put('/:id/status', auth, async function(req, res) {
  try {
    if (req.user.role !== 'COLLEGE') {
      return res.status(403).json({ error: 'Only TPO can approve/reject jobs' });
    }
    var job = await prisma.job.update({
      where: { id: req.params.id },
      data: { status: req.body.status }
    });
    console.log('✅ Job', req.params.id, 'updated to', req.body.status);
    res.json(job);
  } catch (err) {
    console.error('❌ Status update error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/jobs/:id — Delete a job
router.delete('/:id', auth, async function(req, res) {
  try {
    await prisma.job.deleteMany({
      where: { id: req.params.id, postedBy: req.user.id }
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/jobs/:id/applications — Get applications for a job
router.get('/:id/applications', auth, async function(req, res) {
  try {
    var applications = await prisma.jobApplication.findMany({
      where: { jobId: req.params.id },
      include: { student: { select: { fullName: true, email: true, college: true, department: true } } },
      orderBy: { appliedAt: 'desc' }
    });
    res.json({ applications });
  } catch (err) {
    res.json({ applications: [] });
  }
});

// PUT /api/applications/:id/status — HR updates application status
router.put('/applications/:id/status', auth, async function(req, res) {
  try {
    if (req.user.role !== 'EMPLOYER') {
      return res.status(403).json({ error: 'Only employers can update application status' });
    }
    var application = await prisma.jobApplication.update({
      where: { id: req.params.id },
      data: { status: req.body.status }
    });
    console.log('✅ Application', req.params.id, '→', req.body.status);
    res.json(application);
  } catch (err) {
    console.error('❌ Application status error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 