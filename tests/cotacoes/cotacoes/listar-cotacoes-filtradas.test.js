import assert from 'node:assert/strict';
import cotacoesService from '../../../src/modules/cotacoes/cotacoes/cotacoes.service.js';
import {
  cleanupCotacaoFixtures,
  createSolicitacaoAprovadaComItemFixture
} from '../helpers/test-utils.js';

export default async function testListarCotacoesFiltradas() {
  const solicitacaoCancelada = await createSolicitacaoAprovadaComItemFixture();
  const solicitacaoAberta = await createSolicitacaoAprovadaComItemFixture();

  const cotacaoCancelada = await cotacoesService.create({
    solicitacao_id: solicitacaoCancelada.id,
    criado_por: solicitacaoCancelada.usuarioFixture.id
  });
  const cotacaoAberta = await cotacoesService.create({
    solicitacao_id: solicitacaoAberta.id,
    criado_por: solicitacaoAberta.usuarioFixture.id
  });

  await cotacoesService.updateStatus(cotacaoCancelada.id, {
    status: 'CANCELADA',
    usuario_id: solicitacaoCancelada.usuarioFixture.id
  });

  const abertas = await cotacoesService.list({ status: 'ABERTA' });
  const canceladas = await cotacoesService.list({ status: 'CANCELADA' });
  const porSolicitacao = await cotacoesService.list({ solicitacao_id: solicitacaoAberta.id });

  assert.ok(abertas.some((cotacao) => cotacao.id === cotacaoAberta.id));
  assert.ok(!abertas.some((cotacao) => cotacao.id === cotacaoCancelada.id));
  assert.ok(canceladas.some((cotacao) => cotacao.id === cotacaoCancelada.id));
  assert.deepEqual(porSolicitacao.map((cotacao) => cotacao.id), [cotacaoAberta.id]);

  await cleanupCotacaoFixtures({ solicitacao: solicitacaoCancelada });
  await cleanupCotacaoFixtures({ solicitacao: solicitacaoAberta });
}
