var service = require('./zara-tasks.service');

exports.getTasks = async function (req, res) {
  try {
    var profile = {
      fullName: req.user.fullName || 'Student',
      department: req.body.department || 'B.Tech AI and DS',
      college: req.body.college || 'AMSCE Chennai',
      streak: req.body.streak || 7,
      consistency: req.body.consistency || 90,
      skills: req.body.skills || ['React', 'JavaScript', 'Python'],
      courses: req.body.courses || [],
      procredits: req.body.procredits || 0
    };

    var tasks = await service.generateDailyTasks(profile);

    var prisma = require('../../config/prisma');
    var today = new Date();
    today.setHours(0, 0, 0, 0);

    await prisma.dailyTask.deleteMany({
      where: { userId: req.user.id, date: { gte: today } }
    });

    for (var i = 0; i < tasks.length; i++) {
      var task = tasks[i];
      await prisma.dailyTask.create({
        data: {
          userId: req.user.id,
          time: task.time,
          task: task.task,
          type: task.type,
          duration: task.duration,
          date: new Date()
        }
      });
    }

    res.json({ tasks: tasks });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed' });
  }
};