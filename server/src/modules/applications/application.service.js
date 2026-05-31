const prisma = require('../../config/prisma');

// Simple synchronous match score calculation
function calculateMatchScore(studentSkills, jobSkills) {
  console.log('Calculating match score...');
  console.log('Student skills:', studentSkills);
  console.log('Job skills:', jobSkills);
  
  if (!jobSkills) return 50;
  
  // Parse student skills
  let sSkills = [];
  if (Array.isArray(studentSkills)) {
    sSkills = studentSkills.map(s => s.name?.toLowerCase() || '').filter(s => s);
  } else if (typeof studentSkills === 'string') {
    sSkills = studentSkills.toLowerCase().split(',').map(s => s.trim());
  }
  
  // Parse job skills
  const jSkills = typeof jobSkills === 'string' 
    ? jobSkills.toLowerCase().split(',').map(s => s.trim())
    : [];
  
  if (jSkills.length === 0) return 50;
  
  // Count matches
  const matchCount = jSkills.filter(skill => 
    sSkills.some(s => s.includes(skill) || skill.includes(s))
  );
  
  const score = Math.round((matchCount.length / jSkills.length) * 100);
  console.log('Match score calculated:', score);
  
  return isNaN(score) ? 50 : score;
}

async function applyForJob(data) {
  console.log('Applying for job with data:', data);
  
  const existing = await prisma.jobApplication.findFirst({
    where: { 
      jobId: data.jobId, 
      studentId: data.studentId 
    },
  });
  
  if (existing) {
    throw new Error('You have already applied for this job');
  }
  
  const job = await prisma.job.findUnique({
    where: { id: data.jobId }
  });
  
  if (!job) {
    throw new Error('Job not found');
  }
  
  const student = await prisma.user.findUnique({
    where: { id: data.studentId },
    include: { skills: true }
  });
  
  let matchScore = 50;
  if (student && student.skills && job.skills) {
    matchScore = calculateMatchScore(student.skills, job.skills);
  }
  
  matchScore = parseInt(matchScore) || 50;
  console.log('Final matchScore to save:', matchScore);
  
  const application = await prisma.jobApplication.create({ 
    data: {
      jobId: data.jobId,
      studentId: data.studentId,
      studentName: data.studentName,
      studentEmail: data.studentEmail,
      college: data.college,
      department: data.department,
      resume: data.resume || null,
      resumeFileName: data.resumeFileName || null,
      matchScore: matchScore,
      status: 'Applied'
    }
  });
  
  console.log('Application created:', application.id);
  return application;
}

async function applyForJob(data) {
  console.log('Applying for job with data:', data);
  
  // Check for duplicate applications
  const existing = await prisma.jobApplication.findFirst({
    where: { 
      jobId: data.jobId, 
      studentId: data.studentId 
    },
  });
  
  if (existing) {
    throw new Error('You have already applied for this job');
  }
  
  // Get job to get skills
  const job = await prisma.job.findUnique({
    where: { id: data.jobId }
  });
  
  if (!job) {
    throw new Error('Job not found');
  }
  
  // Get student skills
  const student = await prisma.user.findUnique({
    where: { id: data.studentId },
    include: { skills: true }
  });
  
  // Calculate match score - ensure it's a number
  let matchScore = 50;
  if (student && student.skills && job.skills) {
    matchScore = calculateMatchScore(student.skills, job.skills);
  }
  
  // Ensure matchScore is a valid integer
  matchScore = parseInt(matchScore) || 50;
  console.log('Final matchScore to save:', matchScore, typeof matchScore);
  
  // Create application
  const application = await prisma.jobApplication.create({ 
    data: {
      jobId: data.jobId,
      studentId: data.studentId,
      studentName: data.studentName,
      studentEmail: data.studentEmail,
      college: data.college,
      department: data.department,
      resume: data.resume || null,
      resumeFileName: data.resumeFileName || null,
      matchScore: matchScore,
      status: 'Applied'
    }
  });
  
  console.log('Application created:', application.id);
  return application;
}

async function getMyApplications(studentId) {
  return prisma.jobApplication.findMany({
    where: { studentId },
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
    orderBy: { appliedAt: 'desc' },
  });
}

async function getApplicationsForJob(jobId) {
  return prisma.jobApplication.findMany({
    where: { jobId },
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
    orderBy: { appliedAt: 'desc' },
  });
}

async function updateStatus(id, status) {
  return prisma.jobApplication.update({
    where: { id },
    data: { status },
  });
}

module.exports = { applyForJob, getMyApplications, getApplicationsForJob, updateStatus };