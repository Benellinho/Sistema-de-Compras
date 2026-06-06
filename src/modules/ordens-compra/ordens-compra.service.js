import {
  createConflictError,
  createNotFoundError,
  createValidationError,
  required,
  validateUsuarioExiste
} from '../cotacoes/cotacoes/cotacoes.service.js';
import ordensCompraRepository from './ordens-compra.repository.js';

const statusValidos = new Set(['GERADA', 'CANCELADA', 'SUBSTITUIDA']);

async function findOne(id) {
  return validateOrdemExiste(id);
}

async function list(filters = {}) {
  if (filters?.status && !statusValidos.has(filters.status)) {
    throw createValidationError('Status da ordem de compra invalido.');
  }

  return ordensCompraRepository.findAll({
    status: filters?.status || null,
    compra_id: filters?.compra_id || null,
    solicitacao_id: filters?.solicitacao_id || null,
    compra_fornecedor_id: filters?.compra_fornecedor_id || null
  });
}

async function create(data = {}) {
  if (!required(data?.compra_fornecedor_id)) {
    throw createValidationError('Fornecedor da compra e obrigatorio.');
  }

  if (!required(data?.usuario_id)) {
    throw createValidationError('Usuario e obrigatorio para gerar ordem de compra.');
  }

  await validateUsuarioExiste(data.usuario_id);
  await validateCompraFornecedorElegivel(data.compra_fornecedor_id);
  await validateSemOrdemAtiva(data.compra_fornecedor_id);

  const numeroOc = await gerarNumeroOc();

  return ordensCompraRepository.create({
    numero_oc: numeroOc,
    compra_fornecedor_id: data.compra_fornecedor_id,
    usuario_id: data.usuario_id,
    observacoes: data?.observacoes ?? null
  });
}

async function cancelar(id, data = {}) {
  const ordem = await validateOrdemExiste(id);

  if (ordem.status !== 'GERADA') {
    throw createValidationError('Apenas ordem de compra gerada pode ser cancelada.');
  }

  if (!required(data?.usuario_id)) {
    throw createValidationError('Usuario e obrigatorio para cancelar ordem de compra.');
  }

  if (!required(data?.observacao)) {
    throw createValidationError('Observacao e obrigatoria para cancelar ordem de compra.');
  }

  await validateUsuarioExiste(data.usuario_id);

  return ordensCompraRepository.cancelar(id, {
    usuario_id: data.usuario_id,
    observacao: data.observacao
  });
}

async function gerarSubstituta(id, data = {}) {
  const ordem = await validateOrdemExiste(id);

  if (ordem.status !== 'CANCELADA') {
    throw createValidationError('Ordem substituta so pode ser gerada para OC cancelada.');
  }

  if (!required(data?.usuario_id)) {
    throw createValidationError('Usuario e obrigatorio para gerar ordem substituta.');
  }

  await validateUsuarioExiste(data.usuario_id);
  await validateCompraFornecedorElegivel(ordem.compra_fornecedor_id);
  await validateSemOrdemAtiva(ordem.compra_fornecedor_id);

  const numeroOc = await gerarNumeroOc();

  return ordensCompraRepository.create({
    numero_oc: numeroOc,
    compra_fornecedor_id: ordem.compra_fornecedor_id,
    ordem_substituida_id: ordem.id,
    usuario_id: data.usuario_id,
    observacoes: data?.observacoes ?? null
  });
}

async function getResumoByCompraId(compraId) {
  if (!required(compraId)) {
    throw createValidationError('Compra e obrigatoria.');
  }

  const compra = await ordensCompraRepository.findCompraById(compraId);

  if (!compra) {
    throw createNotFoundError('Compra nao encontrada.');
  }

  return ordensCompraRepository.getResumoByCompraId(compraId);
}

async function validateOrdemExiste(id) {
  const ordem = await ordensCompraRepository.findById(id);

  if (!ordem) {
    throw createNotFoundError('Ordem de compra nao encontrada.');
  }

  return ordem;
}

async function validateCompraFornecedorElegivel(compraFornecedorId) {
  const compraFornecedor = await ordensCompraRepository.findCompraFornecedor(compraFornecedorId);

  if (!compraFornecedor) {
    throw createNotFoundError('Fornecedor da compra nao encontrado.');
  }

  if (compraFornecedor.compra_status !== 'APROVADA') {
    throw createValidationError('Ordem de compra so pode ser gerada para compra aprovada.');
  }

  const totalItens = await ordensCompraRepository.countItensByCompraFornecedorId(compraFornecedorId);

  if (totalItens < 1) {
    throw createValidationError('Fornecedor da compra precisa ter ao menos um item para gerar OC.');
  }

  return compraFornecedor;
}

async function validateSemOrdemAtiva(compraFornecedorId) {
  const ordemAtiva = await ordensCompraRepository.findActiveByCompraFornecedorId(compraFornecedorId);

  if (ordemAtiva) {
    throw createConflictError('Fornecedor da compra ja possui ordem de compra ativa.');
  }
}

async function gerarNumeroOc() {
  const year = new Date().getFullYear();
  let sequence = await ordensCompraRepository.findNextNumeroOcSequence();

  for (let attempt = 0; attempt < 20; attempt += 1) {
    const numeroOc = `OC-${year}-${String(sequence).padStart(6, '0')}`;

    if (!(await ordensCompraRepository.numeroOcExists(numeroOc))) {
      return numeroOc;
    }

    sequence += 1;
  }

  throw createConflictError('Nao foi possivel gerar numero de OC unico.');
}

export default {
  list,
  findOne,
  create,
  cancelar,
  gerarSubstituta,
  getResumoByCompraId
};
