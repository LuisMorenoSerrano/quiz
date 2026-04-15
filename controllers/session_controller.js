var MAX_FAILED_LOGIN_ATTEMPTS = 5;
var BLOCK_WINDOW_MS = 10 * 60 * 1000;
var loginFailures = new Map();

function getLoginFailureState(ip) {
  var now = Date.now();
  var state = loginFailures.get(ip);

  if (!state) {
    state = { fails: 0, blockedUntil: 0 };
    loginFailures.set(ip, state);
  }

  if (state.blockedUntil && state.blockedUntil <= now) {
    state.fails = 0;
    state.blockedUntil = 0;
  }

  return state;
}

// Autorización de acceso restringido por HTTP
exports.loginRequired = (req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    res.redirect('/login');
  }
};

// GET /login
exports.new = (req, res) => {
  var errors = req.session.errors || {};

  req.session.errors = {};
  res.render('sessions/new.ejs', { errors: errors });
};

// POST /login
exports.create = (req, res) => {
  var login          = req.body.login;
  var password       = req.body.password;
  var ip             = req.ip || 'unknown';
  var failState      = getLoginFailureState(ip);
  var now            = Date.now();
  var userController = require('./user_controller');

  if (failState.blockedUntil && failState.blockedUntil > now) {
    req.session.errors = [
      { message: '\u21E8 Demasiados intentos fallidos. Reintente en unos minutos.' }
    ];
    res.redirect('/login');

    return;
  }

  userController.autenticar(login, password, (error, user) => {
    // Si hay error devolver mensaje de error de sesión
    if (error) {
      failState.fails += 1;
      if (failState.fails >= MAX_FAILED_LOGIN_ATTEMPTS) {
        failState.blockedUntil = now + BLOCK_WINDOW_MS;
      }

      req.session.errors = [ { message: `${error}` } ];
      res.redirect('/login');

      return;
    }

    loginFailures.delete(ip);

    // Crear sesión de usuario y redirigir a ruta anterior al login
    req.session.user = { id: user.id, username: user.username };
    res.redirect((req.session.redir || '/').toString());
  });
};

// DELETE /login
exports.destroy = (req, res) => {
  // Eliminar sesión de usuario y redirigir a ruta anterior
  delete req.session.user;
  res.redirect((req.session.redir || '/').toString());
};