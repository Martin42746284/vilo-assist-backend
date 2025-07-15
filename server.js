// app.js - Configuration principale de l'application
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const { sequelize } = require('./models');
const routes = require('./routes'); // ← ✅ On importe le routeur central

const app = express();

// ✅ Définition des origines autorisées
const allowedOrigins = [
  'https://vilo-assist-pro-jet.vercel.app',
  'http://localhost:8080'
];

// ✅ Middleware CORS personnalisé
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS policy: origin ${origin} not allowed`));
    }
  },
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware de log en développement
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.originalUrl} - ${new Date().toISOString()}`);
    next();
  });
}

// ✅ Point d’entrée des routes (centralisé)
app.use('/api', routes);

// ✅ Middleware de gestion d’erreurs
app.use((err, req, res, next) => {
  console.error('❌ Erreur non gérée :', err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Erreur interne du serveur',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// ✅ Route 404 (pour les routes non trouvées)
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} non trouvée`
  });
});

// ✅ Démarrage du serveur
const PORT = process.env.PORT || 3001;

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connexion à la base de données établie avec succès.');

    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: false });
      console.log('✅ Modèles synchronisés avec la base de données.');
    }

    app.listen(PORT, () => {
      console.log(`🚀 Serveur démarré sur le port ${PORT}`);
      console.log(`📝 API: http://localhost:${PORT}/api`);
      console.log(`❤️  Health check: http://localhost:${PORT}/api/health`);
    });

  } catch (error) {
    console.error('❌ Impossible de se connecter à la base de données:', error);
    process.exit(1);
  }
}

// ✅ Gestion propre des arrêts
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

startServer();

module.exports = app;
