import fornecedoresRepository from '../fornecedores.repository.js';
import contatosRepository from './contatos.repository.js';

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

async function validateFornecedorExiste(fornecedorId) {
  const fornecedor = await fornecedoresRepository.findById(fornecedorId);

  if (!fornecedor) {
    throw createNotFoundError('Fornecedor nao encontrado.');
  }

  return fornecedor;
}

async function validateContatoDoFornecedor(fornecedorId, contatoId) {
  const contato = await contatosRepository.findById(contatoId);

  if (!contato || Number(contato.fornecedor_id) !== Number(fornecedorId)) {
    throw createNotFoundError('Contato nao encontrado para este fornecedor.');
  }

  return contato;
}

// Services concentram regras de negócio e mantêm controllers desacoplados do banco.
async function list(fornecedorId) {
  await validateFornecedorExiste(fornecedorId);

  return contatosRepository.findAllByFornecedorId(fornecedorId);
}

async function findOne(fornecedorId, contatoId) {
  return validateContatoDoFornecedor(fornecedorId, contatoId);
}

async function create(fornecedorId, data) {
  await validateFornecedorExiste(fornecedorId);

  if (!required(data?.nome)) {
    throw createValidationError('Nome do contato e obrigatorio.');
  }

  return contatosRepository.create(fornecedorId, data);
}

async function update(fornecedorId, contatoId, data) {
  await validateContatoDoFornecedor(fornecedorId, contatoId);

  if (data?.nome !== undefined && !required(data.nome)) {
    throw createValidationError('Nome do contato nao pode ser vazio.');
  }

  return contatosRepository.update(contatoId, data);
}

async function remove(fornecedorId, contatoId) {
  await validateContatoDoFornecedor(fornecedorId, contatoId);
  await contatosRepository.remove(contatoId);
}

export default {
  list,
  findOne,
  create,
  update,
  remove
};
