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

  return {
    solicitacao_item_id: item.solicitacao_item_id,
    quantidade,
    valor_unitario: valorUnitario,
    observacoes: item?.observacoes ?? null
  };
}

export default {
  registrar
};
