const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Testimonial = sequelize.define('Testimonial', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    post: { // ou "position"
      type: DataTypes.STRING,
      allowNull: false
    },
    entreprise: { // ou "company"
      type: DataTypes.STRING,
      allowNull: false
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5
      }
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    photo: {
      type: DataTypes.STRING, // URL ou nom du fichier
      allowNull: true
    }
  }, {
    timestamps: true
  });

  return Testimonial;
};
