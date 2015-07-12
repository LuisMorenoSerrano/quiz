// Título del portal
var sTitulo = 'Quiz';

// GET /quizes/question
exports.question = function(req, res) {
  var sPregunta = 'Capital de Italia';

  res.render('quizes/question', { title: sTitulo, pregunta: sPregunta });
};

// GET /quizes/answer
exports.answer = function(req, res) {
  var sRespOK  = new RegExp('^'
    + 'Roma'.toLowerCase()
            .replace(/á/, "[aá]")
            .replace(/é/, "[eé]")
            .replace(/í/, "[ií]")
            .replace(/ó/, "[oó]")
            .replace(/ú/, "[uú]")
    + '$');
  var sRespUsr = req.query.respuesta.trim().replace(/\s{2,}/g, ' ').toLowerCase();

  res.render('quizes/answer', { title: sTitulo, respuesta: sRespOK.test(sRespUsr) });
};