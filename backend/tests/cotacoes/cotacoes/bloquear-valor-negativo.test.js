import assert from 'node:assert/strict';
import cotacoesService from '../../../src/modules/cotacoes/cotacoes/cotacoes.service.js';
import fornecedoresCotacaoService from '../../../src/modules/cotacoes/fornecedores/fornecedores-cotacao.service.js';
import respostasCotacaoService from '../../../src/modules/cotacoes/respostas/respostas-cotacao.service.js';
import {
  cleanupCotacaoFixtures,
  createFornecedorFixture,
  createSolicitacaoAprovadaComItemFixture
} from '../helpers/test-utils.js';

export default async function testBloquearValorNegativo() {
  const solicitacao = await createSolicitacaoAprovadaComItemFixture();
  const fornecedor = await createFornecedorFixture();
  const cotacao = await cotacoesService.create({ solicitacao_id: solicitacao.id });
  const fornecedorCotacao = await fornecedoresCotacaoService.add(cotacao.id, {
    fornecedor_id: fornecedor.id
  });

  await fornecedoresCotacaoService.marcarEnvio(cotacao.id, fornecedorCotacao.id);

  await assert.rejects(
    () =>
      respostasCotacaoService.registrar(cotacao.id, fornecedorCotacao.id, {
        itens: [
          {
            solicitacao_item_id: solicitacao.itemSolicitacaoFixture.id,
            quantidade: 1,
            valor_unitario: -1
          }
        ]
      }),
    /Valor unitario nao pode ser negativo./
  );

  await cleanupCotacaoFixtures({ solicitacao, fornecedores: [fornecedor] });
}
