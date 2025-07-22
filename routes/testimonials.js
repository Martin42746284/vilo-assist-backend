const express = require('express');
const router = express.Router();
const { Testimonial } = require('../models');

// GET all testimonials
router.get('/', async (req, res) => {
  try {
    const testimonials = await Testimonial.findAll({
      order: [['createdAt', 'DESC']]
    });

    res.json({ success: true, testimonials });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// POST new testimonial (sans photo)
router.post('/', async (req, res) => {
  try {
    const { name, post, entreprise, rating, comment } = req.body;

    const newTestimonial = await Testimonial.create({
      name,
      post,
      entreprise,
      rating,
      comment
    });

    res.status(201).json({
      success: true,
      testimonial: newTestimonial
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// DELETE testimonial
router.delete('/:id', async (req, res) => {
  try {
    const testimonial = await Testimonial.findByPk(req.params.id);
    if (!testimonial) {
      return res.status(404).json({ success: false, message: 'Témoignage introuvable' });
    }

    await testimonial.destroy();
    res.json({ success: true, message: 'Témoignage supprimé' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// PUT - Approve testimonial
router.put('/:id/approve', async (req, res) => {
  try {
    const { approved } = req.body;
    const testimonial = await Testimonial.findByPk(req.params.id);

    if (!testimonial) {
      return res.status(404).json({ success: false, message: 'Témoignage introuvable' });
    }

    testimonial.approved = approved;
    await testimonial.save();

    res.json({ success: true, testimonial });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// PUT - Publish testimonial
router.put('/:id/publish', async (req, res) => {
  try {
    const { published } = req.body;
    const testimonial = await Testimonial.findByPk(req.params.id);

    if (!testimonial) {
      return res.status(404).json({ success: false, message: 'Témoignage introuvable' });
    }

    testimonial.published = published;
    await testimonial.save();

    res.json({ success: true, testimonial });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

module.exports = router;
