var { PrismaClient } = require('@prisma/client');
var prisma = new PrismaClient();

// Get all conversations for a user
async function getConversations(userId) {
  var sent = await prisma.message.findMany({
    where: { senderId: userId },
    distinct: ['receiverId'],
    orderBy: { createdAt: 'desc' }
  });
  
  var received = await prisma.message.findMany({
    where: { receiverId: userId },
    distinct: ['senderId'],
    orderBy: { createdAt: 'desc' }
  });

  var conversations = [];
  var seen = new Set();

  for (var m of [...sent, ...received]) {
    var otherId = m.senderId === userId ? m.receiverId : m.senderId;
    
    if (otherId === userId) continue;
    if (seen.has(otherId)) continue;
    seen.add(otherId);

    var otherUser = await prisma.user.findUnique({ where: { id: otherId } });
    if (!otherUser) continue;

    var unread = await prisma.message.count({
      where: { senderId: otherId, receiverId: userId, read: false }
    });
    
    var lastMsg = await prisma.message.findFirst({
      where: {
        OR: [
          { senderId: userId, receiverId: otherId },
          { senderId: otherId, receiverId: userId }
        ]
      },
      orderBy: { createdAt: 'desc' }
    });

    conversations.push({
      id: otherId,
      name: otherUser.fullName || otherUser.college || otherUser.company || 'User',
      role: otherUser.role || 'USER',
      college: otherUser.college,
      company: otherUser.company,
      lastMessage: lastMsg?.content || '',
      time: lastMsg?.createdAt || new Date(),
      unread: unread
    });
  }

  return conversations.sort(function(a, b) { return new Date(b.time).getTime() - new Date(a.time).getTime(); });
}

// Get messages between two users
async function getMessages(userId, otherId) {
  // Mark as read
  await prisma.message.updateMany({
    where: { senderId: otherId, receiverId: userId, read: false },
    data: { read: true }
  });

  var messages = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: userId, receiverId: otherId },
        { senderId: otherId, receiverId: userId }
      ]
    },
    orderBy: { createdAt: 'asc' },
    take: 100
  });
  
  // Add a 'text' field for frontend compatibility
  return messages.map(function(msg) {
    return {
      ...msg,
      text: msg.content  // Add text field for frontend that expects 'text'
    };
  });
}

// Send a message
async function sendMessage(senderId, receiverId, content) {
  var msg = await prisma.message.create({
    data: { 
      senderId, 
      receiverId, 
      content
    }
  });
  
  // Add text field for frontend compatibility
  return {
    ...msg,
    text: msg.content
  };
}

// Delete a message (only by sender)
async function deleteMessage(messageId, userId) {
  var msg = await prisma.message.findUnique({ where: { id: messageId } });
  if (!msg || msg.senderId !== userId) return false;
  await prisma.message.delete({ where: { id: messageId } });
  return true;
}

// Delete entire conversation
async function deleteConversation(userId, otherId) {
  await prisma.message.deleteMany({
    where: {
      OR: [
        { senderId: userId, receiverId: otherId },
        { senderId: otherId, receiverId: userId }
      ]
    }
  });
  return true;
}

module.exports = { getConversations, getMessages, sendMessage, deleteMessage, deleteConversation };