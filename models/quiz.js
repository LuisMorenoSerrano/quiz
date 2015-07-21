// Definición del modelo tabla: Quiz
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Quiz', {
    pregunta: {
      type: DataTypes.STRING,
      validate: { notEmpty: { msg: '\u21E8 Falta Pregunta' }}
    },
    respuesta: {
      type: DataTypes.STRING,
      validate: { notEmpty: { msg: '\u21E8 Falta Respuesta' }}
    }
  });
}