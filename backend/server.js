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
const MentorRequest = require('./models/MentorRequest'); // add at top, alongside `const Message = require('./models/Chat');`
const DirectMessage = require('./models/DirectMessage'); // add
const PORT = process.env.PORT || 5000;
const Project = require('./models/Project'); // add near top, alongside `const Message = require('./models/Chat');`


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

    const message = await Message.create({ project: projectId, sender: socket.user.id, content });
    const populated = await Message.findById(message._id).populate('sender', 'name avatar year branch');

    io.to(`project_${projectId}`).emit('newProjectMessage', populated);

    // NEW — participant notification, same logic as the REST path in chatController
    const project = await Project.findById(projectId).select('createdBy title');
    if (project) {
      const priorSenderIds = await Message.distinct('sender', { project: projectId, sender: { $ne: socket.user.id } });
      const recipientIds = new Set(priorSenderIds.map(String));
      if (project.createdBy.toString() !== socket.user.id) recipientIds.add(project.createdBy.toString());
      recipientIds.delete(socket.user.id.toString());
      recipientIds.forEach(uid => io.to(`user_${uid}`).emit('newProjectMessageNotification', {
        projectId, projectTitle: project.title, creatorId: project.createdBy.toString(),
        senderName: populated.sender.name, preview: content.slice(0, 80),
      }));
    }

    if (typeof callback === 'function') callback({ status: 'success', data: populated });
  } catch (err) {
    console.error('❌ sendProjectMessage error:', err.message);
    if (typeof callback === 'function') callback({ status: 'error', error: err.message });
  }
});

socket.on('joinMentorChat', async (requestId) => {
  try {
    const mr = await MentorRequest.findById(requestId);
    if (!mr || mr.status !== 'accepted') return;
    const isParticipant = [mr.student.toString(), mr.senior.toString()].includes(socket.user.id);
    if (!isParticipant) return;
    socket.join(`mentor_${requestId}`);
  } catch (err) {
    console.error('❌ joinMentorChat error:', err.message);
  }
});

socket.on('leaveMentorChat', (requestId) => {
  if (!requestId) return;
  socket.leave(`mentor_${requestId}`);
});

socket.on('sendMentorMessage', async (data, callback) => {
  try {
    const { requestId, content } = data;
    if (!requestId || !content) throw new Error('requestId and content are required');

    const mr = await MentorRequest.findById(requestId);
    if (!mr || mr.status !== 'accepted') throw new Error('Chat is not available for this request');
    const isParticipant = [mr.student.toString(), mr.senior.toString()].includes(socket.user.id);
    if (!isParticipant) throw new Error('Not authorized');

    const message = await DirectMessage.create({ mentorRequest: requestId, sender: socket.user.id, content });
    const populated = await DirectMessage.findById(message._id).populate('sender', 'name avatar');

    io.to(`mentor_${requestId}`).emit('newMentorMessage', populated);

    // lightweight notification to the OTHER participant, even if they're not currently in the chat room —
    // this is what powers the green dot on the Mentor Connect list page
    const otherUserId = mr.student.toString() === socket.user.id ? mr.senior.toString() : mr.student.toString();
    io.to(`user_${otherUserId}`).emit('mentorMessageNotification', {
  requestId,
  senderName: populated.sender.name,
  preview: content.slice(0, 80),
});

    if (typeof callback === 'function') callback({ status: 'success', data: populated });
  } catch (err) {
    console.error('❌ sendMentorMessage error:', err.message);
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