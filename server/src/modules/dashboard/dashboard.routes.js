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
    
    // Fix: Use correct field names - taskDate, isDone
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    var tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    var tasks = await prisma.dailyTask.findMany({ 
      where: { 
        userId: userId, 
        taskDate: { 
          gte: today,
          lt: tomorrow
        } 
      } 
    });
    
    var completedTasks = tasks.filter(function(t) { return t.isDone; }).length;
    var leaderboard = await prisma.leaderboardEntry.findFirst({ where: { userId: userId } });
    
    res.json({
      streak: req.user.streak || 7,
      consistency: req.user.consistencyScore || 85,
      procredits: req.user.procredits || 0,
      enrolledCourses: enrollments.length,
      completedTasks: completedTasks,
      totalTasks: tasks.length,
      rank: leaderboard ? leaderboard.rank : 0
    });
  } catch (err) {
    console.error(err);
    res.json({ streak: 0, consistency: 0, procredits: 0, enrolledCourses: 0, completedTasks: 0, totalTasks: 0, rank: 0 });
  }
});

// GET /api/dashboard/tasks - FIXED field names
router.get('/tasks', auth, async function(req, res) {
  try {
    var userId = req.user.id;
    
    // Get today's date range
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    var tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    var tasks = await prisma.dailyTask.findMany({
      where: { 
        userId: userId,
        taskDate: {
          gte: today,
          lt: tomorrow
        }
      },
      orderBy: { taskTime: 'asc' }
    });
    
    // Map to frontend expected format
    var mappedTasks = tasks.map(function(task) {
      return {
        id: task.id,
        taskTime: task.taskTime,
        taskName: task.taskName,
        taskType: task.taskType,
        durationMinutes: task.durationMinutes,
        isDone: task.isDone,
        taskDate: task.taskDate
      };
    });
    
    // If no tasks, return empty array (don't create mock tasks here)
    res.json({ tasks: mappedTasks });
  } catch (err) {
    console.error('Tasks error:', err);
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
        rank: entry.rank || result.length + 1,
        name: user ? user.fullName : "Student",
        credits: entry.credits,
        avatar: user ? user.avatarInitials : (user?.fullName?.charAt(0) || "S"),
        trend: entry.trend || "up"
      });
    }
    
    res.json({ entries: result });
  } catch (err) {
    console.error(err);
    res.json({ entries: [] });
  }
});

module.exports = router;