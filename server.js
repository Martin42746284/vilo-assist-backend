// app.js ou server.js - Configuration principale de l'application
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models'); // configuration Sequelize
const dotenv = require('dotenv');

// Import des routes
const contactRoutes = require('./routes/contacts');
const appointmentRoutes = require('./routes/appointments'); 
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const emailRoutes = require('./routes/email');

const app = express();

// Middleware globaux
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8080',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware de logging en développement
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
    next();
  });
}

// Routes API
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes); 
app.use('/api/contacts', contactRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use(express.json());
app.use('/api/admin', emailRoutes);

// Route de santé de l'API
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'API fonctionne correctement',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Middleware de gestion d'erreur globale
app.use((err, req, res, next) => {
  console.error('Erreur non gérée:', err);
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Erreur interne du serveur',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Route 404 pour les routes non trouvées
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} non trouvée`
  });
});

const PORT = process.env.PORT || 3001;

// Fonction pour démarrer le serveur
async function startServer() {
  try {
    // Tester la connexion à la base de données
    await sequelize.authenticate();
    console.log('✅ Connexion à la base de données établie avec succès.');

    // Synchroniser les modèles (uniquement en développement)
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: false }); // Use alter: true pour les modifications de schema
      console.log('✅ Modèles synchronisés avec la base de données.');
    }
    
    app.listen(PORT, () => {
      console.log(`🚀 Serveur démarré sur le port ${PORT}`);
      console.log(`📝 API disponible sur: http://localhost:${PORT}/api`);
      console.log(`❤️  Health check: http://localhost:${PORT}/api/health`);
    });
    
  } catch (error) {
    console.error('❌ Impossible de se connecter à la base de données:', error);
    process.exit(1);
  }
}

// Gestion des signaux de fermeture propre
process.on('SIGINT', async () => {
  console.log('\n⏹️  Arrêt du serveur...');
  await sequelize.close();
  console.log('✅ Connexion à la base de données fermée.');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n⏹️  Arrêt du serveur...');
  await sequelize.close();
  console.log('✅ Connexion à la base de données fermée.');
  process.exit(0);
});

// Démarrer le serveur
startServer();

module.exports = app;