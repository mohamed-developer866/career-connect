var { PrismaClient } = require('@prisma/client');
var p = new PrismaClient();

async function check() {
  var students = await p.user.findMany({
    where: { role: 'STUDENT' },
    select: { fullName: true, college: true }
  });
  console.log('Total students:', students.length);
  students.forEach(function(s) {
    console.log(' -', s.fullName, '| College:', s.college || 'NULL');
  });
  await p.$disconnect();
}

check();