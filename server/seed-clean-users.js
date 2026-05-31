const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  console.log('\n🌱 SEEDING COMPLETE DATABASE...\n');

  const hash = await bcrypt.hash('123456', 10);
  const collegeName = 'Aalim Muhammed Salegh College of Engineering (AMSCE), Chennai';

  // ========== CLEAR ALL EXISTING DATA ==========
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

  // ========== 1. CREATE ADMIN ==========
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

  // ========== 2. CREATE COLLEGE TPO ==========
  console.log('🏛️ Creating College TPO...');
  const college = await prisma.user.create({
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

  // ========== 3. CREATE EMPLOYERS ==========
  console.log('💼 Creating Employers...');
  
  const employers = [
    { name: 'HR Manager', email: 'employer@test.com', company: 'InnovateLabs AI', industry: 'EdTech', desc: 'AI-powered education platform' },
    { name: 'Google HR', email: 'hr@google.com', company: 'Google', industry: 'Technology', desc: 'Global technology leader' },
    { name: 'Microsoft Talent', email: 'careers@microsoft.com', company: 'Microsoft', industry: 'Technology', desc: 'Software and cloud computing' },
    { name: 'Amazon Recruitment', email: 'jobs@amazon.com', company: 'Amazon', industry: 'E-commerce', desc: 'E-commerce giant' },
    { name: 'TCS HR', email: 'hr@tcs.com', company: 'TCS', industry: 'IT Services', desc: 'Leading IT services company' }
  ];
  
  const employerRecords = [];
  for (const emp of employers) {
    const record = await prisma.user.create({
      data: {
        fullName: emp.name,
        email: emp.email,
        password: hash,
        role: 'EMPLOYER',
        company: emp.company,
        companyDescription: emp.desc,
        companyIndustry: emp.industry,
        companyWebsite: `https://${emp.company.toLowerCase().replace(/ /g, '')}.com`,
        isVerified: true,
        avatarInitials: emp.company.charAt(0)
      }
    });
    employerRecords.push(record);
    console.log(`  ✅ ${emp.company} (${emp.email})`);
  }
  console.log('');

  // ========== 4. CREATE STUDENTS ==========
  console.log('🎓 Creating Students...');
  
  const students = [
    { name: 'Mohamed Apsar', email: 'student@test.com', dept: 'Computer Science Engineering', credits: 240, skills: ['JavaScript', 'React', 'Node.js'] },
    { name: 'Arun Kumar S', email: 'arun.kumar@amsc.edu', dept: 'Computer Science Engineering', credits: 1250, skills: ['React', 'TypeScript', 'Next.js'] },
    { name: 'Divya Lakshmi M', email: 'divya.lakshmi@amsc.edu', dept: 'Information Technology', credits: 980, skills: ['Java', 'Spring Boot', 'MySQL'] },
    { name: 'Karthikeyan R', email: 'karthik.r@amsc.edu', dept: 'Computer Science Engineering', credits: 2100, skills: ['Python', 'Django', 'PostgreSQL'] },
    { name: 'Meena Priya S', email: 'meena.priya@amsc.edu', dept: 'Electronics Engineering', credits: 750, skills: ['C++', 'Embedded Systems', 'Arduino'] },
    { name: 'Rahul Varma P', email: 'rahul.v@amsc.edu', dept: 'Computer Science Engineering', credits: 1670, skills: ['Flutter', 'Firebase', 'Dart'] },
    { name: 'Swetha Nandhini K', email: 'swetha.n@amsc.edu', dept: 'Information Technology', credits: 1890, skills: ['Data Science', 'Python', 'Pandas'] },
    { name: 'Vignesh Raj S', email: 'vignesh.r@amsc.edu', dept: 'Computer Science Engineering', credits: 1430, skills: ['Go', 'Kubernetes', 'Docker'] },
    { name: 'Anjali Priya R', email: 'anjali.p@amsc.edu', dept: 'Computer Science Engineering', credits: 1120, skills: ['React Native', 'Redux', 'GraphQL'] },
    { name: 'Gokul Nathan M', email: 'gokul.n@amsc.edu', dept: 'Information Technology', credits: 2050, skills: ['DevOps', 'Jenkins', 'AWS'] },
    { name: 'Keerthana S', email: 'keerthana.s@amsc.edu', dept: 'Computer Science Engineering', credits: 890, skills: ['Angular', 'RxJS', 'Sass'] }
  ];
  
  const studentRecords = [];
  for (const stu of students) {
    const record = await prisma.user.create({
      data: {
        fullName: stu.name,
        email: stu.email,
        password: hash,
        role: 'STUDENT',
        college: collegeName,
        department: stu.dept,
        procredits: stu.credits,
        isVerified: true,
        placementStatus: stu.credits > 1500 ? 'Active' : 'Looking',
        avatarInitials: stu.name.split(' ').map(n => n[0]).join(''),
        skills: {
          create: stu.skills.map((skill, idx) => ({
            name: skill,
            score: Math.floor(Math.random() * 40) + 60,
            category: idx < 2 ? 'Technical' : 'Soft Skill'
          }))
        }
      }
    });
    studentRecords.push(record);
    console.log(`  ✅ ${stu.name} (${stu.credits} credits) - ${stu.skills.length} skills`);
  }
  console.log('');

  // ========== 5. CREATE JOBS ==========
  console.log('📋 Creating Jobs...');
  
  const jobs = [
    { title: 'Frontend Developer', company: 'InnovateLabs AI', location: 'Bangalore', type: 'Full-time', salaryMin: 800000, salaryMax: 1400000, desc: 'Looking for a React developer to join our team', req: 'React, JavaScript, 2+ years', skills: 'React,JavaScript,HTML,CSS', status: 'approved', employer: employerRecords[0] },
    { title: 'Backend Engineer', company: 'InnovateLabs AI', location: 'Bangalore', type: 'Full-time', salaryMin: 900000, salaryMax: 1500000, desc: 'Node.js backend engineer needed', req: 'Node.js, Express, MongoDB', skills: 'Node.js,Express,MongoDB', status: 'approved', employer: employerRecords[0] },
    { title: 'Full Stack Developer', company: 'Google', location: 'Bangalore', type: 'Full-time', salaryMin: 1500000, salaryMax: 2500000, desc: 'Senior full stack developer', req: 'React, Node.js, 5+ years', skills: 'React,Node.js,TypeScript', status: 'approved', employer: employerRecords[1] },
    { title: 'Software Engineer', company: 'Microsoft', location: 'Hyderabad', type: 'Full-time', salaryMin: 1400000, salaryMax: 2200000, desc: 'Software engineer for Azure team', req: 'C#, .NET, cloud experience', skills: 'C#,.NET,Azure', status: 'approved', employer: employerRecords[2] },
    { title: 'Data Scientist', company: 'Amazon', location: 'Chennai', type: 'Full-time', salaryMin: 1200000, salaryMax: 2000000, desc: 'Data scientist for analytics team', req: 'Python, ML, SQL', skills: 'Python,Machine Learning,SQL', status: 'pending', employer: employerRecords[3] },
    { title: 'DevOps Engineer', company: 'TCS', location: 'Pune', type: 'Full-time', salaryMin: 1000000, salaryMax: 1600000, desc: 'DevOps engineer for cloud infrastructure', req: 'Docker, Kubernetes, AWS', skills: 'Docker,Kubernetes,AWS', status: 'approved', employer: employerRecords[4] }
  ];
  
  for (const job of jobs) {
    await prisma.job.create({
      data: {
        title: job.title,
        company: job.company,
        location: job.location,
        type: job.type,
        salaryMin: job.salaryMin,
        salaryMax: job.salaryMax,
        description: job.desc,
        requirements: job.req,
        skills: job.skills,
        deadline: new Date('2026-12-31'),
        postedBy: job.employer.id,
        status: job.status,
        maxApplicants: 50
      }
    });
    console.log(`  ✅ ${job.title} at ${job.company} (${job.status})`);
  }
  console.log('');

  // ========== 6. CREATE JOB APPLICATIONS ==========
  console.log('📝 Creating Job Applications...');
  
  const allJobs = await prisma.job.findMany();
  let appCount = 0;
  
  for (let i = 0; i < studentRecords.length; i++) {
    const student = studentRecords[i];
    const numApps = Math.min(3, allJobs.length);
    const shuffledJobs = [...allJobs].sort(() => 0.5 - Math.random());
    
    for (let j = 0; j < numApps; j++) {
      const job = shuffledJobs[j];
      const statuses = ['Applied', 'Shortlisted', 'Interview', 'HIRED'];
      const finalStatus = i < 3 && job.status === 'approved' ? 'HIRED' : statuses[Math.floor(Math.random() * statuses.length)];
      
      await prisma.jobApplication.create({
        data: {
          jobId: job.id,
          studentId: student.id,
          studentName: student.fullName,
          studentEmail: student.email,
          college: student.college,
          department: student.department,
          status: finalStatus,
          matchScore: Math.floor(Math.random() * 40) + 60,
          appliedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
        }
      });
      appCount++;
    }
  }
  console.log(`  ✅ Created ${appCount} job applications\n`);

  // ========== 7. CREATE BROADCASTS ==========
  console.log('📢 Creating Broadcasts...');
  
  const broadcasts = [
    { text: '📢 Placement drive for Google is scheduled on Dec 15th. Register now!' },
    { text: '🎓 TCS hiring freshers with 70%+ throughout academics. Apply by Nov 30th.' },
    { text: '💼 Resume building workshop this Friday at 3 PM in Seminar Hall.' }
  ];
  
  for (const broadcast of broadcasts) {
    await prisma.broadcast.create({
      data: {
        senderId: college.id,
        text: broadcast.text
      }
    });
    console.log(`  ✅ ${broadcast.text.substring(0, 50)}...`);
  }
  console.log('');

  // ========== 8. CREATE LEADERBOARD ==========
  console.log('🏆 Creating Leaderboard...');
  
  for (const student of studentRecords) {
    await prisma.leaderboardEntry.create({
      data: {
        userId: student.id,
        credits: student.procredits,
        trend: Math.random() > 0.5 ? 'up' : 'same'
      }
    });
  }
  console.log(`  ✅ Created leaderboard entries\n`);

  // ========== FINAL SUMMARY ==========
  const totalUsers = await prisma.user.count();
  const totalJobs = await prisma.job.count();
  const totalApps = await prisma.jobApplication.count();
  const totalSkills = await prisma.skill.count();
  
  console.log('='.repeat(60));
  console.log('🎉 DATABASE SEED COMPLETED SUCCESSFULLY! 🎉');
  console.log('='.repeat(60));
  console.log(`\n📊 FINAL SUMMARY:`);
  console.log(`  👑 Admin: 1`);
  console.log(`  🏛️ College TPOs: 1`);
  console.log(`  💼 Employers: ${employerRecords.length}`);
  console.log(`  🎓 Students: ${studentRecords.length}`);
  console.log(`  📋 Jobs: ${totalJobs}`);
  console.log(`  📝 Applications: ${totalApps}`);
  console.log(`  🛠️ Skills: ${totalSkills}`);
  console.log(`  📢 Broadcasts: ${broadcasts.length}`);
  console.log(`  📚 Total Users: ${totalUsers}`);
  
  console.log('\n🔑 LOGIN CREDENTIALS:');
  console.log('  ┌─────────────────────────────────────────────────────────────┐');
  console.log('  │ 👑 ADMIN:    admin@careerconnect.com / 123456              │');
  console.log('  │ 🎓 STUDENT:  student@test.com / 123456                     │');
  console.log('  │ 🏛️ COLLEGE:  college@test.com / 123456                     │');
  console.log('  │ 💼 EMPLOYER: employer@test.com / 123456                    │');
  console.log('  ├─────────────────────────────────────────────────────────────┤');
  console.log('  │ OTHER STUDENTS (any email + 123456):                       │');
  console.log('  │   arun.kumar@amsc.edu                                      │');
  console.log('  │   divya.lakshmi@amsc.edu                                   │');
  console.log('  │   karthik.r@amsc.edu                                       │');
  console.log('  └─────────────────────────────────────────────────────────────┘');
  
  console.log('\n💼 EMPLOYER LOGINS:');
  console.log('   hr@google.com / 123456');
  console.log('   careers@microsoft.com / 123456');
  console.log('   jobs@amazon.com / 123456');
  console.log('   hr@tcs.com / 123456');
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ All done! Your database is fully populated.');
  console.log('='.repeat(60));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());