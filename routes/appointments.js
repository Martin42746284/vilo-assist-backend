const express = require('express');
const router = express.Router();
const { Appointment, Contact } = require('../models');
const { validationResult } = require('express-validator');

// POST /api/appointments - Créer un nouveau rendez-vous
router.post('/', async (req, res) => {
  // Validation des données
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      errors: errors.array() 
    });
  }

  try {
    const { client_name, client_email, date, time, service, message } = req.body;

    // Validation manuelle des champs obligatoires
    if (!client_name || !client_email || !date || !time || !service) {
      return res.status(400).json({
        success: false,
        message: 'Les champs client_name, client_email, date, time et service sont obligatoires.'
      });
    }

    // Création du contact (si message existe)
    if (message) {
      await Contact.create({
        name: client_name,
        email: client_email,
        service,
        message
      });
    }

    // Création du rendez-vous
    const newAppointment = await Appointment.create({
      client_name,  // Correspond au modèle
      client_email,
      date,
      time,
      service,
      status: 'en_attente'  // Correspond à votre ENUM
    });

    res.status(201).json({
      success: true,
      data: newAppointment,
      message: 'Rendez-vous créé avec succès.'
    });

  } catch (error) {
    console.error('Erreur création rendez-vous:', error);
    
    // Gestion des erreurs spécifiques
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors.map(e => e.message)
      });
    }

    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la création du rendez-vous.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/appointments/:id - Récupérer un rendez-vous spécifique
router.get('/:id', async (req, res) => {
  try {
    const appointment = await Appointment.findByPk(req.params.id, {
      attributes: ['id', 'client_name', 'client_email', 'date', 'time', 'service', 'status', 'createdAt']
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Rendez-vous non trouvé'
      });
    }

    res.json({ 
      success: true, 
      data: appointment 
    });

  } catch (error) {
    console.error('Erreur récupération rendez-vous:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// PUT /api/appointments/:id - Mettre à jour un rendez-vous
router.put('/:id', async (req, res) => {
  try {
    const appointment = await Appointment.findByPk(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Rendez-vous non trouvé'
      });
    }

    // Ne permet que la mise à jour des champs autorisés
    const { status } = req.body;
    const allowedUpdates = { status };

    await appointment.update(allowedUpdates);

    res.json({
      success: true,
      data: appointment,
      message: 'Rendez-vous mis à jour avec succès'
    });

  } catch (error) {
    console.error('Erreur mise à jour rendez-vous:', error);
    
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
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

// DELETE /api/appointments/:id - Supprimer un rendez-vous
router.delete('/:id', async (req, res) => {
  try {
    const appointment = await Appointment.findByPk(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Rendez-vous non trouvé'
      });
    }

    // Vérification si le rendez-vous peut être supprimé (optionnel)
    if (appointment.status === 'confirmé') {
      return res.status(400).json({
        success: false,
        message: 'Impossible de supprimer un rendez-vous confirmé. Veuillez d\'abord l\'annuler.'
      });
    }

    await appointment.destroy();

    res.json({
      success: true,
      message: 'Rendez-vous supprimé avec succès'
    });

  } catch (error) {
    console.error('Erreur suppression rendez-vous:', error);
    
    // Gestion des erreurs spécifiques
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({
        success: false,
        message: 'Impossible de supprimer ce rendez-vous car il est lié à d\'autres données'
      });
    }

    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur lors de la suppression',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;