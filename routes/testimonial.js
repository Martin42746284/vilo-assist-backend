const express = require('express');
const router = express.Router();
const { Testimonial } = require('../models');
const { validationResult, body } = require('express-validator');

// Middleware de validation
const validateTestimonial = [
  body('name')
    .notEmpty().withMessage('Le nom est requis')
    .isLength({ min: 2, max: 100 }).withMessage('Le nom doit comporter entre 2 et 100 caractères'),
  body('comment')
    .notEmpty().withMessage('Le commentaire est requis'),
  body('rating')
    .isInt({ min: 1, max: 5 }).withMessage('La note doit être entre 1 et 5')
];

// ➕ POST /api/testimonials - Créer un témoignage
router.post('/', validateTestimonial, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { name, comment, rating, date } = req.body;

    const testimonial = await Testimonial.create({ name, comment, rating, date });

    res.status(201).json({
      success: true,
      message: 'Témoignage créé avec succès.',
      data: testimonial
    });
  } catch (error) {
    console.error('Erreur création témoignage:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la création du témoignage.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// 📃 GET /api/testimonials - Liste paginée
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows } = await Testimonial.findAndCountAll({
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Erreur récupération témoignages:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des témoignages.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// 🔍 GET /api/testimonials/:id - Détail d’un témoignage
router.get('/:id', async (req, res) => {
  try {
    const testimonial = await Testimonial.findByPk(req.params.id);

    if (!testimonial) {
      return res.status(404).json({ success: false, message: 'Témoignage non trouvé' });
    }

    res.json({ success: true, data: testimonial });
  } catch (error) {
    console.error('Erreur récupération témoignage:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ✏️ PUT /api/testimonials/:id - Modifier un témoignage
router.put('/:id', validateTestimonial, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const testimonial = await Testimonial.findByPk(req.params.id);
    if (!testimonial) {
      return res.status(404).json({ success: false, message: 'Témoignage non trouvé' });
    }

    const { name, comment, rating, date } = req.body;
    await testimonial.update({ name, comment, rating, date });

    res.json({
      success: true,
      message: 'Témoignage mis à jour avec succès',
      data: testimonial
    });
  } catch (error) {
    console.error('Erreur mise à jour témoignage:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// 🗑️ DELETE /api/testimonials/:id - Supprimer un témoignage
router.delete('/:id', async (req, res) => {
  try {
    const testimonial = await Testimonial.findByPk(req.params.id);
    if (!testimonial) {
      return res.status(404).json({ success: false, message: 'Témoignage non trouvé' });
    }

    await testimonial.destroy();

    res.json({
      success: true,
      message: 'Témoignage supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur suppression témoignage:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
