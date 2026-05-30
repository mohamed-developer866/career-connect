async function getZaraCodeHelp(userMessage, code, studentContext) {
  const systemPrompt = `You are ZARA — an expert AI coding tutor for Career Connect.

You help students with JavaScript and React coding problems.

Respond with a JSON object in this EXACT format:
{
  "message": "Your helpful explanation here",
  "code": {
    "html": "updated HTML if needed, otherwise original",
    "css": "updated CSS if needed, otherwise original", 
    "js": "updated JavaScript if needed, otherwise original"
  }
}

RULES:
- Always return valid JSON
- If no code changes needed, return the original code unchanged
- Keep your message encouraging and brief (1-3 sentences)
- Focus on fixing errors and improving code quality`;

  try {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Student: ${studentContext.fullName}\n\nCurrent Code:\n${code.js || code}\n\nQuestion: ${userMessage}` },
        ],
        temperature: 0.3,
        max_tokens: 2000,
      }),
    });

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.error('Failed to parse AI response:', e);
    }
    
    return {
      message: content,
      code: code
    };
  } catch (error) {
    console.error('DeepSeek API Error:', error);
    return {
      message: "I'm having trouble connecting. Try again in a moment! 🧠",
      code: code
    };
  }
}

async function getZaraTip(studentContext) {
  const systemPrompt = `You are ZARA — a friendly, warm AI study partner.

Give ONE specific, short, encouraging study tip. Keep it under 2 sentences. Use 1-2 emojis max.`;

  try {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `My profile: ${JSON.stringify(studentContext)}. Give me a personalized tip.` },
        ],
        temperature: 0.9,
        max_tokens: 150,
      }),
    });

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    return "Keep up the great work! Every line of code you write makes you better! 🚀";
  }
}

module.exports = { getZaraCodeHelp, getZaraTip };