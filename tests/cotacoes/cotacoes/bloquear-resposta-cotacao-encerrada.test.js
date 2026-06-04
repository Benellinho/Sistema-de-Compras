import assert from 'node:assert/strict';
import cotacoesService from '../../../src/modules/cotacoes/cotacoes/cotacoes.service.js';
import fornecedoresCotacaoService from '../../../src/modules/cotacoes/fornecedores/fornecedores-cotacao.service.js';
import respostasCotacaoService from '../../../src/modules/cotacoes/respostas/respostas-cotacao.service.js';
import {
  cleanupCotacaoFixtures,
  createFornecedorFixture,
  createSolicitacaoAprovadaComItemFixture
} from '../helpers/test-utils.js';

export default async function testBloquearRespostaCotacaoEncerrada() {
  const solicitacaoCancelada = await createSolicitacaoAprovadaComItemFixture();
  const fornecedorCancelada = await createFornecedorFixture();
  const cotacaoCancelada = await cotacoesService.create({ solicitacao_id: solicitacaoCancelada.id });
  const fornecedorCotacaoCancelada = await fornecedoresCotacaoService.add(cotacaoCancelada.id, {
    fornecedor_id: fornecedorCancelada.id
  });

  await cotacoesService.updateStatus(cotacaoCancelada.id, { status: 'CANCELADA' });

  await assert.rejects(
    () =>
      respostasCotacaoService.registrar(cotacaoCancelada.id, fornecedorCotacaoCancelada.id, {
        itens: [
          {
            solicitacao_item_id: solicitacaoCancelada.itemSolicitacaoFixture.id,
            quantidade: 1,
            valor_unitario: 10
          }
        ]
      }),
    /Cotacao encerrada nao permite alteracoes./
  );

  const solicitacaoEncerrada = await createSolicitacaoAprovadaComItemFixture();
  const fornecedorEncerrada = await createFornecedorFixture();
  const cotacaoEncerrada = await cotacoesService.create({ solicitacao_id: solicitacaoEncerrada.id });
  const fornecedorCotacaoEncerrada = await fornecedoresCotacaoService.add(cotacaoEncerrada.id, {
    fornecedor_id: fornecedorEncerrada.id
  });

  await cotacoesService.updateStatus(cotacaoEncerrada.id, { status: 'ENCERRADA' });

  await assert.rejects(
    () =>
      respostasCotacaoService.registrar(cotacaoEncerrada.id, fornecedorCotacaoEncerrada.id, {
        itens: [
          {
            solicitacao_item_id: solicitacaoEncerrada.itemSolicitacaoFixture.id,
            quantidade: 1,
            valor_unitario: 10
          }
        ]
      }),
    /Cotacao encerrada nao permite alteracoes./
  );

  await cleanupCotacaoFixtures({ solicitacao: solicitacaoCancelada, fornecedores: [fornecedorCancelada] });
  await cleanupCotacaoFixtures({ solicitacao: solicitacaoEncerrada, fornecedores: [fornecedorEncerrada] });
}
