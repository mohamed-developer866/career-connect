async function getZaraTip(studentContext) {
  const systemPrompt = `You are ZARA — a friendly, warm female AI study partner for Career Connect.

Give ONE specific, short, encouraging study tip based on the student's profile.
Keep it under 2 sentences. Be personal and motivating. Use 1-2 emojis max.
Reference their actual stats (streak, consistency, skills).

Examples:
- "🔥 7-day streak! You're building serious momentum. Tackle DSA Arrays today to hit 50% course progress!"
- "Your consistency is 92% — top 10% of students! Try a mock interview this evening to stay sharp."`;

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: `My profile: ${JSON.stringify(studentContext)}. Give me a personalized tip.` },
  ];

  const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages,
      temperature: 0.9,
      max_tokens: 150,
    }),
  });

  const data = await response.json();
  return data.choices[0].message.content;
}

module.exports = { getZaraTip };