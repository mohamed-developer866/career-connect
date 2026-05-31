var { PrismaClient } = require('@prisma/client');
var prisma = new PrismaClient();

async function main() {
  await prisma.$executeRawUnsafe('PRAGMA foreign_keys = OFF');
  
  await prisma.userProgress.deleteMany();
  await prisma.topic.deleteMany();
  await prisma.module.deleteMany();
  await prisma.courseEnrollment.deleteMany();
  await prisma.course.deleteMany();
  
  await prisma.$executeRawUnsafe('PRAGMA foreign_keys = ON');
  
  console.log('✅ Database cleaned\n');
  var course = await prisma.course.create({
    data: {
      title: "React JS Mastery",
      description: "Learn React from scratch to advanced. Build real-world projects with hooks, state management, and modern React patterns.",
      category: "Frontend Development",
      difficulty: "Beginner to Advanced",
      duration: "18 hours",
      totalTopics: 6,
      accentColor: "#61dafb",
      icon: "⚛️",
      thumbnailUrl: "https://img.youtube.com/vi/SqcY0GlETPk/0.jpg"
    }
  });

  // ==================== MODULE 1 ====================
  var module1 = await prisma.module.create({
    data: {
      courseId: course.id, title: "React Fundamentals", orderIndex: 1,
      duration: "2 hours", description: "Learn the basics of React — components, JSX, props, and state.",
      videoUrl: "SqcY0GlETPk", videoDuration: 2700
    }
  });

  await prisma.topic.createMany({
    data: [
      { moduleId: module1.id, title: "Introduction to React", contentType: "video", content: "SqcY0GlETPk", orderIndex: 1, duration: "15 min" },
      { moduleId: module1.id, title: "React Components & JSX", contentType: "cheatsheet", orderIndex: 2, duration: "10 min",
        content: `## React Components

### What is a Component?
Components are the building blocks of any React application. They let you split the UI into independent, reusable pieces. Each component manages its own state and renders JSX.

### Functional Components
The simplest way to define a component is to write a JavaScript function that returns JSX.

\`\`\`jsx
function Welcome() {
  return <h1>Hello, World!</h1>;
}

// Arrow function version
const Welcome = () => {
  return <h1>Hello, World!</h1>;
};
\`\`\`

### Component Naming Rules
- Component names must start with a **capital letter**
- Use **PascalCase** (e.g., MyComponent, UserProfile)
- File names usually match component names
- One component per file is recommended

---

## JSX (JavaScript XML)

### What is JSX?
JSX is a syntax extension for JavaScript that looks similar to HTML. It makes React code more readable and intuitive to write.

### Key JSX Rules
- Return a **single root element** (wrap in div or Fragment)
- Use \`className\` instead of \`class\`
- Use \`htmlFor\` instead of \`for\`
- JavaScript expressions go inside curly braces \`{ }\`
- Close all tags (including self-closing tags like \`<img />\`)

### Example Component with JSX
\`\`\`jsx
function UserProfile({ name, bio, avatar }) {
  return (
    <div className="profile-card">
      <img src={avatar} alt={name} className="avatar" />
      <h2>{name}</h2>
      <p className="bio">{bio}</p>
      <button onClick={() => alert('Followed!')}>
        Follow
      </button>
    </div>
  );
}
\`\`\`

---

## Working with Props

### What are Props?
Props (short for "properties") are **read-only data** passed from a parent component to a child component. They make components dynamic and reusable.

### Passing Props
\`\`\`jsx
// Parent component
function App() {
  return <Greeting name="Mohamed" age={22} />;
}

// Child component
function Greeting(props) {
  return <h1>Hello, {props.name}! You are {props.age}.</h1>;
}
\`\`\`

### Destructuring Props
\`\`\`jsx
function Greeting({ name, age }) {
  return (
    <div>
      <h1>Hello, {name}!</h1>
      <p>Age: {age}</p>
    </div>
  );
}
\`\`\`

---

## State Management

### What is State?
State is data that a component can **maintain and update** over time. When state changes, React automatically re-renders the component.

### useState Hook
\`\`\`jsx
import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <h2>Count: {count}</h2>
      <button onClick={() => setCount(count + 1)}>+</button>
      <button onClick={() => setCount(count - 1)}>-</button>
      <button onClick={() => setCount(0)}>Reset</button>
    </div>
  );
}
\`\`\`

### State Best Practices
- **Never modify state directly** — always use the setter function
- State updates **may be asynchronous**
- Use **functional updates** when new state depends on old state
- Keep state **minimal** — derive computed values instead of storing them`
      },
      { moduleId: module1.id, title: "Props & State", contentType: "video", content: "SqcY0GlETPk", orderIndex: 3, duration: "20 min" },
      { moduleId: module1.id, title: "Your First Component", contentType: "coding",
        codeTemplate: `function App() {
  const [count, setCount] = React.useState(0);
  return (
    <div className="card">
      <h1>Count: {count}</h1>
      <p>Welcome to Career Connect! Keep learning and building amazing things.</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}
ReactDOM.createRoot(document.getElementById('root')).render(<App />);`,
        testCases: JSON.stringify([{ test: "Button should increment count", expected: "count increases by 1" }]),
        orderIndex: 4, duration: "15 min" },
      { moduleId: module1.id, title: "React Hooks Quick Reference", contentType: "cheatsheet", orderIndex: 5, duration: "5 min",
        content: `## React Hooks Reference

### useState
Manages local state in functional components.
\`\`\`jsx
const [value, setValue] = useState(initialValue);
\`\`\`

### useEffect
Handles side effects like API calls, timers, DOM manipulation.
\`\`\`jsx
useEffect(() => { /* run on mount */ }, []);
useEffect(() => { /* run when deps change */ }, [dep1, dep2]);
\`\`\`

### useContext
Access context values without prop drilling.
\`\`\`jsx
const theme = useContext(ThemeContext);
\`\`\`

### useRef
Creates a mutable reference persisting across renders.
\`\`\`jsx
const inputRef = useRef(null);
inputRef.current?.focus();
\`\`\`

### useMemo
Memoizes expensive computations.
\`\`\`jsx
const value = useMemo(() => compute(a, b), [a, b]);
\`\`\`

### useCallback
Memoizes callback functions to prevent unnecessary re-renders.
\`\`\`jsx
const handler = useCallback(() => doSomething(a), [a]);
\`\`\`

---

## Component Lifecycle with Hooks

| Phase | Class Component | Hooks Equivalent |
|-------|----------------|------------------|
| Mount | componentDidMount | useEffect(() => {}, []) |
| Update | componentDidUpdate | useEffect(() => {}) |
| Unmount | componentWillUnmount | useEffect(() => { return () => {} }, []) |`
      },
    ]
  });

  // ==================== MODULE 2 ====================
  var module2 = await prisma.module.create({
    data: {
      courseId: course.id, title: "React Hooks Deep Dive", orderIndex: 2,
      duration: "3 hours", description: "Master useState, useEffect, useContext, useRef, and custom hooks.",
      videoUrl: "TNhaISOUy6Q", videoDuration: 3600
    }
  });

  await prisma.topic.createMany({
    data: [
      { moduleId: module2.id, title: "useState Explained", contentType: "video", content: "TNhaISOUy6Q", orderIndex: 1, duration: "20 min" },
      { moduleId: module2.id, title: "useEffect & Lifecycle", contentType: "video", content: "TNhaISOUy6Q", orderIndex: 2, duration: "25 min" },
      { moduleId: module2.id, title: "useContext & useRef", contentType: "cheatsheet", orderIndex: 3, duration: "15 min",
        content: `## useContext Hook

### What is Context?
Context provides a way to pass data through the component tree without having to pass props manually at every level.

### Creating Context
\`\`\`jsx
import { createContext, useContext } from 'react';

const ThemeContext = createContext('light');

function App() {
  return (
    <ThemeContext.Provider value="dark">
      <ThemedButton />
    </ThemeContext.Provider>
  );
}

function ThemedButton() {
  const theme = useContext(ThemeContext);
  return <button className={theme}>Themed Button</button>;
}
\`\`\`

### Common Use Cases
- Theme switching (dark/light mode)
- User authentication state
- Language/localization settings
- Shopping cart data

---

## useRef Hook

### What is useRef?
useRef returns a mutable ref object whose \`.current\` property persists across re-renders without causing re-renders when changed.

### DOM Access
\`\`\`jsx
function TextInput() {
  const inputRef = useRef(null);

  const focusInput = () => {
    inputRef.current?.focus();
  };

  return (
    <div>
      <input ref={inputRef} type="text" />
      <button onClick={focusInput}>Focus Input</button>
    </div>
  );
}
\`\`\`

### Storing Previous Values
\`\`\`jsx
function usePrevious(value) {
  const ref = useRef();
  useEffect(() => { ref.current = value; });
  return ref.current;
}
\`\`\`

### Common Use Cases
- Accessing DOM elements directly
- Storing timer IDs for cleanup
- Keeping track of previous state values
- Holding mutable values without triggering re-renders`
      },
      { moduleId: module2.id, title: "Build a Counter with Hooks", contentType: "coding",
        codeTemplate: `function App() {
  const [count, setCount] = React.useState(0);
  
  React.useEffect(() => {
    document.title = \`Count: \${count}\`;
  }, [count]);
  
  return (
    <div className="card">
      <h1>Count: {count}</h1>
      <p>Click the buttons to change the count!</p>
      <button onClick={() => setCount(count + 1)}>+ Increment</button>
      <button onClick={() => setCount(count - 1)}>- Decrement</button>
      <button onClick={() => setCount(0)}>Reset</button>
    </div>
  );
}
ReactDOM.createRoot(document.getElementById('root')).render(<App />);`,
        testCases: JSON.stringify([{ test: "Title updates on count change" }]),
        orderIndex: 4, duration: "20 min" },
    ]
  });

  // ==================== MODULE 3 ====================
  var module3 = await prisma.module.create({
    data: {
      courseId: course.id, title: "State Management", orderIndex: 3,
      duration: "3 hours", description: "Learn Context API, Redux, and Zustand for managing application state.",
      videoUrl: "iBUJVy8phqw", videoDuration: 3000
    }
  });

  await prisma.topic.createMany({
    data: [
      { moduleId: module3.id, title: "Context API Tutorial", contentType: "video", content: "iBUJVy8phqw", orderIndex: 1, duration: "30 min" },
      { moduleId: module3.id, title: "Redux Toolkit Guide", contentType: "cheatsheet", orderIndex: 2, duration: "15 min",
        content: `## Redux Toolkit

### Why Redux?
Redux is a predictable state container for JavaScript apps. It helps manage global state that many components need access to.

### Installation
\`\`\`bash
npm install @reduxjs/toolkit react-redux
\`\`\`

### Creating a Store
\`\`\`js
import { configureStore } from '@reduxjs/toolkit';

const store = configureStore({
  reducer: {
    counter: counterReducer,
    user: userReducer
  }
});
\`\`\`

### Creating a Slice
\`\`\`js
import { createSlice } from '@reduxjs/toolkit';

const counterSlice = createSlice({
  name: 'counter',
  initialState: { value: 0 },
  reducers: {
    increment: (state) => { state.value += 1; },
    decrement: (state) => { state.value -= 1; },
    incrementByAmount: (state, action) => {
      state.value += action.payload;
    }
  }
});

export const { increment, decrement, incrementByAmount } = counterSlice.actions;
export default counterSlice.reducer;
\`\`\`

### Using in Components
\`\`\`jsx
import { useSelector, useDispatch } from 'react-redux';
import { increment, decrement } from './counterSlice';

function Counter() {
  const count = useSelector((state) => state.counter.value);
  const dispatch = useDispatch();

  return (
    <div>
      <h1>{count}</h1>
      <button onClick={() => dispatch(increment())}>+</button>
      <button onClick={() => dispatch(decrement())}>-</button>
    </div>
  );
}
\`\`\`

### Redux vs Context API
| Feature | Redux | Context API |
|---------|-------|-------------|
| Setup | More boilerplate | Simple |
| Performance | Optimized | Can cause re-renders |
| DevTools | Yes | No |
| Best for | Large apps | Small-medium apps |`
      },
      { moduleId: module3.id, title: "Build a Todo App with Redux", contentType: "coding",
       codeTemplate: `function App() {
  const [todos, setTodos] = React.useState([]);
  const [input, setInput] = React.useState("");
  
  const addTodo = () => {
    if (input.trim()) {
      setTodos([...todos, { id: Date.now(), text: input, done: false }]);
      setInput("");
    }
  };
  
  return (
    <div className="card">
      <h1>Todo List</h1>
      <input 
        value={input} 
        onChange={(e) => setInput(e.target.value)}
        placeholder="Add a todo..."
      />
      <button onClick={addTodo}>Add</button>
      <ul>
        {todos.map(todo => (
          <li key={todo.id}>{todo.text}</li>
        ))}
      </ul>
    </div>
  );
}
ReactDOM.createRoot(document.getElementById('root')).render(<App />);`,
        orderIndex: 3, duration: "45 min" },
    ]
  });

  // ==================== MODULE 4 ====================
  var module4 = await prisma.module.create({
    data: {
      courseId: course.id, title: "React Router & Navigation", orderIndex: 4,
      duration: "2 hours", description: "Master client-side routing with React Router v7.",
      videoUrl: "Ul3y1LXxzdU", videoDuration: 2400
    }
  });

  await prisma.topic.createMany({
    data: [
      { moduleId: module4.id, title: "React Router Setup", contentType: "video", content: "Ul3y1LXxzdU", orderIndex: 1, duration: "20 min" },
      { moduleId: module4.id, title: "Dynamic Routes & Params", contentType: "cheatsheet", orderIndex: 2, duration: "10 min",
        content: `## React Router v7

### Installation
\`\`\`bash
npm install react-router-dom
\`\`\`

### Basic Setup
\`\`\`jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
\`\`\`

### Navigation with Link
\`\`\`jsx
import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav>
      <Link to="/">Home</Link>
      <Link to="/about">About</Link>
      <Link to="/contact">Contact</Link>
    </nav>
  );
}
\`\`\`

### URL Parameters
\`\`\`jsx
import { useParams } from 'react-router-dom';

function UserProfile() {
  const { userId } = useParams();
  return <h1>User ID: {userId}</h1>;
}

// Route: <Route path="/user/:userId" element={<UserProfile />} />
\`\`\`

### Programmatic Navigation
\`\`\`jsx
import { useNavigate } from 'react-router-dom';

function LoginButton() {
  const navigate = useNavigate();
  
  const handleLogin = () => {
    // After login success
    navigate('/dashboard');
  };
  
  return <button onClick={handleLogin}>Login</button>;
}
\`\`\`

### Nested Routes
\`\`\`jsx
<Route path="/dashboard" element={<Dashboard />}>
  <Route index element={<Overview />} />
  <Route path="settings" element={<Settings />} />
  <Route path="profile" element={<Profile />} />
</Route>
\`\`\`

// Parent component must include <Outlet />
function Dashboard() {
  return (
    <div>
      <Sidebar />
      <Outlet /> {/* Child routes render here */}
    </div>
  );
}`
      },
      { moduleId: module4.id, title: "Build Multi-Page App", contentType: "coding",
        codeTemplate: `function App() {
  const [page, setPage] = React.useState("home");
  
  return (
    <div className="card">
      <nav>
        <button onClick={() => setPage("home")}>Home</button>
        <button onClick={() => setPage("about")}>About</button>
        <button onClick={() => setPage("contact")}>Contact</button>
      </nav>
      
      {page === "home" && <h1>Welcome Home!</h1>}
      {page === "about" && <h1>About Us</h1>}
      {page === "contact" && <h1>Contact Page</h1>}
    </div>
  );
}
ReactDOM.createRoot(document.getElementById('root')).render(<App />);`,
        orderIndex: 3, duration: "30 min" },
    ]
  });

  // ==================== MODULE 5 ====================
  var module5 = await prisma.module.create({
    data: {
      courseId: course.id, title: "API Integration & Data Fetching", orderIndex: 5,
      duration: "3 hours", description: "Learn to fetch data from REST APIs, handle loading states, and manage errors.",
      videoUrl: "bYFYF2Gn1Oc", videoDuration: 3000
    }
  });

  await prisma.topic.createMany({
    data: [
      { moduleId: module5.id, title: "Fetch API & Axios", contentType: "video", content: "bYFYF2Gn1Oc", orderIndex: 1, duration: "25 min" },
      { moduleId: module5.id, title: "API Integration Patterns", contentType: "cheatsheet", orderIndex: 2, duration: "15 min",
        content: `## Fetching Data in React

### Using Fetch API
\`\`\`jsx
function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('https://jsonplaceholder.typicode.com/users')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      })
      .then(data => {
        setUsers(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <ul>
      {users.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
\`\`\`

### Async/Await Pattern
\`\`\`jsx
useEffect(() => {
  const fetchData = async () => {
    try {
      const res = await fetch(url);
      const data = await res.json();
      setData(data);
    } catch (err) {
      setError(err.message);
    }
  };
  fetchData();
}, []);
\`\`\`

### Custom useFetch Hook
\`\`\`jsx
function useFetch(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(url)
      .then(res => res.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, [url]);

  return { data, loading, error };
}

// Usage
const { data, loading, error } = useFetch('/api/users');
\`\`\`

### POST Request Example
\`\`\`jsx
const createUser = async (userData) => {
  const res = await fetch('/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  });
  return res.json();
};
\`\`\`

### Axios Alternative
\`\`\`jsx
import axios from 'axios';

const fetchUsers = async () => {
  const { data } = await axios.get('/api/users');
  return data;
};
\`\`\``
      },
      { moduleId: module5.id, title: "Build a Data Dashboard", contentType: "coding",
       codeTemplate: `function App() {
  const [users, setUsers] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  
  React.useEffect(() => {
    fetch('https://jsonplaceholder.typicode.com/users')
      .then(res => res.json())
      .then(data => {
        setUsers(data);
        setLoading(false);
      });
  }, []);
  
  if (loading) return <h1>Loading...</h1>;
  
  return (
    <div className="card">
      <h1>User Dashboard</h1>
      <ul>
        {users.map(user => (
          <li key={user.id}>{user.name} - {user.email}</li>
        ))}
      </ul>
    </div>
  );
}
ReactDOM.createRoot(document.getElementById('root')).render(<App />);`,
        orderIndex: 3, duration: "45 min" },
    ]
  });

  // ==================== MODULE 6 ====================
  var module6 = await prisma.module.create({
    data: {
      courseId: course.id, title: "Final Project: E-Commerce App", orderIndex: 6,
      duration: "5 hours", description: "Build a complete e-commerce app with React, Context API, and React Router.",
      videoUrl: "j8229C3k8vY", videoDuration: 5400
    }
  });

  await prisma.topic.createMany({
    data: [
      { moduleId: module6.id, title: "Project Overview & Setup", contentType: "video", content: "j8229C3k8vY", orderIndex: 1, duration: "30 min" },
      { moduleId: module6.id, title: "Build Product Listing Page", contentType: "coding",
        codeTemplate: "// Create product listing with grid layout\n// Add search and filter functionality",
        orderIndex: 2, duration: "60 min" },
      { moduleId: module6.id, title: "Shopping Cart with Context", contentType: "coding",
        codeTemplate: "// Implement cart using Context API\n// Add/Remove items, calculate total",
        orderIndex: 3, duration: "60 min" },
      { moduleId: module6.id, title: "Checkout & Order Summary", contentType: "coding",
        codeTemplate: "// Create checkout flow\n// Show order summary",
        orderIndex: 4, duration: "45 min" },
    ]
  });

  // Enroll test student
  var student = await prisma.user.findFirst({ where: { email: 'student@test.com' } });
  if (student) {
    await prisma.courseEnrollment.create({
      data: { userId: student.id, courseId: course.id, completedTopics: 0, progress: 0 }
    });
  }

  console.log('✅ React JS Mastery course seeded!');
}

main().catch(console.error).finally(function () { prisma.$disconnect(); });