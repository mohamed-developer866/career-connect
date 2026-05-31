const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedSchedule() {
  console.log('\n📅 Creating today\'s schedule from course topics...\n');
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Get all students with their enrolled courses
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
  
  // Hardcoded schedule times based on course difficulty and type
  const scheduleTimes = {
    'Learning': ['09:00 AM', '11:00 AM', '02:00 PM', '04:00 PM'],
    'Assessment': ['10:00 AM', '03:00 PM'],
    'Project': ['01:00 PM', '04:30 PM']
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
    const isAalim = student.college?.includes('Aalim');
    
    // Get all topics from enrolled courses
    const allTopics = [];
    for (const enrollment of student.courseEnrollments) {
      const course = enrollment.course;
      const progress = enrollment.progress;
      
      // Calculate which topics are pending (based on progress)
      let totalTopics = 0;
      for (const module of course.modules) {
        for (const topic of module.topics) {
          totalTopics++;
          const topicIndex = totalTopics - 1;
          const topicProgress = (topicIndex / course.totalTopics) * 100;
          
          // If topic is not completed (based on course progress)
          if (topicProgress > progress) {
            allTopics.push({
              name: topic.title,
              type: topic.contentType === 'coding' ? 'Project' : 'Learning',
              duration: parseInt(topic.duration) || 30,
              courseTitle: course.title
            });
          }
        }
      }
    }
    
    // If no topics found, create generic tasks
    if (allTopics.length === 0) {
      if (isAalim) {
        tasks.push(
          { taskTime: "09:00 AM", taskName: "Aalim College - AI Module", taskType: "Learning", durationMinutes: 60, isDone: false },
          { taskTime: "11:00 AM", taskName: "Aalim Weekly Assessment", taskType: "Assessment", durationMinutes: 45, isDone: false },
          { taskTime: "02:00 PM", taskName: "Aalim Capstone Project", taskType: "Project", durationMinutes: 90, isDone: false },
          { taskTime: "04:00 PM", taskName: "Aalim Group Study", taskType: "Learning", durationMinutes: 60, isDone: false }
        );
      } else {
        tasks.push(
          { taskTime: "09:00 AM", taskName: "Complete React Module", taskType: "Learning", durationMinutes: 45, isDone: false },
          { taskTime: "11:00 AM", taskName: "Weekly Assessment", taskType: "Assessment", durationMinutes: 30, isDone: false },
          { taskTime: "02:00 PM", taskName: "Practice Problems", taskType: "Learning", durationMinutes: 45, isDone: false }
        );
      }
    } else {
      // Create tasks from actual course topics (up to 4 tasks per day)
      const shuffledTopics = [...allTopics].sort(() => 0.5 - Math.random());
      const topicsToUse = shuffledTopics.slice(0, isAalim ? 4 : 3);
      
      let timeIndex = 0;
      for (const topic of topicsToUse) {
        let taskTime;
        if (topic.type === 'Learning') {
          taskTime = scheduleTimes['Learning'][timeIndex % scheduleTimes['Learning'].length];
          timeIndex++;
        } else if (topic.type === 'Assessment') {
          taskTime = scheduleTimes['Assessment'][0];
        } else {
          taskTime = scheduleTimes['Project'][0];
        }
        
        tasks.push({
          taskTime: taskTime,
          taskName: `${topic.courseTitle}: ${topic.name}`,
          taskType: topic.type,
          durationMinutes: topic.duration,
          isDone: false
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
    
    console.log(`✅ Created ${tasks.length} tasks for ${student.fullName}${isAalim ? ' (Aalim College)' : ''}`);
  }
  
  console.log(`\n📊 SUMMARY:`);
  console.log(`   Total students: ${students.length}`);
  console.log(`   Total tasks created: ${totalTasksCreated}`);
  console.log(`   Date: ${today.toLocaleDateString()}`);
  
  await prisma.$disconnect();
}

seedSchedule().catch(console.error);