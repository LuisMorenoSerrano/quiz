// Autorización de acceso restringido por HTTP
exports.loginRequired = function(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    res.redirect('/login');
  }
};

// GET /login
exports.new = function(req, res) {
  var errors = req.session.errors || {};

  req.session.errors = {};
  res.render('sessions/new.ejs', { errors: errors });
};

// POST /login
exports.create = function(req, res) {
  var login          = req.body.login;
  var password       = req.body.password;
  var userController = require('./user_controller');

  userController.autenticar(login, password, function(error, user) {
    // Si hay error devolver mensaje de error de sesión
    if (error) {
      req.session.errors = [ { message: '' + error } ];
      res.redirect('/login');

      return;
    }

    // Crear sesión de usuario y redirigir a ruta anterior al login
    req.session.user = { id: user.id, username: user.username };
    res.redirect(req.session.redir.toString());
  });
};

// DELETE /login
exports.destroy = function(req, res) {
  // Eliminar sesión de usuario y redirigir a ruta anterior
  delete req.session.user;
  res.redirect(req.session.redir.toString());
};