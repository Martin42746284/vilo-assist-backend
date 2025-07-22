const express = require('express');
const router = express.Router();
const { Testimonial } = require('../models');
const { validationResult } = require('express-validator');

// POST /api/testimonials - Créer un témoignage
router.post('/', async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const {
      name,
      role,
      company,
      content,
      rating,
      photoUrl,
      bgImage
    } = req.body;

    if (!name || !role || !company || !content || !rating) {
      return res.status(400).json({
        success: false,
        message: 'Les champs name, role, company, content et rating sont obligatoires.'
      });
    }

    const newTestimonial = await Testimonial.create({
      name,
      role,
      company,
      content,
      rating,
      photoUrl,
      bgImage,
      approved: false,
      published: false
    });

    res.status(201).json({
      success: true,
      data: newTestimonial,
      message: 'Témoignage créé avec succès.'
    });

  } catch (error) {
    console.error('Erreur création témoignage:', error);
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Erreur de validation',
        errors: error.errors.map(e => e.message)
      });
    }

    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la création du témoignage.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/testimonials/:id - Récupérer un témoignage
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

// PUT /api/testimonials/:id/approve - Met à jour le statut "approved"
router.put('/:id/approve', async (req, res) => {
  try {
    const testimonial = await Testimonial.findByPk(req.params.id);

    if (!testimonial) {
      return res.status(404).json({ success: false, message: 'Témoignage non trouvé' });
    }

    testimonial.approved = req.body.approved;
    await testimonial.save();

    res.json({
      success: true,
      data: testimonial,
      message: `Témoignage ${testimonial.approved ? 'approuvé' : 'désapprouvé'}`
    });

  } catch (error) {
    console.error('Erreur approbation témoignage:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// PUT /api/testimonials/:id/publish - Met à jour le statut "published"
router.put('/:id/publish', async (req, res) => {
  try {
    const testimonial = await Testimonial.findByPk(req.params.id);

    if (!testimonial) {
      return res.status(404).json({ success: false, message: 'Témoignage non trouvé' });
    }

    testimonial.published = req.body.published;
    await testimonial.save();

    res.json({
      success: true,
      data: testimonial,
      message: `Témoignage ${testimonial.published ? 'publié' : 'dépublié'}`
    });

  } catch (error) {
    console.error('Erreur publication témoignage:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// DELETE /api/testimonials/:id
router.delete('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  console.log(`🗑️ Suppression témoignage ID: ${id}`);

  if (isNaN(id)) {
    return res.status(400).json({ success: false, message: 'ID invalide' });
  }

  try {
    const testimonial = await Testimonial.findByPk(id);

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
