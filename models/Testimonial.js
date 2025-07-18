const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Testimonial = sequelize.define('Testimonial', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    nom: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Le nom est requis' },
        len: { args: [2, 100], msg: 'Le nom doit contenir entre 2 et 100 caractères' }
      }
    },
    post: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Le poste est requis' },
        len: { args: [2, 100], msg: 'Le poste doit contenir entre 2 et 100 caractères' }
      }
    },
    Entreprise: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Le nom de l\'entreprise est requis' },
        len: { args: [2, 150], msg: 'Le nom de l\'entreprise doit contenir entre 2 et 150 caractères' }
      }
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Le commentaire est requis' },
        len: { args: [10, 1000], msg: 'Le commentaire doit contenir entre 10 et 1000 caractères' }
      }
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: { args: [1], msg: 'La note doit être au minimum de 1' },
        max: { args: [5], msg: 'La note doit être au maximum de 5' }
      }
    },
    date: {
      type: DataTypes.DATEONLY,
      defaultValue: DataTypes.NOW
    },
    isApproved: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Indique si le témoignage a été approuvé par un administrateur'
    }
  }, {
    tableName: 'testimonials',
    timestamps: true,
    indexes: [
      {
        fields: ['isApproved']
      },
      {
        fields: ['rating']
      },
      {
        fields: ['date']
      }
    ]
  });

  return Testimonial;
};