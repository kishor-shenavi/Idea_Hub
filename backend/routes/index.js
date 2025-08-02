// const express = require('express');
// const authRoutes = require('./authRoutes');
// const projectRoutes = require('./projectRoutes');
// const adminRoutes = require('./adminRoutes');
// const chatRoutes = require('./chatRoutes');
// const router = express.Router();
// app.get("/", (req, res) => {
//   res.send("✅ Idea Hub backend is running!");
// });
// router.use('/auth', authRoutes);
// router.use('/projects', projectRoutes);
// router.use('/admin', adminRoutes);
// router.use('/chat', chatRoutes);

// module.exports = router;

const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const projectRoutes = require('./projectRoutes');
const adminRoutes = require('./adminRoutes');
const chatRoutes = require('./chatRoutes');

// ✅ Health check route
router.get("/", (req, res) => {
  res.send("✅ Idea Hub backend is running!");
});

router.use('/auth', authRoutes);
router.use('/projects', projectRoutes);
router.use('/admin', adminRoutes);
router.use('/chat', chatRoutes);

module.exports = router;
