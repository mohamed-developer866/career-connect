var { PrismaClient } = require('@prisma/client');
var p = new PrismaClient();

p.user.findMany({ where: { role: 'EMPLOYER' } })
  .then(function(u) {
    console.log('Employers found:', u.length);
    u.forEach(function(x) {
      console.log(x.email, x.fullName, x.company);
    });
    p.$disconnect();
  });