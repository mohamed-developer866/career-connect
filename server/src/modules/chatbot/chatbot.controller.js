const service = require('./chatbot.service');

exports.ask = async (req, res) => {
  try {
    const { message } = req.body;
    const studentContext = {
      name: req.user?.fullName || 'Student',
      department: 'B.Tech AI & DS',
      skills: ['React', 'TypeScript', 'Node.js'],
      proCredits: req.user?.procredits || 0,
    };

    const reply = await service.getCareerAdvice(message, studentContext);
    res.json({ reply });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Chatbot request failed' });
  }
};

// AI Code Help - uses DeepSeek API
exports.codeHelp = async (req, res) => {
  try {
    const { question, code } = req.body;

    const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + process.env.DEEPSEEK_API_KEY
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: "You are Zara, an expert coding tutor for Career Connect. You help students with JavaScript/React code.\n\nRules:\n- Be friendly and encouraging, use emojis\n- Keep responses SHORT (2-4 sentences max)\n- If you suggest code changes, provide the FULL corrected code\n- Format code snippets with ```javascript ... ```\n- Explain WHY something is wrong\n- Use **bold** for important terms\n- If the code is correct, praise the student!"
          },
          {
            role: "user",
            content: "Here is my code:\n```javascript\n" + code + "\n```\n\nMy question: " + question
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    });

    const data = await response.json();
    const aiMessage = data.choices[0].message.content;

    // Try to extract code if AI suggests changes
    let newCode = null;
    const codeMatch = aiMessage.match(/```(?:javascript|js)?\n([\s\S]*?)\n```/);
    if (codeMatch && codeMatch[1]) {
      newCode = codeMatch[1].trim();
    }

    res.json({
      message: aiMessage,
      code: newCode
    });

  } catch (error) {
    console.error("AI Code Help Error:", error);
    res.status(500).json({ 
      message: "I'm having trouble connecting! 🧠 Try again in a moment.",
      code: null 
    });
  }
};