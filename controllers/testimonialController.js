const { Testimonial } = require('../models');
const { validationResult, body } = require('express-validator');

// ✅ Middleware de validation pour création de témoignage
exports.validateTestimonial = [
  body('name')
    .notEmpty().withMessage('Le nom est requis')
    .isLength({ min: 2, max: 100 }).withMessage('Le nom doit contenir entre 2 et 100 caractères'),

  body('role')
    .notEmpty().withMessage('Le poste est requis'),

  body('company')
    .notEmpty().withMessage('Le nom de l’entreprise est requis'),

  body('content')
    .notEmpty().withMessage('Le commentaire est requis')
    .isLength({ max: 1000 }).withMessage('Le commentaire ne doit pas dépasser 1000 caractères'),

  body('rating')
    .notEmpty().withMessage('La note est requise')
    .isInt({ min: 1, max: 5 }).withMessage('La note doit être comprise entre 1 et 5'),

  body('photoUrl')
    .optional()
    .isURL().withMessage('L’URL de la photo est invalide'),

  body('bgImage')
    .optional()
    .isURL().withMessage('L’URL de l’image de fond est invalide')
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
    const { name, role, company, content, rating, photoUrl, bgImage } = req.body;

    const testimonial = await Testimonial.create({
      name,
      role,
      company,
      content,
      rating,
      photoUrl,
      bgImage
    });

    res.status(201).json({ success: true, data: testimonial });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
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
