const express = require('express');
const router = express.Router();
const { Testimonial } = require('../models');
const { validationResult, body } = require('express-validator');

// Middleware de validation
const validateTestimonial = [
  body('name')
    .notEmpty().withMessage('Le nom est requis')
    .isLength({ min: 2, max: 100 }).withMessage('Le nom doit contenir entre 2 et 100 caractères.'),
  body('position')
    .notEmpty().withMessage('Le poste est requis'),
  body('company')
    .notEmpty().withMessage('L\'entreprise est requise'),
  body('rating')
    .notEmpty().withMessage('La note est requise')
    .isInt({ min: 1, max: 5 }).withMessage('La note doit être entre 1 et 5'),
  body('comment')
    .notEmpty().withMessage('Le commentaire est requis')
    .isLength({ min: 10 }).withMessage('Le commentaire doit contenir au moins 10 caractères.')
];

// POST /api/testimonials - Créer un nouveau témoignage
router.post('/', validateTestimonial, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { name, position, company, rating, comment, photo_url } = req.body;

    const newTestimonial = await Testimonial.create({
      name,
      position,
      company,
      rating,
      comment,
      photo_url
    });

    res.status(201).json({
      success: true,
      data: newTestimonial,
      message: 'Témoignage créé avec succès.'
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

// GET /api/testimonials/:id
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
      message: 'Erreur serveur',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// PUT /api/testimonials/:id
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

    const { name, position, company, rating, comment, photo_url } = req.body;

    await testimonial.update({ name, position, company, rating, comment, photo_url });

    res.json({
      success: true,
      data: testimonial,
      message: 'Témoignage mis à jour avec succès.'
    });

  } catch (error) {
    console.error('Erreur mise à jour témoignage:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// DELETE /api/testimonials/:id
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
      message: 'Erreur serveur lors de la suppression',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
