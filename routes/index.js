var express = require('express');
var router = express.Router();

var quizController = require('../controllers/quiz_controller');

// Título del portal
var sTitulo = 'Quiz';

// GET / (Página Principal)
router.get('/', function(req, res, next) {
  res.render('index.ejs', { title: sTitulo });
});

// GET /author (Autor)
router.get('/author', function(req, res, next) {
  res.render('author.ejs', { title: sTitulo });
});

// Autoload de comandos con parámetro :quizId
router.param('quizId', quizController.load);

// Definición de Rutas de /quizes
router.get('/quizes',                      quizController.index);
router.get('/quizes/:quizId(\\d+)',        quizController.show);
router.get('/quizes/:quizId(\\d+)/answer', quizController.answer);
router.get('/quizes/new',                  quizController.new);

router.post('/quizes/create',              quizController.create);

// Exportar enrutador
module.exports = router;