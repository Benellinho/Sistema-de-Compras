import cotacoesService from './cotacoes.service.js';

function sendError(res, error) {
  res.status(error.statusCode || 500).json({
    error: error.message || 'Erro interno do servidor.'
  });
}

export async function createCotacao(req, res) {
  try {
    const cotacao = await cotacoesService.create(req.body);
    res.status(201).json(cotacao);
  } catch (error) {
    sendError(res, error);
  }
}

export async function getCotacao(req, res) {
  try {
    const cotacao = await cotacoesService.findOne(req.params.id);
    res.json(cotacao);
  } catch (error) {
    sendError(res, error);
  }
}

export async function updateCotacaoStatus(req, res) {
  try {
    const resultado = await cotacoesService.updateStatus(req.params.id, req.body);
    res.json(resultado);
  } catch (error) {
    sendError(res, error);
  }
}
