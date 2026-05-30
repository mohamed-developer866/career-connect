var { PrismaClient } = require('@prisma/client');
var prisma = new PrismaClient();

async function main() {
  await prisma.message.deleteMany({});

  var collegeUser = await prisma.user.findFirst({ where: { email: 'college@test.com' } });
  var employerUser = await prisma.user.findFirst({ where: { email: 'employer@test.com' } });
  var studentUser = await prisma.user.findFirst({ where: { email: 'student@test.com' } });

  if (!collegeUser || !employerUser) {
    console.log('Users not found. Run seed-test-users.js first.');
    return;
  }

  // College TPO and Employer conversation
  await prisma.message.createMany({
    data: [
      { senderId: collegeUser.id, receiverId: employerUser.id, text: 'Hello TechCorp! We have 50 eligible students ready for placements.', createdAt: new Date('2026-05-10T10:00:00') },
      { senderId: employerUser.id, receiverId: collegeUser.id, text: 'Great! We are looking for React and Python developers.', createdAt: new Date('2026-05-10T10:05:00') },
      { senderId: collegeUser.id, receiverId: employerUser.id, text: 'Perfect! We have 20 React developers and 15 Python developers in our final year.', createdAt: new Date('2026-05-10T10:10:00') },
      { senderId: employerUser.id