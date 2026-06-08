import itensRepository from '../../itens/itens/itens.repository.js';
import solicitacoesRepository from '../solicitacoes/solicitacoes.repository.js';
import itensSolicitacaoRepository from './itens-solicitacao.repository.js';

const statusEncerrados = new Set(['CANCELADA', 'FINALIZADA', 'APROVADA', 'REPROVADA']);

function createValidationError(message) {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
}

function createNotFoundError(message) {
  const error = new Error(message);
  error.statusCode = 404;
  return error;
}

function required(value) {
  return value !== undefined && value !== null && String(value).trim() !== '';
}

async function validateSolicitacaoAberta(solicitacaoId) {
  const solicitacao = await solicitacoesRepository.findById(solicitacaoId);

  if (!solicitacao) {
    throw createNotFoundError('Solicitacao nao encontrada.');
  }

  if (statusEncerrados.has(solicitacao.status)) {
    throw createValidationError('Solicitacao encerrada nao pode alterar itens.');
  }

  return solicitacao;
}

async function validateItemExiste(itemId) {
  if (!required(itemId)) {
    return null;
  }

  const item = await itensRepository.findById(itemId);

  if (!item) {
    throw createNotFoundError('Item nao encontrado.');
  }

  return item;
}

function validateQuantidade(quantidade) {
  if (quantidade === undefined || quantidade === null) {
    throw createValidationError('Quantidade e obrigatoria.');
  }

  const numeric = Number(quantidade);

  if (!Number.isFinite(numeric) || numeric <= 0) {
    throw createValidationError('Quantidade deve ser maior que zero.');
  }
}

function normalizeQuantidade(quantidade) {
  const normalized = required(quantidade) ? quantidade : 1;

  validateQuantidade(normalized);

  return Number(normalized);
}

function validateDescricaoNecessidade(descricao) {
  if (!required(descricao)) {
    throw createValidationError('Descricao da necessidade e obrigatoria.');
  }
}

async function create(solicitacaoId, data) {
  await validateSolicitacaoAberta(solicitacaoId);
  const item = await validateItemExiste(data?.item_id);
  const quantidade = normalizeQuantidade(data?.quantidade);
  validateDescricaoNecessidade(data?.descricao_necessidade);

  return itensSolicitacaoRepository.create({
    solicitacao_id: solicitacaoId,
    item_id: item ? data.item_id : null,
    descricao_necessidade: String(data.descricao_necessidade).trim(),
    quantidade,
    unidade_snapshot: item?.unidade || 'UN',
    observacoes: data?.observacoes ?? null
  });
}

async function remove(solicitacaoId, itemSolicitacaoId) {
  await validateSolicitacaoAberta(solicitacaoId);

  const itemSolicitacao = await itensSolicitacaoRepository.findById(itemSolicitacaoId);

  if (!itemSolicitacao || Number(itemSolicitacao.solicitacao_id) !== Number(solicitacaoId)) {
    throw createNotFoundError('Item da solicitacao nao encontrado.');
  }

  await itensSolicitacaoRepository.remove(itemSolicitacaoId);
}

export default {
  create,
  remove
};
