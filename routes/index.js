// Importar módulos externos y definir enrutador
var express = require('express');
var router = express.Router();

// Importar controladores
var quizController    = require('../controllers/quiz_controller');
var commentController = require('../controllers/comment_controller');
var sessionController = require('../controllers/session_controller');

// Página Principal -home page- de acceso (público)
router.get('/', function(req, res, next) {
  res.render('index.ejs', { errors: [] });
});

// Página datos del autor (público)
router.get('/author', function(req, res, next) {
  res.render('author.ejs', { errors: [] });
});

// Autoload de comandos con parámetro :quizId
router.param('quizId', quizController.load);

//
// Definición de rutas de sesión (público)
//
router.get('/login',    sessionController.new);
router.post('/login',   sessionController.create);
router.delete('/login', sessionController.destroy);

//
// Definición de rutas de quizes
//

// Mostrar lista de preguntas (público)
router.get('/quizes',                            quizController.index);

// Mostrar pregunta y solicitar respuesta (público)
router.get('/quizes/:quizId(\\d+)',              quizController.show);

// Validar respuesta y mostrar resultado (público)
router.get('/quizes/:quizId(\\d+)/answer',       quizController.answer);

// Crear nueva pregunta (usuario autenticado)
router.get('/quizes/new',                        sessionController.loginRequired,
                                                 quizController.preload,
                                                 quizController.new);

router.post('/quizes/create',                    sessionController.loginRequired,
                                                 quizController.preload,
                                                 quizController.create);

// Editar pregunta (usuario autenticado)
router.get('/quizes/:quizId(\\d+)/edit',         sessionController.loginRequired,
                                                 quizController.preload,
                                                 quizController.edit);

router.put('/quizes/:quizId(\\d+)',              sessionController.loginRequired,
                                                 quizController.preload,
                                                 quizController.update);

// Borrar pregunta (usuario autenticado)
router.delete('/quizes/:quizId(\\d+)',           sessionController.loginRequired,
                                                 quizController.destroy);

// Crear nuevo comentario
router.get('/quizes/:quizId(\\d+)/comments/new', commentController.new);
router.post('/quizes/:quizId(\\d+)/comments',    commentController.create);

// Exportar enrutador
module.exports = router;