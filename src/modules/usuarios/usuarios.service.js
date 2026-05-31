import usuariosRepository from './usuarios.repository.js';

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

function normalizeAtivo(value) {
  if (value === undefined || value === null) {
    return value;
  }

  return value ? 1 : 0;
}

function validateEmail(email) {
  if (!required(email)) {
    throw createValidationError('Email do usuario e obrigatorio.');
  }

  if (!String(email).includes('@')) {
    throw createValidationError('Email do usuario e invalido.');
  }
}

// Services concentram regras de negócio e mantêm controllers desacoplados do banco.
async function list() {
  return usuariosRepository.findAll();
}

async function findOne(id) {
  const usuario = await usuariosRepository.findById(id);

  if (!usuario) {
    throw createNotFoundError('Usuario nao encontrado.');
  }

  return usuario;
}

async function create(data) {
  if (!required(data?.nome)) {
    throw createValidationError('Nome do usuario e obrigatorio.');
  }

  validateEmail(data?.email);

  const usuario = await usuariosRepository.findByEmail(data.email);

  if (usuario) {
    throw createConflictError('Ja existe um usuario cadastrado com este email.');
  }

  return usuariosRepository.create({
    ...data,
    ativo: normalizeAtivo(data?.ativo)
  });
}

async function update(id, data) {
  await findOne(id);

  if (data?.nome !== undefined && !required(data.nome)) {
    throw createValidationError('Nome do usuario nao pode ser vazio.');
  }

  if (data?.email !== undefined) {
    validateEmail(data.email);
  }

  const usuarioComEmail = data?.email ? await usuariosRepository.findByEmail(data.email) : null;

  if (usuarioComEmail && Number(usuarioComEmail.id) !== Number(id)) {
    throw createConflictError('Ja existe um usuario cadastrado com este email.');
  }

  return usuariosRepository.update(id, {
    ...data,
    ativo: normalizeAtivo(data?.ativo)
  });
}

async function remove(id) {
  await findOne(id);
  await usuariosRepository.remove(id);
}

export default {
  list,
  findOne,
  create,
  update,
  remove
};
