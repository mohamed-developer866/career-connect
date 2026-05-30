const prisma = require('../../config/prisma');

async function applyForJob(data) {
  // ✅ This prevents duplicate applications
  const existing = await prisma.jobApplication.findFirst({
    where: { 
      jobId: data.jobId, 
      studentId: data.studentId 
    },
  });
  
  if (existing) {
    throw new Error('You have already applied for this job');
  }
  
  return prisma.jobApplication.create({ data });
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