require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
connectDB();
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const http = require('http');
const socketIO = require('socket.io');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');
dotenv.config();

// Import routes
const authRoutes = require('./routes/auth');
const threadRoutes = require('./routes/threads');
const commentRoutes = require('./routes/comments');
const journalRoutes = require('./routes/journal');
const chatRoutes = require('./routes/chat');

// Initialize express app
const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
const io = socketIO(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware
app.use(helmet()); 
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev')); // Logging

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mindspace', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB Connected Successfully'))
.catch(err => {
  console.error('❌ MongoDB Connection Error:', err);
  process.exit(1);
});

// Socket.IO connection handling
const activeUsers = new Map();

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // User joins chat
  socket.on('join', (userId) => {
    activeUsers.set(userId, socket.id);
    io.emit('activeUsers', Array.from(activeUsers.keys()));
  });

  // Handle chat messages
  socket.on('sendMessage', (data) => {
    const { roomId, message, userId, username } = data;

    io.to(roomId).emit('receiveMessage', {
      message,
      userId,
      username,
      timestamp: new Date().toISOString()
    });
  });

  socket.on('joinRoom', (roomId) => {
    socket.join(roomId);
    console.log(`Socket ${socket.id} joined room ${roomId}`);
  });


  socket.on('leaveRoom', (roomId) => {
    socket.leave(roomId);
    console.log(`Socket ${socket.id} left room ${roomId}`);
  });

  // AI chatbot response simulation
  socket.on('chatbotMessage', (data) => {
    const { message, userId } = data;
    
    // Simulate AI processing time
    setTimeout(() => {
      const responses = [
        "Thank you for sharing. It's completely normal to feel this way. Would you like to talk more about what's troubling you?",
        "I hear you. Remember, seeking help is a sign of strength, not weakness. How can I support you today?",
        "That sounds challenging. Have you tried any relaxation techniques like deep breathing or meditation?",
        "Your feelings are valid. Remember to be kind to yourself. What's one small thing that might help you feel better today?",
        "I'm here to listen. Sometimes talking about our feelings can help us understand them better.",
        "It's brave of you to reach out. Would you like to explore some coping strategies together?",
        "Remember, you're not alone in this journey. Many people experience similar feelings.",
        "Taking care of your mental health is just as important as physical health. What self-care activities do you enjoy?"
      ];
      
      const response = responses[Math.floor(Math.random() * responses.length)];
      
      socket.emit('chatbotResponse', {
        message: response,
        timestamp: new Date().toISOString()
      });
    }, 1000);
  });

  // Typing indicator
  socket.on('typing', (data) => {
    socket.to(data.roomId).emit('userTyping', {
      userId: data.userId,
      username: data.username
    });
  });

  socket.on('stopTyping', (data) => {
    socket.to(data.roomId).emit('userStoppedTyping', {
      userId: data.userId
    });
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    
    // Remove user from active users
    for (let [userId, socketId] of activeUsers.entries()) {
      if (socketId === socket.id) {
        activeUsers.delete(userId);
        break;
      }
    }
    
    io.emit('activeUsers', Array.from(activeUsers.keys()));
  });
});

// Make io accessible to routes
app.set('io', io);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/threads', threadRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/journal', journalRoutes);
app.use('/api/chat', chatRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'MindSpace API is running',
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to MindSpace API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      threads: '/api/threads',
      comments: '/api/comments',
      journal: '/api/journal',
      chat: '/api/chat',
      health: '/api/health'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.path
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`
  ╔═══════════════════════════════════════╗
  ║   🌸 MindSpace Backend Server 🌸     ║
  ║   Server running on port ${PORT}        ║
  ║   Environment: ${process.env.NODE_ENV || 'development'}           ║
  ║   Socket.IO: Enabled ✅               ║
  ╚═══════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing server gracefully...');
  server.close(() => {
    console.log('Server closed');
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed');
      process.exit(0);
    });
  });
});

module.exports = { app, io };
