// Importar módulos externos
var models = require('../models/models.js');

// Autoload de Comentarios con control de errores (rutas con :commentId)
exports.load = function(req, res, next, commentId) {
  // Buscar comentario
  models.Comment.findById(commentId).then(function(comment) {
    if (comment) {
      req.comment = comment;
      next();
    } else {
      next(new Error('No existe el comentario commentId=' + commentId));
    }
  }).catch(function(error) { next(error); });
};

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

// PUT /quizes/:quizId/comments/:commentId/publish
exports.publish = function(req, res, next) {
  req.comment.publicado = true;

  // Almacenar el comentario como publicado en BD y redirección a pregunta
  req.comment
    .save({ fields: [ 'publicado' ] })
    .then(function() {
      res.redirect('/quizes/' + req.params.quizId);
    }
  ).catch(function(error) { next(error); });
};

// DELETE /quizes/:quizId/comments/:commentId
exports.destroy = function(req, res, next) {
  req.comment.destroy().then(function() {
    res.redirect('/quizes/' + req.params.quizId);
  }).catch(function(error) { next(error); });
};