import assert from 'node:assert/strict';
import itensSolicitacaoService from '../../../src/modules/solicitacoes/itens-solicitacao/itens-solicitacao.service.js';
import solicitacoesService from '../../../src/modules/solicitacoes/solicitacoes/solicitacoes.service.js';
import {
  cleanupGrupoByNome,
  cleanupItemByCodigo,
  cleanupSolicitacaoById,
  cleanupUsuarioByEmail,
  createItemFixture,
  createSolicitacaoFixture,
  setupDatabase
} from '../helpers/test-utils.js';

export default async function testBloquearRemocaoItemSolicitacaoEncerrada() {
  await setupDatabase();

  const solicitacao = await createSolicitacaoFixture();
  const item = await createItemFixture();
  const itemSolicitacao = await itensSolicitacaoService.create(solicitacao.id, {
    item_id: item.id,
    descricao_necessidade: 'Bloquear remocao',
    quantidade: 1
  });
  await solicitacoesService.updateStatus(solicitacao.id, { status: 'CANCELADA' });

  await assert.rejects(
    () => itensSolicitacaoService.remove(solicitacao.id, itemSolicitacao.id),
    (error) => error.statusCode === 400 && error.message.includes('encerrada')
  );

  await cleanupSolicitacaoById(solicitacao.id);
  await cleanupItemByCodigo(item.codigo);
  await cleanupGrupoByNome(item.grupoFixture.nome);
  await cleanupUsuarioByEmail(solicitacao.usuarioFixture.email);
}
