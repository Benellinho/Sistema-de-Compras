import comparativoCotacaoService from './comparativo-cotacao.service.js';

function sendError(res, error) {
  res.status(error.statusCode || 500).json({
    error: error.message || 'Erro interno do servidor.'
  });
}

export async function getComparativoCotacao(req, res) {
  try {
    const comparativo = await comparativoCotacaoService.get(req.params.id);
    res.json(comparativo);
  } catch (error) {
    sendError(res, error);
  }
}
