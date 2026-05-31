import assert from 'node:assert/strict';
import itensSolicitacaoService from '../../../src/modules/solicitacoes/itens/itens-solicitacao.service.js';
import { cleanupSolicitacaoById, cleanupUsuarioByEmail, createSolicitacaoFixture, setupDatabase } from '../helpers/test-utils.js';

export default async function testValidarItemInexistente() {
  await setupDatabase();

  const solicitacao = await createSolicitacaoFixture();

  await assert.rejects(
    () => itensSolicitacaoService.create(solicitacao.id, {
      item_id: 99999999,
      descricao_necessidade: 'Item inexistente',
      quantidade: 1
    }),
    (error) => error.statusCode === 404 && error.message.includes('Item')
  );

  await cleanupSolicitacaoById(solicitacao.id);
  await cleanupUsuarioByEmail(solicitacao.usuarioFixture.email);
}
