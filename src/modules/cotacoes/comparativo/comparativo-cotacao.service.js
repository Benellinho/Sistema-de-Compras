import cotacoesRepository from '../cotacoes/cotacoes.repository.js';
import { validateCotacaoExiste } from '../cotacoes/cotacoes.service.js';

async function get(cotacaoId) {
  const cotacao = await validateCotacaoExiste(cotacaoId);
  const resumo = await cotacoesRepository.getResumoRespostas(cotacaoId);
  const { itens, respostas } = await cotacoesRepository.getComparativo(cotacaoId);

  const fornecedoresMap = new Map();

  for (const resposta of respostas) {
    if (!fornecedoresMap.has(resposta.cotacao_fornecedor_id)) {
      fornecedoresMap.set(resposta.cotacao_fornecedor_id, {
        cotacao_fornecedor_id: resposta.cotacao_fornecedor_id,
        fornecedor_id: resposta.fornecedor_id,
        fornecedor_razao_social: resposta.fornecedor_razao_social,
        status: resposta.fornecedor_status,
        prazo_entrega: resposta.prazo_entrega,
        forma_pagamento: resposta.forma_pagamento,
        total: 0,
        itens: []
      });
    }

    const fornecedor = fornecedoresMap.get(resposta.cotacao_fornecedor_id);

    if (resposta.solicitacao_item_id) {
      fornecedor.total += Number(resposta.valor_total ?? 0);
    }
  }

  const fornecedores = [...fornecedoresMap.values()];

  const itensComparativo = itens.map((item) => {
    const respostasItem = fornecedores.map((fornecedor) => {
      const resposta = respostas.find(
        (candidate) =>
          Number(candidate.cotacao_fornecedor_id) === Number(fornecedor.cotacao_fornecedor_id) &&
          Number(candidate.solicitacao_item_id) === Number(item.solicitacao_item_id)
      );

      const respostaFormatada = resposta
        ? {
            cotacao_fornecedor_id: fornecedor.cotacao_fornecedor_id,
            fornecedor_id: fornecedor.fornecedor_id,
            fornecedor_razao_social: fornecedor.fornecedor_razao_social,
            status: fornecedor.status,
            quantidade: resposta.quantidade,
            valor_unitario: resposta.valor_unitario,
            valor_total: resposta.valor_total,
            observacoes: resposta.observacoes
          }
        : {
            cotacao_fornecedor_id: fornecedor.cotacao_fornecedor_id,
            fornecedor_id: fornecedor.fornecedor_id,
            fornecedor_razao_social: fornecedor.fornecedor_razao_social,
            status: fornecedor.status,
            sem_resposta: true
          };

      fornecedor.itens.push({
        solicitacao_item_id: item.solicitacao_item_id,
        valor_total: resposta?.valor_total ?? null,
        sem_resposta: !resposta
      });

      return respostaFormatada;
    });

    const respostasComValor = respostasItem.filter((resposta) => !resposta.sem_resposta);
    const menorValor = respostasComValor.reduce((menor, resposta) => {
      if (!menor || Number(resposta.valor_unitario) < Number(menor.valor_unitario)) {
        return resposta;
      }

      return menor;
    }, null);

    return {
      ...item,
      menor_valor: menorValor,
      respostas: respostasItem
    };
  });

  return {
    cotacao,
    resumo_respostas: resumo,
    fornecedores,
    itens: itensComparativo
  };
}

export default {
  get
};
