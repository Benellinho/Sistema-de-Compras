import assert from 'node:assert/strict';
import cotacoesService from '../../../src/modules/cotacoes/cotacoes/cotacoes.service.js';
import solicitacoesService from '../../../src/modules/solicitacoes/solicitacoes/solicitacoes.service.js';
import {
  cleanupCotacaoFixtures,
  createSolicitacaoAprovadaComItemFixture
} from '../helpers/test-utils.js';

export default async function testPermitirNovaRodadaCotacaoReprovada() {
  const solicitacao = await createSolicitacaoAprovadaComItemFixture();

  const primeiraCotacao = await cotacoesService.create({
    solicitacao_id: solicitacao.id,
    criado_por: solicitacao.usuarioFixture.id
  });

  assert.equal(primeiraCotacao.numero_rodada, 1);

  const reprovacao = await cotacoesService.updateStatus(primeiraCotacao.id, {
    status: 'REPROVADA',
    usuario_id: solicitacao.usuarioFixture.id,
    observacao: 'Valores fora do esperado.'
  });

  assert.equal(reprovacao.cotacao.status, 'REPROVADA');

  const solicitacaoLiberada = await solicitacoesService.findOne(solicitacao.id);

  assert.equal(solicitacaoLiberada.status, 'COTACAO_REPROVADA');

  const segundaCotacao = await cotacoesService.create({
    solicitacao_id: solicitacao.id,
    criado_por: solicitacao.usuarioFixture.id
  });

  assert.equal(segundaCotacao.numero_rodada, 2);
  assert.equal(segundaCotacao.status, 'ABERTA');

  await cleanupCotacaoFixtures({ solicitacao });
}
