var express = require('express');
var router = express.Router();
var { PrismaClient } = require('@prisma/client');
var prisma = new PrismaClient();
var auth = require('../../middlewares/auth');

// GET /api/learning/courses — Get enrolled courses
router.get('/courses', auth, async function(req, res) {
  try {
    var userId = req.user.id;
    
    var courses = await prisma.course.findMany({
      include: {
        modules: { include: { topics: true } },
        enrollments: { where: { userId: userId } }
      }
    });

    var result = courses.map(function(c) {
      var enrollment = c.enrollments[0];
      return {
        id: c.id,
        title: c.title,
        category: c.category,
        difficulty: c.difficulty,
        duration: c.duration,
        totalTopics: c.modules.reduce(function(sum, m) { return sum + m.topics.length; }, 0),
        completedTopics: enrollment ? enrollment.completedTopics : 0,
        progress: enrollment ? enrollment.progress : 0,
        accentColor: c.accentColor,
        icon: c.icon,
        thumbnailUrl: c.thumbnailUrl,
        modules: c.modules
      };
    });

    res.json({ courses: result });
  } catch (err) {
    console.error('Courses error:', err);
    res.json({ courses: [] });
  }
});

// GET /api/learning/courses/all — Get ALL courses (MUST be before :courseId)
router.get('/courses/all', auth, async function(req, res) {
  try {
    var courses = await prisma.course.findMany({
      include: {
        modules: { include: { topics: true } }
      }
    });
    var result = courses.map(function(c) {
      return {
        id: c.id,
        title: c.title,
        category: c.category,
        difficulty: c.difficulty,
        duration: c.duration,
        totalTopics: c.modules.reduce(function(sum, m) { return sum + m.topics.length; }, 0),
        accentColor: c.accentColor,
        icon: c.icon,
        thumbnailUrl: c.thumbnailUrl
      };
    });
    res.json({ courses: result });
  } catch (err) {
    res.json({ courses: [] });
  }
});

// GET /api/learning/courses/:courseId — Get single course (AFTER /all)
router.get('/courses/:courseId', auth, async function(req, res) {
  try {
    var course = await prisma.course.findUnique({
      where: { id: req.params.courseId },
      include: {
        modules: {
          include: { topics: true },
          orderBy: { orderIndex: 'asc' }
        }
      }
    });

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    res.json({ course: course });
  } catch (err) {
    console.error('Course error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/learning/progress — Mark topic as complete
router.post('/progress', auth, async function(req, res) {
  try {
    var userId = req.user.id;
    var { topicId, moduleId, courseId } = req.body;

    var progress = await prisma.userProgress.create({
      data: {
        userId: userId,
        courseId: courseId,
        moduleId: moduleId,
        topicId: topicId,
        completed: true,
        completedAt: new Date()
      }
    });

    var enrollment = await prisma.courseEnrollment.findFirst({
      where: { userId: userId, courseId: courseId }
    });

    if (enrollment) {
      var course = await prisma.course.findUnique({
        where: { id: courseId },
        include: { modules: { include: { topics: true } } }
      });
      
      var totalTopics = course.modules.reduce(function(sum, m) { return sum + m.topics.length; }, 0);
      var completedCount = await prisma.userProgress.count({
        where: { userId: userId, courseId: courseId, completed: true }
      });
      
      var newProgress = totalTopics > 0 ? Math.round((completedCount / totalTopics) * 100) : 0;
      
      await prisma.courseEnrollment.update({
        where: { id: enrollment.id },
        data: { completedTopics: completedCount, progress: newProgress }
      });
    }

    res.json({ success: true, progress: progress });
  } catch (err) {
    console.error('Progress error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;