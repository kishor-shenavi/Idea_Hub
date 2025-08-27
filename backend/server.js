const mongoose = require('mongoose'); // Missing
const User = require('./models/User'); // Missing
const Project = require('./models/Project'); // Missing

const http = require('http');
const socketio = require('socket.io');
const app = require('./app');
const config = require('./config/config');
const Message = require('./models/Chat');
const { verifyToken } = require('./middlewares/auth');
require('./config/passport');

// Create HTTP server
const server = http.createServer(app);

// Configure Socket.io with production-ready settings
const io = socketio(server, {
  cors: {
    origin: process.env.CLIENT_URL || "*",
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['websocket', 'polling'],
  pingTimeout: 30000,
  pingInterval: 25000,
  cookie: false,
  serveClient: false
});
app.set('io', io);
// Connection tracking
const activeConnections = new Map();

// Authentication middleware
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;

    console.log("🛡️ Incoming token:", token); // 🔍 Add this line

    if (!token) {
      console.log("❌ No token received");
      return next(new Error('Authentication error: Token missing'));
    }

    const decoded = await verifyToken(token);
    socket.user = decoded;

    console.log("✅ Authenticated user:", decoded); // 🔍 Log user

    activeConnections.set(decoded.id, {
      socketId: socket.id,
      userId: decoded.id,
      connectedAt: new Date()
    });

    next();
  } catch (err) {
    console.error('❌ Socket auth error:', err.message); // 🔍 Log error
    next(new Error('Authentication failed'));
  }
});

// Event handlers
// ✅ Socket connection handler
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.user.id}`);
  
  socket.join(`user_${socket.user.id}`);

  socket.on('joinProject', (projectId) => {
    if (!projectId) return;
    socket.join(`project_${projectId}`);
    console.log(`User ${socket.user.id} joined project ${projectId}`);
  });
   
  // ✅ Your sendMessage event now placed correctly
  socket.on('sendProjectMessage', async (data, callback) => {
  try {
    const { projectId, content } = data;

    if (!projectId || !content) {
      throw new Error('Project ID and content are required');
    }

    const message = await Message.create({
      project: projectId,
      sender: socket.user.id,
      content
    });

    const populated = await Message.findById(message._id).populate('sender', 'name avatar');

    io.to(`project_${projectId}`).emit('newProjectMessage', populated);

    if (typeof callback === 'function') {
      callback({ status: 'success', data: populated });
    }
  } catch (err) {
    console.error('❌ sendProjectMessage error:', err.message);
    if (typeof callback === 'function') {
      callback({ status: 'error', error: err.message });
    }
  }
});

  // socket.on('sendMessage', async (messageData, callback) => {
  //   try {
  //     const { recipientId, projectId, content } = messageData;

  //     if (!content || !recipientId || !projectId) {
  //       throw new Error('Missing required fields');
  //     }

  //     if (!mongoose.Types.ObjectId.isValid(recipientId) ||
  //         !mongoose.Types.ObjectId.isValid(projectId)) {
  //       throw new Error('Invalid ID format');
  //     }

  //     const recipientExists = await User.exists({ _id: recipientId });
  //     if (!recipientExists) throw new Error('Recipient not found');

  //     const projectExists = await Project.exists({ _id: projectId });
  //     if (!projectExists) throw new Error('Project not found');

  //     const message = await Message.create({
  //       sender: socket.user.id,
  //       recipient: recipientId,
  //       project: projectId,
  //       content
  //     });

  //     const populated = await Message.findById(message._id)
  //       .populate('sender', 'name email avatar')
  //       .populate('recipient', 'name email avatar')
  //       .populate('project', 'title')
  //       .lean();

  //     const response = {
  //       ...populated,
  //       tempId: messageData.tempId
  //     };
  //     delete response.__v;

  //     io.to(`user_${recipientId}`).emit('newMessage', response);
  //     io.to(`project_${projectId}`).emit('newMessage', response);

  //     if (typeof callback === 'function') {
  //       callback({ status: 'success', data: response });
  //     }
  //   } catch (err) {
  //     console.error('Message error:', err.message);
  //     if (typeof callback === 'function') {
  //       callback({
  //         status: 'error',
  //         error: err.message,
  //         tempId: messageData?.tempId
  //       });
  //     }
  //   }
  // });

  socket.on("error", (err) => {
  console.error("🔥 Socket error:", err.message);
});


  socket.on('disconnect', () => {
    activeConnections.delete(socket.user.id);
    console.log(`User disconnected: ${socket.user.id}`);
  });
});


// Health check endpoint
app.get('/socket-health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    connections: activeConnections.size
  });
});
 
// Start server
const PORT = config.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Socket.io listening for connections`);
});
 


// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Closing server...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log(`Error: ${err.message}`);
  server.close(() => process.exit(1));
});