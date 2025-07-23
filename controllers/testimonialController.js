const { Testimonial } = require('../models');
const { validationResult, body } = require('express-validator');

// ✅ Middleware de validation pour création de témoignage
exports.validateTestimonial = [
  body('name')
    .notEmpty().withMessage('Le nom est requis')
    .isLength({ min: 2, max: 100 }).withMessage('Le nom doit contenir entre 2 et 100 caractères'),

  body('post')
    .notEmpty().withMessage('Le poste est requis'),

  body('entreprise')
    .notEmpty().withMessage('Le nom de l’entreprise est requis'),

  body('comment')
    .notEmpty().withMessage('Le commentaire est requis')
    .isLength({ max: 1000 }).withMessage('Le commentaire ne doit pas dépasser 1000 caractères'),

  body('rating')
    .notEmpty().withMessage('La note est requise')
    .isInt({ min: 1, max: 5 }).withMessage('La note doit être comprise entre 1 et 5')
];

// ✅ GET - Récupérer tous les témoignages
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

// ✅ POST - Créer un nouveau témoignage
exports.createTestimonial = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { name, post, entreprise, comment, rating } = req.body;

    if (!name || !post || !entreprise || !comment || !rating) {
      return res.status(400).json({
        success: false,
        message: 'Tous les champs sont obligatoires.'
      });
    }

    const testimonial = await Testimonial.create({
      name,
      post,
      entreprise,
      comment,
      rating,
      status: 'pending'
    });

    res.status(201).json({
      success: true,
      data: testimonial,
      message: 'Témoignage soumis avec succès. Il sera publié après modération.'
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
};

// ✅ DELETE - Supprimer un témoignage
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
