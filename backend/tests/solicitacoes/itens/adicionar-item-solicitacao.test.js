import assert from 'node:assert/strict';
import itensSolicitacaoService from '../../../src/modules/solicitacoes/itens-solicitacao/itens-solicitacao.service.js';
import {
  cleanupGrupoByNome,
  cleanupItemByCodigo,
  cleanupSolicitacaoById,
  cleanupUsuarioByEmail,
  createItemFixture,
  createSolicitacaoFixture,
  setupDatabase
} from '../helpers/test-utils.js';

export default async function testAdicionarItemSolicitacao() {
  await setupDatabase();

  const solicitacao = await createSolicitacaoFixture();
  const item = await createItemFixture();

  const itemSolicitacao = await itensSolicitacaoService.create(solicitacao.id, {
    item_id: item.id,
    descricao_necessidade: 'Reposicao para teste',
    quantidade: 5,
    observacoes: 'Observacao do item'
  });

  assert.equal(itemSolicitacao.solicitacao_id, solicitacao.id);
  assert.equal(itemSolicitacao.item_id, item.id);
  assert.equal(itemSolicitacao.unidade_snapshot, item.unidade);
  assert.equal(itemSolicitacao.quantidade, 5);

  await cleanupSolicitacaoById(solicitacao.id);
  await cleanupItemByCodigo(item.codigo);
  await cleanupGrupoByNome(item.grupoFixture.nome);
  await cleanupUsuarioByEmail(solicitacao.usuarioFixture.email);
}
