// Importar módulos externos
var path = require('path');
var Sequelize = require('sequelize');

// Definir parámetros de cadena de conexión a la BB.DD.
//
// PostgreSQL: DATABASE_URL = postgres://user:passwd@host:port/database
// SQLite....: DATABASE_URL = sqlite://:@:/
var url = process.env.DATABASE_URL.match(/(.*)\:\/\/(.*?)\:(.*)@(.*)\:(.*)\/(.*)/);
var dialect  = (url[1] || null);
var protocol = (url[1] || null);
var user     = (url[2] || null);
var pwd      = (url[3] || null);
var host     = (url[4] || null);
var port     = (url[5] || null);
var dbname   = (url[6] || null);
var storage  = process.env.DATABASE_STORAGE;

// Definir cadena de conexión a BB.DD. (SQLite o PostgreSQL)
var sequelize = new Sequelize(dbname, user, pwd, {
  host:     host,
  port:     port,
  dialect:  dialect,
  protocol: protocol,
  storage:  storage,    // Exclusivo de SQLite
  omitNull: true        // Exclusivo de PostgreSQL
});

// Importar definición tabla Quiz y exportar
var Quiz = sequelize.import(path.join(__dirname, 'quiz'));

exports.Quiz = Quiz;

// Inicializar la BB.DD.
sequelize.sync().then(function() {
  // Inicializar tabla Quiz -si está vacía-
  Quiz.count().then(function(count) {
    if (count === 0) {
      Quiz.create({
        pregunta:  '¿Cuál es la capital de Italia?',
        respuesta: 'Roma'
      });
      Quiz.create({
        pregunta:  '¿Cuál es la capital de Portugal?',
        respuesta: 'Lisboa'
      }).then(function() {
        console.log('Base de Datos "Quiz" inicializada');
      });
    }
  });
});