var { PrismaClient } = require('@prisma/client');
var prisma = new PrismaClient();

async function main() {
  await prisma.job.deleteMany();

  var jobs = [
    { title: "Junior Web Analytics Developer", company: "DataVinci Analytics", location: "Work From Home", type: "Full-time", salaryMin: 450000, salaryMax: 500000, description: "Build cutting-edge web analytics solutions.", requirements: "JavaScript, HTML, CSS", skills: "JavaScript,HTML,CSS,React,SQL", deadline: new Date("2026-05-15"), maxApplicants: 2, postedBy: "employer-1", status: "active" },
    { title: "Data Analytics Intern", company: "Tata CLIQ", location: "Mumbai", type: "Internship", salaryMin: 500000, salaryMax: 700000, description: "Analyze customer behavior data.", requirements: "Python, SQL", skills: "Python,SQL,Excel,Power BI", deadline: new Date("2026-05-20"), maxApplicants: 2, postedBy: "employer-1", status: "active" },
    { title: "Associate Software Engineer", company: "Valar Capital", location: "Noida", type: "Full-time", salaryMin: 400000, salaryMax: 400000, description: "Build fintech solutions.", requirements: "Java, Spring Boot", skills: "Java,Spring Boot,SQL,AWS", deadline: new Date("2026-05-25"), maxApplicants: 2, postedBy: "employer-1", status: "active" },
    { title: "Full Stack Developer", company: "PRM360", location: "Hyderabad", type: "Full-time", salaryMin: 500000, salaryMax: 800000, description: "Build procurement solutions.", requirements: "React, Node.js, MongoDB", skills: "React,Node.js,MongoDB,TypeScript", deadline: new Date("2026-05-30"), maxApplicants: 5, postedBy: "employer-1", status: "active" },
    { title: "React Developer", company: "TechCorp", location: "Chennai", type: "Full-time", salaryMin: 800000, salaryMax: 1200000, description: "Build modern UIs with React.", requirements: "2+ years React", skills: "React,TypeScript,Node.js,Tailwind", deadline: new Date("2026-06-30"), maxApplicants: 50, postedBy: "employer-1", status: "active" },
    { title: "Python Intern", company: "DataFlow", location: "Remote", type: "Internship", salaryMin: 300000, salaryMax: 500000, description: "Work on data pipelines.", requirements: "Python basics", skills: "Python,Django,SQL", deadline: new Date("2026-05-18"), maxApplicants: 5, postedBy: "employer-1", status: "active" },
  ];

  for (var i = 0; i < jobs.length; i++) {
    await prisma.job.create({ data: jobs[i] });
  }
  console.log('✅ 6 jobs seeded!');
}

main().catch(console.error).finally(function () { prisma.$disconnect(); });