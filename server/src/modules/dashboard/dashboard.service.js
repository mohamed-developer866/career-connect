const prisma = require('../../config/prisma');

async function getStats(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, procredits: true, createdAt: true },
  });

  if (!user) throw new Error('User not found');

  const daysSinceJoin = Math.ceil(
    (Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24)
  );
  const streak = Math.min(daysSinceJoin, 30);
  const consistency = Math.floor(Math.random() * 15) + 80;

  const enrolledCoursesCount = await prisma.courseEnrollment.count({
    where: { userId },
  });

  return {
    streak,
    consistency,
    procredits: user.procredits,
    enrolledCourses: enrolledCoursesCount,
  };
}

async function getTodayTasks(userId) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tasks = await prisma.dailyTask.findMany({
    where: { userId, date: { gte: today } },
    orderBy: { time: 'asc' },
    select: {
      id: true,
      time: true,
      task: true,
      type: true,
      duration: true,
      done: true,
      date: true,
    },
  });

  return { tasks };
}

async function getLeaderboard() {
  const entries = await prisma.leaderboardEntry.findMany({
    orderBy: { credits: 'desc' },
    take: 10,
    select: {
      id: true,
      userId: true,
      credits: true,
      trend: true,
      updatedAt: true,
    },
  });

  // Enrich with user names
  const enriched = await Promise.all(
    entries.map(async (entry, index) => {
      const user = await prisma.user.findUnique({
        where: { id: entry.userId },
        select: { fullName: true, avatarInitials: true },
      });
      return {
        rank: index + 1,
        name: user?.fullName || 'Unknown',
        avatar: user?.avatarInitials || '👤',
        credits: entry.credits,
        trend: entry.trend,
      };
    })
  );

  return { entries: enriched };
}

module.exports = { getStats, getTodayTasks, getLeaderboard };