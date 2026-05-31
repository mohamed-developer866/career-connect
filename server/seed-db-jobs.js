const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedJobs() {
  console.log('\n📋 Creating sample jobs...\n');
  
  // Get an employer user
  const employer = await prisma.user.findFirst({
    where: { role: 'EMPLOYER' }
  });
  
  if (!employer) {
    console.log('❌ No employer found! Creating a test employer...');
    
    const bcrypt = require('bcryptjs');
    const hash = await bcrypt.hash('123456', 10);
    
    const newEmployer = await prisma.user.create({
      data: {
        fullName: 'Google HR',
        email: 'hr@google.com',
        password: hash,
        role: 'EMPLOYER',
        company: 'Google',
        companyDescription: 'Global technology leader',
        companyIndustry: 'Technology',
        isVerified: true,
        avatarInitials: 'G'
      }
    });
    
    console.log('✅ Created test employer:', newEmployer.email);
    var employerId = newEmployer.id;
  } else {
    console.log(`✅ Found employer: ${employer.company || employer.fullName}`);
    var employerId = employer.id;
  }
  
  // Check existing jobs
  const existingJobs = await prisma.job.findMany();
  console.log(`\n📊 Existing jobs: ${existingJobs.length}`);
  
  if (existingJobs.length > 0) {
    console.log('Jobs already exist, skipping creation...');
    await prisma.$disconnect();
    return;
  }
  
  const jobs = [
    {
      title: "Frontend Developer",
      company: "Google",
      location: "Bangalore",
      type: "Full-time",
      salaryMin: 800000,
      salaryMax: 1200000,
      description: "We are looking for a skilled Frontend Developer with React expertise to join our team. You will be responsible for building amazing user interfaces.",
      requirements: "3+ years of experience in React, JavaScript, HTML/CSS. Strong problem-solving skills. Bachelor's degree in CS or related field.",
      skills: "React, JavaScript, HTML, CSS, TypeScript, Redux",
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      postedBy: employerId,
      status: "approved",
      maxApplicants: 50
    },
    {
      title: "Backend Engineer",
      company: "Microsoft",
      location: "Hyderabad",
      type: "Full-time",
      salaryMin: 1000000,
      salaryMax: 1500000,
      description: "Seeking a Backend Engineer to build scalable APIs and microservices. You will work on high-traffic systems.",
      requirements: "4+ years in Node.js, Python, or Java. Experience with databases and cloud services.",
      skills: "Node.js, Python, MongoDB, PostgreSQL, AWS, Docker",
      deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      postedBy: employerId,
      status: "approved",
      maxApplicants: 40
    },
    {
      title: "Full Stack Developer",
      company: "Amazon",
      location: "Chennai",
      type: "Full-time",
      salaryMin: 1200000,
      salaryMax: 1800000,
      description: "Looking for a Full Stack Developer to work on our e-commerce platform. You'll build features end-to-end.",
      requirements: "3+ years experience with MERN stack. Strong understanding of web technologies.",
      skills: "React, Node.js, MongoDB, Express, AWS, Git",
      deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      postedBy: employerId,
      status: "approved",
      maxApplicants: 60
    },
    {
      title: "Data Scientist",
      company: "TCS",
      location: "Pune",
      type: "Full-time",
      salaryMin: 900000,
      salaryMax: 1400000,
      description: "Join our data science team to build ML models and drive business insights.",
      requirements: "2+ years experience in Python, SQL, and Machine Learning.",
      skills: "Python, Pandas, NumPy, Scikit-learn, SQL, TensorFlow",
      deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
      postedBy: employerId,
      status: "approved",
      maxApplicants: 35
    },
    {
      title: "DevOps Engineer",
      company: "Infosys",
      location: "Bangalore",
      type: "Full-time",
      salaryMin: 1100000,
      salaryMax: 1600000,
      description: "Looking for a DevOps engineer to manage our cloud infrastructure and CI/CD pipelines.",
      requirements: "3+ years experience with AWS, Docker, Kubernetes, Jenkins.",
      skills: "AWS, Docker, Kubernetes, Jenkins, Terraform, Linux",
      deadline: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000),
      postedBy: employerId,
      status: "approved",
      maxApplicants: 30
    },
    {
      title: "UI/UX Designer Intern",
      company: "Adobe",
      location: "Noida",
      type: "Internship",
      salaryMin: 300000,
      salaryMax: 500000,
      description: "Internship opportunity for creative UI/UX designers. Learn from industry experts.",
      requirements: "Knowledge of Figma, Adobe XD, or similar tools. Portfolio required.",
      skills: "Figma, Adobe XD, UI Design, UX Research, Prototyping",
      deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      postedBy: employerId,
      status: "approved",
      maxApplicants: 25
    },
    {
      title: "Mobile Developer (React Native)",
      company: "Flipkart",
      location: "Bangalore",
      type: "Full-time",
      salaryMin: 1000000,
      salaryMax: 1600000,
      description: "Build cross-platform mobile apps using React Native for India's leading e-commerce platform.",
      requirements: "2+ years experience in React Native, JavaScript, and mobile development.",
      skills: "React Native, JavaScript, Redux, iOS, Android, Firebase",
      deadline: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
      postedBy: employerId,
      status: "approved",
      maxApplicants: 45
    }
  ];
  
  let created = 0;
  for (const job of jobs) {
    await prisma.job.create({ data: job });
    created++;
    console.log(`✅ Created: ${job.title} at ${job.company}`);
  }
  
  console.log(`\n🎉 Successfully created ${created} approved jobs!`);
  console.log('\n📝 Jobs are now available for students to apply.');
  
  await prisma.$disconnect();
}

seedJobs().catch(console.error);