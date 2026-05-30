async function generateQuestions(topic, difficulty, count) {
  const prompt = `Generate ${count} multiple choice questions about "${topic}" at ${difficulty} difficulty level.

CRITICAL: About 30% of questions MUST include a "code" field with a code snippet, and a "type" field.

Return ONLY a valid JSON array. Each question object must have these exact fields:
- "id": number (starting from 1)
- "question": string (the question text)
- "code": string (include for ~30% of questions. Write realistic code with syntax)
- "type": string (MUST be "output", "error", or "theory")
- "options": array of 4 strings (the answer choices)
- "answer": number (index of correct option, 0-3)
- "topic": string ("${topic}")
- "difficulty": string ("${difficulty}")

Question type rules:
- "output": Show code, ask "What is the output of this code?" — include a "code" field
- "error": Show buggy code, ask "What is wrong with this code?" or "Spot the error" — include a "code" field  
- "theory": Pure MCQ without code — no "code" field needed

Mix the types: aim for 30% output, 30% error, 40% theory.

Example:
[
  {
    "id": 1,
    "question": "What is the output of the following code?",
    "code": "console.log(typeof []);",
    "type": "output",
    "options": ["object", "array", "undefined", "null"],
    "answer": 0,
    "topic": "JavaScript",
    "difficulty": "Easy"
  },
  {
    "id": 2,
    "question": "What is wrong with this code?",
    "code": "const x = 5;\nx = 10;",
    "type": "error",
    "options": ["Cannot reassign const", "Missing semicolon", "x is undefined", "Nothing wrong"],
    "answer": 0,
    "topic": "JavaScript",
    "difficulty": "Easy"
  },
  {
    "id": 3,
    "question": "What does CSS stand for?",
    "type": "theory",
    "options": ["Cascading Style Sheets", "Computer Style System", "Colorful Style Sheets", "Creative Styling"],
    "answer": 0,
    "topic": "HTML/CSS",
    "difficulty": "Easy"
  }
]

Make sure:
- Questions are clear and unambiguous
- Only ONE option is correct
- All 4 options are plausible
- Code snippets use proper syntax
- Return ONLY the JSON array, no other text`;

  const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.8,
      max_tokens: 4000,
    }),
  });

  const data = await response.json();
  const content = data.choices[0].message.content;
  
  const jsonMatch = content.match(/\[[\s\S]*\]/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }
  throw new Error('Failed to parse AI response');
}

module.exports = { generateQuestions };