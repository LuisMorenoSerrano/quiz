var crypto = require('node:crypto');
var models = require('../models/models.js');

function hashPassword(password, salt) {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

function compareHashSafe(a, b) {
  var aBuffer = Buffer.from(a, 'hex');
  var bBuffer = Buffer.from(b, 'hex');

  if (aBuffer.length !== bBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(aBuffer, bBuffer);
}

// Comprobar credenciales del usuario
exports.autenticar = (login, password, callback) => {
  models.User.findOne({ where: { username: login } }).then((user) => {
    var inputHash = null;

    if (user) {
      inputHash = hashPassword((password || ''), user.salt);

      if (compareHashSafe(inputHash, user.passwordHash)) {
        callback(null, { id: user.id, username: user.username });
      } else {
        callback(new Error('\u21E8 Password erróneo'));
      }
    } else {
      callback(new Error('\u21E8 No existe el usuario'));
    }
  }).catch((error) => {
    callback(error);
  });
};