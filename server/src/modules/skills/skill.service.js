var prisma = require('../../config/prisma');

async function calculateStudentSkills(userId) {
  // Get course progress
  var enrollments = await prisma.courseEnrollment.findMany({
    where: { userId: userId },
    include: { course: true }
  });

  var skills = [];

  // Map courses to skills based on title
  for (var i = 0; i < enrollments.length; i++) {
    var e = enrollments[i];
    var courseName = e.course.title.toLowerCase();
    
    if (courseName.includes('react')) {
      skills.push({ name: 'React', score: e.progress, category: 'Frontend' });
    }
    if (courseName.includes('python')) {
      skills.push({ name: 'Python', score: e.progress, category: 'Backend' });
    }
    if (courseName.includes('node') || courseName.includes('express')) {
      skills.push({ name: 'Node.js', score: e.progress, category: 'Backend' });
    }
    if (courseName.includes('javascript') || courseName.includes('js')) {
      skills.push({ name: 'JavaScript', score: e.progress, category: 'Frontend' });
    }
    if (courseName.includes('sql') || courseName.includes('database')) {
      skills.push({ name: 'SQL', score: e.progress, category: 'Backend' });
    }
    if (courseName.includes('dsa') || courseName.includes('algorithm')) {
      skills.push({ name: 'DSA', score: e.progress, category: 'Core' });
    }
    if (courseName.includes('ai') || courseName.includes('ml') || courseName.includes('machine')) {
      skills.push({ name: 'AI/ML', score: e.progress, category: 'Data' });
    }
  }

  // Delete old skills and save new ones
  await prisma.skill.deleteMany({ where: { userId: userId } });
  
  for (var j = 0; j < skills.length; j++) {
    await prisma.skill.create({
      data: {
        userId: userId,
        name: skills[j].name,
        score: skills[j].score,
        category: skills[j].category
      }
    });
  }

  return skills;
}

async function getStudentSkills(userId) {
  return prisma.skill.findMany({ where: { userId: userId } });
}

async function getCollegeSkillRanking() {
  // Get all students with skills
  var users = await prisma.user.findMany({
    where: { role: 'STUDENT' },
    select: { id: true, college: true, fullName: true }
  });

  // Group by college
  var colleges = {};
  for (var i = 0; i < users.length; i++) {
    var u = users[i];
    var collegeName = u.college || 'Unknown';
    if (!colleges[collegeName]) {
      colleges[collegeName] = { name: collegeName, totalStudents: 0, totalSkillScore: 0, skills: {} };
    }
    
    var skills = await prisma.skill.findMany({ where: { userId: u.id } });
    var avgScore = 0;
    if (skills.length > 0) {
      avgScore = skills.reduce(function(sum, s) { return sum + s.score; }, 0) / skills.length;
    }
    
    colleges[collegeName].totalStudents++;
    colleges[collegeName].totalSkillScore += avgScore;
  }

  // Convert to array and calculate averages
  var result = [];
  var collegeKeys = Object.keys(colleges);
  for (var j = 0; j < collegeKeys.length; j++) {
    var c = colleges[collegeKeys[j]];
    result.push({
      name: c.name,
      totalStudents: c.totalStudents,
      avgSkillScore: c.totalStudents > 0 ? Math.round(c.totalSkillScore / c.totalStudents) : 0
    });
  }

  // Sort by skill score
  result.sort(function(a, b) { return b.avgSkillScore - a.avgSkillScore; });
  
  return result;
}

module.exports = { 
  calculateStudentSkills: calculateStudentSkills,
  getStudentSkills: getStudentSkills,
  getCollegeSkillRanking: getCollegeSkillRanking
};