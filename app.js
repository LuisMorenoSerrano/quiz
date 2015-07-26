// Importar módulos externos
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var partials = require('express-partials');
var methodOverride = require('method-override');
var session = require('express-session');

var routes = require('./routes/index');

// Definir aplicación
var app = express();

// Definir propiedades globales de la aplicación
app.locals.title  = 'My Quiz';
app.locals.author = 'Luis Moreno';

// Configurar motor de vistas
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Asociar middlewares a la aplicación
app.use(partials());

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser('My Quiz 2015'));
app.use(session());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

// Gestión de la sesión
app.use(function(req, res, next) {
  var oldTransStart, newTransStart, offsetTrans;

  // Control sobre todas las rutas excepto "/login"
  if (!req.path.match(/\/login/)) {
    // Almacenar ruta previa a la acción "login" / "logout" para redirección
    req.session.redir = req.path;

    // Control de timeout de sesión activa (usuario autenticado)
    if (req.session.user) {
      oldTransStart = (req.session.lastTransStart || Date.now());
      newTransStart = Date.now();
      offsetTrans   = (newTransStart - oldTransStart) / 1000.0;  // Segundos

      // Control sesión si han transcurrido más de 2 minutos desde última transacción
      if (offsetTrans <= 120.0) {
        // Actualizar timestamp en sesión
        req.session.lastTransStart = newTransStart;
      } else {
        // Destruir sesión si se sobrepasa timeout y redirigir a ruta anterior
        delete req.session.user;
        delete req.session.lastTransStart;

        res.redirect(req.session.redir.toString());

        return;
      }
    }
  }

  // Hacer visible la sesión a las vistas
  res.locals.session = req.session;

  next();
});

// Dirigir peticiones a través del enrutador
app.use('/', routes);

// Capturar Error 404 y redirigir al manejador de errores
app.use(function(req, res, next) {
  var err = new Error('Not Found');

  err.status = 404;
  next(err);
});

//
// Manejador de errores
//

// Manejador de errores (Desarrollo): Mostrar pila de errores completa
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', { message: err.message, error: err, errors: [] });
  });
}

// Manejador de errores (Producción): Mostrar sólo mensaje de error
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', { message: err.message, error: {}, errors: [] });
});

// Exportar aplicación
module.exports = app;