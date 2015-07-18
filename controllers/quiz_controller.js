// Importar módulos externos
var models = require('../models/models.js');

// Título del portal
var sTitulo = 'Quiz';

// GET /quizes
exports.index = function(req, res) {
  models.Quiz.findAll().then(function(quizes) {
    res.render('quizes/index.ejs', { title: sTitulo, quizes: quizes });
  });
};

// GET /quizes/:id
exports.show = function(req, res) {
  models.Quiz.findById(req.params.quizId).then(function(quiz) {
    res.render('quizes/show.ejs', { title: sTitulo, quiz: quiz });
  });
};

// GET /quizes/:id/answer
exports.answer = function(req, res) {
  models.Quiz.findById(req.params.quizId).then(function(quiz) {
    var sRespOK  = new RegExp('^'
      + quiz.respuesta
        .toLowerCase()
        .replace(/á/, "[aá]")
        .replace(/é/, "[eé]")
        .replace(/í/, "[ií]")
        .replace(/ó/, "[oó]")
        .replace(/ú/, "[uú]")
      + '$');
    var sRespUsr = req.query.respuesta.trim().replace(/\s{2,}/g, ' ').toLowerCase();

    res.render('quizes/answer.ejs', { title: sTitulo, id: quiz.id, respuesta: sRespOK.test(sRespUsr) });
  });
};