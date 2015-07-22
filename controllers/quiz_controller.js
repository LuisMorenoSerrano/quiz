// Importar módulos externos
var models = require('../models/models.js');

// Título del portal
var sTitulo = 'Quiz';

// Definición de parámetros de recuperación de datos
var sOpLike = (models.DBDialect === 'postgres' ? 'ILIKE' : 'LIKE');
var sParam  = {
  attributes: [ 'id', 'pregunta', 'respuesta', 'id_tema' ],
  include:    [ { model: models.Subject, attributes: [ 'tema' ] } ]
};

// Función: Convertir texto en expresión regular
function stringToRegExp(sTxt) {
  return new RegExp('^'
    + sTxt
      .toLowerCase()
      .replace(/á/, '[aá]')
      .replace(/é/, '[eé]')
      .replace(/í/, '[ií]')
      .replace(/ó/, '[oó]')
      .replace(/ú/, '[uú]')
    + '$');
};

// Preload: Carga previa de datos auxiliares
exports.preload = function(req, res, next) {
  // Carga de datos: Temas
  models.Subject.findAll().then(function(subjects) {
    if (subjects) {
      req.subjects = subjects;
      next();
    } else {
      next(new Error('No hay datos de Temas (Subjects)'));
    }
  }).catch(function(error) { next(error); });
};

// Autoload: factorización del código de búsqueda
// incluyendo control de errores (rutas con :quizId)
exports.load = function(req, res, next, quizId) {
  models.Quiz.findById(quizId, sParam).then(function(quiz) {
    if (quiz) {
      req.quiz = quiz;
      next();
    } else {
      next(new Error('No existe la pregunta quizId=' + quizId));
    }
  }).catch(function(error) { next(error); });
};

// GET /quizes(?search=<txt>)?
exports.index = function(req, res, next) {
  // Definir filtro de búsqueda -opcional-
  var sSearch = sParam;

  if (req.query.search) {
    sSearch.where = [
      'pregunta ' + sOpLike + ' ?', '%' + req.query.search.trim().replace(/\s{1,}/g, '%') + '%'
    ];
    sSearch.order = [ [ 'pregunta', 'ASC' ] ];
  } else {
    sSearch.where = [ ];
    sSearch.order = [ [ 'id', 'ASC' ] ];
  };

  // Buscar las preguntas -con filtro opcional-
  models.Quiz.findAll(sSearch).then(function(quizes) {
    res.render('quizes/index.ejs', { title: sTitulo, quizes: quizes, errors: [] });
  }).catch(function(error) { next(error); });
};

// GET /quizes/:id
exports.show = function(req, res) {
  res.render('quizes/show.ejs', { title: sTitulo, quiz: req.quiz, errors: [] });
};

// GET /quizes/:id/answer
exports.answer = function(req, res) {
  var sRespOK  = stringToRegExp(req.quiz.respuesta);
  var sRespUsr = req.query.respuesta.trim().replace(/\s{2,}/g, ' ').toLowerCase();

  res.render('quizes/answer.ejs', { title: sTitulo, id: req.quiz.id, respuesta: sRespOK.test(sRespUsr),
    errors: [] });
};

// GET /quizes/new
exports.new = function(req, res) {
  var subjects = req.subjects  // Asignación por preload
  var quiz     = models.Quiz.build(
    { pregunta: 'Escriba la pregunta', respuesta: 'Escriba la respuesta', id_tema: 1 }
  );

  res.render('quizes/new.ejs', { title: sTitulo, subjects: subjects, quiz: quiz, errors: [] });
};

// GET /quizes/:id/edit
exports.edit = function(req, res) {
  var subjects = req.subjects  // Asignación por preload
  var quiz     = req.quiz;     // Asignación por autoload

  res.render('quizes/edit.ejs', { title: sTitulo, subjects: subjects, quiz: quiz, errors: [] });
};

// POST /quizes/create
exports.create = function(req, res) {
  var subjects = req.subjects  // Asignación por preload
  var quiz     = models.Quiz.build(req.body.quiz);

  quiz
    .validate()
    .then(function(err) {
      if (err) {
        // Mostrar mensaje de error si falla la validación
        res.render('quizes/new.ejs', {
          title: sTitulo, subjects: subjects, quiz: quiz, errors: err.errors
        });
      } else {
        // Almacenar par Pregunta-Respuesta en BD y redirección a lista de preguntas
        quiz
          .save({ fields: [ 'pregunta', 'respuesta', 'id_tema' ] })
          .then(function() {
            res.redirect('/quizes');
          }
        );
      }
    }
  );
};

// PUT /quizes/:id
exports.update = function(req, res) {
  var subjects = req.subjects  // Asignación por preload

  req.quiz.pregunta  = req.body.quiz.pregunta;
  req.quiz.respuesta = req.body.quiz.respuesta;
  req.quiz.id_tema   = req.body.quiz.id_tema;

  req.quiz
    .validate()
    .then(function(err) {
      if (err) {
        // Mostrar mensaje de error si falla la validación
        res.render('quizes/edit.ejs', {
          title: sTitulo, subjects: subjects, quiz: req.quiz, errors: err.errors
        });
      } else {
        // Almacenar par Pregunta-Respuesta en BD y redirección a lista de preguntas
        req.quiz
          .save({ fields: [ 'pregunta', 'respuesta', 'id_tema' ] })
          .then(function() {
            res.redirect('/quizes');
          }
        );
      }
    }
  );
};

// DELETE /quizes/:id
exports.destroy = function(req, res, next) {
  req.quiz.destroy().then(function() {
    res.redirect('/quizes');
  }).catch(function(error) { next(error); });
};