const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const { verifyToken } = require('./middlewares/auth');
const Message = require('./models/Chat');
const { createAdapter } = require('@socket.io/redis-adapter');
const config = require('./config');
const IORedis = require('ioredis');
const mongoose = require('mongoose');
const redis = require('./config/redis');
const queueConnection = require('./config/queueConnection');

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

// ── Socket.io setup ───────────────────────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
  pingTimeout: 30000,
  pingInterval: 25000,
});

const pubClient = new IORedis(config.redis.url);
const subClient = pubClient.duplicate();
pubClient.on('error', (err) => console.error('Socket adapter pubClient error:', err.message));
subClient.on('error', (err) => console.error('Socket adapter subClient error:', err.message));
io.adapter(createAdapter(pubClient, subClient));
app.set('io', io);

// ── Socket auth middleware ────────────────────────────────────────────────────
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token) return next(new Error('Auth token missing'));
    const decoded = await verifyToken(token);
    socket.user = decoded;
    next();
  } catch {
    next(new Error('Authentication failed'));
  }
});

// ── Socket connection handler ─────────────────────────────────────────────────
io.on('connection', (socket) => {
  console.log(`✅ Socket connected: user ${socket.user.id}`);

  // Join personal room (for notifications)
  socket.join(`user_${socket.user.id}`);

  // Join a project's chat room
  socket.on('joinProject', (projectId) => {
    if (!projectId) return;
    socket.join(`project_${projectId}`);
    console.log(`User ${socket.user.id} joined project room ${projectId}`);
  });

  // Leave a project's chat room
  socket.on('leaveProject', (projectId) => {
    if (!projectId) return;
    socket.leave(`project_${projectId}`);
  });

  // Send message via socket (primary path)
  socket.on('sendProjectMessage', async (data, callback) => {
    try {
      const { projectId, content } = data;
      if (!projectId || !content) throw new Error('projectId and content are required');

      const message = await Message.create({
        project: projectId,
        sender: socket.user.id,
        content,
      });

      const populated = await Message.findById(message._id)
        .populate('sender', 'name avatar year branch');

      // Broadcast to everyone in the project room
      io.to(`project_${projectId}`).emit('newProjectMessage', populated);

      if (typeof callback === 'function') callback({ status: 'success', data: populated });
    } catch (err) {
      console.error('❌ sendProjectMessage error:', err.message);
      if (typeof callback === 'function') callback({ status: 'error', error: err.message });
    }
  });

  // Typing indicators
  socket.on('typing', ({ projectId }) => {
    if (!projectId) return;
    socket.to(`project_${projectId}`).emit('userTyping', {
      userId: socket.user.id,
    });
  });

  socket.on('stopTyping', ({ projectId }) => {
    if (!projectId) return;
    socket.to(`project_${projectId}`).emit('userStoppedTyping', {
      userId: socket.user.id,
    });
  });

  socket.on('disconnect', () => {
    console.log(`❌ Socket disconnected: user ${socket.user.id}`);
  });

  socket.on('error', (err) => {
    console.error('🔥 Socket error:', err.message);
  });
});

// ── Start server ──────────────────────────────────────────────────────────────
server.listen(PORT, () => {
  console.log(`🚀 IdeaHub server running on port ${PORT}`);
});
 console.log('BUILD MARKER: shutdown-fix-v2');
let isShuttingDown = false; // add this line right above the function

const gracefulShutdown = async (signal) => {
  if (isShuttingDown) return; // ignore repeated signals while already shutting down — this is the actual fix
  isShuttingDown = true;

  console.log(`${signal} received — shutting down gracefully`);

  server.close(async () => {
    console.log('HTTP server closed');

    try {
      await mongoose.connection.close();
      console.log('MongoDB connection closed');
    } catch (err) {
      console.error('Error closing MongoDB connection:', err.message);
    }

    // .disconnect() instead of .quit() — quit() waits for a clean reply from Redis, which hangs
    // forever if Redis is already unreachable. disconnect() closes immediately, no reply needed.
    try {
      redis.disconnect();
      console.log('Redis connection closed');
    } catch (err) {
      console.error('Error closing Redis connection:', err.message);
    }

    try {
      queueConnection.disconnect();
      console.log('Queue Redis connection closed');
    } catch (err) {
      console.error('Error closing queue connection:', err.message);
    }

    process.exit(0);
  });

  setTimeout(() => {
    console.error('Forced shutdown after 10s timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT')); // handles Ctrl+C locally too, not just production signals

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err.message);
  gracefulShutdown('unhandledRejection');
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err.message);
  gracefulShutdown('uncaughtException');
});