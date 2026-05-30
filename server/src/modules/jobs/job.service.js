const prisma = require('../../config/prisma');

async function getJobs(filters = {}) {
  // FIXED: Change 'active' to 'approved'
  const where = { status: 'approved' };
  
  if (filters.type) where.type = filters.type;
  if (filters.search) {
    where.OR = [
      { title: { contains: filters.search, mode: 'insensitive' } },
      { company: { contains: filters.search, mode: 'insensitive' } },
      { skills: { contains: filters.search, mode: 'insensitive' } },
    ];
  }
  return prisma.job.findMany({ 
    where, 
    orderBy: { createdAt: 'desc' } 
  });
}

async function getJobById(id) {
  return prisma.job.findUnique({ where: { id } });
}

async function createJob(data) {
  return prisma.job.create({ data });
}

module.exports = { getJobs, getJobById, createJob };