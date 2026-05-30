var prisma = require('../../config/prisma');

async function getCourseDetail(courseId, userId) {
  var course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      modules: {
        orderBy: { orderIndex: 'asc' },
        include: {
          topics: { orderBy: { orderIndex: 'asc' } }
        }
      }
    }
  });

  if (!course) throw new Error('Course not found');

  // Get user progress
  var progress = await prisma.userProgress.findMany({
    where: { userId: userId, courseId: courseId }
  });

  return { course: course, progress: progress };
}

async function markTopicComplete(userId, topicId, moduleId, courseId) {
  var existing = await prisma.userProgress.findFirst({
    where: { userId: userId, topicId: topicId }
  });

  if (existing) {
    return prisma.userProgress.update({
      where: { id: existing.id },
      data: { completed: true, completedAt: new Date() }
    });
  }

  return prisma.userProgress.create({
    data: {
      userId: userId,
      courseId: courseId,
      moduleId: moduleId,
      topicId: topicId,
      completed: true,
      completedAt: new Date()
    }
  });
}

async function getEnrolledCourses(userId) {
  return prisma.courseEnrollment.findMany({
    where: { userId: userId },
    include: { course: true }
  });
}

module.exports = { getCourseDetail: getCourseDetail, markTopicComplete: markTopicComplete, getEnrolledCourses: getEnrolledCourses };