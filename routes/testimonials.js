const express = require('express');
const router = express.Router();
const { Testimonial } = require('../models');
const { validationResult } = require('express-validator');

// POST /api/testimonials - Créer un nouveau témoignage
router.post('/', async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { name, role, company, content, rating } = req.body;

    if (!name || !role || !company || !content || !rating) {
      return res.status(400).json({
        success: false,
        message: 'Tous les champs sont obligatoires.'
      });
    }

    const newTestimonial = await Testimonial.create({
      name,
      role,
      company,
      content,
      rating,
      status: 'pending'
    });

    res.status(201).json({
      success: true,
      data: newTestimonial,
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
});

// GET /api/testimonials/:id - Récupérer un témoignage spécifique
router.get('/:id', async (req, res) => {
  try {
    const testimonial = await Testimonial.findByPk(req.params.id, {
      attributes: ['id', 'name', 'role', 'company', 'content', 'rating', 'status', 'createdAt']
    });

    if (!testimonial) {
      return res.status(404).json({ success: false, message: 'Témoignage non trouvé' });
    }

    if (testimonial.status !== 'approved' && !req.user?.isAdmin) {
      return res.status(403).json({ 
        success: false, 
        message: 'Accès non autorisé à ce témoignage' 
      });
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

// PUT /api/testimonials/:id - Mettre à jour un témoignage
router.put('/:id', async (req, res) => {
  try {
    const testimonial = await Testimonial.findByPk(req.params.id);

    if (!testimonial) {
      return res.status(404).json({ success: false, message: 'Témoignage non trouvé' });
    }

    const { name, role, company, content, rating, status } = req.body;

    const updates = {};
    if (name) updates.name = name;
    if (role) updates.role = role;
    if (company) updates.company = company;
    if (content) updates.content = content;
    if (rating) updates.rating = rating;
    if (status) updates.status = status;

    await testimonial.update(updates);

    res.json({
      success: true,
      data: testimonial,
      message: 'Témoignage mis à jour avec succès'
    });

  } catch (error) {
    console.error('Erreur mise à jour témoignage:', error);
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Erreur de validation',
        errors: error.errors.map(e => e.message)
      });
    }

    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// DELETE /api/testimonials/:id - Supprimer un témoignage
router.delete('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);

  if (isNaN(id)) {
    return res.status(400).json({
      success: false,
      message: 'ID invalide'
    });
  }

  try {
    const testimonial = await Testimonial.findByPk(id);

    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: 'Témoignage non trouvé'
      });
    }

    await testimonial.destroy();

    res.json({
      success: true,
      message: 'Témoignage supprimé avec succès'
    });

  } catch (error) {
    console.error('Erreur suppression témoignage:', error);
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({
        success: false,
        message: 'Impossible de supprimer ce témoignage car il est lié à d\'autres données'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la suppression',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/testimonials - Lister les témoignages approuvés
router.get('/', async (req, res) => {
  try {
    const testimonials = await Testimonial.findAll({
      where: { status: 'approved' },
      order: [['createdAt', 'DESC']],
      attributes: ['id', 'name', 'role', 'company', 'content', 'rating', 'createdAt']
    });

    res.json({ 
      success: true, 
      data: testimonials,
      count: testimonials.length
    });

  } catch (error) {
    console.error('Erreur récupération témoignages:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;