import {
  createConflictError,
  createNotFoundError,
  createValidationError,
  required,
  validateCotacaoExiste,
  validateFornecedorExiste,
  validateUsuarioExiste
} from '../../cotacoes/cotacoes/cotacoes.service.js';
import comprasRepository from './compras.repository.js';

const statusValidos = new Set(['EM_MONTAGEM', 'AGUARDANDO_APROVACAO', 'APROVADA', 'CANCELADA']);
const statusFinais = new Set(['APROVADA', 'CANCELADA']);
const justificativasValidas = new Set([
  'MENOR_PRECO',
  'PRAZO',
  'PECA_ORIGINAL',
  'GARANTIA',
  'QUALIDADE',
  'DISPONIBILIDADE',
  'OUTRO'
]);

async function findOne(id) {
  return validateCompraExiste(id);
}

async function list(filters = {}) {
  if (filters?.status && !statusValidos.has(filters.status)) {
    throw createValidationError('Status da compra invalido.');
  }

  return comprasRepository.findAll({
    status: filters?.status || null,
    solicitacao_id: filters?.solicitacao_id || null,
    cotacao_id: filters?.cotacao_id || null
  });
}

async function create(data) {
  if (!required(data?.cotacao_id)) {
    throw createValidationError('Cotacao e obrigatoria para criar compra.');
  }

  const cotacao = await validateCotacaoExiste(data.cotacao_id);

  if (cotacao.status !== 'APROVADA') {
    throw createValidationError('Compra so pode ser criada para cotacao aprovada.');
  }

  await validateUsuarioExiste(data?.criado_por, 'Usuario criador');

  const compraExistente = await comprasRepository.findByCotacaoId(data.cotacao_id);

  if (compraExistente) {
    throw createConflictError('Cotacao ja possui compra criada.');
  }

  return comprasRepository.create({
    solicitacao_id: cotacao.solicitacao_id,
    cotacao_id: cotacao.id,
    criado_por: data?.criado_por ?? null,
    observacoes: data?.observacoes ?? null,
    status_anterior: 'COTACAO_APROVADA'
  });
}

async function addFornecedor(compraId, data) {
  const compra = await validateCompraExiste(compraId);
  validateCompraEmMontagem(compra);

  if (!required(data?.fornecedor_id)) {
    throw createValidationError('Fornecedor e obrigatorio.');
  }

  await validateFornecedorExiste(data.fornecedor_id);
  await validateUsuarioExiste(data?.usuario_id);

  const fornecedorCotacao = await comprasRepository.findCotacaoFornecedor(compra.cotacao_id, data.fornecedor_id);

  if (!fornecedorCotacao) {
    throw createValidationError('Fornecedor nao participou da cotacao da compra.');
  }

  if (fornecedorCotacao.status !== 'RESPONDIDO') {
    throw createValidationError('Fornecedor precisa ter resposta registrada na cotacao.');
  }

  const fornecedorExistente = await comprasRepository.findCompraFornecedorByCompraAndFornecedor(
    compraId,
    data.fornecedor_id
  );

  if (fornecedorExistente) {
    throw createConflictError('Fornecedor ja participa desta compra.');
  }

  const justificativas = validateJustificativas(data?.justificativas, data?.justificativa_texto);

  return comprasRepository.addFornecedor({
    compra_id: compraId,
    fornecedor_id: data.fornecedor_id,
    prazo_entrega: data?.prazo_entrega ?? fornecedorCotacao.prazo_entrega ?? null,
    forma_pagamento: data?.forma_pagamento ?? fornecedorCotacao.forma_pagamento ?? null,
    justificativa_texto: data?.justificativa_texto ?? null,
    justificativas,
    usuario_id: data?.usuario_id ?? null
  });
}

async function addItem(compraId, compraFornecedorId, data) {
  const compra = await validateCompraExiste(compraId);
  validateCompraEmMontagem(compra);

  const compraFornecedor = await validateFornecedorDaCompra(compraId, compraFornecedorId);
  await validateUsuarioExiste(data?.usuario_id);

  if (!required(data?.solicitacao_item_id)) {
    throw createValidationError('Item da solicitacao e obrigatorio.');
  }

  const solicitacaoItem = await comprasRepository.findSolicitacaoItemForCompra(compraId, data.solicitacao_item_id);

  if (!solicitacaoItem) {
    throw createValidationError('Item nao pertence a solicitacao da compra.');
  }

  const respostaCotacao = await comprasRepository.findCotacaoRespostaItem(
    compra.cotacao_id,
    compraFornecedor.fornecedor_id,
    data.solicitacao_item_id
  );

  if (!respostaCotacao) {
    throw createValidationError('Fornecedor nao possui resposta para este item na cotacao.');
  }

  if (respostaCotacao.status_item !== 'DISPONIVEL') {
    throw createValidationError('Item indisponivel na cotacao nao pode ser comprado.');
  }

  if (!required(respostaCotacao.valor_unitario)) {
    throw createValidationError('Item sem valor cotado nao pode ser comprado.');
  }

  const quantidadePedida = Number(data?.quantidade_pedida);

  if (!Number.isFinite(quantidadePedida) || quantidadePedida <= 0) {
    throw createValidationError('Quantidade pedida deve ser maior que zero.');
  }

  return comprasRepository.addItem({
    compra_id: compraId,
    compra_fornecedor_id: compraFornecedorId,
    solicitacao_item_id: data.solicitacao_item_id,
    quantidade_pedida: quantidadePedida,
    valor_unitario: Number(respostaCotacao.valor_unitario),
    usuario_id: data?.usuario_id ?? null
  });
}

