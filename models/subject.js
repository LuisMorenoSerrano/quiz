const { Model } = require('sequelize');

class Subject extends Model {}

module.exports = (sequelize, DataTypes) => {
  Subject.init({
    tema: {
      type: DataTypes.STRING,
      validate: { notEmpty: { msg: '\u21E8 Falta Tema' } }
    }
  }, {
    sequelize,
    modelName: 'Subject',
    tableName: 'Subjects'
  });

  return Subject;
};