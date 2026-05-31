const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use('/api/v2', require('./routes/api'));

const authRoutes = require('./modules/auth/auth.routes');
app.use('/api/auth', authRoutes);

const jobRoutes = require('./modules/jobs/job.routes');
app.use('/api/jobs', jobRoutes);

const chatbotRoutes = require('./modules/chatbot/chatbot.routes');
app.use('/api/chatbot', chatbotRoutes);

var messageRoutes = require('./modules/messages/message.routes');
app.use('/api/messages', messageRoutes);

const assessmentRoutes = require('./modules/assessments/assessment.routes');
app.use('/api/assessments', assessmentRoutes);

var collegeRoutes = require('./modules/college/college.routes');
app.use('/api/college', collegeRoutes);

var learningRoutes = require('./modules/learning/learning.routes');
app.use('/api/learning', learningRoutes);

const userRoutes = require('./modules/users/user.routes');
app.use('/api/users', userRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});
var broadcastRoutes = require('./modules/broadcast/broadcast.routes');
app.use('/api/broadcast', broadcastRoutes);

const applicationRoutes = require('./modules/applications/application.routes');
app.use('/api/applications', applicationRoutes);

const employerAnalyticsRoutes = require('./modules/employer/analytics.routes');
app.use('/api/employer', employerAnalyticsRoutes);

const analyticsRoutes = require('./modules/analytics/analytics.routes');
app.use('/api/analytics', analyticsRoutes);

//var collegeStudentRoutes = require('./modules/college/students.routes');
//app.use('/api/college/students', collegeStudentRoutes);

const dashboardRoutes = require('./modules/dashboard/dashboard.routes');
app.use('/api/dashboard', dashboardRoutes);

var skillRoutes = require('./modules/skills/skill.routes');
app.use('/api/skills', skillRoutes);

const zaraTasksRoutes = require('./modules/users/zara-tasks.routes');
app.use('/api/zara', zaraTasksRoutes);

const aiGeneratorRoutes = require('./modules/assessments/ai-generator.routes');
app.use('/api/assessments/generate', aiGeneratorRoutes);




const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});
app.set('io', io); 
// Socket.io — Real-time messaging
io.on('connection', function(socket) {
  console.log('User connected:', socket.id);
  
  // Join a room with user ID for private messaging
  socket.on('join', function(userId) {
    socket.join(userId);
    console.log('User joined room:', userId);
  });
  
  // Send message in real-time
  socket.on('sendMessage', function(data) {
    // Broadcast to receiver's room
    io.to(data.receiverId).emit('newMessage', {
      senderId: data.senderId,
      text: data.text,
      createdAt: new Date()
    });
  });
  
  socket.on('disconnect', function() {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, function() {
  console.log('Server running on port ' + PORT);
});