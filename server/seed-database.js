const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  console.log('\n🚀 STARTING COMPLETE DATABASE SEED\n');
  console.log('🏫 PRIORITY: AALIM MOHAMED COLLEGE WILL BE FIRST IN EVERYTHING!\n');

  const hash = await bcrypt.hash('123456', 10);

  // ========== COLLEGES LIST (AALIM FIRST) ==========
  const colleges = [
    { name: 'Aalim Muhammed Salegh College of Engineering (AMSCE), Chennai' },
    { name: 'Anna University, Chennai' },
    { name: 'IIT Madras, Chennai' },
    { name: 'NIT Trichy' },
    { name: 'VIT Vellore' },
    { name: 'BITS Pilani' },
    { name: 'PSG College of Technology, Coimbatore' },
    { name: 'SSN College of Engineering, Chennai' },
    { name: 'SRM University, Chennai' },
    { name: 'SASTRA University, Thanjavur' }
  ];

  // ========== COMPANIES LIST ==========
  const companies = [
    { name: 'Google', industry: 'Technology', desc: 'Global technology leader' },
    { name: 'Microsoft', industry: 'Technology', desc: 'Software and cloud computing' },
    { name: 'Amazon', industry: 'E-commerce', desc: 'E-commerce giant' },
    { name: 'TCS', industry: 'IT Services', desc: 'Leading IT services' },
    { name: 'Infosys', industry: 'IT Services', desc: 'IT consulting' },
    { name: 'Accenture', industry: 'IT Services', desc: 'Global professional services' },
    { name: 'Deloitte', industry: 'Consulting', desc: 'Professional services network' },
    { name: 'IBM', industry: 'Technology', desc: 'Technology and consulting' },
    { name: 'Cognizant', industry: 'IT Services', desc: 'IT services and consulting' },
    { name: 'Wipro', industry: 'IT Services', desc: 'IT consulting and outsourcing' },
    { name: 'InnovateLabs AI', industry: 'EdTech', desc: 'AI-powered education platform' },
    { name: 'CodeCraft Studios', industry: 'Software', desc: 'Software development studio' },
    { name: 'DataMind Analytics', industry: 'Data Science', desc: 'Analytics and insights' },
    { name: 'CloudNest Technologies', industry: 'Cloud', desc: 'Cloud solutions provider' },
    { name: 'FinTech Fusion', industry: 'FinTech', desc: 'Financial technology' },
    { name: 'HealthTech Innovators', industry: 'HealthTech', desc: 'Healthcare technology' },
    { name: 'EduTech Solutions', industry: 'EdTech', desc: 'Educational platform' },
    { name: 'GreenEnergy Startups', industry: 'CleanTech', desc: 'Sustainable energy' },
    { name: 'TechSolutions India', industry: 'IT Services', desc: 'IT consulting' },
    { name: 'DigitalWave Creators', industry: 'Digital Marketing', desc: 'Marketing agency' },
    { name: 'NextGen Systems', industry: 'Software', desc: 'Enterprise software' },
    { name: 'FreshWorks', industry: 'SaaS', desc: 'Customer engagement' },
    { name: 'Zoho Corporation', industry: 'SaaS', desc: 'Business software' },
    { name: 'Razorpay', industry: 'FinTech', desc: 'Payment solutions' },
    { name: 'PhonePe', industry: 'FinTech', desc: 'Digital payments' }
  ];

  // ========== CLEAR EXISTING DATA (Keep courses) ==========
  console.log('📋 Clearing existing user data...');
  await prisma.jobApplication.deleteMany({});
  await prisma.message.deleteMany({});
  await prisma.skill.deleteMany({});
  await prisma.job.deleteMany({});
  await prisma.dailyTask.deleteMany({});
  await prisma.courseEnrollment.deleteMany({});
  await prisma.leaderboardEntry.deleteMany({});
  await prisma.broadcast.deleteMany({});
  await prisma.user.deleteMany({});
  console.log('✅ Cleared user data (courses preserved)\n');

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

  // ========== 2. CREATE COLLEGE TPOS ==========
  console.log('🏛️ Creating College TPOs...');
  
  const collegeTPOs = [
    { name: 'Dr. A. Rahman', email: 'tpo@aalimcollege.edu', college: colleges[0].name },
    { name: 'Dr. Senthil Kumar', email: 'tpo@annauniv.edu', college: colleges[1].name },
    { name: 'Prof. Krishnamoorthy', email: 'tpo@iitm.ac.in', college: colleges[2].name },
    { name: 'Dr. Meenakshi', email: 'placement@nit.edu', college: colleges[3].name },
    { name: 'Prof. Raghavan', email: 'tpo@vit.ac.in', college: colleges[4].name },
    { name: 'Dr. Bharadwaj', email: 'placement@bitspilani.edu', college: colleges[5].name },
    { name: 'Prof. Vanitha', email: 'tpo@psgtech.edu', college: colleges[6].name },
    { name: 'Dr. Kumar', email: 'placement@ssn.edu', college: colleges[7].name },
    { name: 'Prof. Priya', email: 'tpo@srm.edu', college: colleges[8].name },
    { name: 'Dr. Srinivasan', email: 'placement@sastra.edu', college: colleges[9].name }
  ];
  
  const collegeRecords = [];
  for (const tpo of collegeTPOs) {
    const record = await prisma.user.create({
      data: {
        fullName: tpo.name,
        email: tpo.email,
        password: hash,
        role: 'COLLEGE',
        college: tpo.college,
        isVerified: true,
        avatarInitials: tpo.name.split(' ').map(n => n[0]).join('')
      }
    });
    collegeRecords.push(record);
    if (tpo.college.includes('Aalim')) {
      console.log(`  ✅🏆 ${tpo.college.split(',')[0]} - ${tpo.email}`);
    } else {
      console.log(`  ✅ ${tpo.college.split(',')[0]} - ${tpo.email}`);
    }
  }
  console.log('');

  // ========== 3. CREATE EMPLOYERS ==========
  console.log('💼 Creating Employers...');
  
  const employerRecords = [];
  for (const company of companies) {
    const record = await prisma.user.create({
      data: {
        fullName: `${company.name} HR`,
        email: `hr@${company.name.toLowerCase().replace(/ /g, '')}.com`,
        password: hash,
        role: 'EMPLOYER',
        company: company.name,
        companyDescription: company.desc,
        companyIndustry: company.industry,
        companyLocation: 'Bangalore',
        companyWebsite: `https://${company.name.toLowerCase().replace(/ /g, '')}.com`,
        isVerified: true,
        avatarInitials: company.name.charAt(0)
      }
    });
    employerRecords.push(record);
  }
  console.log(`  ✅ Total ${employerRecords.length} employers created!\n`);

  // ========== 4. CREATE STUDENTS ==========
  console.log('🎓 Creating Students...');
  
  const departments = [
    'Computer Science Engineering', 'Information Technology', 'Artificial Intelligence & ML',
    'Data Science', 'Cyber Security', 'Electronics Engineering'
  ];
  
  const studentRecords = [];
  // After creating students, add this function
