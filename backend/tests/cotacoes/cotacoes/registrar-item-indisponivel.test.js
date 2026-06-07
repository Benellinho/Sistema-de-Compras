import assert from 'node:assert/strict';
import comparativoCotacaoService from '../../../src/modules/cotacoes/comparativo/comparativo-cotacao.service.js';
import cotacoesService from '../../../src/modules/cotacoes/cotacoes/cotacoes.service.js';
import fornecedoresCotacaoService from '../../../src/modules/cotacoes/fornecedores/fornecedores-cotacao.service.js';
import respostasCotacaoService from '../../../src/modules/cotacoes/respostas/respostas-cotacao.service.js';
import {
  cleanupCotacaoFixtures,
  createFornecedorFixture,
  createSolicitacaoAprovadaComItemFixture
} from '../helpers/test-utils.js';

export default async function testRegistrarItemIndisponivel() {
  const solicitacao = await createSolicitacaoAprovadaComItemFixture();
  const fornecedor = await createFornecedorFixture();
  const cotacao = await cotacoesService.create({ solicitacao_id: solicitacao.id });
  const fornecedorCotacao = await fornecedoresCotacaoService.add(cotacao.id, {
    fornecedor_id: fornecedor.id
  });

  await fornecedoresCotacaoService.marcarEnvio(cotacao.id, fornecedorCotacao.id);

  await respostasCotacaoService.registrar(cotacao.id, fornecedorCotacao.id, {
    itens: [
      {
        solicitacao_item_id: solicitacao.itemSolicitacaoFixture.id,
        status_item: 'INDISPONIVEL',
        valor_unitario: null
      }
    ]
  });

  const comparativo = await comparativoCotacaoService.get(cotacao.id);
  const resposta = comparativo.itens[0].respostas[0];

  assert.equal(resposta.status_item, 'INDISPONIVEL');
  assert.equal(resposta.indisponivel, true);
  assert.equal(resposta.valor_unitario, null);
  assert.equal(resposta.valor_total, null);
  assert.equal(comparativo.itens[0].menor_valor, null);
  assert.equal(comparativo.fornecedores[0].total, 0);

  await cleanupCotacaoFixtures({ solicitacao, fornecedores: [fornecedor] });
}
