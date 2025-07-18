const Testimonial = require('../models/Testimonial');
const { validationResult } = require('express-validator');

// Obtenir tous les témoignages (optionnel : uniquement approuvés)
exports.getTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.findAll({
      order: [['createdAt', 'DESC']]
    });

    res.json({ success: true, data: testimonials });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// Créer un nouveau témoignage
exports.createTestimonial = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { nom, post, Entreprise, comment, rating, date } = req.body;

    const testimonial = await Testimonial.create({
      nom,
      post,
      Entreprise,
      comment,
      rating,
      date
    });

    res.status(201).json({ success: true, data: testimonial });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// Mettre à jour l’approbation d’un témoignage
exports.approveTestimonial = async (req, res) => {
  try {
    const { isApproved } = req.body;
    const testimonial = await Testimonial.findByPk(req.params.id);

    if (!testimonial) {
      return res.status(404).json({ success: false, message: 'Témoignage non trouvé' });
    }

    testimonial.isApproved = isApproved;
    await testimonial.save();

    res.json({ success: true, data: testimonial });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// Supprimer un témoignage
exports.deleteTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.findByPk(req.params.id);

    if (!testimonial) {
      return res.status(404).json({ success: false, message: 'Témoignage non trouvé' });
    }

    await testimonial.destroy();
    res.json({ success: true, message: 'Témoignage supprimé' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};


