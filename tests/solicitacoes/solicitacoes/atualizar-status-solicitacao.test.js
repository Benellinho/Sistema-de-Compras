import assert from 'node:assert/strict';
import solicitacoesService from '../../../src/modules/solicitacoes/solicitacoes.service.js';
import { cleanupSolicitacaoById, cleanupUsuarioByEmail, createSolicitacaoFixture, setupDatabase } from '../helpers/test-utils.js';

export default async function testAtualizarStatusSolicitacao() {
  await setupDatabase();

  const solicitacao = await createSolicitacaoFixture();

  const atualizada = await solicitacoesService.updateStatus(solicitacao.id, {
    status: 'FINALIZADA'
  });

  assert.equal(atualizada.id, solicitacao.id);
  assert.equal(atualizada.status, 'FINALIZADA');

  await cleanupSolicitacaoById(solicitacao.id);
  await cleanupUsuarioByEmail(solicitacao.usuarioFixture.email);
}
