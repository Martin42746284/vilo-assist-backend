const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { Testimonial } = require('../models');
// 📁 Configuration Multer (enregistre dans /uploads)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // ce dossier doit exister
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

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


// ✅ Middleware de validation (sans `photo`)
const validateTestimonial = [
  body('name').notEmpty().withMessage('Nom requis'),
  body('post').notEmpty().withMessage('Post requis'),
  body('entreprise').notEmpty().withMessage('Entreprise requise'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Note invalide'),
  body('comment').notEmpty().withMessage('Commentaire requis'),
];

// ✅ POST new testimonial (avec photo)
router.post('/', upload.single('photo'), async (req, res) => {
  try {
    const { name, post, entreprise, rating, comment } = req.body;

    const newTestimonial = await Testimonial.create({
      name,
      post,
      entreprise,
      rating,
      comment,
      photo: req.file ? req.file.filename : null
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
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Approve testimonial
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

// Publish testimonial
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
