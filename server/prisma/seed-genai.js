var { PrismaClient } = require('@prisma/client');
var prisma = new PrismaClient();

async function main() {
  console.log('🧹 Cleaning GenAI course if exists...');
  var existing = await prisma.course.findFirst({ where: { title: { contains: "Generative AI" } } });
  if (existing) {
    await prisma.topic.deleteMany({ where: { module: { courseId: existing.id } } });
    await prisma.module.deleteMany({ where: { courseId: existing.id } });
    await prisma.course.delete({ where: { id: existing.id } });
  }

  var c = await prisma.course.create({
    data: {
      title: "Generative AI & Machine Learning",
      description: "Master AI/ML fundamentals, prompt engineering, LLMs, RAG applications, and build real-world AI projects.",
      category: "Artificial Intelligence",
      difficulty: "Intermediate",
      duration: "24 hours",
      totalTopics: 5,
      accentColor: "#10B981",
      icon: "🤖",
      thumbnailUrl: "https://img.youtube.com/vi/5sLYAEBGTnw/0.jpg"
    }
  });
  console.log('✅ Course: ' + c.id);

  // MODULE 1: AI & ML Fundamentals
  var m1 = await prisma.module.create({
    data: { courseId: c.id, title: "AI & ML Fundamentals", orderIndex: 1, duration: "5h", description: "Types of ML, supervised vs unsupervised learning, neural networks basics.", videoUrl: "5sLYAEBGTnw", videoDuration: 3000 }
  });
  await prisma.topic.createMany({ data: [
    { moduleId: m1.id, title: "What is AI & ML?", contentType: "video", content: "5sLYAEBGTnw", orderIndex: 1, duration: "25 min" },
    { moduleId: m1.id, title: "AI & ML Guide", contentType: "cheatsheet", orderIndex: 2, duration: "20 min",
      content: `## AI & Machine Learning Fundamentals

### Types of Machine Learning

| Type | Description | Example |
|------|-------------|---------|
| **Supervised** | Learn from labeled data | Spam detection |
| **Unsupervised** | Find patterns in unlabeled data | Customer segments |
| **Reinforcement** | Learn by trial and error | Game playing AI |

### Supervised Learning Algorithms
\`\`\`python
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC
from sklearn.neighbors import KNeighborsClassifier

# Regression
model = LinearRegression()
model.fit(X_train, y_train)

# Classification
model = RandomForestClassifier(n_estimators=100)
model.fit(X_train, y_train)
\`\`\`

### Key Metrics
| Metric | Use |
|--------|-----|
| Accuracy | Overall correct predictions |
| Precision | True positives / All positives |
| Recall | True positives / Actual positives |
| F1 Score | Harmonic mean of precision & recall |

### Neural Networks Basics
\`\`\`python
import tensorflow as tf

model = tf.keras.Sequential([
    tf.keras.layers.Dense(128, activation='relu'),
    tf.keras.layers.Dropout(0.2),
    tf.keras.layers.Dense(10, activation='softmax')
])

model.compile(optimizer='adam',
              loss='categorical_crossentropy',
              metrics=['accuracy'])
\`\`\`

### ML Pipeline
\`\`\`python
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

pipeline = Pipeline([
    ('scaler', StandardScaler()),
    ('classifier', RandomForestClassifier())
])
pipeline.fit(X_train, y_train)
\`\`\`
` },
    { moduleId: m1.id, title: "Supervised vs Unsupervised", contentType: "video", content: "5sLYAEBGTnw", orderIndex: 3, duration: "30 min" },
    { moduleId: m1.id, title: "Train Your First Model", contentType: "coding",
      codeTemplate: `from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score

# Load data
iris = load_iris()
X, y = iris.data, iris.target

# Split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)

# Train
model = RandomForestClassifier(n_estimators=100)
model.fit(X_train, y_train)

# Predict & Evaluate
predictions = model.predict(X_test)
accuracy = accuracy_score(y_test, predictions)
print(f'Accuracy: {accuracy:.2%}')`,
      orderIndex: 4, duration: "20 min" }
  ]});

  // MODULE 2: Generative AI & LLMs
  var m2 = await prisma.module.create({
    data: { courseId: c.id, title: "Generative AI & LLMs", orderIndex: 2, duration: "6h", description: "GPT, Claude, Gemini, how LLMs work, transformers architecture.", videoUrl: "5sLYAEBGTnw", videoDuration: 3600 }
  });
  await prisma.topic.createMany({ data: [
    { moduleId: m2.id, title: "How LLMs Work", contentType: "video", content: "5sLYAEBGTnw", orderIndex: 1, duration: "30 min" },
    { moduleId: m2.id, title: "GenAI & LLMs Guide", contentType: "cheatsheet", orderIndex: 2, duration: "25 min",
      content: `## Generative AI & Large Language Models

### What are LLMs?
Large Language Models are AI models trained on **massive text datasets** that can generate human-like text, answer questions, and perform tasks.

### Popular LLMs
| Model | Company | Key Feature |
|-------|---------|-------------|
| GPT-4 | OpenAI | Most capable general AI |
| Claude | Anthropic | Safety-focused, long context |
| Gemini | Google | Multimodal (text+image) |
| Llama 3 | Meta | Open source |
| DeepSeek | DeepSeek | Efficient, code-focused |

### Transformer Architecture
\`\`\`
Input → Tokenization → Embeddings → 
[Self-Attention → Feed Forward] × N layers →
Output Probabilities → Text Generation
\`\`\`

### Key Concepts
\`\`\`
Tokens: Words/subwords the model processes
Context Window: Max tokens model can handle
Temperature: Controls randomness (0 = precise, 1 = creative)
Embeddings: Vector representation of words
Attention: How model focuses on relevant parts
\`\`\`

### Using OpenAI API
\`\`\`python
import openai

openai.api_key = "your-key"

response = openai.ChatCompletion.create(
    model="gpt-4",
    messages=[
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "Explain quantum computing"}
    ]
)
print(response.choices[0].message.content)
\`\`\`

### Using DeepSeek API
\`\`\`python
import requests

response = requests.post(
    "https://api.deepseek.com/v1/chat/completions",
    headers={"Authorization": "Bearer YOUR_KEY"},
    json={
        "model": "deepseek-chat",
        "messages": [{"role": "user", "content": "Hello!"}]
    }
)
print(response.json()["choices"][0]["message"]["content"])
\`\`\`
` },
    { moduleId: m2.id, title: "GPT vs Claude vs Gemini", contentType: "video", content: "5sLYAEBGTnw", orderIndex: 3, duration: "35 min" },
    { moduleId: m2.id, title: "Call an LLM API", contentType: "coding",
      codeTemplate: `// Simulate LLM API call
async function askAI(prompt) {
  console.log('Asking AI:', prompt);
  console.log('Thinking...');
  
  // Simulate response
  const responses = {
    'hello': 'Hello! How can I help you today? 👋',
    'react': 'React is a JavaScript library for building user interfaces. It uses components and a virtual DOM for efficient rendering.',
    'ai': 'AI (Artificial Intelligence) refers to machines that can perform tasks that typically require human intelligence.'
  };
  
  const key = Object.keys(responses).find(k => prompt.toLowerCase().includes(k));
  return key ? responses[key] : 'Thats a great question! Let me think about it...';
}

askAI('What is React?').then(console.log);`,
      orderIndex: 4, duration: "20 min" }
  ]});

  // MODULE 3: Prompt Engineering
  var m3 = await prisma.module.create({
    data: { courseId: c.id, title: "Prompt Engineering Mastery", orderIndex: 3, duration: "5h", description: "Craft effective prompts, chain-of-thought, few-shot learning, system prompts.", videoUrl: "5sLYAEBGTnw", videoDuration: 3000 }
  });
  await prisma.topic.createMany({ data: [
    { moduleId: m3.id, title: "Prompt Engineering Basics", contentType: "video", content: "5sLYAEBGTnw", orderIndex: 1, duration: "25 min" },
    { moduleId: m3.id, title: "Prompt Engineering Guide", contentType: "cheatsheet", orderIndex: 2, duration: "20 min",
      content: `## Prompt Engineering

### What is Prompt Engineering?
The art of **crafting effective inputs** to get desired outputs from AI models.

### Prompt Structure
\`\`\`
[Role/Persona] + [Context] + [Task] + [Format] + [Constraints]

Example:
"You are a senior React developer. 
I'm building a todo app. 
Write a component with add/delete functionality. 
Return only the code, no explanations."
\`\`\`

### Key Techniques
| Technique | Description | Example |
|-----------|-------------|---------|
| **Zero-shot** | Direct question | "What is React?" |
| **Few-shot** | Give examples | "Input: apple → Output: fruit" |
| **Chain-of-Thought** | Step by step | "Think step by step..." |
| **Role Prompting** | Set persona | "You are an expert..." |
| **Structured Output** | Specify format | "Return as JSON" |

### System Prompt Example
\`\`\`
You are ZARA, an expert AI coding tutor for Career Connect.

Rules:
- Be friendly and encouraging, use emojis
- Keep responses SHORT (2-4 sentences max)
- Explain WHY something is wrong
- Use **bold** for important terms
- If the code is correct, praise the student!
\`\`\`

### Chain-of-Thought Prompting
\`\`\`
Question: If a train travels 120 km in 2 hours, 
what is its speed?

Think step by step:
1. Speed = Distance / Time
2. Distance = 120 km
3. Time = 2 hours
4. Speed = 120 / 2 = 60 km/h
Answer: 60 km/h
\`\`\`

### Common Prompt Patterns
| Pattern | Use When |
|---------|----------|
| "Explain like I'm 5" | Simple explanations |
| "You are an expert in..." | Specialized answers |
| "List pros and cons" | Balanced view |
| "Give me 3 options" | Multiple solutions |
| "Format as table" | Structured data |
\`\`\`
` },
    { moduleId: m3.id, title: "Advanced Prompt Patterns", contentType: "video", content: "5sLYAEBGTnw", orderIndex: 3, duration: "30 min" },
    { moduleId: m3.id, title: "Craft Perfect Prompts", contentType: "coding",
      codeTemplate: `// Prompt Engineering Practice
const prompts = {
  basic: "What is JavaScript?",
  role: "You are a senior developer. Explain JavaScript to a beginner.",
  structured: "List 5 key features of JavaScript. Format as bullet points.",
  creative: "Write a short story about a bug that became a feature. Use JavaScript terms."
};

function evaluatePrompt(prompt) {
  const score = {
    hasRole: prompt.includes('You are'),
    hasContext: prompt.length > 50,
    hasFormat: prompt.includes('List') || prompt.includes('Format'),
    hasConstraints: prompt.includes('short') || prompt.includes('brief')
  };
  const total = Object.values(score).filter(Boolean).length;
  console.log('Prompt:', prompt.substring(0, 60) + '...');
  console.log('Score:', total + '/4');
}

Object.values(prompts).forEach(evaluatePrompt);`,
      orderIndex: 4, duration: "20 min" }
  ]});

  // MODULE 4: RAG Applications
  var m4 = await prisma.module.create({
    data: { courseId: c.id, title: "RAG & AI Applications", orderIndex: 4, duration: "5h", description: "Retrieval-Augmented Generation, vector databases, LangChain, embeddings.", videoUrl: "5sLYAEBGTnw", videoDuration: 3000 }
  });
  await prisma.topic.createMany({ data: [
    { moduleId: m4.id, title: "What is RAG?", contentType: "video", content: "5sLYAEBGTnw", orderIndex: 1, duration: "30 min" },
    { moduleId: m4.id, title: "RAG Guide", contentType: "cheatsheet", orderIndex: 2, duration: "20 min",
      content: `## RAG (Retrieval-Augmented Generation)

### What is RAG?
RAG combines **information retrieval** with **text generation**. It first searches relevant documents, then uses them to generate accurate answers.

### RAG Architecture
\`\`\`
User Query → Embedding → Vector DB Search → 
Retrieve Top-K Documents → 
Combine Query + Documents → LLM → Answer
\`\`\`

### Vector Databases
| Database | Best For |
|----------|----------|
| Pinecone | Production RAG |
| Chroma | Open source, local |
| Weaviate | Hybrid search |
| FAISS | Facebook AI, fast |
| Qdrant | Rust-based, fast |

### LangChain Basics
\`\`\`python
from langchain.llms import OpenAI
from langchain.chains import LLMChain
from langchain.prompts import PromptTemplate

prompt = PromptTemplate(
    input_variables=["question"],
    template="Answer: {question}"
)

chain = LLMChain(llm=OpenAI(), prompt=prompt)
response = chain.run("What is AI?")
\`\`\`

### Embeddings
\`\`\`python
from openai import OpenAI

client = OpenAI()
response = client.embeddings.create(
    model="text-embedding-3-small",
    input="Hello world"
)
embedding = response.data[0].embedding
print(f'Vector dimension: {len(embedding)}')
\`\`\`

### RAG Use Cases
| Use Case | Example |
|----------|---------|
| Customer Support | Answer from docs |
| Legal Research | Search case laws |
| Medical Q&A | Evidence-based answers |
| Code Assistant | Search codebase |
| Education | Textbook Q&A |
\`\`\`
` },
    { moduleId: m4.id, title: "Build a Simple RAG", contentType: "coding",
      codeTemplate: `# Simple RAG System (Concept)
documents = [
    "React is a JavaScript library for building UI",
    "Python is used for data science and AI",
    "Node.js runs JavaScript on the server"
]

def search(query):
    # Simple keyword search
    results = []
    for doc in documents:
        if any(word in doc.lower() for word in query.lower().split()):
            results.append(doc)
    return results

def rag_answer(query):
    docs = search(query)
    context = ' '.join(docs)
    return f"Based on {len(docs)} documents: {context[:100]}..."

print(rag_answer("What is React?"))
print(rag_answer("Tell me about Python"))`,
      orderIndex: 3, duration: "25 min" }
  ]});

  // MODULE 5: AI Project
  var m5 = await prisma.module.create({
    data: { courseId: c.id, title: "Build AI Projects", orderIndex: 5, duration: "3h", description: "Build a chatbot, image generator, and AI-powered app.", videoUrl: "5sLYAEBGTnw", videoDuration: 2000 }
  });
  await prisma.topic.createMany({ data: [
    { moduleId: m5.id, title: "AI Project Showcase", contentType: "video", content: "5sLYAEBGTnw", orderIndex: 1, duration: "30 min" },
    { moduleId: m5.id, title: "Projects Guide", contentType: "cheatsheet", orderIndex: 2, duration: "15 min",
      content: `## AI Projects Ideas

### Beginner Projects
1. **Chatbot** - Use OpenAI API to create a Q&A bot
2. **Text Summarizer** - Summarize long articles
3. **Sentiment Analyzer** - Detect emotions in text
4. **Code Explainer** - Explain code snippets

### Intermediate Projects
1. **RAG Q&A System** - Answer from documents
2. **AI Resume Analyzer** - Score resumes
3. **Image Caption Generator** - Describe images
4. **Voice Assistant** - Speech to text + AI

### Advanced Projects
1. **Multi-Agent System** - Multiple AI agents collaborating
2. **AI Code Reviewer** - Review pull requests
3. **Document Chat** - Chat with PDFs
4. **AI Interview Coach** - Mock interviews

### Tech Stack for AI Projects
| Component | Options |
|-----------|---------|
| Frontend | React, Next.js, Streamlit |
| Backend | FastAPI, Express, Flask |
| AI API | OpenAI, DeepSeek, Claude |
| Database | PostgreSQL, Pinecone (vectors) |
| Deployment | Vercel, Render, Railway |
\`\`\`
` },
    { moduleId: m5.id, title: "Build AI Chatbot", contentType: "coding",
      codeTemplate: `// Simple AI Chatbot (Frontend)
function ChatBot() {
  const [messages, setMessages] = React.useState([]);
  const [input, setInput] = React.useState('');

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { role: 'user', text: input };
    setMessages([...messages, userMsg]);
    setInput('');
    
    // Simulate AI response
    setTimeout(() => {
      const aiMsg = { role: 'ai', text: 'Thanks for your message! I am an AI assistant. 🤖' };
      setMessages(prev => [...prev, aiMsg]);
    }, 1000);
  };

  return (
    <div>
      <h2>AI Chatbot</h2>
      <div>{messages.map((m, i) => <p key={i}><b>{m.role}:</b> {m.text}</p>)}</div>
      <input value={input} onChange={e => setInput(e.target.value)} />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}
ReactDOM.createRoot(document.getElementById('root')).render(<ChatBot />);`,
      orderIndex: 3, duration: "30 min" }
  ]});

  console.log('✅ Generative AI & Machine Learning course created!');
  console.log('   Course ID: ' + c.id);
}

main().catch(console.error).finally(function() { prisma.$disconnect(); });