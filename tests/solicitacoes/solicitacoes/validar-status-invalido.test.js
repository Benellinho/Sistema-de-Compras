import assert from 'node:assert/strict';
import solicitacoesService from '../../../src/modules/solicitacoes/solicitacoes/solicitacoes.service.js';
import { cleanupSolicitacaoById, cleanupUsuarioByEmail, createSolicitacaoFixture, setupDatabase } from '../helpers/test-utils.js';

export default async function testValidarStatusInvalido() {
  await setupDatabase();

  const solicitacao = await createSolicitacaoFixture();

  await assert.rejects(
    () => solicitacoesService.updateStatus(solicitacao.id, { status: 'EM_COTACAO' }),
    (error) => error.statusCode === 400 && error.message.includes('Status')
  );

  await cleanupSolicitacaoById(solicitacao.id);
  await cleanupUsuarioByEmail(solicitacao.usuarioFixture.email);
}
