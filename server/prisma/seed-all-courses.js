var { PrismaClient } = require('@prisma/client');
var prisma = new PrismaClient();

async function main() {
  // Clean old course data
  await prisma.$executeRawUnsafe('PRAGMA foreign_keys = OFF');
  await prisma.userProgress.deleteMany().catch(function() {});
  await prisma.topic.deleteMany().catch(function() {});
  await prisma.module.deleteMany().catch(function() {});
  await prisma.courseEnrollment.deleteMany().catch(function() {});
  await prisma.course.deleteMany().catch(function() {});
  await prisma.$executeRawUnsafe('PRAGMA foreign_keys = ON');
  console.log('✅ Cleaned\n');

  // Helper to create a full course
  async function createCourse(info, modules) {
    var course = await prisma.course.create({ data: info });
    for (var m of modules) {
      var mod = await prisma.module.create({ data: { courseId: course.id, title: m.title, orderIndex: m.orderIndex, duration: m.duration, description: m.description, videoUrl: m.videoUrl || "SqcY0GlETPk", videoDuration: m.videoDuration || 2700 } });
      await prisma.topic.createMany({ data: m.topics.map(function(t) { return { moduleId: mod.id, title: t.title, contentType: t.type, content: t.content || "", codeTemplate: t.code || "", orderIndex: t.order, duration: t.time }; }) });
    }
    console.log('✅ ' + info.title);
  }

  // ==================== 1. REACT JS ====================
  await createCourse(
    { title: "React JS Mastery", description: "Learn React from scratch to advanced.", category: "Frontend Development", difficulty: "Beginner to Advanced", duration: "18 hours", totalModules: 4, accentColor: "#61dafb", icon: "⚛️", thumbnailUrl: "https://img.youtube.com/vi/SqcY0GlETPk/0.jpg" },
    [
      { title: "React Fundamentals", orderIndex: 1, duration: "3h", description: "Components, JSX, props, state.", videoUrl: "SqcY0GlETPk", topics: [
        { title: "Intro to React", type: "video", content: "SqcY0GlETPk", order: 1, time: "15 min" },
        { title: "Components & JSX", type: "cheatsheet", content: "## Components\n```jsx\nfunction App() { return <h1>Hello</h1>; }\n```", order: 2, time: "10 min" },
        { title: "Props & State", type: "video", content: "SqcY0GlETPk", order: 3, time: "20 min" },
        { title: "First Component", type: "coding", code: "function App() {\n  const [count, setCount] = React.useState(0);\n  return <div><h1>{count}</h1><button onClick={() => setCount(count+1)}>+</button></div>;\n}\nReactDOM.createRoot(document.getElementById('root')).render(<App />);", order: 4, time: "15 min" },
        { title: "Hooks Reference", type: "cheatsheet", content: "## useState\n`const [val, setVal] = useState(0);`\n## useEffect\n`useEffect(() => {}, []);`", order: 5, time: "5 min" }
      ]},
      { title: "Hooks Deep Dive", orderIndex: 2, duration: "4h", description: "useState, useEffect, useContext.", videoUrl: "TNhaISOUy6Q", topics: [
        { title: "useState Explained", type: "video", content: "TNhaISOUy6Q", order: 1, time: "20 min" },
        { title: "useEffect & Lifecycle", type: "video", content: "TNhaISOUy6Q", order: 2, time: "25 min" },
        { title: "useContext & useRef", type: "cheatsheet", content: "## useContext\n```jsx\nconst theme = useContext(ThemeContext);\n```", order: 3, time: "15 min" },
        { title: "Counter with Hooks", type: "coding", code: "function App() {\n  const [count, setCount] = React.useState(0);\n  React.useEffect(() => { document.title = count; }, [count]);\n  return <div><h1>{count}</h1><button onClick={() => setCount(count+1)}>+</button></div>;\n}\nReactDOM.createRoot(document.getElementById('root')).render(<App />);", order: 4, time: "20 min" }
      ]},
      { title: "React Router", orderIndex: 3, duration: "3h", description: "Routing with React Router v7.", videoUrl: "Ul3y1LXxzdU", topics: [
        { title: "Router Setup", type: "video", content: "Ul3y1LXxzdU", order: 1, time: "20 min" },
        { title: "Dynamic Routes", type: "cheatsheet", content: "## React Router\n```jsx\n<Route path=\"/user/:id\" element={<Profile />} />\n```", order: 2, time: "10 min" },
        { title: "Multi-Page App", type: "coding", code: "function App() {\n  const [page, setPage] = React.useState('home');\n  return <div>{page==='home'?<h1>Home</h1>:<h1>About</h1>}</div>;\n}\nReactDOM.createRoot(document.getElementById('root')).render(<App />);", order: 3, time: "30 min" }
      ]},
      { title: "API Integration", orderIndex: 4, duration: "4h", description: "Fetch data from REST APIs.", videoUrl: "bYFYF2Gn1Oc", topics: [
        { title: "Fetch API", type: "video", content: "bYFYF2Gn1Oc", order: 1, time: "25 min" },
        { title: "API Patterns", type: "cheatsheet", content: "## Fetching Data\n```jsx\nfetch('/api/users').then(r=>r.json()).then(setData);\n```", order: 2, time: "15 min" },
        { title: "Data Dashboard", type: "coding", code: "function App() {\n  const [users, setUsers] = React.useState([]);\n  React.useEffect(() => { fetch('https://jsonplaceholder.typicode.com/users').then(r=>r.json()).then(setUsers); }, []);\n  return <ul>{users.map(u=><li key={u.id}>{u.name}</li>)}</ul>;\n}\nReactDOM.createRoot(document.getElementById('root')).render(<App />);", order: 3, time: "45 min" }
      ]}
    ]
  );

  console.log('\n✅ All courses seeded!');
}

main().catch(console.error).finally(function() { prisma.$disconnect(); });