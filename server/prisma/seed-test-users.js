const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...\n');
  
  const hashedPassword = await bcrypt.hash('123456', 10);

  // Full college name as in auth page
  const FULL_COLLEGE_NAME = 'Aalim Muhammed Salegh College of Engineering (AMSCE), Chennai';

  // Startup company details
  const STARTUP = {
    name: 'InnovateLabs AI',
    description: 'A cutting-edge AI startup focused on revolutionizing education technology through intelligent learning platforms and personalized student mentorship solutions.',
    website: 'https://innovatelabs.ai',
    industry: 'EdTech / Artificial Intelligence',
    location: 'Bangalore, India'
  };

  // ========== CLEAR EXISTING DATA ==========
  console.log('Clearing existing data...');
  await prisma.jobApplication.deleteMany();
  await prisma.message.deleteMany();
  await prisma.skill.deleteMany();
  await prisma.job.deleteMany();
  await prisma.otp.deleteMany();
  await prisma.user.deleteMany();
  console.log('✅ Cleared\n');

  // ========== CREATE YOUR TEST USERS ==========
  console.log('📝 Creating your test users...');
  
  // Your Student
  const student1 = await prisma.user.create({
    data: {
      fullName: 'Mohamed Apsar',
      email: 'student@test.com',
      password: hashedPassword,
      role: 'STUDENT',
      college: FULL_COLLEGE_NAME,
      department: 'Computer Science Engineering',
      procredits: 240,
      avatarInitials: 'MA',
      isVerified: true,
      skills: {
        create: [
          { name: 'JavaScript', score: 85, category: 'Technical' },
          { name: 'React', score: 78, category: 'Technical' },
          { name: 'Node.js', score: 72, category: 'Technical' }
        ]
      }
    }
  });
  console.log('  ✅ Mohamed Apsar (Student)');

  // Your College TPO
  const college = await prisma.user.create({
    data: {
      fullName: 'Dr. Placement Officer',
      email: 'college@test.com',
      password: hashedPassword,
      role: 'COLLEGE',
      college: FULL_COLLEGE_NAME,
      department: 'Training & Placement Officer',
      avatarInitials: 'PO',
      isVerified: true
    }
  });
  console.log('  ✅ Dr. Placement Officer (College TPO)');

  // Your Employer (Startup HR)
  const employer = await prisma.user.create({
    data: {
      fullName: 'Priya Sharma',
      email: 'employer@test.com',
      password: hashedPassword,
      role: 'EMPLOYER',
      company: STARTUP.name,
      companyDescription: STARTUP.description,
      companyWebsite: STARTUP.website,
      companyIndustry: STARTUP.industry,
      avatarInitials: 'PS',
      isVerified: true
    }
  });
  console.log(`  ✅ ${employer.fullName} (HR Manager) - ${STARTUP.name}\n`);

  // ========== CREATE 10 ADDITIONAL STUDENTS ==========
  console.log('🎓 Creating 10 more students...');
  
  const studentsData = [
    { name: 'Arun Kumar S', email: 'arun.kumar@amsc.edu', dept: 'Computer Science Engineering', credits: 1250, skills: ['JavaScript', 'React', 'Node.js', 'MongoDB'] },
    { name: 'Divya Lakshmi M', email: 'divya.lakshmi@amsc.edu', dept: 'Information Technology', credits: 980, skills: ['Java', 'Spring Boot', 'MySQL', 'AWS'] },
    { name: 'Karthikeyan R', email: 'karthik.r@amsc.edu', dept: 'Computer Science Engineering', credits: 2100, skills: ['Python', 'Django', 'PostgreSQL', 'React'] },
    { name: 'Meena Priya S', email: 'meena.priya@amsc.edu', dept: 'Electronics Engineering', credits: 750, skills: ['C++', 'Embedded Systems', 'Arduino', 'IoT'] },
    { name: 'Rahul Varma P', email: 'rahul.v@amsc.edu', dept: 'Computer Science Engineering', credits: 1670, skills: ['Flutter', 'Firebase', 'Dart', 'UI/UX'] },
    { name: 'Swetha Nandhini K', email: 'swetha.n@amsc.edu', dept: 'Information Technology', credits: 1890, skills: ['Data Science', 'Python', 'Pandas', 'Tableau'] },
    { name: 'Vignesh Raj S', email: 'vignesh.r@amsc.edu', dept: 'Computer Science Engineering', credits: 1430, skills: ['Go', 'Kubernetes', 'Docker', 'Redis'] },
    { name: 'Anjali Priya R', email: 'anjali.p@amsc.edu', dept: 'Computer Science Engineering', credits: 1120, skills: ['React Native', 'TypeScript', 'GraphQL', 'Redux'] },
    { name: 'Gokul Nathan M', email: 'gokul.n@amsc.edu', dept: 'Information Technology', credits: 2050, skills: ['DevOps', 'Jenkins', 'Terraform', 'Ansible'] },
    { name: 'Keerthana S', email: 'keerthana.s@amsc.edu', dept: 'Computer Science Engineering', credits: 890, skills: ['Angular', 'RxJS', 'Sass', 'C#'] }
  ];

  for (const s of studentsData) {
    await prisma.user.create({
      data: {
        fullName: s.name,
        email: s.email,
        password: hashedPassword,
        role: 'STUDENT',
        college: FULL_COLLEGE_NAME,
        department: s.dept,
        procredits: s.credits,
        isVerified: true,
        placementStatus: s.credits > 1500 ? 'Active' : 'Looking',
        skills: {
          create: s.skills.map((skill, idx) => ({
            name: skill,
            score: Math.floor(Math.random() * 40) + 60,
            category: idx < 2 ? 'Technical' : 'Soft Skill'
          }))
        }
      }
    });
    console.log(`  ✅ ${s.name} (${s.credits} credits)`);
  }

  // ========== CREATE JOBS (Startup focused roles) ==========
  console.log('\n📋 Creating startup jobs...');
  
  const jobs = [
    {
      title: 'Frontend Developer (React)',
      company: STARTUP.name,
      location: STARTUP.location,
      type: 'Full-time',
      salaryMin: 800000,
      salaryMax: 1400000,
      description: `${STARTUP.name} is looking for a passionate Frontend Developer to join our growing team. You'll work on cutting-edge AI-powered educational products.`,
      requirements: 'Strong proficiency in React, JavaScript, HTML/CSS. Experience with TypeScript is a plus. Good understanding of responsive design.',
      skills: 'React,JavaScript,TypeScript,HTML,CSS,Tailwind',
      status: 'approved'
    },
    {
      title: 'Backend Engineer (Node.js)',
      company: STARTUP.name,
      location: STARTUP.location,
      type: 'Full-time',
      salaryMin: 900000,
      salaryMax: 1500000,
      description: `Join our backend team to build scalable APIs and microservices for our AI learning platform.`,
      requirements: 'Experience with Node.js, Express, MongoDB/PostgreSQL. Knowledge of REST APIs and microservices architecture.',
      skills: 'Node.js,Express,MongoDB,PostgreSQL,REST APIs,Redis',
      status: 'approved'
    },
    {
      title: 'AI/ML Intern',
      company: STARTUP.name,
      location: 'Remote (India)',
      type: 'Internship',
      salaryMin: 300000,
      salaryMax: 500000,
      description: `Exciting internship opportunity to work on LLMs and AI models for personalized learning.`,
      requirements: 'Python, Machine Learning basics, NLP knowledge. Eager to learn and experiment with AI technologies.',
      skills: 'Python,Machine Learning,NLP,TensorFlow,PyTorch',
      status: 'approved'
    },
    {
      title: 'Full Stack Developer (MERN)',
      company: STARTUP.name,
      location: STARTUP.location,
      type: 'Full-time',
      salaryMin: 1000000,
      salaryMax: 1800000,
      description: `Looking for a Full Stack Developer to own features end-to-end. You'll work on both frontend and backend.`,
      requirements: '3+ years experience with MERN stack, good understanding of cloud deployment (AWS/GCP).',
      skills: 'MongoDB,Express,React,Node.js,AWS,Docker',
      status: 'pending'
    },
    {
      title: 'UI/UX Designer',
      company: STARTUP.name,
      location: STARTUP.location,
      type: 'Full-time',
      salaryMin: 700000,
      salaryMax: 1200000,
      description: `Design beautiful and intuitive interfaces for our AI learning platform.`,
      requirements: 'Figma, Adobe XD, Portfolio showcasing design work. Understanding of user-centered design principles.',
      skills: 'Figma,UI/UX,Adobe XD,Prototyping,User Research',
      status: 'pending'
    }
  ];

  for (const job of jobs) {
    await prisma.job.create({
      data: {
        ...job,
        deadline: new Date('2026-12-31'),
        postedBy: employer.id,
        maxApplicants: 50,
        collegeId: null
      }
    });
    console.log(`  ✅ ${job.title} (${job.status}) - ${job.salaryMin/100000}L - ${job.salaryMax/100000}L`);
  }

  // ========== CREATE JOB APPLICATIONS ==========
  console.log('\n📝 Creating job applications...');
  
  const allStudents = await prisma.user.findMany({
    where: { role: 'STUDENT' }
  });
  
  const allJobs = await prisma.job.findMany();
  
  for (let i = 0; i < allStudents.length; i++) {
    const student = allStudents[i];
    const numApps = Math.floor(Math.random() * 3) + 1;
    const shuffledJobs = [...allJobs].sort(() => 0.5 - Math.random());
    
    for (let j = 0; j < numApps && j < shuffledJobs.length; j++) {
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
    }
  }
  console.log('  ✅ Applications created for all students');

  // ========== CREATE SAMPLE MESSAGES ==========
  console.log('\n💬 Creating sample messages...');
  
  const messages = [
    { sender: college.id, receiver: employer.id, text: `Welcome ${STARTUP.name}! We're excited to partner with an innovative startup like yours.` },
    { sender: employer.id, receiver: college.id, text: `Thank you! We're looking forward to hiring talented students from ${FULL_COLLEGE_NAME}.` },
    { sender: college.id, receiver: student1.id, text: 'Hey Mohamed! Check out the new internship opportunity at InnovateLabs AI. Great learning opportunity!' },
    { sender: student1.id, receiver: college.id, text: 'Thank you sir! I will definitely apply for the AI/ML Intern role.' },
    { sender: employer.id, receiver: student1.id, text: 'Hi Mohamed! We saw your application for Frontend Developer. Your React skills look impressive. When are you available for an interview?' }
  ];

  for (const msg of messages) {
    await prisma.message.create({
      data: {
        senderId: msg.sender,
        receiverId: msg.receiver,
        text: msg.text,
        read: false
      }
    });
  }
  console.log('  ✅ Messages created');

  // ========== FINAL SUMMARY ==========
  console.log('\n' + '='.repeat(70));
  console.log('🎉 DATABASE SEED COMPLETED SUCCESSFULLY! 🎉');
  console.log('='.repeat(70));
  console.log('\n📊 Summary:');
  console.log(`  🏛️  College: ${FULL_COLLEGE_NAME}`);
  console.log(`  👨‍🎓 Students: ${allStudents.length} (1 test + ${allStudents.length - 1} regular)`);
  console.log(`  🏛️  College Admin: 1 (Dr. Placement Officer)`);
  console.log(`  💼 Employer/Startup: ${STARTUP.name}`);
  console.log(`  📋 Jobs: ${allJobs.length} (${allJobs.filter(j => j.status === 'approved').length} approved, ${allJobs.filter(j => j.status === 'pending').length} pending)`);
  console.log(`  📝 Applications: ${await prisma.jobApplication.count()} applications created`);
  console.log(`  💬 Messages: ${messages.length}`);
  
  console.log('\n🔑 LOGIN CREDENTIALS:');
  console.log('  ┌' + '─'.repeat(66) + '┐');
  console.log('  │ YOUR TEST ACCOUNTS:                                      │');
  console.log('  │   🎓 Student:  student@test.com / 123456                 │');
  console.log('  │   🏛️  College:  college@test.com / 123456                 │');
  console.log('  │   💼 Employer: employer@test.com / 123456                │');
  console.log('  ├' + '─'.repeat(66) + '┤');
  console.log(`  │ 🚀 STARTUP: ${STARTUP.name.padEnd(48)}│`);
  console.log(`  │    ${STARTUP.description.substring(0, 60)}... │`);
  console.log('  ├' + '─'.repeat(66) + '┤');
  console.log('  │ OTHER STUDENTS (any of these):                           │');
  console.log('  │   arun.kumar@amsc.edu / 123456                           │');
  console.log('  │   divya.lakshmi@amsc.edu / 123456                        │');
  console.log('  │   karthik.r@amsc.edu / 123456                            │');
  console.log('  │   ... and 7 more                                         │');
  console.log('  └' + '─'.repeat(66) + '┘');
  
  console.log('\n💡 Startup Jobs Available:');
  for (const job of jobs) {
    console.log(`   ${job.status === 'approved' ? '✅' : '⏳'} ${job.title} - ${job.salaryMin/100000}L to ${job.salaryMax/100000}L`);
  }
  
  console.log('\n' + '='.repeat(70));
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());