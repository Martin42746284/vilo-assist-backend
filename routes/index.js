// routes/index.js
const express = require('express');
const router = express.Router();

// Import des routes internes
const authRoutes = require('./auth');
const contactRoutes = require('./contacts');
const appointmentRoutes = require('./appointments');
const adminRoutes = require('./admin');
const userRoutes = require('./users');

// Si tu as un fichier test.js dans routes/, sinon supprime cette ligne
const testRoutes = require('./test');

// Configuration des routes API
router.use('/auth', authRoutes);
router.use('/contacts', contactRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/admin', adminRoutes);
router.use('/users', userRoutes);

// Routes supplémentaires (optionnelles)
if (testRoutes) {
  router.use('/test', testRoutes);
}

// Route de santé de l'API (accessible via /api/health)
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API fonctionne correctement',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
