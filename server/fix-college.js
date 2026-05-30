var { PrismaClient } = require('@prisma/client');
var prisma = new PrismaClient();

async function fixCollege() {
  try {
    // Update TPO's college
    var tpo = await prisma.user.update({
      where: { id: 'de671f9f-47ec-48eb-a1be-5b8a7c20ca6f' },
      data: { college: 'AMSCE Chennai' }
    });
    console.log('✅ TPO Updated:', tpo.fullName, '| College:', tpo.college);

    // Show all students
    var students = await prisma.user.findMany({
      where: { role: 'STUDENT' },
      select: { id: true, fullName: true, college: true }
    });
    console.log('\n📚 Students:', students.length);
    students.forEach(function(s) {
      console.log('  -', s.fullName, '| College:', s.college || 'NULL');
    });

    // Update students without college
    var updated = await prisma.user.updateMany({
      where: { role: 'STUDENT', college: null },
      data: { college: 'AMSCE Chennai' }
    });
    console.log('\n🔧 Updated', updated.count, 'students with college');
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

fixCollege();