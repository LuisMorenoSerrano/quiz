const { Model } = require('sequelize');

class Quiz extends Model {}

module.exports = (sequelize, DataTypes) => {
  Quiz.init({
    pregunta: {
      type: DataTypes.STRING,
      validate: { notEmpty: { msg: '\u21E8 Falta Pregunta' } }
    },
    respuesta: {
      type: DataTypes.STRING,
      validate: { notEmpty: { msg: '\u21E8 Falta Respuesta' } }
    }
  }, {
    sequelize,
    modelName: 'Quiz',
    tableName: 'Quizzes'
  });

  return Quiz;
};