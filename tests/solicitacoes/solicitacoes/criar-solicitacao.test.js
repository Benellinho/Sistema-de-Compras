import assert from 'node:assert/strict';
import solicitacoesService from '../../../src/modules/solicitacoes/solicitacoes.service.js';
import {
  assertRequiredFields,
  cleanupSolicitacaoById,
  cleanupUsuarioByEmail,
  createUsuarioFixture,
  setupDatabase
} from '../helpers/test-utils.js';

export default async function testCriarSolicitacao() {
  await setupDatabase();

  const usuario = await createUsuarioFixture();

  const solicitacao = await solicitacoesService.create({
    solicitante_id: usuario.id,
    observacoes: 'Compra para teste'
  });

  assertRequiredFields(solicitacao, [
    'id',
    'solicitante_id',
    'solicitante_nome',
    'solicitante_email',
    'status',
    'observacoes',
    'created_at',
    'updated_at'
  ]);
  assert.equal(solicitacao.solicitante_id, usuario.id);
  assert.equal(solicitacao.status, 'ABERTA');
  assert.equal(solicitacao.observacoes, 'Compra para teste');

  await cleanupSolicitacaoById(solicitacao.id);
  await cleanupUsuarioByEmail(usuario.email);
}
