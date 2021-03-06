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

// Importar definiciones de tablas del modelo
var Quiz    = sequelize.import(path.join(__dirname, 'quiz'));
var Subject = sequelize.import(path.join(__dirname, 'subject'));
var Comment = sequelize.import(path.join(__dirname, 'comment'));

// Definir relaciones entre tablas del modelo
Quiz.belongsTo(Subject, { foreignKey: 'id_tema' });
Subject.hasMany(Quiz, { foreignKey: 'id_tema' });

Comment.belongsTo(Quiz, { foreignKey: 'id_quiz', onDelete: 'cascade' });
Quiz.hasMany(Comment, { foreignKey: 'id_quiz' });

// Exportar elementos del modelo
exports.DBDialect = dialect;
exports.Quiz      = Quiz;
exports.Subject   = Subject;
exports.Comment   = Comment;

// Inicializar la BB.DD.
sequelize.sync().then(function() {
  // Inicializar tabla Subject -si está vacía-
  Subject.count().then(function(count) {
    if (count === 0) {
      Subject.create({ tema: 'Sin Asignar' });
      Subject.create({ tema: 'Humanidades' });
      Subject.create({ tema: 'Ocio' });
      Subject.create({ tema: 'Ciencia' });
      Subject.create({ tema: 'Tecnología' });
      Subject.create({ tema: 'Otros' }).then(function() {
        console.log('Tabla "Subject" inicializada!');
      });
    }
  });

  // Inicializar tabla Quiz -si está vacía-
  Quiz.count().then(function(count) {
    if (count === 0) {
      Quiz.create({
        pregunta:  '¿Cuál es la capital de Italia?',
        respuesta: 'Roma',
        id_tema:   2
      });

      Quiz.create({
        pregunta:  '¿Cuál es la capital de Portugal?',
        respuesta: 'Lisboa',
        id_tema:   2
      }).then(function() {
        console.log('Tabla "Quiz" inicializada!');
      });
    }
  });
});