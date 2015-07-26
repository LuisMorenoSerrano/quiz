// Importar módulos externos
var models = require('../models/models.js');
var async = require('async');

//
// Funciones de obtención de estadísticas
//

// Número Total de Preguntas
var getNumTotQuizzes = function(callback) {
  models.Quiz.count()
    .then(function(c)      { callback(null, c); });
//    .catch(function(error) { callback(null, 0); });
};

// Número Total de Comentarios
var getNumTotComments = function(callback) {
  models.Comment.count()
    .then(function(c)      { callback(null, c); });
//    .catch(function(error) { callback(null, 0); });
};

// Número de Preguntas con Comentarios
var getNumQuizWithComm = function(callback) {
  models.Quiz.count({
    distinct: true,
    include: [ { model: models.Comment, required: true } ] })
  .then(function(c)      { callback(null, c); });
//  .catch(function(error) { callback(null, 0); });
};

// Número de Preguntas sin Comentarios
var getNumQuizWithoutComm = function(callback) {
  models.Quiz.count({
    distinct: true,
    where:    [ '"Comments"."id" IS NULL' ],
    include:  [ { model: models.Comment, required: false } ] })
  .then(function(c)      { callback(null, c); });
//  .catch(function(error) { callback(null, 0); });
};

// Número Medio de Comentarios por Pregunta
function getNumAvgCommPerQuiz(results, callback) {
  if (results.numTotComments && results.numTotQuizzes && results.numTotQuizzes !== 0) {
    results.numAvgCommPerQuiz = (results.numTotComments / results.numTotQuizzes).toFixed(3);
  } else {
    results.numAvgCommPerQuiz = (0.0).toFixed(3);
  }

  callback(null, results);
};

// GET /quizes/statistics
exports.show = function(req, res) {
  // Calcular estadísticas independientes
  async.series({
    numTotQuizzes:      function(callback) { getNumTotQuizzes(callback);      },
    numTotComments:     function(callback) { getNumTotComments(callback);     },
    numQuizWithComm:    function(callback) { getNumQuizWithComm(callback);    },
    numQuizWithoutComm: function(callback) { getNumQuizWithoutComm(callback); }
  },
  function(err, results) {
    // Calcular estadísticas dependientes
    async.waterfall([
      function(callback) { getNumAvgCommPerQuiz(results, callback); }
    ],
    function(err, results) {
      // Mostrar estadísticas
      res.render('quizes/stats.ejs', { stats: results, errors: [] });
    });
  });
};