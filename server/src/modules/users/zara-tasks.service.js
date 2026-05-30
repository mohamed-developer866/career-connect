var fetch = globalThis.fetch;

async function generateDailyTasks(studentProfile) {
  var prompt = 'Generate 6 daily study tasks for a student. Return ONLY JSON array with time, task, type, duration. Student: ' + JSON.stringify(studentProfile);

  var response = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + process.env.DEEPSEEK_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 1000
    })
  });

  var data = await response.json();
  var content = data.choices[0].message.content;
  var jsonMatch = content.match(/\[[\s\S]*\]/);
  
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }
  
  return [
    { time: "08:00 AM", task: "Review learning goals", type: "Planning", duration: "15m" },
    { time: "09:00 AM", task: "Complete DSA practice", type: "Coding", duration: "45m" },
    { time: "11:00 AM", task: "Work on React project", type: "Coding", duration: "60m" },
    { time: "02:00 PM", task: "Study new material", type: "Learning", duration: "45m" },
    { time: "04:00 PM", task: "Take assessment quiz", type: "Practice", duration: "30m" },
    { time: "07:00 PM", task: "Review and plan tomorrow", type: "Review", duration: "15m" }
  ];
}

module.exports = { generateDailyTasks: generateDailyTasks };