const prisma = require('../../config/prisma');

async function createAssessment(data) {
  const { questions, ...assessmentData } = data;
  return prisma.assessment.create({
    data: {
      ...assessmentData,
      totalQuestions: questions.length,
      questions: {
        create: questions.map(q => ({
          type: q.type,
          questionText: q.questionText,
          options: q.options ? JSON.stringify(q.options) : null,
          correctAnswer: q.correctAnswer || null,
          marks: q.marks || 1,
          codingTemplate: q.codingTemplate || null,
          testCases: q.testCases ? JSON.stringify(q.testCases) : null,
        })),
      },
    },
    include: { questions: true },
  });
}

async function getAssessmentById(id) {
  return prisma.assessment.findUnique({
    where: { id },
    include: { questions: true },
  });
}

async function listAssessments() {
  return prisma.assessment.findMany({
    include: { _count: { select: { questions: true } } },
    orderBy: { createdAt: 'desc' },
  });
}

module.exports = { createAssessment, getAssessmentById, listAssessments };