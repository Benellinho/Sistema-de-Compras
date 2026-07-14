import {
  createConflictError,
  createNotFoundError,
  createValidationError,
  required,
  statusEncerrados as statusCotacaoEncerrados,
  validateCotacaoExiste,
  validateFornecedorExiste,
  validateUsuarioExiste
} from '../../cotacoes/cotacoes/cotacoes.service.js';
import cotacoesService from '../../cotacoes/cotacoes/cotacoes.service.js';
import solicitacoesRepository from '../../solicitacoes/solicitacoes/solicitacoes.repository.js';
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

  if (!required(respostaCotacao.valor_unitario) || Number(respostaCotacao.valor_unitario) <= 0) {
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

async function aprovarCotacaoPorItens(cotacaoId, data = {}) {
  if (!required(data?.usuario_id)) {
    throw createValidationError('Usuario e obrigatorio para aprovar cotacao por item.');
  }

  if (!Array.isArray(data?.itens) || data.itens.length < 1) {
    throw createValidationError('Informe os itens aprovados da cotacao.');
  }

  const cotacao = await validateCotacaoExiste(cotacaoId);

  if (statusCotacaoEncerrados.has(cotacao.status)) {
    throw createValidationError('Cotacao encerrada nao permite aprovacao por item.');
  }

  await validateUsuarioExiste(data.usuario_id);

  const compraExistente = await comprasRepository.findByCotacaoId(cotacaoId);

  if (compraExistente) {
    throw createConflictError('Cotacao ja possui compra criada.');
  }

  const justificativas = validateJustificativas(data?.justificativas, data?.observacao);
  const itensSolicitacao = (await solicitacoesRepository.findItensBySolicitacaoId(cotacao.solicitacao_id))
    .filter((item) => item.item_id !== null && item.item_id !== undefined);
  const itensPorId = new Map(itensSolicitacao.map((item) => [Number(item.id), item]));
  const escolhas = normalizarEscolhasItens(data.itens);

  validarCoberturaItens(itensSolicitacao, escolhas);

  const escolhasValidadas = [];

  for (const escolha of escolhas) {
    const itemSolicitacao = itensPorId.get(Number(escolha.solicitacao_item_id));
    const fornecedorCotacao = await comprasRepository.findCotacaoFornecedor(
      cotacao.id,
      escolha.fornecedor_id
    );

    if (!fornecedorCotacao) {
      throw createValidationError('Fornecedor nao participou da cotacao da compra.');
    }

    if (fornecedorCotacao.status !== 'RESPONDIDO') {
      throw createValidationError('Fornecedor precisa ter resposta registrada na cotacao.');
    }

    const respostaCotacao = await comprasRepository.findCotacaoRespostaItem(
      cotacao.id,
      escolha.fornecedor_id,
      escolha.solicitacao_item_id
    );

    if (!respostaCotacao) {
      throw createValidationError('Fornecedor nao possui resposta para um item aprovado.');
    }

    if (respostaCotacao.status_item !== 'DISPONIVEL') {
      throw createValidationError('Item indisponivel na cotacao nao pode ser comprado.');
    }

    if (!required(respostaCotacao.valor_unitario) || Number(respostaCotacao.valor_unitario) <= 0) {
      throw createValidationError('Item sem valor cotado nao pode ser comprado.');
    }

    const quantidadePedida = Number(itemSolicitacao.quantidade);

    if (!Number.isFinite(quantidadePedida) || quantidadePedida <= 0) {
      throw createValidationError('Quantidade solicitada invalida para item aprovado.');
    }

    escolhasValidadas.push({
      ...escolha,
      quantidade_pedida: quantidadePedida,
      fornecedorCotacao
    });
  }

  const observacao = data?.observacao ?? 'Aprovacao de cotacao por item.';

  await cotacoesService.updateStatus(cotacao.id, {
    status: 'APROVADA',
    usuario_id: data.usuario_id,
    observacao
  });

  const compra = await create({
    cotacao_id: cotacao.id,
    criado_por: data.usuario_id,
    observacoes: observacao
  });
  const fornecedoresCompra = new Map();

  for (const escolha of escolhasValidadas) {
    const fornecedorKey = Number(escolha.fornecedor_id);
    let fornecedorCompra = fornecedoresCompra.get(fornecedorKey);

    if (!fornecedorCompra) {
      fornecedorCompra = await addFornecedor(compra.id, {
        fornecedor_id: escolha.fornecedor_id,
        usuario_id: data.usuario_id,
        justificativas,
        justificativa_texto: observacao,
        prazo_entrega: escolha.fornecedorCotacao.prazo_entrega,
        forma_pagamento: escolha.fornecedorCotacao.forma_pagamento
      });
      fornecedoresCompra.set(fornecedorKey, fornecedorCompra);
    }

    await addItem(compra.id, fornecedorCompra.id, {
      solicitacao_item_id: escolha.solicitacao_item_id,
      quantidade_pedida: escolha.quantidade_pedida,
      usuario_id: data.usuario_id
    });
  }

  await enviarAprovacao(compra.id, {
    usuario_id: data.usuario_id,
    observacao: 'Compra enviada para aprovacao por aprovacao de cotacao por item.'
  });

  return aprovar(compra.id, {
    aprovador_id: data.usuario_id,
    observacao
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

function normalizarEscolhasItens(itens = []) {
  const idsUsados = new Set();

  return itens.map((item) => {
    if (!required(item?.solicitacao_item_id)) {
      throw createValidationError('Item da solicitacao e obrigatorio na aprovacao por item.');
    }

    if (!required(item?.fornecedor_id)) {
      throw createValidationError('Fornecedor e obrigatorio para cada item aprovado.');
    }

    const solicitacaoItemId = Number(item.solicitacao_item_id);

    if (idsUsados.has(solicitacaoItemId)) {
      throw createValidationError('Cada item da solicitacao deve ser aprovado apenas uma vez.');
    }

    idsUsados.add(solicitacaoItemId);

    return {
      solicitacao_item_id: solicitacaoItemId,
      fornecedor_id: Number(item.fornecedor_id)
    };
  });
}

function validarCoberturaItens(itensSolicitacao, escolhas) {
  if (itensSolicitacao.length < 1) {
    throw createValidationError('Cotacao precisa ter ao menos um item catalogado para aprovacao.');
  }

  const escolhasPorItem = new Set(escolhas.map((item) => Number(item.solicitacao_item_id)));

  for (const item of itensSolicitacao) {
    if (!escolhasPorItem.has(Number(item.id))) {
      throw createValidationError('Todos os itens catalogados precisam ter fornecedor escolhido.');
    }
  }

  const itensValidos = new Set(itensSolicitacao.map((item) => Number(item.id)));

  for (const escolha of escolhas) {
    if (!itensValidos.has(Number(escolha.solicitacao_item_id))) {
      throw createValidationError('Item aprovado nao pertence a cotacao informada.');
    }
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
  aprovarCotacaoPorItens,
  cancelar
};
