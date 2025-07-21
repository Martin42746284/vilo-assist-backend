const express = require('express');
const router = express.Router();
const { Testimonial } = require('../models');

// GET all testimonials
router.get('/', async (req, res) => {
  try {
    const testimonials = await Testimonial.findAll({ order: [['createdAt', 'DESC']] });

    const formatted = testimonials.map(t => ({
      id: t.id,
      name: t.name,
      post: t.post,
      entreprise: t.entreprise,
      rating: t.rating,
      comment: t.comment,
      photoUrl: t.photo ? `${process.env.BASE_URL}/uploads/${t.photo}` : null,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt
    }));

    res.json({ success: true, testimonials: formatted });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});


// POST new
router.post('/', async (req, res) => {
  try {
    const testimonial = await Testimonial.create(req.body);
    res.status(201).json({ success: true, testimonial });
  } catch (err) {
    res.status(400).json({ success: false, message: 'Erreur de validation', error: err.message });
  }
});

// DELETE one
router.delete('/:id', async (req, res) => {
  try {
    const testimonial = await Testimonial.findByPk(req.params.id);
    if (!testimonial) {
      return res.status(404).json({ success: false, message: 'Témoignage introuvable' });
    }
    await testimonial.destroy();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

router.put('/:id/approve', async (req, res) => {
  try {
    const { approved } = req.body;
    const testimonial = await Testimonial.findByPk(req.params.id);
    if (!testimonial) return res.status(404).json({ success: false, message: "Non trouvé" });

    testimonial.approved = approved;
    await testimonial.save();

    res.json({ success: true, testimonial });
  } catch (err) {
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

router.put('/:id/publish', async (req, res) => {
  try {
    const { published } = req.body;
    const testimonial = await Testimonial.findByPk(req.params.id);
    if (!testimonial) return res.status(404).json({ success: false, message: "Non trouvé" });

    testimonial.published = published;
    await testimonial.save();

    res.json({ success: true, testimonial });
  } catch (err) {
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});


module.exports = router;
