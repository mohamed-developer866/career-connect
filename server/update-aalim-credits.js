const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateAalimCollege() {
  console.log('\n🏫 UPDATING AALIM COLLEGE STUDENTS\n');

  // Update Aalim College students with high credits
  const aalimStudents = await prisma.user.updateMany({
    where: {
      college: { contains: 'Aalim' },
      role: 'STUDENT'
    },
    data: {
      procredits: 5000,
      streak: 100,
      consistencyScore: 98
    }
  });
  console.log(`✅ Updated ${aalimStudents.count} Aalim College students with 5000 credits`);

  // Update specific Aalim students with even higher credits
  const namedStudents = [
    { name: 'Bhuvanesh', credits: 5200 },
    { name: 'Asif', credits: 5100 },
    { name: 'Tamil Alagan', credits: 5050 },
    { name: 'Mohamed Apsar', credits: 5000 }
  ];

  for (const student of namedStudents) {
    await prisma.user.updateMany({
      where: {
        fullName: student.name,
        college: { contains: 'Aalim' }
      },
      data: {
        procredits: student.credits,
        streak: 100,
        consistencyScore: 98,
        placementStatus: 'Placed'
      }
    });
    console.log(`   ✅ ${student.name} - ${student.credits} credits`);
  }

  // Update other students with random credits
  const otherStudents = await prisma.user.updateMany({
    where: {
      role: 'STUDENT',
      college: { not: { contains: 'Aalim' } }
    },
    data: {
      procredits: {
        set: Math.floor(Math.random() * 2000) + 500
      }
    }
  });

  console.log(`\n✅ Updated other students with random credits`);

  await prisma.$disconnect();
}

updateAalimCollege().catch(console.error);