import cotacoesRepository from '../cotacoes/cotacoes.repository.js';
import {
  createConflictError,
  createValidationError,
  statusEncerrados,
  validateCotacaoAbertaParaAlteracao,
  validateCotacaoExiste,
  validateFornecedorExiste,
  validateUsuarioExiste
} from '../cotacoes/cotacoes.service.js';

const statusFornecedorSemValores = new Set(['RECUSADO', 'SEM_RESPOSTA']);

async function validateFornecedorDaCotacao(cotacaoId, cotacaoFornecedorId) {
  const fornecedorCotacao = await cotacoesRepository.findFornecedorById(cotacaoFornecedorId);

  if (!fornecedorCotacao || Number(fornecedorCotacao.cotacao_id) !== Number(cotacaoId)) {
    throw createValidationError('Fornecedor nao pertence a cotacao informada.');
  }

  return fornecedorCotacao;
}

async function add(cotacaoId, data) {
  const cotacao = await validateCotacaoExiste(cotacaoId);
  validateCotacaoAbertaParaAlteracao(cotacao);

  if (cotacao.status === 'EM_ANALISE') {
    throw createValidationError('Cotacao em analise nao permite adicionar fornecedores.');
  }

  await validateFornecedorExiste(data?.fornecedor_id);
  await validateUsuarioExiste(data?.usuario_id);

  const fornecedorExistente = await cotacoesRepository.findFornecedorByCotacaoAndFornecedor(
    cotacaoId,
    data.fornecedor_id
  );

  if (fornecedorExistente) {
    throw createConflictError('Fornecedor ja participa desta cotacao.');
  }

  return cotacoesRepository.addFornecedor({
    cotacao_id: cotacaoId,
    fornecedor_id: data.fornecedor_id,
    usuario_id: data?.usuario_id ?? null
  });
}

async function marcarEnvio(cotacaoId, cotacaoFornecedorId, data = {}) {
  const cotacao = await validateCotacaoExiste(cotacaoId);
  validateCotacaoAbertaParaAlteracao(cotacao);

  if (statusEncerrados.has(cotacao.status) || cotacao.status === 'EM_ANALISE') {
    throw createValidationError('Cotacao nao permite envio para fornecedor neste status.');
  }

  await validateFornecedorDaCotacao(cotacaoId, cotacaoFornecedorId);
  await validateUsuarioExiste(data?.usuario_id);

  return cotacoesRepository.marcarEnvio({
    cotacao_id: cotacaoId,
    cotacao_fornecedor_id: cotacaoFornecedorId,
    usuario_id: data?.usuario_id ?? null
  });
}

async function updateStatus(cotacaoId, cotacaoFornecedorId, data) {
  const cotacao = await validateCotacaoExiste(cotacaoId);
  validateCotacaoAbertaParaAlteracao(cotacao);

  if (!statusFornecedorSemValores.has(data?.status)) {
    throw createValidationError('Status do fornecedor invalido para esta acao.');
  }

  await validateFornecedorDaCotacao(cotacaoId, cotacaoFornecedorId);
  await validateUsuarioExiste(data?.usuario_id);

  return cotacoesRepository.updateFornecedorStatus({
    cotacao_id: cotacaoId,
    cotacao_fornecedor_id: cotacaoFornecedorId,
    status: data.status,
    observacoes: data?.observacoes ?? null,
    usuario_id: data?.usuario_id ?? null
  });
}

export { validateFornecedorDaCotacao };

export default {
  add,
  marcarEnvio,
  updateStatus
};
