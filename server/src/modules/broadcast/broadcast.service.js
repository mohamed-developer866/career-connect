var prisma = require('../../config/prisma');

async function sendBroadcast(senderId, senderName, data) {
  var students = await prisma.user.findMany({
    where: { role: 'STUDENT', college: data.college || undefined },
    select: { id: true }
  });

  if (data.department && data.department !== 'All') {
    // Department filter (if department field added to User model)
    // For now, send to all students
  }

  var messages = [];
  for (var i = 0; i < students.length; i++) {
    var msg = await prisma.message.create({
      data: {
        senderId: senderId,
        receiverId: students[i].id,
        text: data.message,
        createdAt: new Date()
      }
    });
    messages.push(msg);
  }

  return { sent: students.length, message: data.message };
}

async function getBroadcastHistory(senderId) {
  // Get unique broadcast messages sent by this user
  return prisma.message.findMany({
    where: { senderId: senderId },
    orderBy: { createdAt: 'desc' },
    take: 20
  });
}

module.exports = { sendBroadcast: sendBroadcast, getBroadcastHistory: getBroadcastHistory };