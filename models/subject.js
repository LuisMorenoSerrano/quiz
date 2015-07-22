// Definición del modelo tabla: Subject
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Subject', {
    tema: {
      type: DataTypes.STRING,
      validate: { notEmpty: { msg: '\u21E8 Falta Tema' }}
    }
  });
}