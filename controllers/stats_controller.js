// Importar módulos externos
var models = require('../models/models.js');
var async = require('async');

//
// Funciones de obtención de estadísticas
//

// Número Total de Preguntas
var getNumTotQuizzes = (callback) => {
  models.Quiz.count()
    .then((c) => { callback(null, c); });
//    .catch(function(error) { callback(null, 0); });
};

// Número Total de Comentarios
var getNumTotComments = (callback) => {
  models.Comment.count()
    .then((c) => { callback(null, c); });
//    .catch(function(error) { callback(null, 0); });
};

// Número de Preguntas con Comentarios
var getNumQuizWithComm = (callback) => {
  models.Quiz.count({
    distinct: true,
    include: [ { model: models.Comment, required: true } ] })
  .then((c) => { callback(null, c); });
//  .catch(function(error) { callback(null, 0); });
};

// Número de Preguntas sin Comentarios
var getNumQuizWithoutComm = (callback) => {
  Promise.all([
    models.Quiz.count(),
    models.Quiz.count({
      distinct: true,
      include: [ { model: models.Comment, required: true } ]
    })
  ]).then((values) => {
    var total = values[0] || 0;
    var withComments = values[1] || 0;

    callback(null, Math.max(total - withComments, 0));
  }).catch((error) => { callback(error); });
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
exports.show = (_req, res) => {
  // Calcular estadísticas independientes
  async.series({
    numTotQuizzes:      (callback) => { getNumTotQuizzes(callback);      },
    numTotComments:     (callback) => { getNumTotComments(callback);     },
    numQuizWithComm:    (callback) => { getNumQuizWithComm(callback);    },
    numQuizWithoutComm: (callback) => { getNumQuizWithoutComm(callback); }
  },
  (_err, results) => {
    // Calcular estadísticas dependientes
    async.waterfall([
      (callback) => { getNumAvgCommPerQuiz(results, callback); }
    ],
    (_waterfallErr, results) => {
      // Mostrar estadísticas
      res.render('quizes/stats.ejs', { stats: results, errors: [] });
    });
  });
};