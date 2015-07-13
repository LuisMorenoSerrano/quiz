var express = require('express');
var router = express.Router();

var quizController = require('../controllers/quiz_controller');

// Título del portal
var sTitulo = 'Quiz';

// GET / (Página Principal)
router.get('/', function(req, res, next) {
  res.render('index', { title: sTitulo });
});

// GET /author (Autor)
router.get('/author', function(req, res, next) {
  res.render('author', { title: sTitulo });
});

// GET /quizes/question (Pregunta)
router.get('/quizes/question', quizController.question);

// GET /quizes/answer (Respuesta)
router.get('/quizes/answer', quizController.answer);

module.exports = router;