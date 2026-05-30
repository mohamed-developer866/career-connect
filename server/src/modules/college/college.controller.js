var service = require('./college.service');

exports.getDashboard = async function (req, res) {
  try {
    var collegeName = req.user.college || 'AMSCE Chennai';
    var data = await service.getCollegeDashboard(collegeName);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load dashboard' });
  }
};

exports.getStudents = async function (req, res) {
  try {
    var collegeName = req.user.college || 'AMSCE Chennai';
    
    // 🔧 FETCH DIRECTLY from Prisma, NOT from service
    var { PrismaClient } = require('@prisma/client');
    var prisma = new PrismaClient();
    
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

    await prisma.$disconnect();
    
    res.json({ students: students, stats: { totalStudents, totalPlaced, totalActive, avgCredits } });
  } catch (err) {
    console.error('❌ getStudents error:', err);
    res.json({ students: [], stats: { totalStudents: 0, totalPlaced: 0, totalActive: 0, avgCredits: 0 } });
  }
};
exports.getCompanies = async function (req, res) {
  try {
    var collegeName = req.user.college || 'AMSCE Chennai';
    var companies = await service.getCompanies(collegeName);
    res.json({ companies: companies });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load companies' });
  }
};
exports.getDrives = async function (req, res) {
  try {
    var collegeName = req.user.college || 'AMSCE Chennai';
    var drives = await service.getCollegeSpecificDrives(collegeName);
    res.json(drives);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load drives' });
  }
};
exports.getMessages = async function (req, res) {
  try {
    var collegeName = req.user.college || 'AMSCE Chennai';
    var messages = await service.getMessages(collegeName);
    res.json({ conversations: messages });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load messages' });
  }
};
exports.getReports = async function (req, res) {
  try {
    var collegeName = req.user.college || 'AMSCE Chennai';
    var reports = await service.getReports(collegeName);
    res.json(reports);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load reports' });
  }
};