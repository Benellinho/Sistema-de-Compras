import itensRepository from './itens.repository.js';
import gruposRepository from '../grupos/grupos.repository.js';

const classificacoesValidas = new Set(['CUSTO', 'DESPESA', 'INVESTIMENTO', 'PLR']);

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
    throw createValidationError('Status ativo do item e obrigatorio.');
  }
}

async function validateGrupoAtivo(grupoId) {
  if (grupoId === undefined || grupoId === null) {
    throw createValidationError('Grupo do item e obrigatorio.');
  }

  const grupo = await gruposRepository.findById(grupoId);

  if (!grupo) {
    throw createNotFoundError('Grupo de item nao encontrado.');
  }

  if (!grupo.ativo) {
    throw createValidationError('Grupo inativo nao pode receber itens.');
  }
}

function validateClassificacao(classificacao) {
  if (classificacao !== undefined && !classificacoesValidas.has(classificacao)) {
    throw createValidationError('Classificacao de item invalida.');
  }
}

// Services concentram regras de negócio e mantêm controllers desacoplados do banco.
async function list() {
  return itensRepository.findAll();
}

async function findOne(id) {
  const item = await itensRepository.findById(id);

  if (!item) {
    throw createNotFoundError('Item nao encontrado.');
  }

  return item;
}

async function create(data) {
  if (!required(data?.codigo)) {
    throw createValidationError('Codigo do item e obrigatorio.');
  }

  if (!required(data?.descricao)) {
    throw createValidationError('Descricao do item e obrigatoria.');
  }

  if (!required(data?.unidade)) {
    throw createValidationError('Unidade do item e obrigatoria.');
  }

  validateClassificacao(data.classificacao);
  await validateGrupoAtivo(data.grupo_id);

  const item = await itensRepository.findByCodigo(data.codigo);

  if (item) {
    throw createConflictError('Ja existe um item cadastrado com este codigo.');
  }

  return itensRepository.create({
    ...data,
    controla_estoque: normalizeAtivo(data?.controla_estoque),
    ativo: normalizeAtivo(data?.ativo)
  });
}

async function update(id, data) {
  await findOne(id);

  if (data?.codigo !== undefined && !required(data.codigo)) {
    throw createValidationError('Codigo do item nao pode ser vazio.');
  }

  if (data?.descricao !== undefined && !required(data.descricao)) {
    throw createValidationError('Descricao do item nao pode ser vazia.');
  }

  if (data?.unidade !== undefined && !required(data.unidade)) {
    throw createValidationError('Unidade do item nao pode ser vazia.');
  }

  validateClassificacao(data.classificacao);
  if (data?.grupo_id !== undefined) {
    await validateGrupoAtivo(data.grupo_id);
  }

  const itemComCodigo = data?.codigo ? await itensRepository.findByCodigo(data.codigo) : null;

  if (itemComCodigo && Number(itemComCodigo.id) !== Number(id)) {
    throw createConflictError('Ja existe um item cadastrado com este codigo.');
  }

  return itensRepository.update(id, {
    ...data,
    grupo_id: data?.grupo_id === undefined ? (await findOne(id)).grupo_id : data.grupo_id,
    controla_estoque: normalizeAtivo(data?.controla_estoque),
    ativo: normalizeAtivo(data?.ativo)
  });
}

async function updateStatus(id, data) {
  await findOne(id);
  validateAtivoInformado(data?.ativo);

  return update(id, {
    ativo: data.ativo
  });
}

async function remove(id) {
  await findOne(id);
  await itensRepository.remove(id);
}

export default {
  list,
  findOne,
  create,
  update,
  updateStatus,
  remove
};
