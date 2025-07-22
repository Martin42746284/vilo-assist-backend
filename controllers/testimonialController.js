const { Testimonial } = require('../models');
const { validationResult } = require('express-validator');

// GET - Récupérer tous les témoignages
exports.getTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.findAll({
      order: [['createdAt', 'DESC']],
    });
    res.json({ success: true, data: testimonials });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// POST - Créer un nouveau témoignage (sans image)
exports.createTestimonial = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { name, post, entreprise, rating, comment } = req.body;

    const testimonial = await Testimonial.create({
      name,
      post,
      entreprise,
      rating,
      comment,
    });

    res.status(201).json({ success: true, data: testimonial });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// DELETE - Supprimer un témoignage
exports.deleteTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.findByPk(req.params.id);

    if (!testimonial) {
      return res.status(404).json({ success: false, message: 'Témoignage introuvable' });
    }

    await testimonial.destroy();
    res.json({ success: true, message: 'Témoignage supprimé' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};
