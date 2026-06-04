import assert from 'node:assert/strict';
import cotacoesService from '../../../src/modules/cotacoes/cotacoes/cotacoes.service.js';
import fornecedoresCotacaoService from '../../../src/modules/cotacoes/fornecedores/fornecedores-cotacao.service.js';
import respostasCotacaoService from '../../../src/modules/cotacoes/respostas/respostas-cotacao.service.js';
import {
  cleanupCotacaoFixtures,
  createFornecedorFixture,
  createSolicitacaoAprovadaComItemFixture
} from '../helpers/test-utils.js';

export default async function testBloquearItemForaDaSolicitacao() {
  const solicitacao = await createSolicitacaoAprovadaComItemFixture();
  const outraSolicitacao = await createSolicitacaoAprovadaComItemFixture();
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
            solicitacao_item_id: outraSolicitacao.itemSolicitacaoFixture.id,
            quantidade: 1,
            valor_unitario: 10
          }
        ]
      }),
    /Item nao pertence a solicitacao da cotacao./
  );

  await cleanupCotacaoFixtures({ solicitacao, fornecedores: [fornecedor] });
  await cleanupCotacaoFixtures({ solicitacao: outraSolicitacao });
}
