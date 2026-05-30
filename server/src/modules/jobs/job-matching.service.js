async function calculateMatchScore(studentSkills, jobSkills) {
  // Convert skills strings to arrays
  var studentSkillsArr = (typeof studentSkills === 'string' ? studentSkills.split(',').map(function(s) { return s.trim().toLowerCase(); }) : studentSkills || []);
  var jobSkillsArr = (typeof jobSkills === 'string' ? jobSkills.split(',').map(function(s) { return s.trim().toLowerCase(); }) : jobSkills || []);

  if (jobSkillsArr.length === 0) return 0;

  var matched = 0;
  for (var skill of jobSkillsArr) {
    if (studentSkillsArr.some(function(s) { return s.includes(skill) || skill.includes(s); })) {
      matched++;
    }
  }

  return Math.round((matched / jobSkillsArr.length) * 100);
}

// Get AI-enhanced match using DeepSeek
async function getAIMatchScore(student, job) {
  try {
    var response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + process.env.DEEPSEEK_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: 'You are a job matching AI. Calculate a match score (0-100) between a student profile and job requirements. Return ONLY a JSON object: {"score": number, "reason": "short explanation"}'
          },
          {
            role: 'user',
            content: 'Student: ' + JSON.stringify({ name: student.fullName, skills: student.skills?.map(function(s) { return s.name; }), department: student.department }) + '\n\nJob: ' + JSON.stringify({ title: job.title, skills: job.skills, requirements: job.requirements, description: job.description?.substring(0, 200) })
          }
        ],
        temperature: 0.3,
        max_tokens: 150,
      }),
    });

    var data = await response.json();
    var content = data.choices[0].message.content;
    var jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (err) {
    console.error('AI Match error:', err.message);
  }

  // Fallback to basic calculation
  return null;
}

module.exports = { calculateMatchScore, getAIMatchScore };