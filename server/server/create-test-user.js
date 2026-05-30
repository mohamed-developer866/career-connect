var { PrismaClient } = require('@prisma/client');
var bcrypt = require('bcryptjs');
var p = new PrismaClient();

async function run() {
  var pw = await bcrypt.hash('123456', 10);
  var u = await p.user.upsert({
    where: { email: 'student@test.com' },
    update: { password: pw },
    create: {
      fullName: 'Test Student',
      email: 'student@test.com',
      password: pw,
      role: 'STUDENT',
      isVerified: true,
      avatarInitials: 'TS',
      college: 'AMSCE Chennai'
    }
  });
  console.log('User created: ' + u.email);
  console.log('Password: 123456');
  p.$disconnect();
}

run();