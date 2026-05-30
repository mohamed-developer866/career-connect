const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...\n');

  try {
    const hashedPassword = await bcrypt.hash('123456', 10);
    const FULL_COLLEGE_NAME = 'Aalim Muhammed Salegh College of Engineering (AMSCE), Chennai';

    console.log('Clearing existing data...');
    
    await prisma.jobApplication.deleteMany({});
    await prisma.message.deleteMany({});
    await prisma.skill.deleteMany({});
    await prisma.job.deleteMany({});
    await prisma.user.deleteMany({});
    
    console.log('✅ Cleared all existing data\n');

    // ========== CREATE USERS ==========
    console.log('📝 Creating users...\n');

    // 1. Create College TPO
    const college = await prisma.user.create({
      data: {
        fullName: 'Dr. Placement Officer',
        email: 'college@test.com',
        password: hashedPassword,
        role: 'COLLEGE',
        college: FULL_COLLEGE_NAME,
        department: 'Training & Placement',
        phone: '+91 9876543210',
        isVerified: true
      }
    });
    console.log('  ✅ College TPO: college@test.com');

    // 2. Create Employer (Startup HR)
    const employer = await prisma.user.create({
      data: {
        fullName: 'Priya Sharma',
        email: 'employer@test.com',
        password: hashedPassword,
        role: 'EMPLOYER',
        company: 'InnovateLabs AI',
        companyDescription: 'AI startup focused on revolutionizing education technology through intelligent learning platforms',
        companyWebsite: 'https://innovatelabs.ai',
        companyIndustry: 'EdTech / Artificial Intelligence',
        phone: '+91 9876543211',
        isVerified: true
      }
    });
    console.log('  ✅ Employer: employer@test.com\n');

    // 3. Create 15 Students with skills
    console.log('🎓 Creating students...');

    const studentsData = [
      { name: 'Mohamed Apsar', email: 'student@test.com', dept: 'Computer Science Engineering', credits: 240, skills: ['JavaScript', 'React', 'Node.js', 'MongoDB'] },
      { name: 'Arun Kumar S', email: 'arun.kumar@amsc.edu', dept: 'Computer Science Engineering', credits: 1250, skills: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'Express'] },
      { name: 'Divya Lakshmi M', email: 'divya.lakshmi@amsc.edu', dept: 'Information Technology', credits: 980, skills: ['Java', 'Spring Boot', 'MySQL', 'AWS', 'Docker'] },
      { name: 'Karthikeyan R', email: 'karthik.r@amsc.edu', dept: 'Computer Science Engineering', credits: 2100, skills: ['Python', 'Django', 'PostgreSQL', 'React', 'TypeScript'] },
      { name: 'Meena Priya S', email: 'meena.priya@amsc.edu', dept: 'Electronics Engineering', credits: 750, skills: ['C++', 'Embedded Systems', 'Arduino', 'IoT', 'Python'] },
      { name: 'Rahul Varma P', email: 'rahul.v@amsc.edu', dept: 'Computer Science Engineering', credits: 1670, skills: ['Flutter', 'Firebase', 'Dart', 'UI/UX', 'Figma'] },
      { name: 'Swetha Nandhini K', email: 'swetha.n@amsc.edu', dept: 'Information Technology', credits: 1890, skills: ['Data Science', 'Machine Learning', 'Python', 'Pandas', 'Tableau'] },
      { name: 'Vignesh Raj S', email: 'vignesh.r@amsc.edu', dept: 'Computer Science Engineering', credits: 1430, skills: ['Go', 'Kubernetes', 'Docker', 'Redis', 'Microservices'] },
      { name: 'Anjali Priya R', email: 'anjali.p@amsc.edu', dept: 'Computer Science Engineering', credits: 1120, skills: ['React Native', 'TypeScript', 'Redux', 'GraphQL', 'Jest'] },
      { name: 'Gokul Nathan M', email: 'gokul.n@amsc.edu', dept: 'Information Technology', credits: 2050, skills: ['DevOps', 'Jenkins', 'GitHub Actions', 'Terraform', 'Ansible'] },
      { name: 'Keerthana S', email: 'keerthana.s@amsc.edu', dept: 'Computer Science Engineering', credits: 890, skills: ['Angular', 'RxJS', 'NgRx', 'Sass', 'C#'] },
      { name: 'Harish Venkat', email: 'harish.v@amsc.edu', dept: 'Computer Science Engineering', credits: 1560, skills: ['Ruby on Rails', 'PostgreSQL', 'Redis', 'Sidekiq', 'Hotwire'] },
      { name: 'Nandhini M', email: 'nandhini.m@amsc.edu', dept: 'Information Technology', credits: 1320, skills: ['Cybersecurity', 'Network Security', 'Cryptography', 'Penetration Testing', 'Wireshark'] },
      { name: 'Pradeep R', email: 'pradeep.r@amsc.edu', dept: 'Computer Science Engineering', credits: 1780, skills: ['Blockchain', 'Solidity', 'Web3', 'Smart Contracts', 'Ethereum'] },
      { name: 'Sowmya K', email: 'sowmya.k@amsc.edu', dept: 'Computer Science Engineering', credits: 950, skills: ['PHP', 'Laravel', 'MySQL', 'Bootstrap', 'jQuery'] }
    ];

    const createdStudents = [];
    for (const s of studentsData) {
      const student = await prisma.user.create({
        data: {
          fullName: s.name,
          email: s.email,
          password: hashedPassword,
          role: 'STUDENT',
          college: FULL_COLLEGE_NAME,
          department: s.dept,
          procredits: s.credits,
          placementStatus: s.credits > 1500 ? 'Active' : 'Looking',
          isVerified: true,
          skills: {
            create: s.skills.map((skill, idx) => ({
              name: skill,
              score: Math.floor(Math.random() * 40) + 60,
              category: idx < 3 ? 'Technical' : 'Soft Skill'
            }))
          }
        }
      });
      createdStudents.push(student);
      console.log(`  ✅ ${s.name.padEnd(25)} (${s.credits} credits) - ${s.dept}`);
    }

    // ========== CREATE JOBS ==========
    console.log('\n📋 Creating jobs...');

    const jobs = [
      {
        title: 'Frontend Developer (React)',
        company: 'InnovateLabs AI',
        location: 'Bangalore',
        type: 'Full-time',
        salaryMin: 800000,
        salaryMax: 1400000,
        description: 'Looking for a passionate Frontend Developer with React expertise to join our growing team. You will work on cutting-edge AI-powered educational products.',
        requirements: 'Strong proficiency in React, JavaScript, HTML/CSS. Experience with TypeScript is a plus. Good understanding of responsive design.',
        skills: 'React,JavaScript,TypeScript,HTML,CSS,Tailwind',
        status: 'approved'
      },
      {
        title: 'Backend Engineer (Node.js)',
        company: 'InnovateLabs AI',
        location: 'Bangalore',
        type: 'Full-time',
        salaryMin: 900000,
        salaryMax: 1500000,
        description: 'Join our backend team to build scalable APIs and microservices for our AI learning platform.',
        requirements: 'Experience with Node.js, Express, MongoDB/PostgreSQL. Knowledge of REST APIs and microservices architecture.',
        skills: 'Node.js,Express,MongoDB,PostgreSQL,REST APIs',
        status: 'approved'
      },
      {
        title: 'Full Stack Developer (MERN)',
        company: 'InnovateLabs AI',
        location: 'Remote',
        type: 'Full-time',
        salaryMin: 1000000,
        salaryMax: 1800000,
        description: 'Looking for a Full Stack Developer to own features end-to-end. You will work on both frontend and backend.',
        requirements: '3+ years experience with MERN stack, good understanding of cloud deployment (AWS/GCP).',
        skills: 'MongoDB,Express,React,Node.js,AWS,Docker',
        status: 'pending'
      },
      {
        title: 'AI/ML Engineer',
        company: 'InnovateLabs AI',
        location: 'Bangalore',
        type: 'Full-time',
        salaryMin: 1200000,
        salaryMax: 2200000,
        description: 'Exciting opportunity to work on LLMs and AI models for personalized learning.',
        requirements: 'Strong Python skills, experience with ML frameworks (TensorFlow/PyTorch), NLP knowledge.',
        skills: 'Python,Machine Learning,NLP,TensorFlow,PyTorch,LLMs',
        status: 'approved'
      },
      {
        title: 'DevOps Engineer',
        company: 'InnovateLabs AI',
        location: 'Bangalore',
        type: 'Full-time',
        salaryMin: 1100000,
        salaryMax: 1900000,
        description: 'DevOps engineer for cloud infrastructure management and CI/CD pipelines.',
        requirements: 'Kubernetes, Docker, CI/CD pipelines, AWS/GCP, Terraform.',
        skills: 'Kubernetes,Docker,AWS,CI/CD,Terraform,Ansible',
        status: 'pending'
      },
      {
        title: 'UI/UX Designer',
        company: 'InnovateLabs AI',
        location: 'Bangalore',
        type: 'Full-time',
        salaryMin: 700000,
        salaryMax: 1200000,
        description: 'Design beautiful and intuitive interfaces for our AI learning platform.',
        requirements: 'Figma, Adobe XD, Portfolio showcasing design work. Understanding of user-centered design principles.',
        skills: 'Figma,UI/UX,Adobe XD,Prototyping,User Research',
        status: 'approved'
      },
      {
        title: 'Data Scientist',
        company: 'InnovateLabs AI',
        location: 'Remote',
        type: 'Full-time',
        salaryMin: 1300000,
        salaryMax: 2100000,
        description: 'Data Scientist role for analytics and insights generation.',
        requirements: 'Python, SQL, Statistical analysis, Machine Learning, Data visualization.',
        skills: 'Python,SQL,Statistics,Machine Learning,Tableau',
        status: 'approved'
      }
    ];

    const createdJobs = [];
    for (const job of jobs) {
      const newJob = await prisma.job.create({
        data: {
          ...job,
          deadline: new Date('2026-12-31'),
          postedBy: employer.id,
          maxApplicants: 50,
          collegeId: null
        }
      });
      createdJobs.push(newJob);
      console.log(`  ✅ ${job.title.padEnd(30)} (${job.status}) - ${job.salaryMin/100000}L-${job.salaryMax/100000}L`);
    }

    // ========== CREATE JOB APPLICATIONS ==========
    console.log('\n📝 Creating job applications...');
    
    let applicationCount = 0;
    for (let i = 0; i < createdStudents.length; i++) {
      const student = createdStudents[i];
      // Each student applies to 2-4 jobs
      const numApps = Math.floor(Math.random() * 3) + 2;
      const shuffledJobs = [...createdJobs].sort(() => 0.5 - Math.random());
      
      for (let j = 0; j < numApps && j < shuffledJobs.length; j++) {
        const job = shuffledJobs[j];
        let status = 'Applied';
        let matchScore = Math.floor(Math.random() * 40) + 60;
        
        // First 3 students get hired for approved jobs
        if (i < 3 && job.status === 'approved') {
          status = 'HIRED';
          matchScore = Math.floor(Math.random() * 20) + 80;
        } else if (job.status === 'approved') {
          const statuses = ['Applied', 'Shortlisted', 'Interview'];
          status = statuses[Math.floor(Math.random() * statuses.length)];
        }
        
        await prisma.jobApplication.create({
          data: {
            jobId: job.id,
            studentId: student.id,
            studentName: student.fullName,
            studentEmail: student.email,
            college: student.college,
            department: student.department,
            status: status,
            matchScore: matchScore,
            appliedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
          }
        });
        applicationCount++;
      }
    }
    console.log(`  ✅ Created ${applicationCount} job applications`);

    // ========== CREATE SAMPLE MESSAGES ==========
    console.log('\n💬 Creating sample messages...');
    
    const messages = [
      { sender: college.id, receiver: employer.id, text: `Welcome ${employer.company}! We're excited to partner with an innovative startup like yours.` },
      { sender: employer.id, receiver: college.id, text: `Thank you! We're looking forward to hiring talented students from ${FULL_COLLEGE_NAME}.` },
      { sender: college.id, receiver: createdStudents[0].id, text: 'Congratulations on your placement! Keep up the great work.' },
      { sender: createdStudents[0].id, receiver: college.id, text: 'Thank you sir! I will do my best.' },
      { sender: employer.id, receiver: createdStudents[0].id, text: 'Welcome to the team! We are excited to have you at InnovateLabs AI.' },
      { sender: employer.id, receiver: createdStudents[1].id, text: 'Your application looks impressive. When are you available for an interview?' }
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
    console.log(`  ✅ Created ${messages.length} messages`);

    // ========== FINAL SUMMARY ==========
    const totalUsers = await prisma.user.count();
    const totalJobs = await prisma.job.count();
    const totalApps = await prisma.jobApplication.count();

    console.log('\n' + '='.repeat(70));
    console.log('🎉 DATABASE SEED COMPLETED SUCCESSFULLY! 🎉');
    console.log('='.repeat(70));
    console.log('\n📊 FINAL SUMMARY:');
    console.log(`  🏛️  College: ${FULL_COLLEGE_NAME}`);
    console.log(`  👨‍🎓 Students: ${createdStudents.length}`);
    console.log(`  🏛️  College Admin: 1`);
    console.log(`  💼 Employer: ${employer.company}`);
    console.log(`  📋 Total Jobs: ${totalJobs} (${createdJobs.filter(j => j.status === 'approved').length} approved, ${createdJobs.filter(j => j.status === 'pending').length} pending)`);
    console.log(`  📝 Applications: ${totalApps}`);
    console.log(`  💬 Messages: ${messages.length}`);
    
    console.log('\n🔑 LOGIN CREDENTIALS:');
    console.log('  ┌' + '─'.repeat(66) + '┐');
    console.log('  │ 🎓 STUDENT:  student@test.com / 123456                 │');
    console.log('  │ 🏛️ COLLEGE:  college@test.com / 123456                 │');
    console.log('  │ 💼 EMPLOYER: employer@test.com / 123456                │');
    console.log('  ├' + '─'.repeat(66) + '┤');
    console.log('  │ OTHER STUDENTS (any email + password 123456):          │');
    for (let i = 1; i <= 3; i++) {
      console.log(`  │   ${studentsData[i].email.padEnd(30)} (${studentsData[i].credits} credits)  │`);
    }
    console.log(`  │   ... and ${studentsData.length - 3} more students                     │`);
    console.log('  └' + '─'.repeat(66) + '┘');
    
    console.log('\n💼 JOBS AVAILABLE:');
    for (const job of createdJobs) {
      const emoji = job.status === 'approved' ? '✅' : '⏳';
      console.log(`  ${emoji} ${job.title.padEnd(30)} - ₹${job.salaryMin/100000}L to ₹${job.salaryMax/100000}L`);
    }
    
    console.log('\n' + '='.repeat(70));
    console.log('✨ All data has been seeded successfully! ✨');
    console.log('='.repeat(70));

  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

main();