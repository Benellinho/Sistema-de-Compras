import assert from 'node:assert/strict';
import cotacoesService from '../../../src/modules/cotacoes/cotacoes/cotacoes.service.js';
import fornecedoresCotacaoService from '../../../src/modules/cotacoes/fornecedores/fornecedores-cotacao.service.js';
import respostasCotacaoService from '../../../src/modules/cotacoes/respostas/respostas-cotacao.service.js';
import {
  cleanupCotacaoFixtures,
  createFornecedorFixture,
  createSolicitacaoAprovadaComItemFixture
} from '../helpers/test-utils.js';

export default async function testBuscarDetalhesCotacao() {
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
        quantidade: 4,
        valor_unitario: 15
      }
    ]
  });

  const detalhes = await cotacoesService.findOne(cotacao.id);

  assert.equal(detalhes.id, cotacao.id);
  assert.equal(detalhes.fornecedores.length, 1);
  assert.equal(detalhes.fornecedores[0].fornecedor_id, fornecedor.id);
  assert.equal(detalhes.fornecedores[0].itens.length, 1);
  assert.equal(detalhes.fornecedores[0].itens[0].solicitacao_item_id, solicitacao.itemSolicitacaoFixture.id);
  assert.equal(detalhes.fornecedores[0].itens[0].valor_unitario, 15);

  await cleanupCotacaoFixtures({ solicitacao, fornecedores: [fornecedor] });
}
