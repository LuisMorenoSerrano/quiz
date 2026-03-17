// Importar módulos externos
var models = require('../models/models.js');
var Op = require('sequelize').Op;

// Definición de parámetros de recuperación de datos
var sSearch     = '',
  sOpLike     = (models.DBDialect === 'postgres' ? Op.iLike : Op.like),
    aAttributes = [ 'id', 'pregunta', 'respuesta', 'id_tema' ],
    oIncSubject = { model: models.Subject, attributes: [ 'tema' ]  },
    oIncComment = { model: models.Comment, attributes: [ 'id', 'texto', 'publicado' ] },
    oParams     = {};

oParams.attributes = aAttributes;

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
exports.preload = (req, _res, next) => {
  // Carga de datos: Temas
  models.Subject.findAll().then((subjects) => {
    if (subjects) {
      req.subjects = subjects;
      next();
    } else {
      next(new Error('No hay datos de Temas (Subjects)'));
    }
  }).catch((error) => { next(error); });
};

// Autoload de Preguntas con control de errores (rutas con :quizId)
exports.load = (req, _res, next, quizId) => {
  // Asignar parámetros y buscar pregunta
  oParams.include = [];
  oParams.include.push(oIncSubject);
  oParams.include.push(oIncComment);
  delete oParams.where;
  delete oParams.order;

  models.Quiz.findByPk(quizId, oParams).then((quiz) => {
    if (quiz) {
      req.quiz = quiz;
      next();
    } else {
      next(new Error(`No existe la pregunta quizId=${quizId}`));
    }
  }).catch((error) => { next(error); });
};

// GET /quizes(?search=<txt>)?
exports.index = (req, res, next) => {
  // Definir filtro de búsqueda -opcional- y almacenar
  oParams.include = [];
  oParams.include.push(oIncSubject);

  if (req.query.search) {
    oParams.where = {
      pregunta: {}
    };
    oParams.where.pregunta[sOpLike] = `%${req.query.search.trim().replace(/\s{2,}/g, ' ')}%`;
    oParams.order = [ [ 'pregunta', 'ASC' ] ];
  } else {
    delete oParams.where;
    oParams.order = [ [ 'id', 'ASC' ] ];
  };

  sSearch = req.query.search;

  // Buscar las preguntas -con filtro opcional-
  models.Quiz.findAll(oParams).then((quizes) => {
    res.render('quizes/index.ejs', {
      quizes: quizes, search: sSearch, errors: []
    });
  }).catch((error) => { next(error); });
};

// GET /quizes/:quizId
exports.show = (req, res) => {
  res.render('quizes/show.ejs', {
    quiz: req.quiz, search: sSearch, errors: []
  });
};

// GET /quizes/:quizId/answer
exports.answer = (req, res) => {
  var sRespOK  = stringToRegExp(req.quiz.respuesta);
  var sRespUsr = req.query.respuesta.trim().replace(/\s{2,}/g, ' ').toLowerCase();

  res.render('quizes/answer.ejs', {
    id: req.quiz.id, respuesta: sRespOK.test(sRespUsr), search: sSearch, errors: []
  });
};

// GET /quizes/new
exports.new = (req, res) => {
  var subjects = req.subjects  // Asignación por preload
  var quiz     = models.Quiz.build(
    { pregunta: 'Escriba la pregunta', respuesta: 'Escriba la respuesta', id_tema: 1 }
  );

  res.render('quizes/new.ejs', {
    subjects: subjects, quiz: quiz, search: sSearch, errors: []
  });
};

// POST /quizes/create
exports.create = (req, res, next) => {
  var subjects = req.subjects  // Asignación por preload
  var quiz     = models.Quiz.build(req.body.quiz);

  quiz
    .save({ fields: [ 'pregunta', 'respuesta', 'id_tema' ] })
    .then(() => {
      // Almacenar par Pregunta-Respuesta en BD y redirección a lista de preguntas
      res.redirect(`/quizes${(sSearch) ? `?search=${sSearch}` : ''}`);
    })
    .catch((error) => {
      if (error.name === 'SequelizeValidationError') {
        // Mostrar mensaje de error si falla la validación
        res.render('quizes/new.ejs', {
          subjects: subjects, quiz: quiz, search: sSearch, errors: error.errors
        });
      } else {
        next(error);
      }
    });
};

// GET /quizes/:quizId/edit
exports.edit = (req, res) => {
  var subjects = req.subjects  // Asignación por preload
  var quiz     = req.quiz;     // Asignación por autoload

  res.render('quizes/edit.ejs', {
    subjects: subjects, quiz: quiz, search: sSearch, errors: []
  });
};

// PUT /quizes/:quizId
exports.update = (req, res, next) => {
  var subjects = req.subjects  // Asignación por preload

  req.quiz.pregunta  = req.body.quiz.pregunta;
  req.quiz.respuesta = req.body.quiz.respuesta;
  req.quiz.id_tema   = req.body.quiz.id_tema;

  req.quiz
    .save({ fields: [ 'pregunta', 'respuesta', 'id_tema' ] })
    .then(() => {
      // Almacenar par Pregunta-Respuesta en BD y redirección a lista de preguntas
      res.redirect(`/quizes${(sSearch) ? `?search=${sSearch}` : ''}`);
    })
    .catch((error) => {
      if (error.name === 'SequelizeValidationError') {
        // Mostrar mensaje de error si falla la validación
        res.render('quizes/edit.ejs', {
          subjects: subjects, quiz: req.quiz, search: sSearch, errors: error.errors
        });
      } else {
        next(error);
      }
    });
};

// DELETE /quizes/:quizId
exports.destroy = (req, res, next) => {
  req.quiz.destroy().then(() => {
    res.redirect(`/quizes${(sSearch) ? `?search=${sSearch}` : ''}`);
  }).catch((error) => { next(error); });
};