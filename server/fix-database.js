const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function fixDatabase() {
  console.log('🔧 FIXING DATABASE...\n');
  console.log('='.repeat(50));

  try {
    // ========== 1. FIND OR CREATE STUDENT ==========
    console.log('\n📝 STEP 1: Updating student data...');
    
    let student = await prisma.user.findFirst({
      where: { email: 'student@test.com' }
    });

    if (!student) {
      const hashedPassword = await bcrypt.hash('123456', 10);
      student = await prisma.user.create({
        data: {
          fullName: 'Mohamed Apsar',
          email: 'student@test.com',
          password: hashedPassword,
          role: 'STUDENT',
          college: 'Aalim Muhammed Salegh College of Engineering (AMSCE), Chennai',
          department: 'Computer Science Engineering',
          procredits: 2450,
          isVerified: true,
          avatarInitials: 'MA'
        }
      });
      console.log('   ✅ Student created');
    } else {
      student = await prisma.user.update({
        where: { id: student.id },
        data: {
          procredits: 2450,
          college: 'Aalim Muhammed Salegh College of Engineering (AMSCE), Chennai',
          department: 'Computer Science Engineering',
          isVerified: true
        }
      });
      console.log('   ✅ Student updated');
    }
    
    console.log(`   📧 Email: ${student.email}`);
    console.log(`   ⭐ ProCredits: ${student.procredits}`);

    // ========== 2. UPDATE SKILLS ==========
    console.log('\n📚 STEP 2: Adding skills...');
    
    await prisma.skill.deleteMany({ where: { userId: student.id } });
    
    const skills = [
      { name: 'React.js', score: 88, category: 'Frontend' },
      { name: 'JavaScript', score: 82, category: 'Frontend' },
      { name: 'Python', score: 92, category: 'Backend' },
      { name: 'Node.js', score: 75, category: 'Backend' },
      { name: 'TypeScript', score: 70, category: 'Frontend' },
      { name: 'MongoDB', score: 65, category: 'Database' },
      { name: 'Tailwind CSS', score: 80, category: 'Frontend' },
      { name: 'Express.js', score: 68, category: 'Backend' },
      { name: 'Git', score: 85, category: 'Tools' },
      { name: 'Docker', score: 60, category: 'DevOps' }
    ];
    
    for (const skill of skills) {
      await prisma.skill.create({
        data: {
          userId: student.id,
          name: skill.name,
          score: skill.score,
          category: skill.category
        }
      });
    }
    
    const skillCount = await prisma.skill.count({ where: { userId: student.id } });
    console.log(`   ✅ Added ${skillCount} skills`);

    // ========== 3. CREATE DAILY TASKS ==========
    console.log('\n📋 STEP 3: Creating daily tasks...');
    
    await prisma.dailyTask.deleteMany({ where: { userId: student.id } });
    
    const today = new Date();
    const taskNames = [
      'Complete React Components', 'DSA Practice Session', 'API Integration Task',
      'Study System Design', 'Code Review Practice', 'Build Mini Project',
      'Learn TypeScript', 'Practice LeetCode', 'Work on Portfolio'
    ];
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const completed = i < 25;
      
      await prisma.dailyTask.create({
        data: {
          userId: student.id,
          time: '09:00 AM',
          task: taskNames[i % taskNames.length],
          type: i % 2 === 0 ? 'Learning' : 'Practice',
          duration: '45min',
          done: completed,
          date: date
        }
      });
    }
    
    const taskCount = await prisma.dailyTask.count({ where: { userId: student.id } });
    const completedCount = await prisma.dailyTask.count({ 
      where: { userId: student.id, done: true } 
    });
    console.log(`   ✅ Added ${taskCount} tasks`);
    console.log(`   ✅ ${completedCount} tasks completed`);

    // ========== 4. ADD COURSE ENROLLMENTS ==========
    console.log('\n🎓 STEP 4: Adding course enrollments...');
    
    let courses = await prisma.course.findMany();
    
    if (courses.length === 0) {
      await prisma.course.createMany({
        data: [
          { title: 'React JS Mastery', description: 'Learn React from basics to advanced', category: 'Frontend', difficulty: 'Intermediate', duration: '8 weeks', totalModules: 12, accentColor: '#6366f1', icon: '⚛️' },
          { title: 'Python for Data Science', description: 'Master Python for data analysis', category: 'Data Science', difficulty: 'Beginner', duration: '6 weeks', totalModules: 10, accentColor: '#ec4899', icon: '🐍' },
          { title: 'Node.js & Express Mastery', description: 'Backend development with Node', category: 'Backend', difficulty: 'Intermediate', duration: '8 weeks', totalModules: 14, accentColor: '#22c55e', icon: '🚀' }
        ]
      });
      courses = await prisma.course.findMany();
    }
    
    await prisma.courseEnrollment.deleteMany({ where: { userId: student.id } });
    
    for (const course of courses) {
      await prisma.courseEnrollment.create({
        data: {
          userId: student.id,
          courseId: course.id,
          progress: Math.floor(Math.random() * 100),
          completedTopics: Math.floor(Math.random() * 15)
        }
      });
    }
    
    const courseCount = await prisma.courseEnrollment.count({ where: { userId: student.id } });
    console.log(`   ✅ Enrolled in ${courseCount} courses`);

    // ========== 5. ADD JOB APPLICATIONS ==========
    console.log('\n💼 STEP 5: Adding job applications...');
    
    const jobs = await prisma.job.findMany({ take: 5 });
    
    if (jobs.length > 0) {
      await prisma.jobApplication.deleteMany({ where: { studentId: student.id } });
      
      const statuses = ['Applied', 'Shortlisted', 'Interview', 'Shortlisted', 'Applied'];
      for (let i = 0; i < jobs.length; i++) {
        await prisma.jobApplication.create({
          data: {
            jobId: jobs[i].id,
            studentId: student.id,
            studentName: student.fullName,
            studentEmail: student.email,
            college: student.college,
            department: student.department,
            status: statuses[i],
            matchScore: 75 + Math.floor(Math.random() * 20),
            appliedAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000)
          }
        });
      }
      console.log(`   ✅ Added ${jobs.length} job applications`);
    } else {
      console.log('   ⚠️ No jobs found, skipping applications');
    }

    // ========== 6. ADD LEADERBOARD ENTRY ==========
    console.log('\n🏆 STEP 6: Adding leaderboard entry...');
    
    await prisma.leaderboardEntry.deleteMany({ where: { userId: student.id } });
    
    await prisma.leaderboardEntry.create({
      data: {
        userId: student.id,
        credits: student.procredits,
        trend: 'up'
      }
    });
    console.log('   ✅ Leaderboard entry added');

    // ========== FINAL SUMMARY (FIXED) ==========
    console.log('\n' + '='.repeat(50));
    console.log('✅ DATABASE FIX COMPLETED!');
    console.log('='.repeat(50));
    
    // Fixed: Use correct relation names from schema
    const finalStudent = await prisma.user.findUnique({
      where: { id: student.id },
      include: { 
        skills: true,
        applications: true  // This is JobApplication relation (not courseEnrollments)
      }
    });
    
    // Get course count separately
    const courseEnrollments = await prisma.courseEnrollment.count({ 
      where: { userId: student.id } 
    });
    
    console.log('\n📊 FINAL STATS:');
    console.log(`   👨‍🎓 Student: ${finalStudent.email}`);
    console.log(`   ⭐ ProCredits: ${finalStudent.procredits}`);
    console.log(`   📚 Skills: ${finalStudent.skills.length}`);
    console.log(`   🎓 Courses: ${courseEnrollments}`);
    console.log(`   💼 Applications: ${finalStudent.applications.length}`);
    
    console.log('\n🔑 Login: student@test.com / 123456');
    console.log('='.repeat(50));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

fixDatabase();