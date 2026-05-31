const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function seedAnalytics() {
  console.log('🌱 Starting Analytics Data Seed...\n');

  try {
    // Find or create student
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
      console.log('✅ Student created:', student.email);
    } else {
      console.log('✅ Student found:', student.email);
    }

    // Clear existing analytics data
    await prisma.skill.deleteMany({ where: { userId: student.id } });
    await prisma.dailyTask.deleteMany({ where: { userId: student.id } });
    console.log('🗑️ Cleared existing analytics data\n');

    // ========== CREATE SKILLS ==========
    console.log('📚 Creating skills...');
    
    const skills = [
      { name: 'React.js', score: 85, category: 'Frontend' },
      { name: 'JavaScript', score: 78, category: 'Frontend' },
      { name: 'Python', score: 92, category: 'Backend' },
      { name: 'Node.js', score: 70, category: 'Backend' },
      { name: 'MongoDB', score: 65, category: 'Database' },
      { name: 'TypeScript', score: 80, category: 'Frontend' },
      { name: 'Tailwind CSS', score: 75, category: 'Frontend' },
      { name: 'Express.js', score: 68, category: 'Backend' },
      { name: 'Git', score: 82, category: 'Tools' },
      { name: 'Docker', score: 55, category: 'DevOps' }
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
      console.log(`  ✅ ${skill.name}: ${skill.score}% (${skill.category})`);
    }

    // ========== CREATE DAILY TASKS (Last 30 days) ==========
    console.log('\n📋 Creating daily tasks...');
    
    const today = new Date();
    const tasksData = [];
    
    // Generate tasks for last 30 days
    const taskNames = [
      'Complete React Components', 'DSA Practice Session', 'API Integration Task',
      'Study System Design', 'Code Review Practice', 'Build Mini Project',
      'Learn TypeScript Advanced', 'Practice LeetCode', 'Work on Portfolio',
      'Database Optimization', 'Security Best Practices', 'Cloud Deployment'
    ];
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      
      // Higher completion rate for recent days
      const completionRate = i < 7 ? 0.9 : i < 14 ? 0.75 : i < 21 ? 0.6 : 0.4;
      const completed = Math.random() < completionRate;
      
      tasksData.push({
        userId: student.id,
        time: `${9 + (i % 8)}:${i % 60}`,
        task: taskNames[i % taskNames.length],
        type: i % 3 === 0 ? 'Assessment' : i % 2 === 0 ? 'Learning' : 'Practice',
        duration: `${30 + (i % 45)}min`,
        done: completed,
        date: date
      });
    }
    
    for (const task of tasksData) {
      await prisma.dailyTask.create({ data: task });
    }
    console.log(`  ✅ Created ${tasksData.length} daily tasks`);

    // ========== UPDATE USER STATS ==========
    console.log('\n📊 Updating user stats...');
    
    const skillCount = await prisma.skill.count({ where: { userId: student.id } });
    const completedTasks = await prisma.dailyTask.count({ 
      where: { userId: student.id, done: true } 
    });
    
    await prisma.user.update({
      where: { id: student.id },
      data: {
        procredits: 2450,
        placementStatus: 'Active'
      }
    });
    
    console.log(`  ✅ Stats updated - Skills: ${skillCount}, Tasks Completed: ${completedTasks}`);

    // ========== CREATE JOB APPLICATIONS (if jobs exist) ==========
    console.log('\n💼 Creating job applications...');
    
    const jobs = await prisma.job.findMany({ take: 5 });
    
    if (jobs.length > 0) {
      // Clear existing applications for this student
      await prisma.jobApplication.deleteMany({
        where: { studentId: student.id }
      });
      
      const statuses = ['Applied', 'Shortlisted', 'Interview', 'HIRED'];
      for (let i = 0; i < jobs.length; i++) {
        const job = jobs[i];
        const status = i < 2 ? 'HIRED' : statuses[Math.floor(Math.random() * statuses.length)];
        
        await prisma.jobApplication.create({
          data: {
            jobId: job.id,
            studentId: student.id,
            studentName: student.fullName,
            studentEmail: student.email,
            college: student.college,
            department: student.department,
            status: status,
            matchScore: Math.floor(Math.random() * 40) + 60,
            appliedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
          }
        });
      }
      console.log(`  ✅ Created ${jobs.length} job applications`);
    } else {
      console.log('  ⚠️ No jobs found, skipping applications');
    }

    // ========== SUMMARY ==========
    console.log('\n' + '='.repeat(60));
    console.log('🎉 ANALYTICS DATA SEEDED SUCCESSFULLY! 🎉');
    console.log('='.repeat(60));
    console.log('\n📊 Summary:');
    console.log(`  👨‍🎓 Student: ${student.email}`);
    console.log(`  📚 Skills: ${skills.length}`);
    console.log(`  📋 Daily Tasks: ${tasksData.length}`);
    console.log(`  💼 Applications: ${jobs.length}`);
    console.log(`  ⭐ ProCredits: 2450`);
    
    console.log('\n📈 Analytics Dashboard will now show:');
    console.log(`  • Skills proficiency with scores`);
    console.log(`  • Learning performance trends`);
    console.log(`  • Recent activities`);
    
    console.log('\n🔑 Login to see analytics:');
    console.log(`  Email: student@test.com`);
    console.log(`  Password: 123456`);
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Error seeding analytics data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedAnalytics();