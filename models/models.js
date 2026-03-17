// Importar módulos externos
var path = require('node:path');
var Sequelize = require('sequelize');

// Definir parámetros de conexión con un fallback local para SQLite.
//
// PostgreSQL: DATABASE_URL = postgres://user:passwd@host:port/database
// SQLite....: DATABASE_URL = sqlite://:@:/
var databaseUrl = process.env.DATABASE_URL || 'sqlite://:@:/';
var storage     = process.env.DATABASE_STORAGE || 'quiz.sqlite';
var dialect     = null;
var sequelize   = null;

if (/^sqlite:/i.test(databaseUrl)) {
  dialect = 'sqlite';

  sequelize = new Sequelize({
    dialect: dialect,
    storage: storage,
    omitNull: true
  });
} else {
  const parsedUrl = new URL(databaseUrl);

  dialect = (parsedUrl.protocol || '').replace(':', '');

  sequelize = new Sequelize(databaseUrl, {
    dialect: dialect,
    protocol: dialect,
    omitNull: true
  });
}

// Importar definiciones de tablas del modelo
var QuizModel    = require(path.join(__dirname, 'quiz'));
var SubjectModel = require(path.join(__dirname, 'subject'));
var CommentModel = require(path.join(__dirname, 'comment'));

var Quiz    = QuizModel(sequelize, Sequelize.DataTypes);
var Subject = SubjectModel(sequelize, Sequelize.DataTypes);
var Comment = CommentModel(sequelize, Sequelize.DataTypes);

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
sequelize.sync().then(() => {
  // Inicializar tabla Subject -si está vacía-
  Subject.count().then((count) => {
    if (count === 0) {
      Subject.create({ tema: 'Sin Asignar' });
      Subject.create({ tema: 'Humanidades' });
      Subject.create({ tema: 'Ocio' });
      Subject.create({ tema: 'Ciencia' });
      Subject.create({ tema: 'Tecnología' });
      Subject.create({ tema: 'Otros' }).then(() => {
        console.log('Tabla "Subject" inicializada!');
      });
    }
  });

  // Inicializar tabla Quiz -si está vacía-
  Quiz.count().then((count) => {
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
      }).then(() => {
        console.log('Tabla "Quiz" inicializada!');
      });
    }
  });
});