import solicitacoesRepository from '../solicitacoes/solicitacoes.repository.js';
import historicoRepository from './historico.repository.js';

function createNotFoundError(message) {
  const error = new Error(message);
  error.statusCode = 404;
  return error;
}

async function listBySolicitacao(solicitacaoId) {
  const solicitacao = await solicitacoesRepository.findById(solicitacaoId);

  if (!solicitacao) {
    throw createNotFoundError('Solicitacao nao encontrada.');
  }

  return historicoRepository.findBySolicitacaoId(solicitacaoId);
}

export default {
  listBySolicitacao
};
