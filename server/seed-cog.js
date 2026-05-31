const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');

async function seedCognizantMessages() {
  console.log('\n💼 SEEDING COGNIZANT - AALIM COLLEGE MESSAGES\n');
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

  // Get or create Cognizant HR (Employer)
  let cognizantHR = await prisma.user.findFirst({
    where: { 
      role: 'EMPLOYER',
      company: 'Cognizant'
    }
  });

  if (!cognizantHR) {
    console.log('Creating Cognizant HR...');
    const hash = await bcrypt.hash('123456', 10);
    cognizantHR = await prisma.user.create({
      data: {
        fullName: 'Priya Sharma',
        email: 'hr@cognizant.com',
        password: hash,
        role: 'EMPLOYER',
        company: 'Cognizant',
        companyDescription: 'Global IT services and consulting',
        companyIndustry: 'Technology',
        companyLocation: 'Chennai',
        isVerified: true,
        avatarInitials: 'PS'
      }
    });
    console.log('✅ Created Cognizant HR: Priya Sharma');
  }

  // Clear existing messages between them
  await prisma.message.deleteMany({
    where: {
      OR: [
        { senderId: cognizantHR.id, receiverId: collegeTPO.id },
        { senderId: collegeTPO.id, receiverId: cognizantHR.id }
      ]
    }
  });
  console.log('🗑️ Cleared existing messages\n');

  // Create conversation timeline
  const messages = [
    // Cognizant HR initiates contact
    {
      senderId: cognizantHR.id,
      receiverId: collegeTPO.id,
      content: "Hello Dr. Rahman, this is Priya from Cognizant HR. We're looking to hire freshers from your college.",
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) // 10 days ago
    },
    {
      senderId: collegeTPO.id,
      receiverId: cognizantHR.id,
      content: "Hello Priya! Great to hear from Cognizant. We'd love to collaborate. What positions are you hiring for?",
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000)
    },
    {
      senderId: cognizantHR.id,
      receiverId: collegeTPO.id,
      content: "We have openings for Software Engineer, Frontend Developer, and Data Analyst roles. Around 30 positions.",
      createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000)
    },
    {
      senderId: collegeTPO.id,
      receiverId: cognizantHR.id,
      content: "That's wonderful! We have many talented students in CSE, IT, and AI/ML branches.",
      createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000)
    },
    {
      senderId: cognizantHR.id,
      receiverId: collegeTPO.id,
      content: "Perfect. Could you share the placement brochure and student profiles?",
      createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000)
    },
    {
      senderId: collegeTPO.id,
      receiverId: cognizantHR.id,
      content: "Certainly! I'll email you the brochure. What's the eligibility criteria for students?",
      createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000 + 1 * 60 * 60 * 1000)
    },
    {
      senderId: cognizantHR.id,
      receiverId: collegeTPO.id,
      content: "Minimum 7.5 CGPA, no backlogs, good communication skills. Knowledge of Java/Python preferred.",
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    },
    {
      senderId: collegeTPO.id,
      receiverId: cognizantHR.id,
      content: "We have 85+ eligible students. Can you conduct the drive in December?",
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000)
    },
    {
      senderId: cognizantHR.id,
      receiverId: collegeTPO.id,
      content: "Yes, we can schedule it for December 10th. Will that work for your students?",
      createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)
    },
    {
      senderId: collegeTPO.id,
      receiverId: cognizantHR.id,
      content: "December 10th works perfectly! Our semester exams end on Dec 5th.",
      createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000)
    },
    {
      senderId: cognizantHR.id,
      receiverId: collegeTPO.id,
      content: "Great! We'll conduct an online aptitude test first, followed by technical interviews.",
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
    },
    {
      senderId: collegeTPO.id,
      receiverId: cognizantHR.id,
      content: "What's the selection process and salary package?",
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 1 * 60 * 60 * 1000)
    },
    {
      senderId: cognizantHR.id,
      receiverId: collegeTPO.id,
      content: "Package: 4.5 LPA. Process: Aptitude Test → Technical Interview → HR Round.",
      createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
    },
    {
      senderId: collegeTPO.id,
      receiverId: cognizantHR.id,
      content: "The package is competitive. Our students will be excited!",
      createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000)
    },
    {
      senderId: cognizantHR.id,
      receiverId: collegeTPO.id,
      content: "Could you share the list of interested students by end of this week?",
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    },
    {
      senderId: collegeTPO.id,
      receiverId: cognizantHR.id,
      content: "Yes, I'll prepare the list and share it by Friday. Any specific skills we should focus on?",
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000)
    },
    {
      senderId: cognizantHR.id,
      receiverId: collegeTPO.id,
      content: "Focus on DSA, SQL, and basics of web development. Python/Java fundamentals.",
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    },
    {
      senderId: collegeTPO.id,
      receiverId: cognizantHR.id,
      content: "Got it! I'll arrange a workshop for students to prepare for Cognizant interview.",
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 1 * 60 * 60 * 1000)
    },
    {
      senderId: cognizantHR.id,
      receiverId: collegeTPO.id,
      content: "That's a great initiative! Let me know if you need any preparatory materials from our side.",
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    },
    {
      senderId: collegeTPO.id,
      receiverId: cognizantHR.id,
      content: "Thank you! We'd appreciate any sample questions or mock test papers.",
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000)
    },
    {
      senderId: cognizantHR.id,
      receiverId: collegeTPO.id,
      content: "I'll share a preparation kit with sample questions by tomorrow morning.",
      createdAt: new Date(Date.now() - 20 * 60 * 60 * 1000)
    },
    {
      senderId: collegeTPO.id,
      receiverId: cognizantHR.id,
      content: "That would be very helpful! Our students will start preparing immediately.",
      createdAt: new Date(Date.now() - 18 * 60 * 60 * 1000)
    },
    {
      senderId: cognizantHR.id,
      receiverId: collegeTPO.id,
      content: "Also, could you share the venue details? We'll be sending our recruitment team.",
      createdAt: new Date(Date.now() - 15 * 60 * 60 * 1000)
    },
    {
      senderId: collegeTPO.id,
      receiverId: cognizantHR.id,
      content: "We'll conduct the drive in our main auditorium. Can accommodate 200 students easily.",
      createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000)
    },
    {
      senderId: cognizantHR.id,
      receiverId: collegeTPO.id,
      content: "Perfect! Please share the exact address and contact person details.",
      createdAt: new Date(Date.now() - 10 * 60 * 60 * 1000)
    },
    {
      senderId: collegeTPO.id,
      receiverId: cognizantHR.id,
      content: "Address: Aalim College, GST Road, Chennai - 600056. Contact: Dr. Rahman, 9876543210",
      createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000)
    },
    {
      senderId: cognizantHR.id,
      receiverId: collegeTPO.id,
      content: "Thank you! I've noted the details. Looking forward to a successful placement drive.",
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000)
    },
    {
      senderId: collegeTPO.id,
      receiverId: cognizantHR.id,
      content: "We're excited to host Cognizant! This will be great for our students' careers.",
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000)
    },
    {
      senderId: cognizantHR.id,
      receiverId: collegeTPO.id,
      content: "Could you arrange a virtual meeting with your placement team tomorrow at 11 AM?",
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000)
    },
    {
      senderId: collegeTPO.id,
      receiverId: cognizantHR.id,
      content: "Sure! I'll coordinate with my team and send you the meeting link.",
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
    },
    {
      senderId: cognizantHR.id,
      receiverId: collegeTPO.id,
      content: "Great! Also, please ensure students register on our portal before the drive.",
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000)
    },
    {
      senderId: collegeTPO.id,
      receiverId: cognizantHR.id,
      content: "Yes, we'll share the registration link with all eligible students today.",
      createdAt: new Date(Date.now() - 30 * 60 * 1000)
    }
  ];

  // Create all messages
  for (const msg of messages) {
    await prisma.message.create({
      data: msg
    });
  }

  console.log(`✅ Created ${messages.length} messages between Cognizant HR and Aalim College TPO`);
  console.log('\n📊 Message Summary:');
  console.log(`   From Cognizant HR: ${messages.filter(m => m.senderId === cognizantHR.id).length} messages`);
  console.log(`   From College TPO: ${messages.filter(m => m.senderId === collegeTPO.id).length} messages`);
  
  console.log('\n🔑 Login Credentials:');
  console.log('   For Cognizant HR:');
  console.log('   Email: hr@cognizant.com');
  console.log('   Password: 123456');
  console.log('');
  console.log('   For Aalim College TPO:');
  console.log('   Email: tpo@aalimcollege.edu');
  console.log('   Password: 123456');
  
  console.log('\n💬 Message Topics Covered:');
  console.log('   • Hiring requirements and positions');
  console.log('   • Eligibility criteria discussion');
  console.log('   • Drive scheduling and coordination');
  console.log('   • Selection process and salary package');
  console.log('   • Student preparation and workshops');
  console.log('   • Venue and logistics planning');
  console.log('   • Registration and portal details');
  console.log('   • Virtual meeting coordination');
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ Messages seeded successfully!');
  console.log('='.repeat(60));
  
  await prisma.$disconnect();
}

seedCognizantMessages().catch(console.error);