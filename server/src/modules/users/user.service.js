const prisma = require('../../config/prisma');

async function getStudentStats(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true, fullName: true, email: true, role: true,
      college: true, procredits: true, avatarInitials: true, createdAt: true,
    },
  });

  if (!user) throw new Error('User not found');

  const daysSinceJoin = Math.ceil((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24));
  const streak = Math.min(daysSinceJoin, 30);

  return { ...user, streak, consistency: Math.floor(Math.random() * 15) + 80, rank: Math.floor(Math.random() * 30) + 1 };
}

async function getDashboardData(userId) {
  const stats = await getStudentStats(userId);

  // Get courses
  const enrollments = await prisma.courseEnrollment.findMany({
    where: { userId },
    include: { course: true },
  });

  // Get today's tasks
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tasks = await prisma.dailyTask.findMany({
    where: { userId, date: { gte: today } },
    orderBy: { time: 'asc' },
  });

  // Get leaderboard
  const leaderboard = await prisma.leaderboardEntry.findMany({
    orderBy: { credits: 'desc' },
    take: 10,
  });

  return { stats, enrollments, tasks, leaderboard };
}

module.exports = { getStudentStats, getDashboardData };