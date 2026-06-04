import solicitacoesRepository from './solicitacoes.repository.js';
import usuariosRepository from '../../usuarios/usuarios.repository.js';

const statusValidos = new Set([
  'ABERTA',
  'APROVADA',
  'REPROVADA',
  'EM_COTACAO',
  'EM_ANALISE_COTACAO',
  'COTACAO_REPROVADA',
  'COTACAO_APROVADA',
  'EM_ESCOLHA_FORNECEDOR',
  'AGUARDANDO_APROVACAO_COMPRA',
  'COMPRA_APROVADA',
  'COMPRA_REPROVADA',
  'OC_GERADA',
  'OC_ENVIADA',
  'AGUARDANDO_RECEBIMENTO',
  'RECEBIDA_PARCIAL',
  'RECEBIDA_TOTAL',
  'CANCELADA',
  'FINALIZADA'
]);

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

async function validateUsuarioExiste(usuarioId, label = 'Usuario') {
  if (!required(usuarioId)) {
    throw createValidationError(`${label} e obrigatorio.`);
  }

  const usuario = await usuariosRepository.findById(usuarioId);

  if (!usuario) {
    throw createNotFoundError(`${label} nao encontrado.`);
  }

  return usuario;
}

function validateStatus(status) {
  if (!required(status)) {
    throw createValidationError('Status da solicitacao e obrigatorio.');
  }

  if (!statusValidos.has(status)) {
    throw createValidationError('Status da solicitacao invalido.');
  }
}

// Services concentram regras de negócio e mantêm controllers desacoplados do banco.
async function list() {
  return solicitacoesRepository.findAll();
}

async function findOne(id) {
  const solicitacao = await solicitacoesRepository.findById(id);

  if (!solicitacao) {
    throw createNotFoundError('Solicitacao nao encontrada.');
  }

  const itens = await solicitacoesRepository.findItensBySolicitacaoId(id);

  return {
    ...solicitacao,
    itens
  };
}

async function create(data) {
  await validateUsuarioExiste(data?.solicitante_id, 'Solicitante');

  return solicitacoesRepository.create({
    solicitante_id: data.solicitante_id,
    status: 'ABERTA',
    observacoes: data?.observacoes ?? null
  });
}

async function updateStatus(id, data) {
  await findOne(id);
  validateStatus(data?.status);

  return solicitacoesRepository.updateStatus(id, data.status);
}

export default {
  list,
  findOne,
  create,
  updateStatus
};
