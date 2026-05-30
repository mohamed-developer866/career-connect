var { PrismaClient } = require('@prisma/client');
var prisma = new PrismaClient();

async function main() {
  console.log('🧹 Cleaning Full Stack course if exists...');
  var existing = await prisma.course.findFirst({ where: { title: { contains: "Full Stack" } } });
  if (existing) {
    await prisma.topic.deleteMany({ where: { module: { courseId: existing.id } } });
    await prisma.module.deleteMany({ where: { courseId: existing.id } });
    await prisma.course.delete({ where: { id: existing.id } });
  }

  var c = await prisma.course.create({
    data: {
      title: "Full Stack Web Development",
      description: "Become a complete full stack developer. Master HTML, CSS, JavaScript, React, Node.js, and MongoDB.",
      category: "Web Development",
      difficulty: "Advanced",
      duration: "30 hours",
      totalModules: 5,
      accentColor: "#F59E0B",
      icon: "🌐",
      thumbnailUrl: "https://img.youtube.com/vi/nu_pCVPKzTk/0.jpg"
    }
  });
  console.log('✅ Course: ' + c.id);

  // MODULE 1: HTML & CSS
  var m1 = await prisma.module.create({
    data: { courseId: c.id, title: "HTML & CSS Foundations", orderIndex: 1, duration: "6h", description: "Semantic HTML5, CSS3, Flexbox, Grid, and responsive design.", videoUrl: "G3e-cpL7ofc", videoDuration: 3600 }
  });
  await prisma.topic.createMany({ data: [
    { moduleId: m1.id, title: "HTML5 Semantic Elements", contentType: "video", content: "G3e-cpL7ofc", orderIndex: 1, duration: "25 min" },
    { moduleId: m1.id, title: "HTML & CSS Guide", contentType: "cheatsheet", orderIndex: 2, duration: "20 min",
      content: `## HTML5 & CSS3

### HTML5 Semantic Tags
\`\`\`html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Website</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <header>
    <nav>
      <a href="/">Home</a>
      <a href="/about">About</a>
    </nav>
  </header>
  <main>
    <section>
      <h1>Welcome</h1>
      <p>This is a paragraph.</p>
    </section>
    <article>
      <h2>Blog Post</h2>
      <p>Content here...</p>
    </article>
  </main>
  <footer>
    <p>&copy; 2026 My Website</p>
  </footer>
</body>
</html>
\`\`\`

### CSS Flexbox
\`\`\`css
.container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

.item {
  flex: 1;
  min-width: 200px;
  padding: 20px;
  background: #f0f0f0;
  border-radius: 8px;
}
\`\`\`

### CSS Grid
\`\`\`css
.grid-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

@media (max-width: 768px) {
  .grid-container {
    grid-template-columns: 1fr;
  }
}
\`\`\`

### Common CSS Properties
| Property | Example | Purpose |
|----------|---------|---------|
| \`color\` | \`#333\` | Text color |
| \`background\` | \`#fff\` | Background |
| \`padding\` | \`20px\` | Inner spacing |
| \`margin\` | \`10px\` | Outer spacing |
| \`border-radius\` | \`8px\` | Rounded corners |
| \`box-shadow\` | \`0 2px 10px rgba(0,0,0,0.1)\` | Shadow effect |
| \`transition\` | \`all 0.3s\` | Smooth animations |
\`\`\`
` },
    { moduleId: m1.id, title: "CSS Flexbox & Grid", contentType: "video", content: "G3e-cpL7ofc", orderIndex: 3, duration: "30 min" },
    { moduleId: m1.id, title: "Build a Landing Page", contentType: "coding",
      codeTemplate: `<!DOCTYPE html>
<html>
<head>
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: Arial, sans-serif; }
.hero { background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 80px 20px; text-align: center; }
.hero h1 { font-size: 48px; margin-bottom: 20px; }
.btn { background: white; color: #667eea; padding: 14px 36px; border: none; border-radius: 8px; font-size: 16px; font-weight: bold; cursor: pointer; }
</style>
</head>
<body>
  <div class="hero">
    <h1>Welcome to My Site</h1>
    <p>Building the future of web development</p>
    <button class="btn">Get Started</button>
  </div>
</body>
</html>`,
      orderIndex: 4, duration: "20 min" }
  ]});

  // MODULE 2: JavaScript
  var m2 = await prisma.module.create({
    data: { courseId: c.id, title: "JavaScript Mastery", orderIndex: 2, duration: "8h", description: "ES6+, DOM manipulation, async/await, fetch API.", videoUrl: "W6NZfCO5SIk", videoDuration: 4000 }
  });
  await prisma.topic.createMany({ data: [
    { moduleId: m2.id, title: "ES6+ Features", contentType: "video", content: "W6NZfCO5SIk", orderIndex: 1, duration: "30 min" },
    { moduleId: m2.id, title: "JavaScript Guide", contentType: "cheatsheet", orderIndex: 2, duration: "20 min",
      content: `## Modern JavaScript (ES6+)

### Variables
\`\`\`js
const name = "John";        // Cannot reassign
let age = 25;               // Can reassign
var oldWay = "avoid this";  // Function scoped
\`\`\`

### Arrow Functions
\`\`\`js
const add = (a, b) => a + b;
const greet = name => \`Hello, \${name}!\`;
const square = x => x * x;
\`\`\`

### Destructuring
\`\`\`js
// Object
const user = { name: "John", age: 25 };
const { name, age } = user;

// Array
const colors = ["red", "green", "blue"];
const [first, second] = colors;
\`\`\`

### Spread & Rest
\`\`\`js
// Spread
const arr1 = [1, 2, 3];
const arr2 = [...arr1, 4, 5];  // [1,2,3,4,5]
const obj1 = { a: 1, b: 2 };
const obj2 = { ...obj1, c: 3 };

// Rest
const sum = (...numbers) => numbers.reduce((a, b) => a + b, 0);
\`\`\`

### Async/Await
\`\`\`js
async function fetchData() {
  try {
    const response = await fetch('https://api.example.com/data');
    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error('Error:', error);
  }
}
\`\`\`

### DOM Manipulation
\`\`\`js
const element = document.getElementById('myId');
const buttons = document.querySelectorAll('.btn');

element.addEventListener('click', () => {
  element.classList.toggle('active');
});
\`\`\`

### Array Methods
\`\`\`js
const numbers = [1, 2, 3, 4, 5];
numbers.map(n => n * 2);       // [2,4,6,8,10]
numbers.filter(n => n > 3);   // [4,5]
numbers.reduce((a, b) => a + b, 0);  // 15
numbers.find(n => n === 3);    // 3
\`\`\`
` },
    { moduleId: m2.id, title: "DOM & Events", contentType: "video", content: "W6NZfCO5SIk", orderIndex: 3, duration: "30 min" },
    { moduleId: m2.id, title: "Build Interactive Page", contentType: "coding",
      codeTemplate: `// Todo List App
let todos = [];

function addTodo(text) {
  todos.push({ id: Date.now(), text, done: false });
  render();
}

function toggleTodo(id) {
  todos = todos.map(t => t.id === id ? {...t, done: !t.done} : t);
  render();
}

function deleteTodo(id) {
  todos = todos.filter(t => t.id !== id);
  render();
}

function render() {
  console.log('Todos:', todos);
}

addTodo('Learn JavaScript');
addTodo('Build Project');
console.log(todos);`,
      orderIndex: 4, duration: "25 min" }
  ]});

  // MODULE 3: React Frontend
  var m3 = await prisma.module.create({
    data: { courseId: c.id, title: "React.js Frontend", orderIndex: 3, duration: "8h", description: "Components, hooks, state management, React Router.", videoUrl: "SqcY0GlETPk", videoDuration: 3600 }
  });
  await prisma.topic.createMany({ data: [
    { moduleId: m3.id, title: "React Components", contentType: "video", content: "SqcY0GlETPk", orderIndex: 1, duration: "30 min" },
    { moduleId: m3.id, title: "React Guide", contentType: "cheatsheet", orderIndex: 2, duration: "15 min",
      content: `## React.js Quick Reference

### Component Types
\`\`\`jsx
// Functional Component
function Welcome({ name }) {
  return <h1>Hello, {name}!</h1>;
}

// With state
function Counter() {
  const [count, setCount] = useState(0);
  return (
    <div>
      <p>{count}</p>
      <button onClick={() => setCount(count + 1)}>+</button>
    </div>
  );
}
\`\`\`

### Common Hooks
\`\`\`jsx
useState: const [value, setValue] = useState(initial);
useEffect: useEffect(() => { /* side effect */ }, [deps]);
useContext: const ctx = useContext(MyContext);
useRef: const ref = useRef(null);
\`\`\`

### Props & Events
\`\`\`jsx
<Button text="Click" onClick={() => alert('Clicked!')} />
<Input value={name} onChange={e => setName(e.target.value)} />
\`\`\`
` },
    { moduleId: m3.id, title: "Build React App", contentType: "coding",
      codeTemplate: `function App() {
  const [count, setCount] = React.useState(0);
  return (
    <div style={{textAlign:'center',padding:40}}>
      <h1>Counter: {count}</h1>
      <button onClick={() => setCount(count+1)}>+</button>
      <button onClick={() => setCount(count-1)}>-</button>
    </div>
  );
}
ReactDOM.createRoot(document.getElementById('root')).render(<App />);`,
      orderIndex: 3, duration: "30 min" }
  ]});

  // MODULE 4: Backend
  var m4 = await prisma.module.create({
    data: { courseId: c.id, title: "Node.js & Express Backend", orderIndex: 4, duration: "5h", description: "REST APIs, Express, MongoDB, authentication.", videoUrl: "Oe421EPjeBE", videoDuration: 3000 }
  });
  await prisma.topic.createMany({ data: [
    { moduleId: m4.id, title: "Express API Setup", contentType: "video", content: "Oe421EPjeBE", orderIndex: 1, duration: "30 min" },
    { moduleId: m4.id, title: "Backend API", contentType: "coding",
      codeTemplate: `const express = require('express');
const app = express();
app.use(express.json());

let products = [];

app.get('/api/products', (req, res) => res.json(products));
app.post('/api/products', (req, res) => {
  const product = { id: Date.now(), ...req.body };
  products.push(product);
  res.status(201).json(product);
});

app.listen(5000, () => console.log('Server running on 5000'));`,
      orderIndex: 2, duration: "30 min" }
  ]});

  // MODULE 5: Deployment
  var m5 = await prisma.module.create({
    data: { courseId: c.id, title: "Deployment & DevOps", orderIndex: 5, duration: "3h", description: "Deploy to Vercel, Render, Netlify. Git & GitHub basics.", videoUrl: "l134cBAJC18", videoDuration: 2000 }
  });
  await prisma.topic.createMany({ data: [
    { moduleId: m5.id, title: "Deploy to Production", contentType: "video", content: "l134cBAJC18", orderIndex: 1, duration: "25 min" },
    { moduleId: m5.id, title: "Deployment Guide", contentType: "cheatsheet", orderIndex: 2, duration: "10 min",
      content: `## Deployment Guide

### Git Commands
\`\`\`bash
git init
git add .
git commit -m "Initial commit"
git push origin main
\`\`\`

### Vercel (Frontend)
\`\`\`bash
npm i -g vercel
vercel
\`\`\`

### Render (Backend)
- Push to GitHub
- Connect repo on Render
- Set build command: \`npm install\`
- Set start command: \`node index.js\`

### Environment Variables
\`\`\`bash
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=mysecret
\`\`\`
` }
  ]});

  console.log('✅ Full Stack Web Development course created!');
  console.log('   Course ID: ' + c.id);
}

main().catch(console.error).finally(function() { prisma.$disconnect(); });