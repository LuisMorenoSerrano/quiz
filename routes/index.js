// Importar módulos externos y definir enrutador
var express = require('express');
var router = express.Router();

// Importar controladores
var quizController    = require('../controllers/quiz_controller');
var commentController = require('../controllers/comment_controller');
var sessionController = require('../controllers/session_controller');

// Página Principal de acceso (home page)
router.get('/', function(req, res, next) {
  res.render('index.ejs', { errors: [] });
});

// Página datos del autor
router.get('/author', function(req, res, next) {
  res.render('author.ejs', { errors: [] });
});

// Autoload de comandos con parámetro :quizId
router.param('quizId', quizController.load);

//
// Definición de rutas de sesión
//
router.get('/login',    sessionController.new);
router.post('/login',   sessionController.create);
router.delete('/login', sessionController.destroy);

//
// Definición de rutas de quizes
//

// Mostrar lista de preguntas
router.get('/quizes',                            quizController.index);

// Mostrar pregunta y solicitar respuesta
router.get('/quizes/:quizId(\\d+)',              quizController.show);

// Validar respuesta y mostrar resultado
router.get('/quizes/:quizId(\\d+)/answer',       quizController.answer);

// Crear nueva pregunta
router.get('/quizes/new',                        quizController.preload,
                                                 quizController.new);
router.post('/quizes/create',                    quizController.preload,
                                                 quizController.create);

// Editar pregunta
router.get('/quizes/:quizId(\\d+)/edit',         quizController.preload,
                                                 quizController.edit);
router.put('/quizes/:quizId(\\d+)',              quizController.preload,
                                                 quizController.update);

// Borrar pregunta
router.delete('/quizes/:quizId(\\d+)',           quizController.destroy);

// Crear nuevo comentario
router.get('/quizes/:quizId(\\d+)/comments/new', commentController.new);
router.post('/quizes/:quizId(\\d+)/comments',    commentController.create);

// Exportar enrutador
module.exports = router;