import aprovacoesService from './aprovacoes.service.js';

function sendError(res, error) {
  res.status(error.statusCode || 500).json({
    error: error.message || 'Erro interno do servidor.'
  });
}

export async function decideSolicitacao(req, res, next) {
  try {
    const decisao = await aprovacoesService.decide(req.params.id, req.body);
    res.status(201).json(decisao);
  } catch (error) {
    sendError(res, error);
  }
}
