var { PrismaClient } = require('@prisma/client');
var prisma = new PrismaClient();

async function main() {
  console.log('🧹 Cleaning Node.js course if exists...');
  var existing = await prisma.course.findFirst({ where: { title: { contains: "Node.js" } } });
  if (existing) {
    await prisma.topic.deleteMany({ where: { module: { courseId: existing.id } } });
    await prisma.module.deleteMany({ where: { courseId: existing.id } });
    await prisma.course.delete({ where: { id: existing.id } });
  }

  var c = await prisma.course.create({
    data: {
      title: "Node.js & Express Mastery",
      description: "Build scalable backend applications with Node.js, Express.js, MongoDB, and REST APIs. Master server-side JavaScript from scratch.",
      category: "Backend Development",
      difficulty: "Intermediate",
      duration: "22 hours",
      totalModules: 4,
      accentColor: "#3cc68a",
      icon: "🟢",
      thumbnailUrl: "https://img.youtube.com/vi/Oe421EPjeBE/0.jpg"
    }
  });
  console.log('✅ Course: ' + c.id);

  // MODULE 1
  var m1 = await prisma.module.create({
    data: { courseId: c.id, title: "Node.js Fundamentals", orderIndex: 1, duration: "4h", description: "Core concepts, modules, NPM, and file system.", videoUrl: "Oe421EPjeBE", videoDuration: 2700 }
  });
  await prisma.topic.createMany({ data: [
    { moduleId: m1.id, title: "What is Node.js?", contentType: "video", content: "Oe421EPjeBE", orderIndex: 1, duration: "20 min" },
    { moduleId: m1.id, title: "Node.js Core Concepts", contentType: "cheatsheet", orderIndex: 2, duration: "15 min",
      content: `## Node.js Core Concepts

### What is Node.js?
Node.js is a **JavaScript runtime** built on Chrome's V8 engine. It allows you to run JavaScript on the server.

### Installation
\`\`\`bash
# Check version
node --version
npm --version

# Create a new project
mkdir my-app && cd my-app
npm init -y
\`\`\`

### Core Modules
Node.js comes with built-in modules:

| Module | Purpose |
|--------|---------|
| \`fs\` | File System operations |
| \`http\` | Create HTTP servers |
| \`path\` | Handle file paths |
| \`os\` | Operating system info |
| \`events\` | Event handling |
| \`crypto\` | Encryption & hashing |

### File System (fs)
\`\`\`js
const fs = require('fs');

// Read file
fs.readFile('data.txt', 'utf8', (err, data) => {
  if (err) throw err;
  console.log(data);
});

// Write file
fs.writeFile('output.txt', 'Hello Node!', (err) => {
  if (err) throw err;
  console.log('File saved!');
});

// Read directory
fs.readdir('./', (err, files) => {
  files.forEach(file => console.log(file));
});
\`\`\`

### Path Module
\`\`\`js
const path = require('path');

console.log(path.join('/users', 'name', 'file.txt')); // /users/name/file.txt
console.log(path.extname('index.js'));               // .js
console.log(path.basename('/home/user/file.txt'));   // file.txt
\`\`\`

### NPM (Node Package Manager)
\`\`\`bash
# Install packages
npm install express
npm install --save-dev nodemon

# Run scripts
npm start
npm run dev
\`\`\`
` },
    { moduleId: m1.id, title: "NPM & Modules", contentType: "video", content: "Oe421EPjeBE", orderIndex: 3, duration: "25 min" },
    { moduleId: m1.id, title: "Build a File Server", contentType: "coding",
      codeTemplate: `const fs = require('fs');
const path = require('path');

// Create a file and read it
fs.writeFileSync('hello.txt', 'Hello from Node.js!');
const data = fs.readFileSync('hello.txt', 'utf8');
console.log('File content:', data);
console.log('Directory:', __dirname);
console.log('File:', __filename);`,
      orderIndex: 4, duration: "15 min" }
  ]});

  // MODULE 2
  var m2 = await prisma.module.create({
    data: { courseId: c.id, title: "Express.js & REST APIs", orderIndex: 2, duration: "8h", description: "Build RESTful APIs with Express.js, routing, middleware, and error handling.", videoUrl: "L72fhGm1tfE", videoDuration: 3600 }
  });
  await prisma.topic.createMany({ data: [
    { moduleId: m2.id, title: "Express.js Setup", contentType: "video", content: "L72fhGm1tfE", orderIndex: 1, duration: "30 min" },
    { moduleId: m2.id, title: "REST API Guide", contentType: "cheatsheet", orderIndex: 2, duration: "20 min",
      content: `## Express.js & REST APIs

### What is Express?
Express is a **fast, minimalist web framework** for Node.js. It simplifies building web servers and APIs.

### Installation
\`\`\`bash
npm install express
npm install --save-dev nodemon
\`\`\`

### Basic Server
\`\`\`js
const express = require('express');
const app = express();
const PORT = 5000;

// Middleware
app.use(express.json());

// Route
app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(PORT, () => {
  console.log('Server running on port ' + PORT);
});
\`\`\`

### HTTP Methods (CRUD)
| Method | Route | Purpose |
|--------|-------|---------|
| GET | /api/users | Get all users |
| GET | /api/users/:id | Get one user |
| POST | /api/users | Create user |
| PUT | /api/users/:id | Update user |
| DELETE | /api/users/:id | Delete user |

### Full CRUD Example
\`\`\`js
const users = [];

// GET all
app.get('/api/users', (req, res) => {
  res.json(users);
});

// GET one
app.get('/api/users/:id', (req, res) => {
  const user = users.find(u => u.id === parseInt(req.params.id));
  if (!user) return res.status(404).json({ error: 'Not found' });
  res.json(user);
});

// POST create
app.post('/api/users', (req, res) => {
  const user = { id: Date.now(), ...req.body };
  users.push(user);
  res.status(201).json(user);
});

// PUT update
app.put('/api/users/:id', (req, res) => {
  const index = users.findIndex(u => u.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ error: 'Not found' });
  users[index] = { ...users[index], ...req.body };
  res.json(users[index]);
});

// DELETE
app.delete('/api/users/:id', (req, res) => {
  const index = users.findIndex(u => u.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ error: 'Not found' });
  users.splice(index, 1);
  res.json({ message: 'Deleted' });
});
\`\`\`

### Middleware
\`\`\`js
// Custom middleware
app.use((req, res, next) => {
  console.log(req.method, req.url);
  next();
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});
\`\`\`

### Route Parameters & Query
\`\`\`js
// URL params: /users/123
app.get('/users/:id', (req, res) => {
  console.log(req.params.id); // "123"
});

// Query strings: /search?q=node&page=1
app.get('/search', (req, res) => {
  console.log(req.query.q);    // "node"
  console.log(req.query.page); // "1"
});
\`\`\`
` },
    { moduleId: m2.id, title: "Middleware & Error Handling", contentType: "video", content: "L72fhGm1tfE", orderIndex: 3, duration: "30 min" },
    { moduleId: m2.id, title: "Build REST API", contentType: "coding",
      codeTemplate: `const express = require('express');
const app = express();
app.use(express.json());

let tasks = [];

app.get('/api/tasks', (req, res) => res.json(tasks));
app.post('/api/tasks', (req, res) => {
  const task = { id: Date.now(), text: req.body.text, done: false };
  tasks.push(task);
  res.status(201).json(task);
});

app.listen(5000, () => console.log('API running on port 5000'));`,
      orderIndex: 4, duration: "30 min" }
  ]});

  // MODULE 3
  var m3 = await prisma.module.create({
    data: { courseId: c.id, title: "Database & MongoDB", orderIndex: 3, duration: "6h", description: "MongoDB, Mongoose ODM, CRUD operations.", videoUrl: "fgTGADljAeg", videoDuration: 3000 }
  });
  await prisma.topic.createMany({ data: [
    { moduleId: m3.id, title: "MongoDB Setup", contentType: "video", content: "fgTGADljAeg", orderIndex: 1, duration: "25 min" },
    { moduleId: m3.id, title: "Mongoose Guide", contentType: "cheatsheet", orderIndex: 2, duration: "20 min",
      content: `## MongoDB & Mongoose

### What is MongoDB?
MongoDB is a **NoSQL database** that stores data in flexible, JSON-like documents.

### Mongoose Setup
\`\`\`bash
npm install mongoose
\`\`\`

\`\`\`js
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/mydb')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error(err));
\`\`\`

### Schema & Model
\`\`\`js
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  age: Number,
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
\`\`\`

### CRUD Operations
\`\`\`js
// CREATE
const user = await User.create({ name: 'John', email: 'john@email.com' });

// READ
const users = await User.find();
const user = await User.findById(id);
const user = await User.findOne({ email: 'john@email.com' });

// UPDATE
await User.findByIdAndUpdate(id, { name: 'Jane' });

// DELETE
await User.findByIdAndDelete(id);
\`\`\`

### Relations (References)
\`\`\`js
const postSchema = new mongoose.Schema({
  title: String,
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

// Populate
const posts = await Post.find().populate('author', 'name email');
\`\`\`
` },
    { moduleId: m3.id, title: "Build MongoDB API", contentType: "coding",
      codeTemplate: `// MongoDB connection and schema
const mongoose = require('mongoose');

// Schema
const productSchema = new mongoose.Schema({
  name: String,
  price: Number,
  category: String
});

const Product = mongoose.model('Product', productSchema);

// Create and find
async function run() {
  await mongoose.connect('mongodb://localhost:27017/store');
  await Product.create({ name: 'Laptop', price: 999, category: 'Electronics' });
  const products = await Product.find();
  console.log(products);
}
run();`,
      orderIndex: 3, duration: "30 min" }
  ]});

  // MODULE 4
  var m4 = await prisma.module.create({
    data: { courseId: c.id, title: "Authentication & Deployment", orderIndex: 4, duration: "4h", description: "JWT authentication, bcrypt, and deploying to Render/Railway.", videoUrl: "7UQBMb8ZpuE", videoDuration: 2400 }
  });
  await prisma.topic.createMany({ data: [
    { moduleId: m4.id, title: "JWT Authentication", contentType: "video", content: "7UQBMb8ZpuE", orderIndex: 1, duration: "30 min" },
    { moduleId: m4.id, title: "Auth Guide", contentType: "cheatsheet", orderIndex: 2, duration: "15 min",
      content: `## JWT Authentication

### What is JWT?
JSON Web Tokens are used to **securely transmit information** between parties. Used for stateless authentication.

### Installation
\`\`\`bash
npm install jsonwebtoken bcryptjs
\`\`\`

### Register & Login
\`\`\`js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const SECRET = 'mysecretkey';

// Register
app.post('/register', async (req, res) => {
  const hashedPassword = await bcrypt.hash(req.body.password, 10);
  const user = await User.create({ ...req.body, password: hashedPassword });
  res.json({ message: 'User created' });
});

// Login
app.post('/login', async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).json({ error: 'Invalid email' });
  
  const valid = await bcrypt.compare(req.body.password, user.password);
  if (!valid) return res.status(400).json({ error: 'Invalid password' });
  
  const token = jwt.sign({ id: user._id }, SECRET, { expiresIn: '7d' });
  res.json({ token, user });
});
\`\`\`

### Auth Middleware
\`\`\`js
function auth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  
  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// Protected route
app.get('/api/profile', auth, (req, res) => {
  res.json({ user: req.user });
});
\`\`\`

### Deployment (Render)
\`\`\`bash
# package.json
"scripts": {
  "start": "node index.js",
  "build": "npm install"
}
\`\`\`
` },
    { moduleId: m4.id, title: "Build Auth System", contentType: "coding",
      codeTemplate: `const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const SECRET = 'supersecret';

async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}

async function comparePassword(password, hash) {
  return await bcrypt.compare(password, hash);
}

function generateToken(userId) {
  return jwt.sign({ id: userId }, SECRET, { expiresIn: '1h' });
}

console.log('Auth module ready!');`,
      orderIndex: 3, duration: "30 min" }
  ]});

  console.log('✅ Node.js & Express Mastery course created!');
  console.log('   Course ID: ' + c.id);
}

main().catch(console.error).finally(function() { prisma.$disconnect(); });