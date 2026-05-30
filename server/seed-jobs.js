var { PrismaClient } = require('@prisma/client');
var p = new PrismaClient();

async function seed() {
  // Get employer ID
  var employer = await p.user.findFirst({ where: { role: 'EMPLOYER' } });
  if (!employer) { console.log('No employer found!'); return; }

  var jobs = [
    {
      title: "React JS Developer",
      company: "TechCorp Solutions",
      location: "Bangalore",
      type: "Full-time",
      salaryMin: 400000,
      salaryMax: 800000,
      description: "We are looking for a talented React JS Developer to join our growing engineering team at TechCorp Solutions. You will build modern web applications.",
      requirements: "1+ year React experience\nJavaScript/TypeScript\nCSS/HTML",
      skills: "React,TypeScript,JavaScript,Redux,HTML,CSS",
      deadline: new Date("2026-06-30"),
      postedBy: employer.id,
      status: "active"
    },
    {
      title: "Node.js Backend Developer",
      company: "DataFlow Systems",
      location: "Chennai",
      type: "Full-time",
      salaryMin: 500000,
      salaryMax: 1000000,
      description: "Join DataFlow as a Backend Developer. Build scalable APIs and microservices.",
      requirements: "Node.js experience\nMongoDB/PostgreSQL\nREST APIs",
      skills: "Node.js,Express,MongoDB,PostgreSQL,TypeScript",
      deadline: new Date("2026-07-15"),
      postedBy: employer.id,
      status: "active"
    },
    {
      title: "Frontend Intern",
      company: "StartupXYZ",
      location: "Remote",
      type: "Internship",
      salaryMin: 15000,
      salaryMax: 25000,
      description: "Great opportunity for freshers to learn frontend development.",
      requirements: "Basic HTML/CSS\nJavaScript knowledge",
      skills: "HTML,CSS,JavaScript,React",
      deadline: new Date("2026-06-15"),
      postedBy: employer.id,
      status: "active"
    }
  ];

  for (var j of jobs) {
    var created = await p.job.create({ data: j });
    console.log('Created:', created.title, '-', created.company);
  }
  console.log('Done!');
  await p.$disconnect();
}

seed();