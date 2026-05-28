import solicitacoesService from './solicitacoes.service.js';

// Controllers traduzem HTTP em chamadas de negócio e formatam as respostas da API.
export async function listSolicitacoes(req, res, next) {
  try {
    const solicitacoes = await solicitacoesService.list();
    res.json(solicitacoes);
  } catch (error) {
    next(error);
  }
}

export async function createSolicitacao(req, res, next) {
  try {
    const solicitacao = await solicitacoesService.create(req.body);
    res.status(201).json(solicitacao);
  } catch (error) {
    next(error);
  }
}
