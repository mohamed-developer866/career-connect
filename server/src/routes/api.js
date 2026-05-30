var express = require('express');
var router = express.Router();
var { PrismaClient } = require('@prisma/client');
var prisma = new PrismaClient();
var auth = require('../middlewares/auth');

// GET /api/v2/students — FULL student data
router.get('/students', auth, async function(req, res) {
  try {
    var students = await prisma.user.findMany({
      where: { role: 'STUDENT' },
      select: { 
        id: true, fullName: true, email: true, department: true, 
        avatarInitials: true, placementStatus: true, procredits: true,
        createdAt: true, college: true,
        skills: { select: { id: true, name: true, score: true, category: true } },
        courseEnrollments: { select: { courseId: true, progress: true, course: { select: { title: true } } } },
        jobApplications: { select: { id: true, status: true, job: { select: { title: true, company: true } } } }
      },
      orderBy: { procredits: 'desc' }
    });

    var totalStudents = students.length;
    var totalPlaced = students.filter(function(s) { 
      return (s.jobApplications || []).some(function(a) { return a.status === 'HIRED'; }); 
    }).length;
    var totalActive = students.filter(function(s) { 
      return (s.courseEnrollments || []).length > 0; 
    }).length;
    var avgCredits = totalStudents > 0 
      ? Math.round(students.reduce(function(sum, s) { return sum + (s.procredits || 0); }, 0) / totalStudents) 
      : 0;

    res.json({ students: students, stats: { totalStudents, totalPlaced, totalActive, avgCredits } });
  } catch (err) {
    res.json({ students: [], stats: { totalStudents: 0, totalPlaced: 0, totalActive: 0, avgCredits: 0 } });
  }
});

module.exports = router;