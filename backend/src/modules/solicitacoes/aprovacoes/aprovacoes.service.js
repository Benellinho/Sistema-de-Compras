import usuariosRepository from '../../usuarios/usuarios.repository.js';
import solicitacoesRepository from '../solicitacoes/solicitacoes.repository.js';
import aprovacoesRepository from './aprovacoes.repository.js';

const decisoesValidas = new Set(['APROVADO', 'REPROVADO']);

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

async function validateSolicitacaoExiste(id) {
  const solicitacao = await solicitacoesRepository.findById(id);

  if (!solicitacao) {
    throw createNotFoundError('Solicitacao nao encontrada.');
  }

  return solicitacao;
}

async function validateAprovadorExiste(aprovadorId) {
  if (!required(aprovadorId)) {
    throw createValidationError('Aprovador e obrigatorio.');
  }

  const aprovador = await usuariosRepository.findById(aprovadorId);

  if (!aprovador) {
    throw createNotFoundError('Aprovador nao encontrado.');
  }

  if (!aprovador.ativo) {
    throw createValidationError('Aprovador deve estar ativo.');
  }

  return aprovador;
}

function validateDecisao(decisao) {
  if (!required(decisao)) {
    throw createValidationError('Decisao da aprovacao e obrigatoria.');
  }

  if (!decisoesValidas.has(decisao)) {
    throw createValidationError('Decisao da aprovacao invalida.');
  }
}

async function decide(solicitacaoId, data) {
  const solicitacao = await validateSolicitacaoExiste(solicitacaoId);

  if (solicitacao.status !== 'ABERTA') {
    throw createValidationError('Apenas solicitacoes abertas podem receber decisao.');
  }

  await validateAprovadorExiste(data?.aprovador_id);
  validateDecisao(data?.decisao);

  if (data.decisao === 'REPROVADO' && !required(data?.observacao)) {
    throw createValidationError('Observacao e obrigatoria para reprovar.');
  }

  const itensCount = await solicitacoesRepository.countItensCatalogadosBySolicitacaoId(solicitacaoId);

  if (itensCount < 1) {
    throw createValidationError('Solicitacao precisa ter ao menos um item cadastrado para aprovacao.');
  }

  const aprovacaoExistente = await aprovacoesRepository.findBySolicitacaoId(solicitacaoId);

  if (aprovacaoExistente) {
    throw createValidationError('Solicitacao ja possui decisao final.');
  }

  const statusNovo = data.decisao === 'APROVADO' ? 'APROVADA' : 'REPROVADA';
  const acao = data.decisao === 'APROVADO' ? 'APROVACAO' : 'REPROVACAO';

  return aprovacoesRepository.applyDecisao({
    solicitacao_id: solicitacaoId,
    aprovador_id: data.aprovador_id,
    decisao: data.decisao,
    observacao: data?.observacao ?? null,
    status_novo: statusNovo,
    etapa: 'SOLICITACAO',
    acao,
    status_anterior: solicitacao.status
  });
}

export default {
  decide
};
