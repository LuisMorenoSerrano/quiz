// Importar módulos externos
var models = require('../models/models.js');

// Título del portal
var sTitulo = 'Quiz';

// GET /quizes/question
exports.question = function(req, res) {
  models.Quiz.findAll().then(function(quiz) {
    var sPregunta = quiz[0].pregunta;

    res.render('quizes/question', { title: sTitulo, pregunta: sPregunta });
  });
};

// GET /quizes/answer
exports.answer = function(req, res) {
  models.Quiz.findAll().then(function(quiz) {
    var sRespOK  = new RegExp('^'
      + quiz[0].respuesta
        .toLowerCase()
        .replace(/á/, "[aá]")
        .replace(/é/, "[eé]")
        .replace(/í/, "[ií]")
        .replace(/ó/, "[oó]")
        .replace(/ú/, "[uú]")
      + '$');
    var sRespUsr = req.query.respuesta.trim().replace(/\s{2,}/g, ' ').toLowerCase();

    res.render('quizes/answer', { title: sTitulo, respuesta: sRespOK.test(sRespUsr) });
  });
};