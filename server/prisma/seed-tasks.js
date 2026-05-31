const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedTasks() {
  console.log('\n📅 Creating today\'s tasks...\n');
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Get all students
  const students = await prisma.user.findMany({
    where: { role: 'STUDENT' },
    include: {
      courseEnrollments: {
        include: {
          course: true
        }
      }
    }
  });
  
  console.log(`Found ${students.length} students\n`);
  
  let totalCreated = 0;
  
  for (const student of students) {
    // Delete old tasks for today
    await prisma.dailyTask.deleteMany({
      where: {
        userId: student.id,
        taskDate: today
      }
    });
    
    const isAalim = student.college?.includes('Aalim');
    const enrolledCourse = student.courseEnrollments[0]?.course;
    
    let tasks = [];
    
    if (isAalim) {
      // Premium tasks for Aalim students
      tasks = [
        { taskTime: "08:00 AM", taskName: "Aalim College - AI/ML Module", taskType: "Learning", durationMinutes: 60, isDone: false },
        { taskTime: "10:00 AM", taskName: "Aalim Weekly Assessment", taskType: "Assessment", durationMinutes: 45, isDone: true },
        { taskTime: "01:00 PM", taskName: "Aalim Capstone Project", taskType: "Project", durationMinutes: 90, isDone: false },
        { taskTime: "03:00 PM", taskName: "Aalim Group Study Session", taskType: "Learning", durationMinutes: 60, isDone: false }
      ];
    } else if (enrolledCourse) {
      // Tasks based on enrolled course
      tasks = [
        { taskTime: "09:00 AM", taskName: `${enrolledCourse.title} - Module 1`, taskType: "Learning", durationMinutes: 45, isDone: false },
        { taskTime: "11:00 AM", taskName: `${enrolledCourse.title} - Quiz`, taskType: "Assessment", durationMinutes: 30, isDone: false },
        { taskTime: "02:00 PM", taskName: `${enrolledCourse.title} - Practice`, taskType: "Learning", durationMinutes: 45, isDone: false }
      ];
    } else {
      // Generic tasks
      tasks = [
        { taskTime: "09:00 AM", taskName: "Complete React Module", taskType: "Learning", durationMinutes: 45, isDone: false },
        { taskTime: "11:00 AM", taskName: "Weekly Assessment", taskType: "Assessment", durationMinutes: 30, isDone: false },
        { taskTime: "02:00 PM", taskName: "Practice Problems", taskType: "Learning", durationMinutes: 45, isDone: false }
      ];
    }
    
    for (const task of tasks) {
      await prisma.dailyTask.create({
        data: {
          userId: student.id,
          taskTime: task.taskTime,
          taskName: task.taskName,
          taskType: task.taskType,
          durationMinutes: task.durationMinutes,
          isDone: task.isDone,
          taskDate: today
        }
      });
      totalCreated++;
    }
    
    console.log(`✅ Created ${tasks.length} tasks for ${student.fullName}${isAalim ? ' (Aalim College)' : ''}`);
  }
  
  console.log(`\n📊 Total: ${totalCreated} tasks created for ${students.length} students`);
  console.log(`📅 Date: ${today.toLocaleDateString()}`);
  
  await prisma.$disconnect();
}

seedTasks().catch(console.error);