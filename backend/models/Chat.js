// // const mongoose = require('mongoose');

// // const messageSchema = new mongoose.Schema({
// //   conversation: {
// //     type: mongoose.Schema.Types.ObjectId,
// //     ref: 'Conversation',
// //     required: true
// //   },
// //   sender: {
// //     type: mongoose.Schema.Types.ObjectId,
// //     ref: 'User',
// //     required: true
// //   },
// //   content: {
// //     type: String,
// //     required: true
// //   },
// //   read: {
// //     type: Boolean,
// //     default: false
// //   },
// //   createdAt: {
// //     type: Date,
// //     default: Date.now
// //   }
// // });

// // // Index for faster querying
// // messageSchema.index({ conversation: 1, createdAt: 1 });

// // module.exports = mongoose.model('Message', messageSchema);
















// const mongoose = require('mongoose');

// const messageSchema = new mongoose.Schema({
//   sender: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true
//   },
//   recipient: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true
//   },
//   project: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Project'
//   },
//   content: {
//     type: String,
//     required: true
//   },
//   read: {
//     type: Boolean,
//     default: false
//   },
//   createdAt: {
//     type: Date,
//     default: Date.now
//   },
//     type: {
//     type: String,
//     enum: ['text', 'image', 'file', 'link'],
//     default: 'text'
//   },
//   attachment: {
//     url: String,
//     name: String,
//     size: Number,
//     mimeType: String
//   },
//   // Add reference to parent message for replies
//   replyTo: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Message'
//   }
// });

// module.exports = mongoose.model('Message', messageSchema);









// ✅ FILE: models/Message.js

const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  readBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Message', messageSchema);
