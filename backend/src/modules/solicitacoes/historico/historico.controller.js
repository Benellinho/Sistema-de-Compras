import historicoService from './historico.service.js';

function sendError(res, error) {
  res.status(error.statusCode || 500).json({
    error: error.message || 'Erro interno do servidor.'
  });
}

export async function listSolicitacaoHistorico(req, res, next) {
  try {
    const historico = await historicoService.listBySolicitacao(req.params.id);
    res.json(historico);
  } catch (error) {
    sendError(res, error);
  }
}
