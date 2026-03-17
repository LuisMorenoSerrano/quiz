// Importar módulos externos
var models = require('../models/models.js');

// Autoload de Comentarios con control de errores (rutas con :commentId)
exports.load = (req, _res, next, commentId) => {
  // Buscar comentario
  models.Comment.findByPk(commentId).then((comment) => {
    if (comment) {
      req.comment = comment;
      next();
    } else {
      next(new Error(`No existe el comentario commentId=${commentId}`));
    }
  }).catch((error) => { next(error); });
};

// GET /quizes/:quizId/comments/new
exports.new = (req, res) => {
  res.render('comments/new.ejs', { id_quiz: req.params.quizId, errors: [] });
};

// POST /quizes/:quizId/comments
exports.create = (req, res, next) => {
  var comment = models.Comment.build( {
    texto:   req.body.comment.texto,
    id_quiz: req.params.quizId
  });

  comment
    .save({ fields: [ 'texto', 'id_quiz' ] })
    .then(() => {
      // Almacenar comentario asociado a la pregunta en BD y redirección a pregunta
      res.redirect(`/quizes/${req.params.quizId}`);
    })
    .catch((error) => {
      if (error.name === 'SequelizeValidationError') {
        // Mostrar mensaje de error si falla la validación
        res.render('comments/new.ejs', {
          id_quiz: req.params.quizId,
          comment: comment,
          errors: error.errors
        });
      } else {
        next(error);
      }
    });
};

// PUT /quizes/:quizId/comments/:commentId/publish
exports.publish = (req, res, next) => {
  req.comment.publicado = true;

  // Almacenar el comentario como publicado en BD y redirección a pregunta
  req.comment
    .save({ fields: [ 'publicado' ] })
    .then(() => {
      res.redirect(`/quizes/${req.params.quizId}`);
    }
  ).catch((error) => { next(error); });
};

// DELETE /quizes/:quizId/comments/:commentId
exports.destroy = (req, res, next) => {
  req.comment.destroy().then(() => {
    res.redirect(`/quizes/${req.params.quizId}`);
  }).catch((error) => { next(error); });
};