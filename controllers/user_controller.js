// Definición de usuarios válidos
var users = {
  admin: { id: 1, username: 'admin', password: '1234' },
  pepe:  { id: 2, username: 'pepe',  password: '5678' },
  luis:  { id: 3, username: 'luis',  password: '9012' }
};

// Comprobar credenciales del usuario
exports.autenticar = function(login, password, callback) {
  if (users[login]) {
    if (password === users[login].password) {
      callback(null, users[login]);
    } else {
      callback(new Error('\u21E8 Password erróneo'));
    };
  } else {
    callback(new Error('\u21E8 No existe el usuario'));
  };
};