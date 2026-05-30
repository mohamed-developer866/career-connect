var { PrismaClient } = require('@prisma/client');
var bcrypt = require('bcryptjs');
var p = new PrismaClient();

async function run() {
  var pw = await bcrypt.hash('amsce123', 10);
  
  // Reset TPO
  var tpo = await p.user.upsert({
    where: { email: 'tpo@amsce.edu.in' },
    update: { password: pw, isVerified: true, role: 'COLLEGE' },
    create: {
      fullName: 'Dr. Rajeshwari S',
      email: 'tpo@amsce.edu.in',
      password: pw,
      role: 'COLLEGE',
      college: 'AMSCE Chennai',
      isVerified: true,
      avatarInitials: 'RS'
    }
  });
  console.log('✅ TPO: ' + tpo.email);
  
  // Reset Employer
  var emp = await p.user.upsert({
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
  console.log('✅ Employer: ' + emp.email);
  
  // Reset Student
  var stu = await p.user.upsert({
    where: { email: 'student@test.com' },
    update: { password: pw, isVerified: true, role: 'STUDENT' },
    create: {
      fullName: 'Test Student',
      email: 'student@test.com',
      password: pw,
      role: 'STUDENT',
      college: 'AMSCE Chennai',
      isVerified: true,
      avatarInitials: 'TS'
    }
  });
  console.log('✅ Student: ' + stu.email);
  
  console.log('\n🔑 ALL PASSWORDS: amsce123');
  await p.$disconnect();
}

run();