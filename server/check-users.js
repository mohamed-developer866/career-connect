var { PrismaClient } = require('@prisma/client');
var p = new PrismaClient();

p.user.findMany({
  select: { email: true, role: true, fullName: true, company: true, college: true, isVerified: true }
}).then(function(u) {
  console.log('TOTAL USERS:', u.length);
  console.log('──────────────────────────────────────────');
  u.forEach(function(x) {
    console.log(x.email, '|', x.role, '|', x.fullName, '|', x.company || x.college || '', '| Verified:', x.isVerified);
  });
  p.$disconnect();
});