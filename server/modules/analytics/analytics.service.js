const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getUserStats(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      skills: true,
      courseEnrollments: true,
      jobApplications: true,
      dailyTasks: {
        where: { done: true }
      }
    }
  });

  const streak = user.dailyTasks.length || 0;
  const consistency = user.skills.length > 0 
    ? Math.round(user.skills.reduce((sum, s) => sum + (s.score || 0), 0) / user.skills.length)
    : 0;

  return {
    streak: streak,
    consistency: consistency,
    procredits: user.procredits || 0,
    skillsCount: user.skills.length,
    coursesCount: user.courseEnrollments.length,
    applicationsCount: user.jobApplications.length,
    rank: '#12'
  };
}

async function getUserSkills(userId) {
  const skills = await prisma.skill.findMany({
    where: { userId: userId },
    select: { id: true, name: true, score: true, category: true },
    orderBy: { score: 'desc' }
  });
  
  return skills.map(skill => ({
    name: skill.name,
    progress: skill.score || 0,
    level: skill.score >= 80 ? "Advanced" : skill.score >= 60 ? "Intermediate" : "Beginner",
    color: getSkillColor(skill.name),
    category: skill.category
  }));
}

async function getUserActivities(userId, limit = 10) {
  const activities = [];
  
  const tasks = await prisma.dailyTask.findMany({
    where: { userId: userId, done: true },
    orderBy: { date: 'desc' },
    take: limit
  });
  
  tasks.forEach(task => {
    activities.push({
      activity: task.task,
      credits: "+30",
      date: task.date,
      type: "course",
      status: "completed"
    });
  });
  
  const applications = await prisma.jobApplication.findMany({
    where: { studentId: userId },
    orderBy: { appliedAt: 'desc' },
    take: limit,
    include: { job: true }
  });
  
  applications.forEach(app => {
    activities.push({
      activity: `Applied for ${app.job?.title || 'Job'}`,
      credits: "+50",
      date: app.appliedAt,
      type: "job",
      status: app.status?.toLowerCase() || "applied"
    });
  });
  
  activities.sort((a, b) => new Date(b.date) - new Date(a.date));
  return activities.slice(0, limit);
}

async function getUserPerformance(userId, range = 'week') {
  const tasks = await prisma.dailyTask.findMany({
    where: { userId: userId },
    orderBy: { date: 'asc' }
  });
  
  const grouped = {};
  tasks.forEach(task => {
    const date = task.date.toISOString().split('T')[0];
    if (!grouped[date]) grouped[date] = { completed: 0, total: 0 };
    grouped[date].total++;
    if (task.done) grouped[date].completed++;
  });
  
  let days = range === 'week' ? 7 : range === 'month' ? 30 : 365;
  const labels = Object.keys(grouped).slice(-days);
  const data = labels.map(date => {
    const day = grouped[date];
    return day.total > 0 ? Math.round((day.completed / day.total) * 100) : 0;
  });
  
  return { labels, data };
}

function getSkillColor(skillName) {
  const colors = {
    'React': '#6366f1',
    'JavaScript': '#a855f7',
    'Python': '#ec4899',
    'Node.js': '#22c55e',
    'MongoDB': '#f97316',
    'TypeScript': '#06b6d4',
    'default': '#10b981'
  };
  return colors[skillName] || colors.default;
}

module.exports = { getUserStats, getUserSkills, getUserActivities, getUserPerformance };