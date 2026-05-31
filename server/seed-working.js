const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  console.log('\n🚀 STARTING DATABASE SEED\n');

  const hash = await bcrypt.hash('123456', 10);
  const collegeName = 'Aalim Muhammed Salegh College of Engineering (AMSCE), Chennai';

  // ========== CLEAR DATA ==========
  console.log('📋 Clearing existing data...');
  await prisma.jobApplication.deleteMany({});
  await prisma.message.deleteMany({});
  await prisma.skill.deleteMany({});
  await prisma.job.deleteMany({});
  await prisma.dailyTask.deleteMany({});
  await prisma.courseEnrollment.deleteMany({});
  await prisma.leaderboardEntry.deleteMany({});
  await prisma.broadcast.deleteMany({});
  await prisma.user.deleteMany({});
  console.log('✅ Cleared\n');

  // ========== CREATE ADMIN ==========
  console.log('👑 Creating Admin...');
  await prisma.user.create({
    data: {
      fullName: 'Super Admin',
      email: 'admin@careerconnect.com',
      password: hash,
      role: 'ADMIN',
      isVerified: true,
      avatarInitials: 'SA'
    }
  });
  console.log('  ✅ admin@careerconnect.com / 123456\n');

  // ========== CREATE COLLEGE ==========
  console.log('🏛️ Creating College TPO...');
  await prisma.user.create({
    data: {
      fullName: 'Dr. Placement Officer',
      email: 'college@test.com',
      password: hash,
      role: 'COLLEGE',
      college: collegeName,
      isVerified: true,
      avatarInitials: 'PO'
    }
  });
  console.log('  ✅ college@test.com / 123456\n');

  // ========== CREATE EMPLOYERS ==========
  console.log('💼 Creating Employers...');
  
  const employer1 = await prisma.user.create({
    data: {
      fullName: 'HR Manager',
      email: 'employer@test.com',
      password: hash,
      role: 'EMPLOYER',
      company: 'InnovateLabs AI',
      companyDescription: 'AI-powered education platform',
      companyIndustry: 'EdTech',
      isVerified: true,
      avatarInitials: 'I'
    }
  });
  console.log('  ✅ InnovateLabs AI (employer@test.com)');

  const employer2 = await prisma.user.create({
    data: {
      fullName: 'Google HR',
      email: 'hr@google.com',
      password: hash,
      role: 'EMPLOYER',
      company: 'Google',
      companyDescription: 'Global technology leader',
      companyIndustry: 'Technology',
      isVerified: true,
      avatarInitials: 'G'
    }
  });
  console.log('  ✅ Google (hr@google.com)\n');

  // ========== CREATE STUDENTS ==========
  console.log('🎓 Creating Students...');
  
  await prisma.user.create({
    data: {
      fullName: 'Mohamed Apsar',
      email: 'student@test.com',
      password: hash,
      role: 'STUDENT',
      college: collegeName,
      department: 'Computer Science Engineering',
      procredits: 240,
      isVerified: true,
      avatarInitials: 'MA'
    }
  });
  console.log('  ✅ Mohamed Apsar (240 credits)');

  await prisma.user.create({
    data: {
      fullName: 'Arun Kumar S',
      email: 'arun.kumar@amsc.edu',
      password: hash,
      role: 'STUDENT',
      college: collegeName,
      department: 'Computer Science Engineering',
      procredits: 1250,
      isVerified: true,
      avatarInitials: 'AK'
    }
  });
  console.log('  ✅ Arun Kumar S (1250 credits)');

  await prisma.user.create({
    data: {
      fullName: 'Divya Lakshmi M',
      email: 'divya.lakshmi@amsc.edu',
      password: hash,
      role: 'STUDENT',
      college: collegeName,
      department: 'Information Technology',
      procredits: 980,
      isVerified: true,
      avatarInitials: 'DL'
    }
  });
  console.log('  ✅ Divya Lakshmi M (980 credits)');

  await prisma.user.create({
    data: {
      fullName: 'Karthikeyan R',
      email: 'karthik.r@amsc.edu',
      password: hash,
      role: 'STUDENT',
      college: collegeName,
      department: 'Computer Science Engineering',
      procredits: 2100,
      isVerified: true,
      avatarInitials: 'KR'
    }
  });
  console.log('  ✅ Karthikeyan R (2100 credits)\n');

  // ========== CREATE JOBS ==========
  console.log('📋 Creating Jobs...');
  
  // Get the employer IDs
  const innovatelabs = await prisma.user.findUnique({ where: { email: 'employer@test.com' } });
  const google = await prisma.user.findUnique({ where: { email: 'hr@google.com' } });

  await prisma.job.create({
    data: {
      title: 'Frontend Developer',
      company: 'InnovateLabs AI',
      location: 'Bangalore',
      type: 'Full-time',
      salaryMin: 800000,
      salaryMax: 1400000,
      description: 'Looking for a React developer to join our team',
      requirements: 'React, JavaScript, HTML/CSS',
      skills: 'React,JavaScript,HTML,CSS',
      deadline: new Date('2026-12-31'),
      postedBy: innovatelabs.id,
      status: 'approved',
      maxApplicants: 50
    }
  });
  console.log('  ✅ Frontend Developer at InnovateLabs AI');

  await prisma.job.create({
    data: {
      title: 'Backend Engineer',
      company: 'InnovateLabs AI',
      location: 'Bangalore',
      type: 'Full-time',
      salaryMin: 900000,
      salaryMax: 1500000,
      description: 'Node.js backend engineer needed',
      requirements: 'Node.js, Express, MongoDB',
      skills: 'Node.js,Express,MongoDB',
      deadline: new Date('2026-12-31'),
      postedBy: innovatelabs.id,
      status: 'approved',
      maxApplicants: 50
    }
  });
  console.log('  ✅ Backend Engineer at InnovateLabs AI');

  await prisma.job.create({
    data: {
      title: 'Software Engineer',
      company: 'Google',
      location: 'Bangalore',
      type: 'Full-time',
      salaryMin: 1500000,
      salaryMax: 2500000,
      description: 'Google software engineer position',
      requirements: 'Computer Science degree, DSA skills',
      skills: 'Java,Python,Algorithms',
      deadline: new Date('2026-12-31'),
      postedBy: google.id,
      status: 'approved',
      maxApplicants: 50
    }
  });
  console.log('  ✅ Software Engineer at Google\n');

  // ========== CREATE APPLICATIONS ==========
  console.log('📝 Creating Job Applications...');
  
  const students = await prisma.user.findMany({ where: { role: 'STUDENT' } });
  const jobs = await prisma.job.findMany();
  
  let appCount = 0;
  for (let i = 0; i < students.length && i < jobs.length; i++) {
    await prisma.jobApplication.create({
      data: {
        jobId: jobs[i % jobs.length].id,
        studentId: students[i].id,
        studentName: students[i].fullName,
        studentEmail: students[i].email,
        college: students[i].college,
        department: students[i].department,
        status: i < 2 ? 'HIRED' : 'Applied',
        matchScore: Math.floor(Math.random() * 40) + 60,
        appliedAt: new Date()
      }
    });
    appCount++;
  }
  console.log(`  ✅ Created ${appCount} applications\n`);

  // ========== SUMMARY ==========
  const totalUsers = await prisma.user.count();
  const totalJobs = await prisma.job.count();
  
  console.log('='.repeat(60));
  console.log('✅ DATABASE SEED COMPLETED!');
  console.log('='.repeat(60));
  console.log(`\n📊 SUMMARY:`);
  console.log(`  👑 Admin: 1`);
  console.log(`  🏛️ College: 1`);
  console.log(`  💼 Employers: 2`);
  console.log(`  🎓 Students: 4`);
  console.log(`  📋 Jobs: 3`);
  console.log(`  📝 Applications: ${appCount}`);
  console.log(`  📚 Total Users: ${totalUsers}`);
  
  console.log('\n🔑 LOGIN CREDENTIALS:');
  console.log('  ┌─────────────────────────────────────────────────────────────┐');
  console.log('  │ 👑 ADMIN:    admin@careerconnect.com / 123456              │');
  console.log('  │ 🎓 STUDENT:  student@test.com / 123456                     │');
  console.log('  │ 🏛️ COLLEGE:  college@test.com / 123456                     │');
  console.log('  │ 💼 EMPLOYER: employer@test.com / 123456                    │');
  console.log('  └─────────────────────────────────────────────────────────────┘');
  console.log('\n💼 Other Employers: hr@google.com / 123456');
  console.log('🎓 Other Students: arun.kumar@amsc.edu / 123456');
  console.log('='.repeat(60));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());