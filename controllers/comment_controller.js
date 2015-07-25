// Importar módulos externos
var models = require('../models/models.js');

// GET /quizes/:quizId/comments/new
exports.new = function(req, res) {
  res.render('comments/new.ejs', { id_quiz: req.params.quizId, errors: [] });
};

// POST /quizes/:quizId/comments
exports.create = function(req, res, next) {
  var comment = models.Comment.build( {
    texto:   req.body.comment.texto,
    id_quiz: req.params.quizId
  });

  comment
    .validate()
    .then(function(err) {
      if (err) {
        // Mostrar mensaje de error si falla la validación
        res.render('comments/new.ejs', { id_quiz: req.params.quizId, comment: comment, errors: err.errors });
      } else {
        // Almacenar comentario asociado a la pregunta en BD y redirección a pregunta
        comment
          .save({ fields: [ 'texto', 'id_quiz' ] })
          .then(function() {
            res.redirect('/quizes/' + req.params.quizId);
          }
        );
      }
    }
  ).catch(function(error) { next(error); });
};