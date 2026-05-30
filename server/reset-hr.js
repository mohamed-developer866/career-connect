var { PrismaClient } = require('@prisma/client');
var bcrypt = require('bcryptjs');
var p = new PrismaClient();

async function run() {
  var pw = await bcrypt.hash('amsce123', 10);
  var u = await p.user.upsert({
    where: { email: 'hr@techcorp.com' },
    update: { password: pw, isVerified: true, role: 'EMPLOYER' },
    create: {
      fullName: 'TechCorp HR',
      email: 'hr@techcorp.com',
      password: pw,
      role: 'EMPLOYER',
      company: 'TechCorp Solutions',
      isVerified: true,
      avatarInitials: 'TC'
    }
  });
  console.log('✅ Employer ready: ' + u.email + ' / amsce123');
  await p.$disconnect();
}

run();