const DEEPSEEK_URL = 'https://api.deepseek.com/v1/chat/completions';

async function getCareerAdvice(userMessage, studentContext) {
  const systemPrompt = `You are **Career Connect AI**, a helpful career guidance assistant for a campus placement platform.
Your role is to help students with:
- Resume building and improvement
- Job matching based on skills
- Technical interview preparation (mock questions, topics to revise)
- Skill gap analysis and learning paths
- Career roadmap suggestions

Always answer in a structured way:
- Use bullet points and **bold headings** for clarity
- Keep answers practical and action‑oriented
- Never answer non‑career related questions
- If the question is about a specific job, refer to the job details if provided.`;

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: `Student profile: ${JSON.stringify(studentContext)}\n\nStudent question: ${userMessage}` },
  ];

  const response = await fetch(DEEPSEEK_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages,
      temperature: 0.7,
      max_tokens: 2500,
      stream: false,
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || 'DeepSeek API error');
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

module.exports = { getCareerAdvice };