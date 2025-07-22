const express = require('express');
const router = express.Router();
const { Testimonial } = require('../models');
const { body, validationResult } = require('express-validator');

// ✅ Validation pour créer un témoignage
const validateTestimonial = [
  body('name')
    .notEmpty().withMessage('Le nom est requis')
    .isLength({ min: 2, max: 100 }).withMessage('Le nom doit contenir entre 2 et 100 caractères'),

  body('role')
    .notEmpty().withMessage('Le poste est requis'),

  body('company')
    .notEmpty().withMessage('L’entreprise est requise'),

  body('content')
    .notEmpty().withMessage('Le commentaire est requis')
    .isLength({ min: 10, max: 1000 }).withMessage('Le commentaire doit contenir entre 10 et 1000 caractères'),

  body('rating')
    .notEmpty().withMessage('La note est requise')
    .isInt({ min: 1, max: 5 }).withMessage('La note doit être un entier entre 1 et 5'),

  body('photoUrl')
    .optional()
    .isURL().withMessage('L’URL de la photo n’est pas valide'),

  body('bgImage')
    .optional()
    .isURL().withMessage('L’URL de l’image de fond n’est pas valide')
];

// ✅ GET - Récupérer les témoignages publiés
router.get('/', async (req, res) => {
  try {
    const testimonials = await Testimonial.findAll({
      where: { published: true },
      order: [['createdAt', 'DESC']]
    });

    res.json({ success: true, testimonials });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// ✅ POST - Créer un nouveau témoignage
router.post('/', validateTestimonial, async (req, res) => {
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

    res.status(201).json({ success: true, testimonial: newTestimonial });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// ✅ DELETE - Supprimer un témoignage
router.delete('/:id', async (req, res) => {
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
});

// ✅ PUT - Approuver un témoignage
router.put('/:id/approve', async (req, res) => {
  try {
    const { approved } = req.body;
    const testimonial = await Testimonial.findByPk(req.params.id);

    if (!testimonial) {
      return res.status(404).json({ success: false, message: 'Témoignage introuvable' });
    }

    testimonial.approved = !!approved;
    await testimonial.save();

    res.json({ success: true, testimonial });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// ✅ PUT - Publier un témoignage
router.put('/:id/publish', async (req, res) => {
  try {
    const { published } = req.body;
    const testimonial = await Testimonial.findByPk(req.params.id);

    if (!testimonial) {
      return res.status(404).json({ success: false, message: 'Témoignage introuvable' });
    }

    testimonial.published = !!published;
    await testimonial.save();

    res.json({ success: true, testimonial });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

module.exports = router;
