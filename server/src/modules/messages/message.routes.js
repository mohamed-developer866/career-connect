var express = require('express');
var router = express.Router();
var ctrl = require('./message.controller');
var { PrismaClient } = require('@prisma/client');  // ← ADD THIS
var prisma = new PrismaClient();  
var auth = require('../../middlewares/auth');

router.get('/conversations', auth, ctrl.getConversations);
router.get('/conversations/:userId', auth, ctrl.getMessages);
router.post('/send', auth, ctrl.sendMessage);
router.delete('/:messageId', auth, ctrl.deleteMessage);
router.delete('/conversations/:userId', auth, ctrl.deleteConversation);

// GET /api/messages/users?role=EMPLOYER - Get users by role
router.get('/users', auth, async function(req, res) {
  try {
    var users = await prisma.user.findMany({
      where: { role: req.query.role || 'EMPLOYER' },
      select: { id: true, fullName: true, role: true, company: true, college: true, department: true, avatarInitials: true }
    });
    res.json({ users });
  } catch (err) {
    res.json({ users: [] });
  }
});

module.exports = router;