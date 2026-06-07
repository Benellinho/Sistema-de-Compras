import assert from 'node:assert/strict';
import aprovacoesService from '../../../src/modules/solicitacoes/aprovacoes/aprovacoes.service.js';
import {
  cleanupSolicitacaoById,
  cleanupUsuarioByEmail,
  createSolicitacaoFixture,
  setupDatabase
} from '../helpers/test-utils.js';

export default async function testBloquearAprovacaoSemItens() {
  await setupDatabase();

  const solicitacao = await createSolicitacaoFixture();

  await assert.rejects(
    () => aprovacoesService.decide(solicitacao.id, {
      aprovador_id: solicitacao.usuarioFixture.id,
      decisao: 'APROVADO'
    }),
    /ao menos um item/
  );

  await cleanupSolicitacaoById(solicitacao.id);
  await cleanupUsuarioByEmail(solicitacao.usuarioFixture.email);
}
