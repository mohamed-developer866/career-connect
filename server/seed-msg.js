const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');

async function seedMessages() {
  console.log('\n💬 SEEDING DEMO MESSAGES\n');
  console.log('='.repeat(60));

  // Get or create Aalim College TPO
  let collegeTPO = await prisma.user.findFirst({
    where: { 
      role: 'COLLEGE',
      college: { contains: 'Aalim' }
    }
  });

  if (!collegeTPO) {
    console.log('Creating Aalim College TPO...');
    const hash = await bcrypt.hash('123456', 10);
    collegeTPO = await prisma.user.create({
      data: {
        fullName: 'Dr. A. Rahman',
        email: 'tpo@aalimcollege.edu',
        password: hash,
        role: 'COLLEGE',
        college: 'Aalim Muhammed Salegh College of Engineering (AMSCE), Chennai',
        isVerified: true,
        avatarInitials: 'AR'
      }
    });
    console.log('✅ Created TPO: Dr. A. Rahman');
  }

  // Get or create Mohamed Apsar (Student)
  let student = await prisma.user.findFirst({
    where: { 
      email: 'mohamed@aalimcollege.edu'
    }
  });

  if (!student) {
    console.log('Creating Mohamed Apsar...');
    const hash = await bcrypt.hash('123456', 10);
    student = await prisma.user.create({
      data: {
        fullName: 'Mohamed Apsar',
        email: 'mohamed@aalimcollege.edu',
        password: hash,
        role: 'STUDENT',
        college: 'Aalim Muhammed Salegh College of Engineering (AMSCE), Chennai',
        department: 'Computer Science Engineering',
        procredits: 5000,
        isVerified: true,
        avatarInitials: 'MA'
      }
    });
    console.log('✅ Created Student: Mohamed Apsar');
  }

  // Clear existing messages between them
  await prisma.message.deleteMany({
    where: {
      OR: [
        { senderId: collegeTPO.id, receiverId: student.id },
        { senderId: student.id, receiverId: collegeTPO.id }
      ]
    }
  });
  console.log('🗑️ Cleared existing messages\n');

  // Create conversation timeline
  const messages = [
    // Mohamed asks about placement
    {
      senderId: student.id,
      receiverId: collegeTPO.id,
      content: "Hello Sir, I wanted to ask about upcoming placement drives. When is the next one?",
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
    },
    {
      senderId: collegeTPO.id,
      receiverId: student.id,
      content: "Hi Mohamed! Yes, we have Google and Microsoft coming next week. I'll share the schedule soon.",
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 5 * 60 * 1000)
    },
    {
      senderId: student.id,
      receiverId: collegeTPO.id,
      content: "That's great news! What are the eligibility criteria for Google?",
      createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)
    },
    {
      senderId: collegeTPO.id,
      receiverId: student.id,
      content: "Minimum 7.5 CGPA and good DSA skills. Also, they prefer candidates with project experience. Your profile looks strong!",
      createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000 + 10 * 60 * 1000)
    },
    {
      senderId: student.id,
      receiverId: collegeTPO.id,
      content: "Thank you sir! I've been practicing LeetCode regularly. Any tips for the interview?",
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
    },
    {
      senderId: collegeTPO.id,
      receiverId: student.id,
      content: "Focus on system design and behavioral questions too. Also, make sure your resume is updated on the portal.",
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 15 * 60 * 1000)
    },
    {
      senderId: student.id,
      receiverId: collegeTPO.id,
      content: "Got it, sir! I'll update my resume today. Also, when is the registration deadline?",
      createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
    },
    {
      senderId: collegeTPO.id,
      receiverId: student.id,
      content: "Registration closes this Friday. Make sure you complete it by then. I've sent the link to your email.",
      createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000 + 20 * 60 * 1000)
    },
    {
      senderId: student.id,
      receiverId: collegeTPO.id,
      content: "Done sir! I've registered. Also, I wanted to ask about the Microsoft drive.",
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    },
    {
      senderId: collegeTPO.id,
      receiverId: student.id,
      content: "Microsoft is coming on 20th December. They're hiring for SDE roles. Your React skills would be valuable!",
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 8 * 60 * 1000)
    },
    {
      senderId: student.id,
      receiverId: collegeTPO.id,
      content: "Perfect! I've been working on a React project. Should I include it in my portfolio?",
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    },
    {
      senderId: collegeTPO.id,
      receiverId: student.id,
      content: "Absolutely! Showcase your best projects. Also, prepare a 1-minute elevator pitch about yourself.",
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 12 * 60 * 1000)
    },
    {
      senderId: student.id,
      receiverId: collegeTPO.id,
      content: "Thanks for the guidance, sir! I really appreciate your help.",
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    },
    {
      senderId: collegeTPO.id,
      receiverId: student.id,
      content: "You're welcome, Mohamed! Keep working hard. I see great potential in you. Let me know if you need any help with resume review.",
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 25 * 60 * 1000)
    },
    {
      senderId: student.id,
      receiverId: collegeTPO.id,
      content: "That would be amazing, sir! Can I share my resume with you?",
      createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000)
    },
    {
      senderId: collegeTPO.id,
      receiverId: student.id,
      content: "Sure! Send it over. I'll review and give you feedback by tomorrow.",
      createdAt: new Date(Date.now() - 11 * 60 * 60 * 1000)
    },
    {
      senderId: student.id,
      receiverId: collegeTPO.id,
      content: "Sent! Please let me know what improvements I can make.",
      createdAt: new Date(Date.now() - 10 * 60 * 60 * 1000)
    },
    {
      senderId: collegeTPO.id,
      receiverId: student.id,
      content: "I've reviewed your resume. It's good! Add more quantifiable achievements and remove the old projects.",
      createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000)
    },
    {
      senderId: student.id,
      receiverId: collegeTPO.id,
      content: "Will do, sir! Thanks for the valuable feedback. I'll update it tonight.",
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000)
    },
    {
      senderId: collegeTPO.id,
      receiverId: student.id,
      content: "Great! Also, don't forget to practice mock interviews. We're conducting one on Saturday.",
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000)
    }
  ];

  // Create all messages
  for (const msg of messages) {
    await prisma.message.create({
      data: msg
    });
  }

  console.log(`✅ Created ${messages.length} messages between TPO and Mohamed Apsar`);
  console.log('\n📊 Message Summary:');
  console.log(`   From Student (Mohamed): ${messages.filter(m => m.senderId === student.id).length} messages`);
  console.log(`   From TPO: ${messages.filter(m => m.senderId === collegeTPO.id).length} messages`);
  
  console.log('\n🔑 Login Credentials:');
  console.log('   For College TPO:');
  console.log('   Email: tpo@aalimcollege.edu');
  console.log('   Password: 123456');
  console.log('');
  console.log('   For Student:');
  console.log('   Email: mohamed@aalimcollege.edu');
  console.log('   Password: 123456');
  
  console.log('\n💡 Message Topics Covered:');
  console.log('   • Placement drives (Google, Microsoft)');
  console.log('   • Eligibility criteria');
  console.log('   • Interview preparation tips');
  console.log('   • Resume review and feedback');
  console.log('   • Registration deadlines');
  console.log('   • Project portfolio advice');
  console.log('   • Mock interview scheduling');
  
  await prisma.$disconnect();
}

seedMessages().catch(console.error);