async function enviarAprovacao(id, data = {}) {
  const compra = await validateCompraExiste(id);

  if (compra.status !== 'EM_MONTAGEM') {
    throw createValidationError('Compra precisa estar em montagem para enviar a aprovacao.');
  }

  await validateUsuarioExiste(data?.usuario_id);
  await validateCompraCompleta(id);

  return comprasRepository.enviarAprovacao(id, {
    usuario_id: data?.usuario_id ?? null,
    observacao: data?.observacao ?? null
  });
}

async function aprovar(id, data = {}) {
  const compra = await validateCompraExiste(id);

  if (compra.status !== 'AGUARDANDO_APROVACAO') {
    throw createValidationError('Compra precisa aguardar aprovacao para ser aprovada.');
  }

  if (await comprasRepository.hasDecisaoFinal(id)) {
    throw createConflictError('Compra ja possui decisao final.');
  }

  if (!required(data?.aprovador_id)) {
    throw createValidationError('Aprovador e obrigatorio.');
  }

  await validateUsuarioExiste(data.aprovador_id, 'Aprovador');
  await validateCompraCompleta(id);

  return comprasRepository.aprovar(id, {
    aprovador_id: data.aprovador_id,
    observacao: data?.observacao ?? null
  });
}

async function cancelar(id, data = {}) {
  const compra = await validateCompraExiste(id);

  if (statusFinais.has(compra.status)) {
    throw createValidationError('Compra encerrada nao permite cancelamento.');
  }

  if (await comprasRepository.hasDecisaoFinal(id)) {
    throw createConflictError('Compra ja possui decisao final.');
  }

  if (!required(data?.usuario_id)) {
    throw createValidationError('Usuario e obrigatorio para cancelar compra.');
  }

  if (!required(data?.observacao)) {
    throw createValidationError('Observacao e obrigatoria para cancelar compra.');
  }

  await validateUsuarioExiste(data.usuario_id);

  return comprasRepository.cancelar(id, {
    usuario_id: data.usuario_id,
    observacao: data.observacao
  });
}

async function validateCompraExiste(id) {
  const compra = await comprasRepository.findById(id);

  if (!compra) {
    throw createNotFoundError('Compra nao encontrada.');
  }

  return compra;
}

async function validateFornecedorDaCompra(compraId, compraFornecedorId) {
  const compraFornecedor = await comprasRepository.findCompraFornecedorById(compraFornecedorId);

  if (!compraFornecedor || Number(compraFornecedor.compra_id) !== Number(compraId)) {
    throw createValidationError('Fornecedor nao pertence a compra informada.');
  }

  return compraFornecedor;
}

function validateCompraEmMontagem(compra) {
  if (compra.status !== 'EM_MONTAGEM') {
    throw createValidationError('Compra nao permite alteracoes neste status.');
  }
}

function validateJustificativas(justificativas, justificativaTexto) {
  if (!Array.isArray(justificativas) || justificativas.length < 1) {
    throw createValidationError('Fornecedor da compra deve possuir ao menos uma justificativa.');
  }

  const unicas = [...new Set(justificativas)];

  if (unicas.length !== justificativas.length) {
    throw createValidationError('Justificativa duplicada para o fornecedor da compra.');
  }

  for (const justificativa of unicas) {
    if (!justificativasValidas.has(justificativa)) {
      throw createValidationError('Justificativa da compra invalida.');
    }
  }

  if (unicas.includes('OUTRO') && !required(justificativaTexto)) {
    throw createValidationError('Justificativa OUTRO exige texto complementar.');
  }

  return unicas;
}

async function validateCompraCompleta(id) {
  const totalFornecedores = await comprasRepository.countFornecedores(id);

  if (totalFornecedores < 1) {
    throw createValidationError('Compra precisa ter ao menos um fornecedor.');
  }

  const totalItens = await comprasRepository.countItens(id);

  if (totalItens < 1) {
    throw createValidationError('Compra precisa ter ao menos um item.');
  }
}

export default {
  list,
  findOne,
  create,
  addFornecedor,
  addItem,
  enviarAprovacao,
  aprovar,
  cancelar
};
