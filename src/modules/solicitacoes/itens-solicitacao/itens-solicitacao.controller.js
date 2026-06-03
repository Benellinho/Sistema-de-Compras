import itensSolicitacaoService from './itens-solicitacao.service.js';

function sendError(res, error) {
  res.status(error.statusCode || 500).json({
    error: error.message || 'Erro interno do servidor.'
  });
}

// Controllers traduzem HTTP em chamadas de negócio e formatam as respostas da API.
export async function createItemSolicitacao(req, res, next) {
  try {
    const item = await itensSolicitacaoService.create(req.params.id, req.body);
    res.status(201).json(item);
  } catch (error) {
    sendError(res, error);
  }
}

export async function deleteItemSolicitacao(req, res, next) {
  try {
    await itensSolicitacaoService.remove(req.params.id, req.params.itemSolicitacaoId);
    res.status(204).send();
  } catch (error) {
    sendError(res, error);
  }
}
