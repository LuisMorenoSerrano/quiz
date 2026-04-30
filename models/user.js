const { Model } = require('sequelize');

class User extends Model {}

module.exports = (sequelize, DataTypes) => {
  User.init({
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: { msg: '\u21E8 Missing Username' }
      }
    },
    salt: {
      type: DataTypes.STRING(32),
      allowNull: false,
      validate: {
        notEmpty: { msg: '\u21E8 Missing Salt' }
      }
    },
    passwordHash: {
      type: DataTypes.STRING(128),
      allowNull: false,
      validate: {
        notEmpty: { msg: '\u21E8 Missing Password Hash' }
      }
    }
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'Users'
  });

  return User;
};