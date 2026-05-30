const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  // DELETE existing admin
  await prisma.user.deleteMany({ where: { role: 'ADMIN' } });
  console.log('Old admin deleted');

  // CREATE new admin
  const hashed = await bcrypt.hash('Mohamed@2026', 10);
  await prisma.user.create({
    data: {
      fullName: 'S Mohamed',
      email: 'mohamed@careerconnect.com',
      password: hashed,
      role: 'ADMIN',
      isVerified: true,
      avatarInitials: 'SM',
    },
  });
  console.log('✅ New admin: mohamed@careerconnect.com / Mohamed@2026');
}

main().catch(console.error).finally(() => prisma.$disconnect());