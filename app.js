// Importar módulos externos
var express = require('express');
var path = require('node:path');
var crypto = require('node:crypto');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var engine = require('ejs-mate');
var methodOverride = require('method-override');
var session = require('express-session');

var routes = require('./routes/index');

// Definir aplicación
var app = express();
var isProduction = (process.env.NODE_ENV === 'production');
var sessionSecret = process.env.SESSION_SECRET;

if (!sessionSecret) {
  sessionSecret = crypto.randomBytes(32).toString('hex');
  console.warn('SESSION_SECRET no definido. Usando uno temporal para esta ejecución.');
}

// Definir propiedades globales de la aplicación
app.locals.title  = 'My Quiz';
app.locals.author = 'Luis Moreno';

// Configurar motor de vistas
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.engine('ejs', engine);

// Asociar middlewares a la aplicación

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser('My Quiz 2015'));
app.use(session({
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProduction,
    maxAge: 30 * 60 * 1000
  }
}));

// Token CSRF simple almacenado en sesión para proteger peticiones de escritura.
app.use((req, res, next) => {
  if (!req.session.csrfToken) {
    req.session.csrfToken = crypto.randomBytes(24).toString('hex');
  }

  res.locals.csrfToken = req.session.csrfToken;
  next();
});

app.use(methodOverride('_method'));

app.use((req, _res, next) => {
  var isUnsafeMethod = ![ 'GET', 'HEAD', 'OPTIONS' ].includes(req.method);
  var csrfToken = null;

  if (!isUnsafeMethod) {
    next();
    return;
  }

  csrfToken = (req.body && req.body._csrf)
    || (req.query && req.query._csrf)
    || req.get('x-csrf-token');

  if (req.session && csrfToken && csrfToken === req.session.csrfToken) {
    next();
    return;
  }

  next(Object.assign(new Error('Invalid CSRF token'), { status: 403 }));
});

app.use(express.static(path.join(__dirname, 'public')));

// Gestión de la sesión
app.use((req, res, next) => {
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
app.use((_req, _res, next) => {
  var err = new Error('Not Found');

  err.status = 404;
  next(err);
});

//
// Manejador de errores
//

// Manejador de errores (Desarrollo): Mostrar pila de errores completa
if (app.get('env') === 'development') {
  app.use((err, _req, res, _next) => {
    res.status(err.status || 500);
    res.render('error', { message: err.message, error: err, errors: [] });
  });
}

// Manejador de errores (Producción): Mostrar sólo mensaje de error
app.use((err, _req, res, _next) => {
  res.status(err.status || 500);
  res.render('error', { message: err.message, error: {}, errors: [] });
});

// Exportar aplicación
module.exports = app;