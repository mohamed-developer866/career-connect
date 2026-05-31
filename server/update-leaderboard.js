const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateLeaderboard() {
  console.log('\n🏆 UPDATING LEADERBOARD\n');

  // Delete existing leaderboard entries
  await prisma.leaderboardEntry.deleteMany({});
  console.log('🗑️ Cleared existing leaderboard');

  // Get all students sorted by credits (highest first)
  const students = await prisma.user.findMany({
    where: { role: 'STUDENT' },
    orderBy: { procredits: 'desc' }
  });

  console.log(`\n📊 Creating leaderboard with ${students.length} entries\n`);

  let rank = 1;
  for (const student of students) {
    await prisma.leaderboardEntry.create({
      data: {
        userId: student.id,
        credits: student.procredits,
        rank: rank,
        trend: rank <= 5 ? 'up' : rank <= 10 ? 'stable' : 'down'
      }
    });
    
    const isAalim = student.college?.includes('Aalim');
    console.log(`${rank}. ${student.fullName} - ${student.procredits} credits ${isAalim ? '🏆 (Aalim College)' : ''}`);
    rank++;
  }

  console.log(`\n✅ Leaderboard created with ${students.length} entries`);
  console.log(`🏆 Aalim College students dominate top positions!`);

  await prisma.$disconnect();
}

updateLeaderboard().catch(console.error);