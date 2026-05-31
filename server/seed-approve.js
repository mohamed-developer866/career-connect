const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function approveAllJobs() {
  console.log('\n✅ Approving all jobs...\n');
  
  // Get all jobs
  const jobs = await prisma.job.findMany();
  console.log(`Found ${jobs.length} total jobs`);
  
  // Count pending jobs
  const pendingJobs = jobs.filter(j => j.status !== 'approved');
  console.log(`Pending jobs: ${pendingJobs.length}`);
  
  // Update all jobs to approved
  const updated = await prisma.job.updateMany({
    where: {
      status: { not: 'approved' }
    },
    data: {
      status: 'approved'
    }
  });
  
  console.log(`✅ Updated ${updated.count} jobs to 'approved' status`);
  
  // Verify
  const approvedJobs = await prisma.job.findMany({
    where: { status: 'approved' }
  });
  console.log(`\n📊 Total approved jobs: ${approvedJobs.length}`);
  
  await prisma.$disconnect();
}

approveAllJobs().catch(console.error);