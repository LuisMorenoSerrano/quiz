// Importar módulos externos
var path = require('path');
var Sequelize = require('sequelize');

// Usar BB.DD. SQLite
var sequelize = new Sequelize(null, null, null,
  { dialect: 'sqlite', storage: 'quiz.sqlite' }
  );

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
      }).then(function() {
        console.log('Base de Datos "Quiz" inicializada');
      });
    }
  });
});