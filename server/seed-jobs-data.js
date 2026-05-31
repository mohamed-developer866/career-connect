const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');

async function seedJobsData() {
  console.log('\n🚀 SEEDING JOBS AND APPLICATIONS DATA\n');

  // Get existing employer
  let employer = await prisma.user.findFirst({
    where: { role: 'EMPLOYER' }
  });

  if (!employer) {
    console.log('Creating test employer...');
    const hash = await bcrypt.hash('123456', 10);
    employer = await prisma.user.create({
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
    console.log('✅ Created employer:', employer.email);
  }

  // Get students
  const students = await prisma.user.findMany({
    where: { role: 'STUDENT' },
    take: 5
  });

  if (students.length === 0) {
    console.log('❌ No students found! Please run main seed first.');
    return;
  }

  console.log(`Found ${students.length} students`);

  // Clear existing jobs and applications
  await prisma.jobApplication.deleteMany({});
  await prisma.job.deleteMany({});
  console.log('🗑️ Cleared existing jobs and applications\n');

  // ========== CREATE 5 JOBS WITH DIFFERENT STATUSES ==========
  const jobs = [
    {
      title: "Frontend Developer",
      company: "Google",
      location: "Bangalore",
      type: "Full-time",
      salaryMin: 800000,
      salaryMax: 1200000,
      description: "Looking for a skilled Frontend Developer with React expertise to join our team.",
      requirements: "3+ years of experience in React, JavaScript, HTML/CSS.",
      skills: "React, JavaScript, HTML, CSS, TypeScript",
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      postedBy: employer.id,
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
      description: "Seeking a Backend Engineer to build scalable APIs.",
      requirements: "4+ years in Node.js, Python, or Java.",
      skills: "Node.js, Python, MongoDB, PostgreSQL",
      deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      postedBy: employer.id,
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
      requirements: "3+ years MERN stack experience.",
      skills: "React, Node.js, MongoDB, Express",
      deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      postedBy: employer.id,
      status: "approved",
      maxApplicants: 60
    },
    {
      title: "Data Scientist Intern",
      company: "TCS",
      location: "Pune",
      type: "Internship",
      salaryMin: 300000,
      salaryMax: 500000,
      description: "Internship opportunity for data science enthusiasts.",
      requirements: "Knowledge of Python, Pandas, and Machine Learning basics.",
      skills: "Python, Pandas, NumPy, Scikit-learn",
      deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      postedBy: employer.id,
      status: "pending",
      maxApplicants: 30
    },
    {
      title: "DevOps Engineer",
      company: "Infosys",
      location: "Bangalore",
      type: "Full-time",
      salaryMin: 1100000,
      salaryMax: 1600000,
      description: "Looking for a DevOps engineer for cloud infrastructure.",
      requirements: "3+ years AWS, Docker, Kubernetes experience.",
      skills: "AWS, Docker, Kubernetes, Jenkins",
      deadline: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000),
      postedBy: employer.id,
      status: "pending",
      maxApplicants: 35
    }
  ];

  const createdJobs = [];
  for (const job of jobs) {
    const created = await prisma.job.create({ data: job });
    createdJobs.push(created);
    console.log(`✅ Created: ${job.title} at ${job.company} - Status: ${job.status}`);
  }

  console.log(`\n📊 Created ${createdJobs.length} jobs:`);
  console.log(`   - Approved: ${createdJobs.filter(j => j.status === 'approved').length}`);
  console.log(`   - Pending: ${createdJobs.filter(j => j.status === 'pending').length}\n`);

  // ========== CREATE APPLICATIONS ==========
  console.log('📝 Creating applications...\n');

  // Find specific students
  const student1 = students.find(s => s.fullName === 'Mohamed Apsar') || students[0];
  const student2 = students.find(s => s.fullName === 'Bhuvanesh') || (students[1] || students[0]);
  const student3 = students.find(s => s.fullName === 'Asif') || (students[2] || students[0]);

  // Job 1: Frontend Developer (approved) - Mohamed applies
  if (createdJobs[0]) {
    const app1 = await prisma.jobApplication.create({
      data: {
        jobId: createdJobs[0].id,
        studentId: student1.id,
        studentName: student1.fullName,
        studentEmail: student1.email,
        college: student1.college || "Aalim College",
        department: student1.department || "Computer Science",
        status: "Applied",
        matchScore: 85,
        appliedAt: new Date()
      }
    });
    console.log(`   ✅ ${student1.fullName} applied to ${createdJobs[0].title}`);
  }

  // Job 2: Backend Engineer (approved) - Mohamed applies (Shortlisted)
  if (createdJobs[1]) {
    const app2 = await prisma.jobApplication.create({
      data: {
        jobId: createdJobs[1].id,
        studentId: student1.id,
        studentName: student1.fullName,
        studentEmail: student1.email,
        college: student1.college || "Aalim College",
        department: student1.department || "Computer Science",
        status: "Shortlisted",
        matchScore: 78,
        appliedAt: new Date()
      }
    });
    console.log(`   ✅ ${student1.fullName} applied to ${createdJobs[1].title} (Shortlisted)`);
  }

  // Job 3: Full Stack Developer (approved) - Bhuvanesh applies (Interview)
  if (createdJobs[2]) {
    const app3 = await prisma.jobApplication.create({
      data: {
        jobId: createdJobs[2].id,
        studentId: student2.id,
        studentName: student2.fullName,
        studentEmail: student2.email,
        college: student2.college || "Aalim College",
        department: student2.department || "Computer Science",
        status: "Interview",
        matchScore: 92,
        appliedAt: new Date()
      }
    });
    console.log(`   ✅ ${student2.fullName} applied to ${createdJobs[2].title} (Interview)`);
  }

  // Job 4: Data Scientist Intern (pending - college approval needed) - Asif applies
  if (createdJobs[3]) {
    const app4 = await prisma.jobApplication.create({
      data: {
        jobId: createdJobs[3].id,
        studentId: student3.id,
        studentName: student3.fullName,
        studentEmail: student3.email,
        college: student3.college || "Aalim College",
        department: student3.department || "Computer Science",
        status: "Applied",
        matchScore: 70,
        appliedAt: new Date()
      }
    });
    console.log(`   ✅ ${student3.fullName} applied to ${createdJobs[3].title} (Pending College Approval)`);
  }

  console.log(`\n📊 SUMMARY:`);
  console.log(`   Total Jobs: ${createdJobs.length}`);
  console.log(`   ✅ Approved Jobs (visible to students): ${createdJobs.filter(j => j.status === 'approved').length}`);
  console.log(`   ⏳ Pending Jobs (waiting for college approval): ${createdJobs.filter(j => j.status === 'pending').length}`);
  console.log(`   📝 Total Applications: 4`);
  
  console.log('\n🔍 JOB VISIBILITY FOR STUDENTS:');
  console.log(`   Students will see only ${createdJobs.filter(j => j.status === 'approved').length} jobs (approved ones)`);
  console.log(`   Pending jobs (${createdJobs.filter(j => j.status === 'pending').length}) require college approval first`);
  
  console.log('\n📋 APPLICATION STATUS:');
  console.log(`   - Mohamed Apsar → Frontend Developer (Applied)`);
  console.log(`   - Mohamed Apsar → Backend Engineer (Shortlisted)`);
  console.log(`   - Bhuvanesh → Full Stack Developer (Interview)`);
  console.log(`   - Asif → Data Scientist Intern (Applied - Job Pending Approval)`);
  
  console.log('\n✅ Seeding completed!');
  
  await prisma.$disconnect();
}

seedJobsData().catch(console.error);