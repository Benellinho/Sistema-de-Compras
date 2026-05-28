import fornecedoresRepository from './fornecedores.repository.js';

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

async function validateCnpjNaoDuplicado(cnpj) {
  const fornecedor = await fornecedoresRepository.findByCnpj(cnpj);

  if (fornecedor) {
    throw createConflictError('Ja existe um fornecedor cadastrado com este CNPJ.');
  }
}

// Services concentram regras de negócio e mantêm controllers desacoplados do banco.
async function list() {
  return fornecedoresRepository.findAll();
}

async function create(data) {
  if (!required(data?.cnpj)) {
    throw createValidationError('CNPJ e obrigatorio.');
  }

  if (!required(data?.razao_social)) {
    throw createValidationError('Razao social e obrigatoria.');
  }

  await validateCnpjNaoDuplicado(data.cnpj);

  return fornecedoresRepository.create(data);
}

async function update(id, data) {
  const fornecedor = await fornecedoresRepository.findById(id);

  if (!fornecedor) {
    throw createNotFoundError('Fornecedor nao encontrado.');
  }

  return fornecedoresRepository.update(id, data);
}

export default {
  list,
  create,
  update
};
