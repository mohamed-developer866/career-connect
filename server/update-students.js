var { PrismaClient } = require('@prisma/client');
var prisma = new PrismaClient();

async function updateStudents() {
  try {
    // Show all students before
    var before = await prisma.user.findMany({
      where: { role: 'STUDENT' },
      select: { id: true, fullName: true, college: true, email: true }
    });
    console.log('📋 Students BEFORE:');
    before.forEach(function(s) {
      console.log('  -', s.fullName, '| College:', s.college || 'NULL', '| Email:', s.email);
    });

    // Update ALL students to have college = 'AMSCE Chennai'
    var result = await prisma.user.updateMany({
      where: { role: 'STUDENT' },
      data: { college: 'AMSCE Chennai' }
    });
    
    console.log('\n✅ Updated', result.count, 'students');

    // Show students after
    var after = await prisma.user.findMany({
      where: { role: 'STUDENT' },
      select: { id: true, fullName: true, college: true }
    });
    console.log('\n📋 Students AFTER:');
    after.forEach(function(s) {
      console.log('  -', s.fullName, '| College:', s.college);
    });

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

updateStudents();