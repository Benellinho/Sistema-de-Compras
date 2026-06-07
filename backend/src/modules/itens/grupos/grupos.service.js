import gruposRepository from './grupos.repository.js';

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

function validateAtivoInformado(ativo) {
  if (ativo === undefined || ativo === null) {
    throw createValidationError('Status ativo do grupo e obrigatorio.');
  }
}

// Services concentram regras de negócio e mantêm controllers desacoplados do banco.
async function list() {
  return gruposRepository.findAll();
}

async function findOne(id) {
  const grupo = await gruposRepository.findById(id);

  if (!grupo) {
    throw createNotFoundError('Grupo de item nao encontrado.');
  }

  return grupo;
}

async function create(data) {
  if (!required(data?.nome)) {
    throw createValidationError('Nome do grupo e obrigatorio.');
  }

  const grupo = await gruposRepository.findByNome(data.nome);

  if (grupo) {
    throw createConflictError('Ja existe um grupo de item com este nome.');
  }

  return gruposRepository.create({
    ...data,
    ativo: normalizeAtivo(data?.ativo)
  });
}

async function update(id, data) {
  await findOne(id);

  if (data?.nome !== undefined && !required(data.nome)) {
    throw createValidationError('Nome do grupo nao pode ser vazio.');
  }

  const grupoComNome = data?.nome ? await gruposRepository.findByNome(data.nome) : null;

  if (grupoComNome && Number(grupoComNome.id) !== Number(id)) {
    throw createConflictError('Ja existe um grupo de item com este nome.');
  }

  return gruposRepository.update(id, {
    ...data,
    ativo: normalizeAtivo(data?.ativo)
  });
}

async function updateStatus(id, data) {
  await findOne(id);
  validateAtivoInformado(data?.ativo);

  return gruposRepository.update(id, {
    ativo: normalizeAtivo(data.ativo)
  });
}

async function remove(id) {
  await findOne(id);

  const totalItens = await gruposRepository.countItensByGrupoId(id);

  if (totalItens > 0) {
    throw createConflictError('Nao e possivel excluir grupo com itens vinculados.');
  }

  await gruposRepository.remove(id);
}

export default {
  list,
  findOne,
  create,
  update,
  updateStatus,
  remove
};
