const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  console.log('\n🚀 STARTING DATABASE SEED\n');

  try {
    // Test connection
    await prisma.$connect();
    console.log('✅ Database connected\n');

    const hashedPassword = await bcrypt.hash('123456', 10);
    const collegeName = 'Aalim Muhammed Salegh College of Engineering (AMSCE), Chennai';

    // ========== CLEAR DATA ==========
    console.log('📋 Clearing existing data...');
    
    // Check if tables exist before deleting
    const tables = await prisma.$queryRaw`SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_prisma_migrations';`;
    console.log('📋 Tables found:', tables.map(t => t.name).join(', '));
    
    // Delete in order
    try { await prisma.$executeRaw`DELETE FROM JobApplication`; } catch(e) {}
    try { await prisma.$executeRaw`DELETE FROM Message`; } catch(e) {}
    try { await prisma.$executeRaw`DELETE FROM Skill`; } catch(e) {}
    try { await prisma.$executeRaw`DELETE FROM Job`; } catch(e) {}
    try { await prisma.$executeRaw`DELETE FROM DailyTask`; } catch(e) {}
    try { await prisma.$executeRaw`DELETE FROM CourseEnrollment`; } catch(e) {}
    try { await prisma.$executeRaw`DELETE FROM LeaderboardEntry`; } catch(e) {}
    try { await prisma.$executeRaw`DELETE FROM Broadcast`; } catch(e) {}
    try { await prisma.$executeRaw`DELETE FROM OTP`; } catch(e) {}
    try { await prisma.$executeRaw`DELETE FROM User`; } catch(e) {}
    
    console.log('✅ Data cleared\n');

    // ========== CREATE ADMIN ==========
    console.log('👑 Creating Admin...');
    await prisma.$executeRaw`
      INSERT INTO User (id, fullName, email, password, role, isVerified, avatarInitials, createdAt, updatedAt)
      VALUES (lower(hex(randomblob(4))), 'Super Admin', 'admin@careerconnect.com', ${hashedPassword}, 'ADMIN', 1, 'SA', datetime('now'), datetime('now'))
    `;
    console.log('  ✅ admin@careerconnect.com / 123456\n');

    // ========== CREATE COLLEGE ==========
    console.log('🏛️ Creating College TPO...');
    await prisma.$executeRaw`
      INSERT INTO User (id, fullName, email, password, role, college, isVerified, avatarInitials, createdAt, updatedAt)
      VALUES (lower(hex(randomblob(4))), 'Dr. Placement Officer', 'college@test.com', ${hashedPassword}, 'COLLEGE', ${collegeName}, 1, 'PO', datetime('now'), datetime('now'))
    `;
    console.log('  ✅ college@test.com / 123456\n');

    // ========== CREATE EMPLOYERS ==========
    console.log('💼 Creating Employers...');
    
    const employers = [
      ['HR Manager', 'employer@test.com', 'InnovateLabs AI', 'AI-powered education platform', 'EdTech'],
      ['Google HR', 'hr@google.com', 'Google', 'Global technology leader', 'Technology']
    ];
    
    for (const emp of employers) {
      await prisma.$executeRaw`
        INSERT INTO User (id, fullName, email, password, role, company, companyDescription, companyIndustry, isVerified, avatarInitials, createdAt, updatedAt)
        VALUES (lower(hex(randomblob(4))), ${emp[0]}, ${emp[1]}, ${hashedPassword}, 'EMPLOYER', ${emp[2]}, ${emp[3]}, ${emp[4]}, 1, substr(${emp[2]}, 1, 1), datetime('now'), datetime('now'))
      `;
      console.log(`  ✅ ${emp[2]} (${emp[1]})`);
    }
    console.log('');

    // ========== CREATE STUDENTS ==========
    console.log('🎓 Creating Students...');
    
    const students = [
      ['Mohamed Apsar', 'student@test.com', 'Computer Science', 240],
      ['Arun Kumar S', 'arun.kumar@amsc.edu', 'Computer Science', 1250],
      ['Divya Lakshmi M', 'divya.lakshmi@amsc.edu', 'Information Technology', 980],
      ['Karthikeyan R', 'karthik.r@amsc.edu', 'Computer Science', 2100]
    ];
    
    for (const stu of students) {
      await prisma.$executeRaw`
        INSERT INTO User (id, fullName, email, password, role, college, department, procredits, isVerified, avatarInitials, createdAt, updatedAt)
        VALUES (lower(hex(randomblob(4))), ${stu[0]}, ${stu[1]}, ${hashedPassword}, 'STUDENT', ${collegeName}, ${stu[2]}, ${stu[3]}, 1, substr(${stu[0]}, 1, 1), datetime('now'), datetime('now'))
      `;
      console.log(`  ✅ ${stu[0]} (${stu[3]} credits)`);
    }
    console.log('');

    // ========== CREATE JOBS ==========
    console.log('📋 Creating Jobs...');
    
    // Get employer IDs
    const employerRows = await prisma.$queryRaw`SELECT id FROM User WHERE role = 'EMPLOYER' LIMIT 2`;
    
    if (employerRows.length >= 2) {
      const jobs = [
        ['Frontend Developer', 'InnovateLabs AI', 'Bangalore', 'Full-time', 800000, 1400000, 'React developer needed', 'React, JavaScript', 'React,JavaScript,HTML,CSS', employerRows[0].id],
        ['Backend Engineer', 'InnovateLabs AI', 'Bangalore', 'Full-time', 900000, 1500000, 'Node.js developer', 'Node.js, Express', 'Node.js,Express,MongoDB', employerRows[0].id],
        ['Software Engineer', 'Google', 'Bangalore', 'Full-time', 1500000, 2500000, 'Google software engineer', 'Computer Science degree', 'Java,Python,Algorithms', employerRows[1].id]
      ];
      
      for (const job of jobs) {
        await prisma.$executeRaw`
          INSERT INTO Job (id, title, company, location, type, salaryMin, salaryMax, description, requirements, skills, deadline, postedBy, status, createdAt, updatedAt, maxApplicants)
          VALUES (lower(hex(randomblob(4))), ${job[0]}, ${job[1]}, ${job[2]}, ${job[3]}, ${job[4]}, ${job[5]}, ${job[6]}, ${job[7]}, ${job[8]}, '2026-12-31', ${job[9]}, 'approved', datetime('now'), datetime('now'), 50)
        `;
        console.log(`  ✅ ${job[0]} at ${job[1]}`);
      }
    }
    console.log('');

    // ========== SUMMARY ==========
    const userCount = await prisma.$queryRaw`SELECT count(*) as count FROM User`;
    const jobCount = await prisma.$queryRaw`SELECT count(*) as count FROM Job`;
    
    console.log('='.repeat(60));
    console.log('🎉 DATABASE SEED COMPLETED! 🎉');
    console.log('='.repeat(60));
    console.log(`\n📊 SUMMARY:`);
    console.log(`  👑 Admins: 1`);
    console.log(`  🏛️ College: 1`);
    console.log(`  💼 Employers: ${employers.length}`);
    console.log(`  🎓 Students: ${students.length}`);
    console.log(`  📋 Jobs: ${jobs?.length || 0}`);
    console.log(`  📚 Total Users: ${userCount[0].count}`);
    
    console.log('\n🔑 LOGIN CREDENTIALS:');
    console.log('  ┌─────────────────────────────────────────────────────────────┐');
    console.log('  │ 👑 ADMIN:    admin@careerconnect.com / 123456              │');
    console.log('  │ 🎓 STUDENT:  student@test.com / 123456                     │');
    console.log('  │ 🏛️ COLLEGE:  college@test.com / 123456                     │');
    console.log('  │ 💼 EMPLOYER: employer@test.com / 123456                    │');
    console.log('  └─────────────────────────────────────────────────────────────┘');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();