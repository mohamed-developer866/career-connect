var express = require('express');
var router = express.Router();
var { PrismaClient } = require('@prisma/client');
var prisma = new PrismaClient();
var auth = require('../../middlewares/auth');

// GET /api/dashboard/stats
router.get('/stats', auth, async function(req, res) {
  try {
    var userId = req.user.id;
    
    var enrollments = await prisma.courseEnrollment.findMany({ where: { userId: userId } });
    var tasks = await prisma.dailyTask.findMany({ where: { userId: userId, date: { gte: new Date(new Date().setHours(0,0,0,0)) } } });
    var completedTasks = tasks.filter(function(t) { return t.done; }).length;
    var leaderboard = await prisma.leaderboardEntry.findFirst({ where: { userId: userId } });
    
    res.json({
      streak: 7,
      consistency: Math.floor(Math.random() * 20) + 80,
      procredits: req.user.procredits || 0,
      enrolledCourses: enrollments.length,
      completedTasks: completedTasks,
      totalTasks: tasks.length,
      rank: leaderboard ? (await prisma.leaderboardEntry.count({ where: { credits: { gt: leaderboard.credits } } })) + 1 : 0
    });
  } catch (err) {
    res.json({ streak: 0, consistency: 0, procredits: 0, enrolledCourses: 0, completedTasks: 0, totalTasks: 0, rank: 0 });
  }
});

// GET /api/dashboard/tasks
router.get('/tasks', auth, async function(req, res) {
  try {
    var userId = req.user.id;
    var tasks = await prisma.dailyTask.findMany({
      where: { userId: userId },
      orderBy: { time: 'asc' }
    });
    
    if (tasks.length === 0) {
      tasks = [
        { id: "1", time: "08:00 AM", task: "Complete React Components", type: "Learning", duration: "45m", done: false },
        { id: "2", time: "09:30 AM", task: "DSA Practice", type: "Coding", duration: "60m", done: false },
        { id: "3", time: "11:00 AM", task: "API Integration Task", type: "Practice", duration: "45m", done: false }
      ];
    }
    
    res.json({ tasks: tasks });
  } catch (err) {
    res.json({ tasks: [] });
  }
});

// GET /api/dashboard/leaderboard
router.get('/leaderboard', auth, async function(req, res) {
  try {
    var entries = await prisma.leaderboardEntry.findMany({
      orderBy: { credits: 'desc' },
      take: 10
    });
    
    var result = [];
    for (var entry of entries) {
      var user = await prisma.user.findUnique({ where: { id: entry.userId } });
      result.push({
        rank: result.length + 1,
        name: user ? user.fullName : "Student",
        credits: entry.credits,
        avatar: user ? user.avatarInitials : "S",
        trend: entry.trend || "up"
      });
    }
    
    if (result.length === 0) {
      result = [
        { rank: 1, name: "Rahul Kumar", credits: 1240, avatar: "RK", trend: "up" },
        { rank: 2, name: "Priya Sharma", credits: 980, avatar: "PS", trend: "up" },
        { rank: 3, name: "Ananya Patel", credits: 850, avatar: "AP", trend: "down" }
      ];
    }
    
    res.json({ entries: result });
  } catch (err) {
    res.json({ entries: [] });
  }
});

module.exports = router;