async function updateStudentCredits() {
  console.log('\n💰 Updating student credits...\n');
  
  // Give high credits to Aalim College students
  const aalimStudents = await prisma.user.findMany({
    where: {
      role: 'STUDENT',
      college: { contains: 'Aalim' }
    }
  });
  
  const aalimCredits = [5200, 5100, 5050, 5000, 4800, 4700, 4600, 4500];
  
  for (let i = 0; i < aalimStudents.length; i++) {
    const credits = aalimCredits[i] || 4500;
    await prisma.user.update({
      where: { id: aalimStudents[i].id },
      data: { 
        procredits: credits,
        streak: 100,
        consistencyScore: 95
      }
    });
    console.log(`   ✅ ${aalimStudents[i].fullName} - ${credits} credits`);
  }
  
  // Give medium credits to other college students
  const otherStudents = await prisma.user.findMany({
    where: {
      role: 'STUDENT',
      college: { not: { contains: 'Aalim' } }
    }
  });
  
  for (const student of otherStudents) {
    const credits = Math.floor(Math.random() * 2500) + 500;
    await prisma.user.update({
      where: { id: student.id },
      data: { procredits: credits }
    });
  }
  
  console.log(`\n✅ Updated credits for all students`);
}

// Call this function after creating students
await updateStudentCredits();
  // ===== AALIM COLLEGE STUDENTS (4 students - HIGH CREDITS) =====
  const aalimStudents = [
    { name: 'Bhuvanesh', credits: 4800, email: 'bhuvanesh@aalimcollege.edu' },
    { name: 'Asif', credits: 4600, email: 'asif@aalimcollege.edu' },
    { name: 'Tamil Alagan', credits: 4500, email: 'tamil@aalimcollege.edu' },
    { name: 'Mohamed Apsar', credits: 4400, email: 'mohamed@aalimcollege.edu' }
  ];
  
  for (const aalimStudent of aalimStudents) {
    const student = await prisma.user.create({
      data: {
        fullName: aalimStudent.name,
        email: aalimStudent.email,
        password: hash,
        role: 'STUDENT',
        college: colleges[0].name,
        department: departments[Math.floor(Math.random() * departments.length)],
        procredits: aalimStudent.credits,
        streak: Math.floor(Math.random() * 30) + 70,
        consistencyScore: Math.floor(Math.random() * 20) + 75,
        isVerified: true,
        placementStatus: 'Placed',
        avatarInitials: aalimStudent.name.charAt(0)
      }
    });
    studentRecords.push(student);
    console.log(`  ✅🏆 ${aalimStudent.name} - ${aalimStudent.credits} credits (Aalim College)`);
  }

  // ===== ANNA UNIVERSITY STUDENTS (2 students) =====
  const annaStudents = [
    { name: 'Arun Kumar', credits: 3200, email: 'arun@annauniv.edu' },
    { name: 'Divya Sri', credits: 3100, email: 'divya@annauniv.edu' }
  ];
  
  for (const annaStudent of annaStudents) {
    const student = await prisma.user.create({
      data: {
        fullName: annaStudent.name,
        email: annaStudent.email,
        password: hash,
        role: 'STUDENT',
        college: colleges[1].name,
        department: departments[Math.floor(Math.random() * departments.length)],
        procredits: annaStudent.credits,
        streak: Math.floor(Math.random() * 30) + 40,
        consistencyScore: Math.floor(Math.random() * 30) + 60,
        isVerified: true,
        placementStatus: annaStudent.credits > 3000 ? 'Placed' : 'Active',
        avatarInitials: annaStudent.name.charAt(0)
      }
    });
    studentRecords.push(student);
    console.log(`  ✅ ${annaStudent.name} - ${annaStudent.credits} credits (Anna University)`);
  }

  // ===== IIT MADRAS STUDENTS (2 students) =====
  const iitStudents = [
    { name: 'Karthik Raja', credits: 3800, email: 'karthik@iitm.ac.in' },
    { name: 'Meena Kumari', credits: 3700, email: 'meena@iitm.ac.in' }
  ];
  
  for (const iitStudent of iitStudents) {
    const student = await prisma.user.create({
      data: {
        fullName: iitStudent.name,
        email: iitStudent.email,
        password: hash,
        role: 'STUDENT',
        college: colleges[2].name,
        department: departments[Math.floor(Math.random() * departments.length)],
        procredits: iitStudent.credits,
        streak: Math.floor(Math.random() * 30) + 50,
        consistencyScore: Math.floor(Math.random() * 30) + 65,
        isVerified: true,
        placementStatus: iitStudent.credits > 3500 ? 'Placed' : 'Active',
        avatarInitials: iitStudent.name.charAt(0)
      }
    });
    studentRecords.push(student);
    console.log(`  ✅ ${iitStudent.name} - ${iitStudent.credits} credits (IIT Madras)`);
  }

  console.log(`  ✅ Total ${studentRecords.length} students created! (4 Aalim + 2 Anna + 2 IIT)\n`);

  // ========== 5. GET EXISTING COURSES ==========
  console.log('📚 Checking existing courses...');
  
  const allCourses = await prisma.course.findMany();
  
  if (allCourses.length === 0) {
    console.log('⚠️ No courses found! Please run course seeds first:');
    console.log('   node prisma/seed-course.js');
    console.log('   node prisma/seed-dsa.js');
    console.log('   node prisma/seed-fullstack.js');
    console.log('   node prisma/seed-genai.js');
    console.log('   node prisma/seed-node.js');
    console.log('   node prisma/seed-python.js');
  } else {
    console.log(`  ✅ Found ${allCourses.length} courses:`);
    for (const course of allCourses) {
      console.log(`     📚 ${course.title}`);
    }
  }
  console.log('');

  // ========== 6. CREATE COURSE ENROLLMENTS ==========
  console.log('📝 Creating Course Enrollments...');
  
  let enrollmentCount = 0;
  
  if (allCourses.length > 0) {
    for (const student of studentRecords) {
      const numCourses = student.college.includes('Aalim') ? Math.min(4, allCourses.length) : Math.min(2, allCourses.length);
      const shuffledCourses = [...allCourses].sort(() => 0.5 - Math.random());
      
      for (let i = 0; i < numCourses; i++) {
        const course = shuffledCourses[i];
        const progress = student.college.includes('Aalim') 
          ? Math.floor(Math.random() * 30) + 70 
          : Math.floor(Math.random() * 60) + 20;
        
        const existing = await prisma.courseEnrollment.findFirst({
          where: { userId: student.id, courseId: course.id }
        });
        
        if (!existing) {
          await prisma.courseEnrollment.create({
            data: {
              userId: student.id,
              courseId: course.id,
              progress: progress,
              completedTopics: Math.floor((progress / 100) * (course.totalModules || 20))
            }
          });
          enrollmentCount++;
        }
      }
    }
  }
  console.log(`  ✅ Created ${enrollmentCount} course enrollments\n`);

  // ========== 7. CREATE JOBS ==========
  console.log('📋 Creating Jobs...');
  
  const jobTitles = [
    'Frontend Developer', 'Backend Engineer', 'Full Stack Developer', 
    'Data Scientist', 'Software Engineer', 'AI/ML Engineer'
  ];
  
  const locations = ['Bangalore', 'Chennai', 'Hyderabad', 'Mumbai', 'Pune', 'Remote'];
  const jobTypes = ['Full-time', 'Internship', 'Contract'];
  
  let totalJobs = 0;
  
  for (const employer of employerRecords.slice(0, 15)) {
    const numJobs = employer.company === 'Google' || employer.company === 'Microsoft' || employer.company === 'Amazon'
      ? Math.floor(Math.random() * 3) + 2
      : Math.floor(Math.random() * 2) + 1;
    
    for (let i = 0; i < numJobs; i++) {
      const title = jobTitles[Math.floor(Math.random() * jobTitles.length)];
      const location = locations[Math.floor(Math.random() * locations.length)];
      const type = jobTypes[Math.floor(Math.random() * jobTypes.length)];
      const salaryMin = (Math.floor(Math.random() * 25) + 5) * 100000;
      const salaryMax = salaryMin + (Math.floor(Math.random() * 20) + 5) * 100000;
      
      await prisma.job.create({
        data: {
          title: title,
          company: employer.company,
          location: location,
          type: type,
          salaryMin: salaryMin,
          salaryMax: salaryMax,
          description: `Join ${employer.company} as a ${title}. Great opportunity!`,
          requirements: `${Math.floor(Math.random() * 4) + 2}+ years experience required.`,
          skills: 'JavaScript, React, Node.js',
          deadline: new Date('2026-12-31'),
          postedBy: employer.id,
          status: 'approved',
          maxApplicants: 50 + Math.floor(Math.random() * 150)
        }
      });
      totalJobs++;
    }
  }
  console.log(`  ✅ Created ${totalJobs} jobs\n`);

  // ========== 8. CREATE JOB APPLICATIONS ==========
  console.log('📝 Creating Job Applications...');
  
  const allJobs = await prisma.job.findMany();
  let appCount = 0;
  
  for (const student of studentRecords) {
    const numApps = student.college.includes('Aalim') ? Math.floor(Math.random() * 3) + 3 : Math.floor(Math.random() * 3) + 1;
    const shuffledJobs = [...allJobs].sort(() => 0.5 - Math.random());
    
    for (let i = 0; i < numApps && i < shuffledJobs.length; i++) {
      const job = shuffledJobs[i];
      let finalStatus;
      
      if (student.college.includes('Aalim')) {
        const statuses = ['Shortlisted', 'Interview', 'Interview', 'HIRED', 'HIRED'];
        finalStatus = statuses[Math.floor(Math.random() * statuses.length)];
      } else {
        const statuses = ['Applied', 'Applied', 'Shortlisted', 'Interview', 'Rejected'];
        finalStatus = statuses[Math.floor(Math.random() * statuses.length)];
      }
      
      await prisma.jobApplication.create({
        data: {
          jobId: job.id,
          studentId: student.id,
          studentName: student.fullName,
          studentEmail: student.email,
          college: student.college,
          department: student.department,
          status: finalStatus,
          matchScore: student.college.includes('Aalim') ? Math.floor(Math.random() * 20) + 80 : Math.floor(Math.random() * 40) + 50,
          appliedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
        }
      });
      appCount++;
    }
  }
  console.log(`  ✅ Created ${appCount} job applications\n`);

  // ========== 9. CREATE DAILY TASKS ==========
  console.log('✅ Creating Daily Tasks...');
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  for (const student of studentRecords) {
    if (student.college.includes('Aalim')) {
      for (let i = 0; i < 3; i++) {
        const hours = [9, 11, 14][i];
        const time = `${hours.toString().padStart(2, '0')}:00 ${hours < 12 ? 'AM' : 'PM'}`;
        
        await prisma.dailyTask.create({
          data: {
            userId: student.id,
            taskTime: time,
            taskName: i === 0 ? 'Complete React Module' : i === 1 ? 'Weekly Assessment' : 'Capstone Project',
            taskType: i === 0 ? 'Learning' : i === 1 ? 'Assessment' : 'Project',
            durationMinutes: [45, 30, 60][i],
            isDone: i === 1,
            taskDate: today
          }
        });
      }
    }
  }
  console.log(`  ✅ Created daily tasks for Aalim students\n`);

  // ========== 10. CREATE BROADCASTS ==========
  console.log('📢 Creating Broadcasts...');
  
  const broadcastMessages = [
    '🏆 Aalim College students are leading the leaderboard! Keep up the great work!',
    '📢 Google and Microsoft hiring drive for Aalim College students on Dec 20th!',
    '🎓 Placement drive: 50+ companies visiting campuses next month!',
    '💼 Resume building workshop this Friday at 10 AM!',
    '🚀 Summer internship applications are now open for all students!'
  ];
  
  for (const message of broadcastMessages) {
    await prisma.broadcast.create({
      data: {
        senderId: collegeRecords[0].id,
        text: message
      }
    });
  }
  console.log(`  ✅ Created ${broadcastMessages.length} broadcasts\n`);

  // ========== 11. CREATE LEADERBOARD ==========
  console.log('🏆 Creating Leaderboard...');
  
  const sortedStudents = [...studentRecords].sort((a, b) => b.procredits - a.procredits);
  
  let rank = 1;
  for (const student of sortedStudents) {
    const existing = await prisma.leaderboardEntry.findUnique({
      where: { userId: student.id }
    });
    
    if (!existing) {
      await prisma.leaderboardEntry.create({
        data: {
          userId: student.id,
          credits: student.procredits,
          rank: rank,
          trend: rank <= 4 ? 'up' : 'stable'
        }
      });
    }
    const isAalim = student.college.includes('Aalim');
    console.log(`  ${rank}. ${student.fullName} - ${student.procredits} credits ${isAalim ? '🏆' : ''}`);
    rank++;
  }
  console.log(`\n  ✅ Leaderboard created with ${sortedStudents.length} entries\n`);

  // ========== FINAL SUMMARY ==========
  const totalUsers = await prisma.user.count();
  const totalJobsCreated = await prisma.job.count();
  const totalApps = await prisma.jobApplication.count();
  const totalLeaderboard = await prisma.leaderboardEntry.count();
  const totalCourses = await prisma.course.count();
  
  console.log('='.repeat(60));
  console.log('🎉 DATABASE SEED COMPLETED SUCCESSFULLY! 🎉');
  console.log('='.repeat(60));
  console.log(`\n📊 FINAL SUMMARY:`);
  console.log(`  👑 Admin: 1`);
  console.log(`  🏛️ College TPOs: ${collegeRecords.length}`);
  console.log(`  💼 Employers: ${employerRecords.length}`);
  console.log(`  🎓 Students: ${studentRecords.length}`);
  console.log(`     - Aalim College: 4 students (Bhuvanesh, Asif, Tamil Alagan, Mohamed)`);
  console.log(`     - Anna University: 2 students`);
  console.log(`     - IIT Madras: 2 students`);
  console.log(`  📚 Courses: ${totalCourses}`);
  console.log(`  📋 Jobs: ${totalJobsCreated}`);
  console.log(`  📝 Applications: ${totalApps}`);
  console.log(`  🏆 Leaderboard: ${totalLeaderboard} entries`);
  
  console.log('\n🔑 LOGIN CREDENTIALS:');
  console.log('  👑 ADMIN:         admin@careerconnect.com / 123456');
  console.log('  🏛️ AALIM TPO:     tpo@aalimcollege.edu / 123456');
  console.log('  🎓 AALIM STUDENTS:');
  console.log('     bhuvanesh@aalimcollege.edu / 123456');
  console.log('     asif@aalimcollege.edu / 123456');
  console.log('     tamil@aalimcollege.edu / 123456');
  console.log('     mohamed@aalimcollege.edu / 123456');
  console.log('  🎓 ANNA UNIVERSITY: arun@annauniv.edu / 123456');
  console.log('                    divya@annauniv.edu / 123456');
  console.log('  🎓 IIT MADRAS:     karthik@iitm.ac.in / 123456');
  console.log('                    meena@iitm.ac.in / 123456');
  console.log('  💼 EMPLOYER:      hr@google.com / 123456');
  
  console.log('\n📈 TOP LEADERBOARD:');
  const top5 = sortedStudents.slice(0, 5);
  top5.forEach((student, idx) => {
    console.log(`   ${idx + 1}. ${student.fullName} - ${student.procredits} credits 🏆`);
  });
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ Database seeded successfully!');
  console.log('='.repeat(60));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());