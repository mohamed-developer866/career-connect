var { PrismaClient } = require('@prisma/client');
var p = new PrismaClient();

async function r() {
  var u = await p.user.findUnique({ where: { email: 'student@test.com' } });
  var c = await p.course.findFirst();
  
  if (u && c) {
    await p.courseEnrollment.create({
      data: {
        userId: u.id,
        courseId: c.id,
        progress: 45,
        completedTopics: 8
      }
    });
    console.log('Enrolled ' + u.email + ' in ' + c.title);
  } else {
    console.log('User or course not found');
  }
  await p.$disconnect();
}

r();