var express = require('express');
var router = express.Router();

var quizController = require('../controllers/quiz_controller');

// Título del portal
var sTitulo = 'Quiz';

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: sTitulo });
});

router.get('/quizes/question', quizController.question);
router.get('/quizes/answer', quizController.answer);

module.exports = router;