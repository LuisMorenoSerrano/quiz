const { Model } = require('sequelize');

class Comment extends Model {}

module.exports = (sequelize, DataTypes) => {
  Comment.init({
    texto: {
      type: DataTypes.STRING,
      validate: { notEmpty: { msg: '\u21E8 Falta Comentario' } }
    },
    publicado: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    sequelize,
    modelName: 'Comment',
    tableName: 'Comments'
  });

  return Comment;
};