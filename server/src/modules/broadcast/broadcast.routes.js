var express = require('express');
var router = express.Router();
var { PrismaClient } = require('@prisma/client');
var prisma = new PrismaClient();
var auth = require('../../middlewares/auth');

// POST /api/broadcast/send — Send broadcast to all students
router.post('/send', auth, async function(req, res) {
  try {
    // ✅ STEP 1: Save ONE broadcast to database
    var broadcast = await prisma.broadcast.create({
      data: {
        senderId: req.user.id,
        text: "📢 " + req.body.message
      }
    });

    // ✅ STEP 2: Send via socket.io for real-time (NO database messages)
    var io = req.app.get('io');
    if (io) {
      var students = await prisma.user.findMany({
        where: { role: 'STUDENT' }
      });
      
      // ✅ JUST emit socket event - DO NOT create chat messages
      for (var s of students) {
        io.to(s.id).emit('newBroadcast', broadcast);
      }
    }

    // ✅ Return ONLY the broadcast, not individual messages
    res.status(201).json(broadcast);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/broadcast — Get broadcasts for students
router.get('/', auth, async function(req, res) {
  try {
    var broadcasts = await prisma.broadcast.findMany({
      orderBy: { createdAt: 'desc' } // ✅ Newest first
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
      orderBy: { createdAt: 'desc' } // ✅ Newest first
    });
    res.json({ broadcasts });
  } catch (err) {
    res.json({ broadcasts: [] });
  }
});

module.exports = router;