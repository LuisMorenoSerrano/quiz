var express = require('express');
var router = express.Router();

var quizController = require('../controllers/quiz_controller');

// Título del portal
var sTitulo = 'Quiz';

// GET / (Página Principal)
router.get('/', function(req, res, next) {
  res.render('index.ejs', { title: sTitulo, errors: [] });
});

// GET /author (Autor)
router.get('/author', function(req, res, next) {
  res.render('author.ejs', { title: sTitulo, errors: [] });
});

// Autoload de comandos con parámetro :quizId
router.param('quizId', quizController.load);

// Definición de Rutas de /quizes
router.get('/quizes',                      quizController.index);
router.get('/quizes/:quizId(\\d+)',        quizController.show);
router.get('/quizes/:quizId(\\d+)/answer', quizController.answer);
router.get('/quizes/new',                  quizController.new);
router.get('/quizes/:quizId(\\d+)/edit',   quizController.edit);

router.post('/quizes/create',              quizController.create);

router.put('/quizes/:quizId(\\d+)',        quizController.update);

router.delete('/quizes/:quizId(\\d+)',     quizController.destroy);

// Exportar enrutador
module.exports = router;