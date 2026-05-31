const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkJobs() {
  console.log('\n📊 Checking jobs in database...\n');
  
  // Get all jobs
  const allJobs = await prisma.job.findMany();
  console.log(`Total jobs: ${allJobs.length}`);
  
  // Count by status
  const approved = allJobs.filter(j => j.status === 'approved').length;
  const pending = allJobs.filter(j => j.status === 'pending').length;
  const rejected = allJobs.filter(j => j.status === 'rejected').length;
  
  console.log(`✅ Approved: ${approved}`);
  console.log(`⏳ Pending: ${pending}`);
  console.log(`❌ Rejected: ${rejected}`);
  
  if (allJobs.length > 0) {
    console.log('\n📋 Job details:');
    allJobs.forEach(job => {
      console.log(`   - ${job.title} (${job.company}) - Status: ${job.status}`);
    });
  }
  
  // Update all pending to approved
  if (pending > 0) {
    console.log('\n🔄 Updating all pending jobs to approved...');
    const updated = await prisma.job.updateMany({
      where: { status: 'pending' },
      data: { status: 'approved' }
    });
    console.log(`✅ Updated ${updated.count} jobs to approved`);
  }
  
  // If no jobs, create sample jobs
  if (allJobs.length === 0) {
    console.log('\n📝 No jobs found! Creating sample jobs...');
    
    const employer = await prisma.user.findFirst({
      where: { role: 'EMPLOYER' }
    });
    
    if (!employer) {
      console.log('❌ No employer found! Creating a test employer...');
      const bcrypt = require('bcryptjs');
      const hash = await bcrypt.hash('123456', 10);
      
      const newEmployer = await prisma.user.create({
        data: {
          fullName: 'Google HR',
          email: 'hr@google.com',
          password: hash,
          role: 'EMPLOYER',
          company: 'Google',
          isVerified: true,
          avatarInitials: 'G'
        }
      });
      var employerId = newEmployer.id;
      console.log('✅ Created test employer');
    } else {
      var employerId = employer.id;
    }
    
    const sampleJobs = [
      {
        title: "Frontend Developer",
        company: "Google",
        location: "Bangalore",
        type: "Full-time",
        salaryMin: 800000,
        salaryMax: 1200000,
        description: "Looking for a skilled Frontend Developer with React expertise.",
        requirements: "3+ years React experience",
        skills: "React, JavaScript, HTML, CSS",
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        postedBy: employerId,
        status: "approved",
        maxApplicants: 50
      },
      {
        title: "Backend Engineer",
        company: "Microsoft",
        location: "Hyderabad",
        type: "Full-time",
        salaryMin: 1000000,
        salaryMax: 1500000,
        description: "Seeking a Backend Engineer for scalable APIs.",
        requirements: "4+ years Node.js/Python",
        skills: "Node.js, Python, MongoDB",
        deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        postedBy: employerId,
        status: "approved",
        maxApplicants: 40
      },
      {
        title: "Full Stack Developer",
        company: "Amazon",
        location: "Chennai",
        type: "Full-time",
        salaryMin: 1200000,
        salaryMax: 1800000,
        description: "Full Stack Developer for e-commerce platform.",
        requirements: "3+ years MERN stack",
        skills: "React, Node.js, MongoDB",
        deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        postedBy: employerId,
        status: "approved",
        maxApplicants: 60
      }
    ];
    
    for (const job of sampleJobs) {
      await prisma.job.create({ data: job });
      console.log(`   ✅ Created: ${job.title} at ${job.company}`);
    }
  }
  
  // Final count
  const finalJobs = await prisma.job.findMany({
    where: { status: 'approved' }
  });
  console.log(`\n🎯 Total approved jobs now: ${finalJobs.length}`);
  
  await prisma.$disconnect();
}

checkJobs().catch(console.error);