const { Testimonial } = require('../models');

// GET /admin/testimonials
exports.getTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.findAll({ 
      order: [['createdAt', 'DESC']] 
    });
    res.json(testimonials);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors du chargement des témoignages" });
  }
};

// GET /api/testimonials/approved - Pour afficher les témoignages approuvés sur le site
exports.getApprovedTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.findAll({ 
      where: { isApproved: true },
      order: [['createdAt', 'DESC']] 
    });
    res.json(testimonials);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors du chargement des témoignages" });
  }
};

// POST /api/testimonials - Créer un nouveau témoignage
exports.createTestimonial = async (req, res) => {
  try {
    const { nom, post, Entreprise, comment, rating } = req.body;

    // Validation des données
    if (!nom || !post || !Entreprise || !comment || !rating) {
      return res.status(400).json({ 
        message: "Tous les champs sont requis" 
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ 
        message: "La note doit être comprise entre 1 et 5" 
      });
    }

    const testimonial = await Testimonial.create({
      nom,
      post,
      Entreprise,
      comment,
      rating,
      isApproved: false // Par défaut, non approuvé
    });

    res.status(201).json({
      success: true,
      message: "Témoignage créé avec succès. Il sera examiné avant publication.",
      testimonial
    });
  } catch (error) {
    console.error(error);
    
    // Gestion des erreurs de validation Sequelize
    if (error.name === 'SequelizeValidationError') {
      const validationErrors = error.errors.map(err => err.message);
      return res.status(400).json({
        message: "Erreur de validation",
        errors: validationErrors
      });
    }

    res.status(500).json({ 
      message: "Erreur lors de la création du témoignage" 
    });
  }
};

// PUT /admin/testimonials/:id - Mettre à jour le statut d'approbation
exports.updateTestimonialStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isApproved } = req.body;

    const testimonial = await Testimonial.findByPk(id);
    if (!testimonial) {
      return res.status(404).json({ message: 'Témoignage non trouvé' });
    }

    testimonial.isApproved = isApproved;
    await testimonial.save();

    res.json({ 
      success: true, 
      message: isApproved ? "Témoignage approuvé" : "Témoignage désapprouvé", 
      testimonial 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la mise à jour du témoignage" });
  }
};

// DELETE /admin/testimonials/:id - Supprimer un témoignage
exports.deleteTestimonial = async (req, res) => {
  try {
    const { id } = req.params;

    const testimonial = await Testimonial.findByPk(id);
    if (!testimonial) {
      return res.status(404).json({ message: 'Témoignage non trouvé' });
    }

    await testimonial.destroy();

    res.json({ 
      success: true, 
      message: "Témoignage supprimé avec succès" 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la suppression du témoignage" });
  }
};

// GET /admin/testimonials/stats - Statistiques des témoignages
exports.getTestimonialStats = async (req, res) => {
  try {
    const total = await Testimonial.count();
    const approved = await Testimonial.count({ where: { isApproved: true } });
    const pending = await Testimonial.count({ where: { isApproved: false } });
    
    // Statistiques par note
    const ratingStats = await Testimonial.findAll({
      attributes: [
        'rating',
        [require('sequelize').fn('COUNT', require('sequelize').col('rating')), 'count']
      ],
      where: { isApproved: true },
      group: ['rating'],
      order: [['rating', 'DESC']]
    });

    // Moyenne des notes
    const averageRating = await Testimonial.findOne({
      attributes: [
        [require('sequelize').fn('AVG', require('sequelize').col('rating')), 'average']
      ],
      where: { isApproved: true }
    });

    res.json({
      total,
      approved,
      pending,
      ratingStats,
      averageRating: parseFloat(averageRating?.dataValues?.average || 0).toFixed(1)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors du chargement des statistiques" });
  }
};