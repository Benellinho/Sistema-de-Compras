import solicitacoesService from './solicitacoes.service.js';

function sendError(res, error) {
  res.status(error.statusCode || 500).json({
    error: error.message || 'Erro interno do servidor.'
  });
}

// Controllers traduzem HTTP em chamadas de negócio e formatam as respostas da API.
export async function listSolicitacoes(req, res, next) {
  try {
    const solicitacoes = await solicitacoesService.list();
    res.json(solicitacoes);
  } catch (error) {
    sendError(res, error);
  }
}

export async function getSolicitacao(req, res, next) {
  try {
    const solicitacao = await solicitacoesService.findOne(req.params.id);
    res.json(solicitacao);
  } catch (error) {
    sendError(res, error);
  }
}

export async function createSolicitacao(req, res, next) {
  try {
    const solicitacao = await solicitacoesService.create(req.body);
    res.status(201).json(solicitacao);
  } catch (error) {
    sendError(res, error);
  }
}

export async function updateSolicitacaoStatus(req, res, next) {
  try {
    const solicitacao = await solicitacoesService.updateStatus(req.params.id, req.body);
    res.json(solicitacao);
  } catch (error) {
    sendError(res, error);
  }
}
