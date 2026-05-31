const prisma = require('../../config/prisma');

async function getStats(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, procredits: true, streak: true, consistencyScore: true, createdAt: true },
  });

  if (!user) throw new Error('User not found');

  const enrolledCoursesCount = await prisma.courseEnrollment.count({
    where: { userId },
  });
  
  // Get today's tasks
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const tasks = await prisma.dailyTask.findMany({
    where: { 
      userId, 
      taskDate: { 
        gte: today,
        lt: tomorrow
      } 
    }
  });
  
  const completedTasks = tasks.filter(t => t.isDone).length;

  // Get leaderboard rank
  const leaderboardEntry = await prisma.leaderboardEntry.findFirst({
    where: { userId }
  });

  return {
    streak: user.streak || 7,
    consistency: user.consistencyScore || 85,
    procredits: user.procredits || 0,
    enrolledCourses: enrolledCoursesCount,
    completedTasks: completedTasks,
    totalTasks: tasks.length,
    rank: leaderboardEntry?.rank || 0
  };
}

async function getTodayTasks(userId) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const tasks = await prisma.dailyTask.findMany({
    where: { 
      userId, 
      taskDate: { 
        gte: today,
        lt: tomorrow
      } 
    },
    orderBy: { taskTime: 'asc' },
    select: {
      id: true,
      taskTime: true,
      taskName: true,
      taskType: true,
      durationMinutes: true,
      isDone: true,
      taskDate: true,
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
      rank: true,
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
        rank: entry.rank || index + 1,
        name: user?.fullName || 'Unknown',
        avatar: user?.avatarInitials || user?.fullName?.charAt(0) || '👤',
        credits: entry.credits,
        trend: entry.trend,
      };
    })
  );

  return { entries: enriched };
}

module.exports = { getStats, getTodayTasks, getLeaderboard };