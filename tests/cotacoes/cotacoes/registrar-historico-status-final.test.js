import assert from 'node:assert/strict';
import cotacoesService from '../../../src/modules/cotacoes/cotacoes/cotacoes.service.js';
import historicoService from '../../../src/modules/solicitacoes/historico/historico.service.js';
import {
  cleanupCotacaoFixtures,
  createSolicitacaoAprovadaComItemFixture
} from '../helpers/test-utils.js';

export default async function testRegistrarHistoricoStatusFinal() {
  const solicitacaoCancelada = await createSolicitacaoAprovadaComItemFixture();
  const cotacaoCancelada = await cotacoesService.create({
    solicitacao_id: solicitacaoCancelada.id,
    criado_por: solicitacaoCancelada.usuarioFixture.id
  });

  await cotacoesService.updateStatus(cotacaoCancelada.id, {
    status: 'CANCELADA',
    usuario_id: solicitacaoCancelada.usuarioFixture.id,
    observacao: 'Cotacao cancelada pelo usuario.'
  });

  const historicoCancelada = await historicoService.listBySolicitacao(solicitacaoCancelada.id);

  assert.ok(historicoCancelada.some((registro) => registro.acao === 'CANCELAMENTO_COTACAO'));

  const solicitacaoEncerrada = await createSolicitacaoAprovadaComItemFixture();
  const cotacaoEncerrada = await cotacoesService.create({
    solicitacao_id: solicitacaoEncerrada.id,
    criado_por: solicitacaoEncerrada.usuarioFixture.id
  });

  await cotacoesService.updateStatus(cotacaoEncerrada.id, {
    status: 'ENCERRADA',
    usuario_id: solicitacaoEncerrada.usuarioFixture.id,
    observacao: 'Coleta encerrada pelo usuario.'
  });

  const historicoEncerrada = await historicoService.listBySolicitacao(solicitacaoEncerrada.id);

  assert.ok(historicoEncerrada.some((registro) => registro.acao === 'ENCERRAMENTO_COTACAO'));

  await cleanupCotacaoFixtures({ solicitacao: solicitacaoCancelada });
  await cleanupCotacaoFixtures({ solicitacao: solicitacaoEncerrada });
}
