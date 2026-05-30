const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.courseEnrollment.deleteMany();
  await prisma.course.deleteMany();

  const courses = await Promise.all([
    prisma.course.create({ data: { title: "Data Structures & Algorithms", category: "Computer Science", totalTopics: 22, difficulty: "Intermediate", accentColor: "#6C63FF", icon: "🧮" } }),
    prisma.course.create({ data: { title: "React JS Mastery", category: "Frontend Development", totalTopics: 18, difficulty: "Beginner", accentColor: "#FF6584", icon: "⚛️" } }),
    prisma.course.create({ data: { title: "Python for AI & ML", category: "Data Science", totalTopics: 15, difficulty: "Advanced", accentColor: "#43C6AC", icon: "🐍" } }),
    prisma.course.create({ data: { title: "Full Stack Web Development", category: "Web Development", totalTopics: 30, difficulty: "Intermediate", accentColor: "#F7971E", icon: "🌐" } }),
    prisma.course.create({ data: { title: "System Design Fundamentals", category: "Architecture", totalTopics: 12, difficulty: "Advanced", accentColor: "#7C3AED", icon: "📐" } }),
    prisma.course.create({ data: { title: "Generative AI Applications", category: "Artificial Intelligence", totalTopics: 20, difficulty: "Intermediate", accentColor: "#EC4899", icon: "🤖" } }),
  ]);

  const user = await prisma.user.findFirst({ where: { role: "STUDENT" } });
  if (user) {
    await prisma.courseEnrollment.createMany({
      data: [
        { userId: user.id, courseId: courses[0].id, completedTopics: 14, progress: 64 },
        { userId: user.id, courseId: courses[1].id, completedTopics: 2, progress: 11 },
        { userId: user.id, courseId: courses[2].id, completedTopics: 10, progress: 67 },
        { userId: user.id, courseId: courses[3].id, completedTopics: 1, progress: 3 },
        { userId: user.id, courseId: courses[4].id, completedTopics: 0, progress: 0 },
        { userId: user.id, courseId: courses[5].id, completedTopics: 9, progress: 45 },
      ],
    });
  }
  console.log('✅ Seeded!');
}

main().catch(console.error).finally(() => prisma.$disconnect());