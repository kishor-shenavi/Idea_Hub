const express = require('express');
const authRoutes = require('./authRoutes');
const projectRoutes = require('./projectRoutes');
const adminRoutes = require('./adminRoutes');
const chatRoutes = require('./chatRoutes');
const router = express.Router();

router.use('/auth', authRoutes);
router.use('/projects', projectRoutes);
router.use('/admin', adminRoutes);
router.use('/chat', chatRoutes);

module.exports = router;