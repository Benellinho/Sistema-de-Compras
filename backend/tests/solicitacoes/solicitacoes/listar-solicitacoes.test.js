import assert from 'node:assert/strict';
import solicitacoesService from '../../../src/modules/solicitacoes/solicitacoes/solicitacoes.service.js';
import { cleanupSolicitacaoById, cleanupUsuarioByEmail, createSolicitacaoFixture, setupDatabase } from '../helpers/test-utils.js';

export default async function testListarSolicitacoes() {
  await setupDatabase();

  const solicitacao = await createSolicitacaoFixture();

  const solicitacoes = await solicitacoesService.list();

  assert.ok(Array.isArray(solicitacoes));
  assert.ok(
    solicitacoes.some((registro) => registro.id === solicitacao.id),
    'Solicitacao criada nao foi encontrada na listagem.'
  );

  await cleanupSolicitacaoById(solicitacao.id);
  await cleanupUsuarioByEmail(solicitacao.usuarioFixture.email);
}
