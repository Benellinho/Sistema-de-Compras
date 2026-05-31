import solicitacoesRepository from './solicitacoes.repository.js';
import usuariosRepository from '../usuarios/usuarios.repository.js';

const statusValidos = new Set(['ABERTA', 'CANCELADA', 'FINALIZADA']);

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

async function validateSolicitanteExiste(solicitanteId) {
  if (!required(solicitanteId)) {
    throw createValidationError('Solicitante e obrigatorio.');
  }

  const usuario = await usuariosRepository.findById(solicitanteId);

  if (!usuario) {
    throw createNotFoundError('Solicitante nao encontrado.');
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
  await validateSolicitanteExiste(data?.solicitante_id);

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
