import cotacoesRepository from '../cotacoes/cotacoes.repository.js';
import {
  createValidationError,
  required,
  validateCotacaoAbertaParaAlteracao,
  validateCotacaoExiste,
  validateUsuarioExiste
} from '../cotacoes/cotacoes.service.js';
import { validateFornecedorDaCotacao } from '../fornecedores/fornecedores-cotacao.service.js';

async function registrar(cotacaoId, cotacaoFornecedorId, data) {
  const cotacao = await validateCotacaoExiste(cotacaoId);
  validateCotacaoAbertaParaAlteracao(cotacao);

  if (cotacao.status === 'EM_ANALISE') {
    throw createValidationError('Cotacao em analise nao permite registrar novas respostas.');
  }

  const fornecedorCotacao = await validateFornecedorDaCotacao(cotacaoId, cotacaoFornecedorId);

  if (fornecedorCotacao.status === 'RECUSADO' || fornecedorCotacao.status === 'SEM_RESPOSTA') {
    throw createValidationError('Fornecedor sem resposta valida nao permite registrar valores.');
  }

  await validateUsuarioExiste(data?.usuario_id);

  if (!Array.isArray(data?.itens) || data.itens.length < 1) {
    throw createValidationError('Resposta deve possuir ao menos um item.');
  }

  const itensValidados = [];

  for (const item of data.itens) {
    itensValidados.push(await validateItemResposta(cotacaoId, item));
  }

  return cotacoesRepository.registrarResposta({
    cotacao_id: cotacaoId,
    cotacao_fornecedor_id: cotacaoFornecedorId,
    prazo_entrega: data?.prazo_entrega ?? null,
    forma_pagamento: data?.forma_pagamento ?? null,
    observacoes: data?.observacoes ?? null,
    itens: itensValidados,
    usuario_id: data?.usuario_id ?? null
  });
}

async function validateItemResposta(cotacaoId, item) {
  if (!required(item?.solicitacao_item_id)) {
    throw createValidationError('Item da solicitacao e obrigatorio.');
  }

  const solicitacaoItem = await cotacoesRepository.findSolicitacaoItemForCotacao(
    cotacaoId,
    item.solicitacao_item_id
  );

  if (!solicitacaoItem) {
    throw createValidationError('Item nao pertence a solicitacao da cotacao.');
  }

  const statusItem = item?.indisponivel === true || item?.status_item === 'INDISPONIVEL'
    ? 'INDISPONIVEL'
    : 'DISPONIVEL';

  if (statusItem === 'INDISPONIVEL') {
    if (required(item?.quantidade)) {
      throw createValidationError('Item indisponivel nao deve possuir quantidade cotada.');
    }

    if (required(item?.valor_unitario)) {
      throw createValidationError('Item indisponivel deve manter valor unitario nulo.');
    }

    return {
      solicitacao_item_id: item.solicitacao_item_id,
      status_item: 'INDISPONIVEL',
      quantidade: null,
      valor_unitario: null,
      observacoes: item?.observacoes ?? null
    };
  }

  if (item?.status_item && item.status_item !== 'DISPONIVEL') {
    throw createValidationError('Status do item da cotacao invalido.');
  }

  const quantidade = Number(item?.quantidade);

  if (!Number.isFinite(quantidade) || quantidade <= 0) {
    throw createValidationError('Quantidade cotada deve ser maior que zero.');
  }

  if (quantidade > Number(solicitacaoItem.quantidade)) {
    throw createValidationError('Quantidade cotada nao pode ser maior que a solicitada.');
  }

  if (!required(item?.valor_unitario)) {
    throw createValidationError('Valor unitario e obrigatorio para registrar resposta.');
  }

  const valorUnitario = Number(item.valor_unitario);

  if (!Number.isFinite(valorUnitario) || valorUnitario < 0) {
    throw createValidationError('Valor unitario nao pode ser negativo.');
  }

  if (valorUnitario === 0) {
    throw createValidationError('Valor unitario deve ser maior que zero para considerar o item respondido.');
  }

  return {
    solicitacao_item_id: item.solicitacao_item_id,
    status_item: 'DISPONIVEL',
    quantidade,
    valor_unitario: valorUnitario,
    observacoes: item?.observacoes ?? null
  };
}

export default {
  registrar
};
