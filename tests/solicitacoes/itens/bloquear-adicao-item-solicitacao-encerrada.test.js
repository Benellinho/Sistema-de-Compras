import assert from 'node:assert/strict';
import itensSolicitacaoService from '../../../src/modules/solicitacoes/itens/itens-solicitacao.service.js';
import solicitacoesService from '../../../src/modules/solicitacoes/solicitacoes.service.js';
import {
  cleanupGrupoByNome,
  cleanupItemByCodigo,
  cleanupSolicitacaoById,
  cleanupUsuarioByEmail,
  createItemFixture,
  createSolicitacaoFixture,
  setupDatabase
} from '../helpers/test-utils.js';

export default async function testBloquearAdicaoItemSolicitacaoEncerrada() {
  await setupDatabase();

  const solicitacao = await createSolicitacaoFixture();
  const item = await createItemFixture();
  await solicitacoesService.updateStatus(solicitacao.id, { status: 'FINALIZADA' });

  await assert.rejects(
    () => itensSolicitacaoService.create(solicitacao.id, {
      item_id: item.id,
      descricao_necessidade: 'Solicitacao encerrada',
      quantidade: 1
    }),
    (error) => error.statusCode === 400 && error.message.includes('encerrada')
  );

  await cleanupSolicitacaoById(solicitacao.id);
  await cleanupItemByCodigo(item.codigo);
  await cleanupGrupoByNome(item.grupoFixture.nome);
  await cleanupUsuarioByEmail(solicitacao.usuarioFixture.email);
}
