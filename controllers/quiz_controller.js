// Importar módulos externos
var models = require('../models/models.js');

// Título del portal
var sTitulo = 'Quiz';

// Función: Convertir texto en expresión regular
function stringToRegExp(sTxt) {
  return new RegExp('^'
    + sTxt
      .toLowerCase()
      .replace(/á/, "[aá]")
      .replace(/é/, "[eé]")
      .replace(/í/, "[ií]")
      .replace(/ó/, "[oó]")
      .replace(/ú/, "[uú]")
    + '$');
};

// Autoload: factorización del código de búsqueda
// incluyendo control de errores (rutas con :quizId)
exports.load = function(req, res, next, quizId) {
  models.Quiz.findById(quizId).then(function(quiz) {
    if (quiz) {
      req.quiz = quiz;
      next();
    } else {
      next(new Error('No existe la pregunta quizId=' + quizId));
    }
  }).catch(function(error) { next(error); });
};

// GET /quizes(?search=<txt>)?
exports.index = function(req, res) {
  // Definir filtro de búsqueda -opcional-
  var sSearch = { order: 'id ASC' };
  var sOper   = (models.DBDialect === 'postgres' ? 'ILIKE' : 'LIKE');

  if (req.query.search) {
    sSearch = {
      where: [ 'pregunta ' + sOper + ' \'%' + req.query.search.trim().replace(/\s{1,}/g, '%') + '%\'' ],
      order: 'pregunta ASC'
    };
  };

  // Buscar las preguntas -con filtro opcional-
  models.Quiz.findAll(sSearch).then(function(quizes) {
    res.render('quizes/index.ejs', { title: sTitulo, quizes: quizes });
  }).catch(function(error) { next(error); });
};

// GET /quizes/:id
exports.show = function(req, res) {
  res.render('quizes/show.ejs', { title: sTitulo, quiz: req.quiz });
};

// GET /quizes/:id/answer
exports.answer = function(req, res) {
  var sRespOK  = stringToRegExp(req.quiz.respuesta);
  var sRespUsr = req.query.respuesta.trim().replace(/\s{2,}/g, ' ').toLowerCase();

  res.render('quizes/answer.ejs', { title: sTitulo, id: req.quiz.id, respuesta: sRespOK.test(sRespUsr) });
};

// GET /quizes/new
exports.new = function(req, res) {
  var quiz = models.Quiz.build(
    { pregunta: "Escriba la pregunta", respuesta: "Escriba la respuesta" }
  );

  res.render('quizes/new.ejs', { title: sTitulo, quiz: quiz });
};

// POST /quizes/create
exports.create = function(req, res) {
  var quiz = models.Quiz.build(req.body.quiz);

  // Almacenar par Pregunta-Respuesta en BD y redirección a lista de preguntas
  quiz.save({ fields: ['pregunta', 'respuesta'] }).then(function() {
    res.redirect('/quizes');
  });
};