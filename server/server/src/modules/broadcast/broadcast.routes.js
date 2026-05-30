var express = require('express');
var router = express.Router();
var { PrismaClient } = require('@prisma/client');
var prisma = new PrismaClient();
var auth = require('../../middlewares/auth');

// POST /api/broadcast/send — Send one broadcast to all students
router.post('/send', auth, async function(req, res) {
  try {
    var broadcast = await prisma.broadcast.create({
      data: {
        senderId: req.user.id,
        text: "📢 " + req.body.message
      }
    });

    // Also send via socket.io for real-time
    var io = req.app.get('io');
    if (io) {
      // Get all students
      var students = await prisma.user.findMany({
        where: { college: req.user.college, role: 'STUDENT' }
      });
      for (var s of students) {
        io.to(s.id).emit('newBroadcast', broadcast);
      }
    }

    res.status(201).json(broadcast);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/broadcast — Get broadcasts for students
router.get('/', auth, async function(req, res) {
  try {
    var broadcasts = await prisma.broadcast.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json({ broadcasts });
  } catch (err) {
    res.json({ broadcasts: [] });
  }
});

// GET /api/broadcast/mine — Get broadcasts sent by this TPO
router.get('/mine', auth, async function(req, res) {
  try {
    var broadcasts = await prisma.broadcast.findMany({
      where: { senderId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ broadcasts });
  } catch (err) {
    res.json({ broadcasts: [] });
  }
});

module.exports = router;