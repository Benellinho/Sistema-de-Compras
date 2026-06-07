import fornecedoresRepository from '../../fornecedores/fornecedores/fornecedores.repository.js';
import solicitacoesRepository from '../../solicitacoes/solicitacoes/solicitacoes.repository.js';
import usuariosRepository from '../../usuarios/usuarios.repository.js';
import cotacoesRepository from './cotacoes.repository.js';

const statusValidos = new Set(['ABERTA', 'EM_ANDAMENTO', 'EM_ANALISE', 'APROVADA', 'REPROVADA', 'CANCELADA', 'ENCERRADA']);
const statusEncerrados = new Set(['APROVADA', 'REPROVADA', 'CANCELADA', 'ENCERRADA']);
const statusSolicitacaoPermitidosParaCotacao = new Set(['APROVADA', 'COTACAO_REPROVADA']);

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

function createConflictError(message) {
  const error = new Error(message);
  error.statusCode = 409;
  return error;
}

function required(value) {
  return value !== undefined && value !== null && String(value).trim() !== '';
}

async function validateUsuarioExiste(usuarioId, label = 'Usuario') {
  if (!required(usuarioId)) {
    return null;
  }

  const usuario = await usuariosRepository.findById(usuarioId);

  if (!usuario) {
    throw createNotFoundError(`${label} nao encontrado.`);
  }

  if (!usuario.ativo) {
    throw createValidationError(`${label} deve estar ativo.`);
  }

  return usuario;
}

async function validateCotacaoExiste(id) {
  const cotacao = await cotacoesRepository.findById(id);

  if (!cotacao) {
    throw createNotFoundError('Cotacao nao encontrada.');
  }

  return cotacao;
}

function validateCotacaoAbertaParaAlteracao(cotacao) {
  if (statusEncerrados.has(cotacao.status)) {
    throw createValidationError('Cotacao encerrada nao permite alteracoes.');
  }
}

async function findOne(id) {
  const cotacao = await validateCotacaoExiste(id);
  const fornecedores = await cotacoesRepository.findFornecedoresByCotacaoId(id);

  for (const fornecedor of fornecedores) {
    fornecedor.itens = await cotacoesRepository.findItensByCotacaoFornecedorId(fornecedor.id);
    fornecedor.anexos = await cotacoesRepository.findAnexosByCotacaoFornecedorId(fornecedor.id);
  }

  return {
    ...cotacao,
    resumo_respostas: await cotacoesRepository.getResumoRespostas(id),
    fornecedores
  };
}

async function list(filters = {}) {
  if (filters?.status && !statusValidos.has(filters.status)) {
    throw createValidationError('Status da cotacao invalido.');
  }

  return cotacoesRepository.findAll({
    status: filters?.status || null,
    solicitacao_id: filters?.solicitacao_id || null,
    criado_por: filters?.criado_por || null
  });
}

async function create(data) {
  if (!required(data?.solicitacao_id)) {
    throw createValidationError('Solicitacao e obrigatoria.');
  }

  const solicitacao = await solicitacoesRepository.findById(data.solicitacao_id);

  if (!solicitacao) {
    throw createNotFoundError('Solicitacao nao encontrada.');
  }

  if (!statusSolicitacaoPermitidosParaCotacao.has(solicitacao.status)) {
    throw createValidationError('Cotacao so pode ser criada para solicitacao aprovada ou com cotacao reprovada.');
  }

  const itensCount = await solicitacoesRepository.countItensBySolicitacaoId(data.solicitacao_id);

  if (itensCount < 1) {
    throw createValidationError('Solicitacao precisa ter ao menos um item para cotacao.');
  }

  await validateUsuarioExiste(data?.criado_por, 'Usuario criador');

  const cotacaoEmAndamento = await cotacoesRepository.findOpenBySolicitacaoId(data.solicitacao_id);

  if (cotacaoEmAndamento) {
    throw createConflictError('Solicitacao ja possui cotacao em andamento.');
  }

  const numeroRodada = await cotacoesRepository.findNextRodadaBySolicitacaoId(data.solicitacao_id);

  return cotacoesRepository.create({
    solicitacao_id: data.solicitacao_id,
    numero_rodada: numeroRodada,
    criado_por: data?.criado_por ?? null,
    observacoes: data?.observacoes ?? null,
    status_anterior: solicitacao.status
  });
}

async function updateStatus(id, data) {
  const cotacao = await validateCotacaoExiste(id);

  if (!required(data?.status)) {
    throw createValidationError('Status da cotacao e obrigatorio.');
  }

  if (!statusValidos.has(data.status)) {
    throw createValidationError('Status da cotacao invalido.');
  }

  await validateUsuarioExiste(data?.usuario_id);

  if (cotacao.status === data.status) {
    return {
      cotacao,
      resumo_respostas: await cotacoesRepository.getResumoRespostas(id)
    };
  }

  if (statusEncerrados.has(cotacao.status)) {
    throw createValidationError('Cotacao encerrada nao permite alteracao de status.');
  }

  if (data.status === 'EM_ANALISE') {
    if (cotacao.status !== 'EM_ANDAMENTO') {
      throw createValidationError('Cotacao precisa estar em andamento para iniciar analise.');
    }

    const resumo = await cotacoesRepository.getResumoRespostas(id);

    if (resumo.fornecedores_convidados < 1) {
      throw createValidationError('Cotacao precisa ter fornecedores convidados para iniciar analise.');
    }

    const cotacaoAtualizada = await cotacoesRepository.updateStatus(id, {
      status: 'EM_ANALISE',
      usuario_id: data?.usuario_id ?? null,
      observacao: data?.observacao ?? 'Usuario iniciou analise da cotacao.',
      acao: 'INICIO_ANALISE'
    });

    return {
      cotacao: cotacaoAtualizada,
      resumo_respostas: await cotacoesRepository.getResumoRespostas(id)
    };
  }

  const cotacaoAtualizada = await cotacoesRepository.updateStatus(id, {
    status: data.status,
    usuario_id: data?.usuario_id ?? null,
    observacao: data?.observacao ?? null,
    acao: getAcaoAlteracaoStatus(data.status)
  });

  return {
    cotacao: cotacaoAtualizada,
    resumo_respostas: await cotacoesRepository.getResumoRespostas(id)
  };
}

function getAcaoAlteracaoStatus(status) {
  if (status === 'CANCELADA') {
    return 'CANCELAMENTO_COTACAO';
  }

  if (status === 'ENCERRADA') {
    return 'ENCERRAMENTO_COTACAO';
  }

  return 'ALTERACAO_STATUS';
}

async function validateFornecedorExiste(fornecedorId) {
  if (!required(fornecedorId)) {
    throw createValidationError('Fornecedor e obrigatorio.');
  }

  const fornecedor = await fornecedoresRepository.findById(fornecedorId);

  if (!fornecedor) {
    throw createNotFoundError('Fornecedor nao encontrado.');
  }

  if (fornecedor.status !== 'ATIVO') {
    throw createValidationError('Fornecedor deve estar ativo.');
  }

  return fornecedor;
}

export {
  createConflictError,
  createNotFoundError,
  createValidationError,
  required,
  statusEncerrados,
  validateCotacaoAbertaParaAlteracao,
  validateCotacaoExiste,
  validateFornecedorExiste,
  validateUsuarioExiste
};

export default {
  list,
  findOne,
  create,
  updateStatus
};
