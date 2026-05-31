const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedTasksFromCourses() {
  console.log('\n📚 Creating today\'s tasks from course topics...\n');
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Get all students with their enrolled courses and topics
  const students = await prisma.user.findMany({
    where: { role: 'STUDENT' },
    include: {
      courseEnrollments: {
        include: {
          course: {
            include: {
              modules: {
                include: {
                  topics: true
                }
              }
            }
          }
        }
      }
    }
  });
  
  console.log(`Found ${students.length} students\n`);
  
  // Schedule time slots based on priority
  const timeSlots = {
    morning: ['09:00 AM', '10:00 AM'],
    afternoon: ['01:00 PM', '02:00 PM', '03:00 PM'],
    evening: ['04:00 PM', '05:00 PM']
  };
  
  let totalTasksCreated = 0;
  
  for (const student of students) {
    // Delete existing tasks for today
    await prisma.dailyTask.deleteMany({
      where: {
        userId: student.id,
        taskDate: today
      }
    });
    
    const tasks = [];
    let timeIndex = 0;
    
    // Collect all topics from enrolled courses
    const allTopics = [];
    
    for (const enrollment of student.courseEnrollments) {
      const course = enrollment.course;
      const progress = enrollment.progress || 0;
      
      // Calculate which topics are pending based on progress
      let totalTopicsCount = 0;
      let completedTopicsCount = 0;
      
      for (const module of course.modules) {
        for (const topic of module.topics) {
          totalTopicsCount++;
          
          // If progress is less than (completed/total)*100, topic is pending
          const topicProgress = (completedTopicsCount / totalTopicsCount) * 100;
          
          if (topicProgress > progress) {
            allTopics.push({
              name: topic.title,
              type: topic.contentType === 'coding' ? 'Project' : 
                    topic.contentType === 'cheatsheet' ? 'Learning' : 'Learning',
              duration: parseInt(topic.duration) || 30,
              moduleTitle: module.title,
              courseTitle: course.title,
              courseId: course.id
            });
          } else {
            completedTopicsCount++;
          }
        }
      }
      
      // If no topics calculated, add all topics
      if (allTopics.length === 0 && course.modules.length > 0) {
        for (const module of course.modules) {
          for (const topic of module.topics) {
            allTopics.push({
              name: topic.title,
              type: topic.contentType === 'coding' ? 'Project' : 'Learning',
              duration: parseInt(topic.duration) || 30,
              moduleTitle: module.title,
              courseTitle: course.title,
              courseId: course.id
            });
          }
        }
      }
    }
    
    // If no topics found, create generic course-based tasks
    if (allTopics.length === 0) {
      const enrolledCourses = student.courseEnrollments.map(e => e.course);
      
      if (enrolledCourses.length > 0) {
        // Create tasks from enrolled course names
        for (let i = 0; i < Math.min(3, enrolledCourses.length); i++) {
          const course = enrolledCourses[i];
          tasks.push({
            taskTime: timeSlots.morning[i] || timeSlots.afternoon[i % timeSlots.afternoon.length],
            taskName: `${course.title} - Module Review`,
            taskType: 'Learning',
            durationMinutes: 45,
            isDone: false
          });
        }
      } else {
        // Fallback tasks
        tasks.push(
          { taskTime: "09:00 AM", taskName: "Complete React Module", taskType: "Learning", durationMinutes: 45, isDone: false },
          { taskTime: "11:00 AM", taskName: "Weekly Assessment", taskType: "Assessment", durationMinutes: 30, isDone: false },
          { taskTime: "02:00 PM", taskName: "Practice Problems", taskType: "Learning", durationMinutes: 45, isDone: false }
        );
      }
    } else {
      // Create tasks from actual topics (up to 4 per day)
      const maxTasks = 4;
      const selectedTopics = allTopics.slice(0, maxTasks);
      
      for (let i = 0; i < selectedTopics.length; i++) {
        const topic = selectedTopics[i];
        let taskTime;
        
        if (i < 2) {
          taskTime = timeSlots.morning[i];
        } else if (i < 4) {
          taskTime = timeSlots.afternoon[i - 2];
        } else {
          taskTime = timeSlots.evening[i - 4];
        }
        
        tasks.push({
          taskTime: taskTime,
          taskName: `${topic.courseTitle}: ${topic.name}`,
          taskType: topic.type === 'Project' ? 'Project' : 'Learning',
          durationMinutes: topic.duration,
          isDone: i === 1 ? true : false  // Second task is completed
        });
      }
      
      // Sort by time
      tasks.sort((a, b) => {
        const timeA = parseInt(a.taskTime);
        const timeB = parseInt(b.taskTime);
        return timeA - timeB;
      });
    }
    
    // Create the tasks
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
      totalTasksCreated++;
    }
    
    console.log(`✅ ${student.fullName}: ${tasks.length} tasks from ${student.courseEnrollments.length} course(s)`);
    for (const task of tasks) {
      console.log(`     📚 ${task.taskTime} - ${task.taskName} (${task.durationMinutes} min)`);
    }
  }
  
  console.log(`\n📊 SUMMARY:`);
  console.log(`   Total students: ${students.length}`);
  console.log(`   Total tasks created: ${totalTasksCreated}`);
  console.log(`   Date: ${today.toLocaleDateString()}`);
  
  await prisma.$disconnect();
}

seedTasksFromCourses().catch(console.error);