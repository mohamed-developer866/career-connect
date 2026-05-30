var { PrismaClient } = require('@prisma/client');
var prisma = new PrismaClient();
var bcrypt = require('bcryptjs'); // ← MOVE TO TOP

async function main() {
  console.log('🧹 Cleaning existing dummy data...');
  
  // Delete only students with @amsce.edu.in emails
  var existingStudents = await prisma.user.findMany({
    where: { email: { contains: '@amsce.edu.in' } }
  });
  
  for (var student of existingStudents) {
    await prisma.userProgress.deleteMany({ where: { userId: student.id } }).catch(function() {});
    await prisma.courseEnrollment.deleteMany({ where: { userId: student.id } }).catch(function() {});
    await prisma.leaderboardEntry.deleteMany({ where: { userId: student.id } }).catch(function() {});
    await prisma.dailyTask.deleteMany({ where: { userId: student.id } }).catch(function() {});
    await prisma.skill.deleteMany({ where: { userId: student.id } }).catch(function() {});
    await prisma.user.delete({ where: { id: student.id } }).catch(function() {});
  }
  
  console.log('✅ Cleaned old AMSCE data\n');

  // ==================== 10 AMSCE STUDENTS ====================
  var students = [
    { fullName: "Rahul Kumar", email: "rahul.kumar@amsce.edu.in", department: "B.Tech CSE", placementStatus: "Placed", procredits: 1240, phone: "9876543201" },
    { fullName: "Priya Sharma", email: "priya.sharma@amsce.edu.in", department: "B.Tech AI & DS", placementStatus: "Unplaced", procredits: 980, phone: "9876543202" },
    { fullName: "Ananya Patel", email: "ananya.patel@amsce.edu.in", department: "B.Tech IT", placementStatus: "Unplaced", procredits: 850, phone: "9876543203" },
    { fullName: "Vikram Singh", email: "vikram.singh@amsce.edu.in", department: "B.Tech ECE", placementStatus: "Placed", procredits: 720, phone: "9876543204" },
    { fullName: "Sneha Reddy", email: "sneha.reddy@amsce.edu.in", department: "B.Tech CSE", placementStatus: "Unplaced", procredits: 680, phone: "9876543205" },
    { fullName: "Arjun Nair", email: "arjun.nair@amsce.edu.in", department: "B.Tech AI & DS", placementStatus: "Unplaced", procredits: 560, phone: "9876543206" },
    { fullName: "Divya Menon", email: "divya.menon@amsce.edu.in", department: "B.Tech CSE", placementStatus: "Placed", procredits: 920, phone: "9876543207" },
    { fullName: "Karthik Raja", email: "karthik.raja@amsce.edu.in", department: "B.Tech IT", placementStatus: "Unplaced", procredits: 450, phone: "9876543208" },
    { fullName: "Meera Krishnan", email: "meera.krishnan@amsce.edu.in", department: "B.Tech ECE", placementStatus: "Unplaced", procredits: 780, phone: "9876543209" },
    { fullName: "Suresh Babu", email: "suresh.babu@amsce.edu.in", department: "B.Tech CSE", placementStatus: "Placed", procredits: 1100, phone: "9876543210" },
  ];

  var createdStudents = [];
  
  for (var student of students) {
    var hashedPassword = await bcrypt.hash('amsce123', 10); // ← No need to require here
    
    var created = await prisma.user.create({
      data: {
        fullName: student.fullName,
        email: student.email,
        password: hashedPassword,
        role: "STUDENT",
        college: "AMSCE Chennai",
        department: student.department,
        phone: student.phone,
        placementStatus: student.placementStatus,
        procredits: student.procredits,
        avatarInitials: student.fullName.split(' ').map(function(n) { return n[0]; }).join(''),
        isVerified: true
      }
    });
    createdStudents.push(created);
    console.log('  ✓ ' + student.fullName + ' (' + student.email + ')');
  }

  console.log('\n✅ 10 AMSCE students created!\n');

  // ==================== ENROLL IN COURSES ====================  // ==================== ENROLL IN COURSES ====================
  // Auto-find any course in the database
  var allCourses = await prisma.course.findMany();
  
  if (allCourses.length === 0) {
    console.log('⚠️ No courses found in database! Run seed-course.js first.\n');
  } else {
    // Enroll each student in ALL available courses
    for (var course of allCourses) {
      console.log('📚 Enrolling in: ' + course.title);
      
      for (var student of createdStudents) {
        await prisma.courseEnrollment.create({
          data: {
            userId: student.id,
            courseId: course.id,
            progress: Math.floor(Math.random() * 80),
            completedTopics: Math.floor(Math.random() * course.totalTopics || 18)
          }
        }).catch(function(err) {
          console.log('  ⚠ ' + student.fullName + ': ' + err.message);
        });
      }
    }
    console.log('✅ Students enrolled in all courses!\n');
  }
  // ==================== ADD SKILLS ====================
  var skillsList = [
    "JavaScript", "React", "Node.js", "Python", "TypeScript",
    "HTML", "CSS", "SQL", "MongoDB", "Git", "C++", "Java"
  ];
  
  for (var student of createdStudents) {
    var numSkills = Math.floor(Math.random() * 4) + 3;
    var selectedSkills = skillsList.sort(function() { return 0.5 - Math.random(); }).slice(0, numSkills);
    
    for (var skill of selectedSkills) {
      await prisma.skill.create({
        data: {
          userId: student.id,
          name: skill,
          score: Math.floor(Math.random() * 100),
          category: "Technical"
        }
      });
    }
  }
  console.log('✅ Skills added\n');

  // ==================== ADD DAILY TASKS ====================
  var taskNames = [
    "DSA Arrays Practice", "React Hooks Deep Dive", "LeetCode Problem Solving",
    "System Design Case Study", "Mock Interview Preparation", "Python for AI"
  ];
  var taskTypes = ["Coding", "Learning", "Practice", "Reading", "Prep"];
  var taskTimes = ["08:00 AM", "09:30 AM", "11:00 AM", "02:00 PM", "04:00 PM"];
  var taskDurations = ["30m", "45m", "60m"];
  
  for (var student of createdStudents) {
    var numTasks = Math.floor(Math.random() * 3) + 3;
    
    for (var i = 0; i < numTasks; i++) {
      await prisma.dailyTask.create({
        data: {
          userId: student.id,
          task: taskNames[Math.floor(Math.random() * taskNames.length)],
          type: taskTypes[Math.floor(Math.random() * taskTypes.length)],
          time: taskTimes[Math.floor(Math.random() * taskTimes.length)],
          duration: taskDurations[Math.floor(Math.random() * taskDurations.length)],
          done: Math.random() > 0.7,
          date: new Date()
        }
      });
    }
  }
  console.log('✅ Daily tasks added\n');

  // ==================== ADD LEADERBOARD ====================
  var sorted = createdStudents.sort(function(a, b) { return b.procredits - a.procredits; });
  var trends = ["up", "down", "same"];
  
  for (var i = 0; i < sorted.length; i++) {
    await prisma.leaderboardEntry.create({
      data: {
        userId: sorted[i].id,
        credits: sorted[i].procredits,
        trend: trends[Math.floor(Math.random() * trends.length)]
      }
    });
  }
  console.log('✅ Leaderboard populated\n');

  // ==================== CREATE COLLEGE TPO ====================
  var tpoPassword = await bcrypt.hash('amsce123', 10);
  
  var existingTPO = await prisma.user.findFirst({ where: { email: 'tpo@amsce.edu.in' } });
  if (!existingTPO) {
    await prisma.user.create({
      data: {
        fullName: "Dr. Rajeshwari S",
        email: "tpo@amsce.edu.in",
        password: tpoPassword,
        role: "COLLEGE",
        college: "AMSCE Chennai",
        department: "Training & Placement",
        phone: "9876543000",
        avatarInitials: "RS",
        isVerified: true
      }
    });
    console.log('✅ AMSCE TPO created: tpo@amsce.edu.in');
  }

  // ==================== CREATE EMPLOYER ====================
  var empPassword = await bcrypt.hash('amsce123', 10);
  
  var existingEmployer = await prisma.user.findFirst({ where: { email: 'hr@techcorp.com' } });
  if (!existingEmployer) {
    await prisma.user.create({
      data: {
        fullName: "TechCorp HR",
        email: "hr@techcorp.com",
        password: empPassword,
        role: "EMPLOYER",
        company: "TechCorp Solutions",
        phone: "9876543111",
        avatarInitials: "TC",
        isVerified: true
      }
    });
    console.log('✅ Employer created: hr@techcorp.com');
  }

  console.log('\n═══════════════════════════════════════════');
  console.log('  🎓 AMSCE COLLEGE - DUMMY DATA READY!');
  console.log('═══════════════════════════════════════════\n');
  console.log('📧 STUDENT LOGINS (Password: amsce123):');
  console.log('──────────────────────────────────────────');
  for (var s of students) {
    console.log('  ' + s.email + ' | ' + s.fullName + ' | ' + s.procredits + ' credits');
  }
  console.log('\n📧 TPO LOGIN:');
  console.log('  tpo@amsce.edu.in / amsce123');
  console.log('\n📧 EMPLOYER LOGIN:');
  console.log('  hr@techcorp.com / amsce123');
  console.log('\n═══════════════════════════════════════════\n');
}

main()
  .catch(function(e) {
    console.error('❌ Error:', e.message);
  })
  .finally(function() {
    prisma.$disconnect();
  });