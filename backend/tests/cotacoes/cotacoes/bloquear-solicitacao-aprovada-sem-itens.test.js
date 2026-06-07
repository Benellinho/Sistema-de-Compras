import assert from 'node:assert/strict';
import cotacoesService from '../../../src/modules/cotacoes/cotacoes/cotacoes.service.js';
import solicitacoesService from '../../../src/modules/solicitacoes/solicitacoes/solicitacoes.service.js';
import {
  cleanupSolicitacaoById,
  cleanupUsuarioByEmail,
  createSolicitacaoFixture,
  setupDatabase
} from '../../solicitacoes/helpers/test-utils.js';

export default async function testBloquearSolicitacaoAprovadaSemItens() {
  await setupDatabase();

  const solicitacao = await createSolicitacaoFixture();

  await solicitacoesService.updateStatus(solicitacao.id, {
    status: 'APROVADA'
  });

  await assert.rejects(
    () => cotacoesService.create({ solicitacao_id: solicitacao.id }),
    /Solicitacao precisa ter ao menos um item para cotacao./
  );

  await cleanupSolicitacaoById(solicitacao.id);
  await cleanupUsuarioByEmail(solicitacao.usuarioFixture.email);
}
