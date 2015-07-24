// Definición del modelo tabla: Comment
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Comment', {
    texto: {
      type: DataTypes.STRING,
      validate: { notEmpty: { msg: '\u21E8 Falta Comentario' }}
    }
  });
}