// routes/index.js
const express = require('express');
const router = express.Router();

// Import des routes
const authRoutes = require('./auth');
const contactRoutes = require('./contacts');
const appointmentRoutes = require('./appointments');
const adminRoutes = require('./admin');
const userRoutes = require('./users');

// Configuration des routes
router.use('/auth', authRoutes);
router.use('/contacts', contactRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/admin', adminRoutes);
router.use('/users', userRoutes);

// Route de test
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API fonctionne correctement',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;