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

export default async function testAtualizarItemSolicitacao() {
  await setupDatabase();

  const solicitacao = await createSolicitacaoFixture();
  const itemOriginal = await createItemFixture();
  const itemAtualizado = await createItemFixture({ unidade: 'KG' });

  const itemSolicitacao = await itensSolicitacaoService.create(solicitacao.id, {
    item_id: itemOriginal.id,
    descricao_necessidade: 'Item antes da edicao',
    quantidade: 2,
    observacoes: 'Observacao original'
  });

  const atualizado = await itensSolicitacaoService.update(solicitacao.id, itemSolicitacao.id, {
    item_id: itemAtualizado.id,
    descricao_necessidade: 'Item depois da edicao',
    quantidade: 7,
    observacoes: 'Observacao atualizada'
  });

  assert.equal(atualizado.id, itemSolicitacao.id);
  assert.equal(atualizado.item_id, itemAtualizado.id);
  assert.equal(atualizado.descricao_necessidade, 'Item depois da edicao');
  assert.equal(atualizado.quantidade, 7);
  assert.equal(atualizado.unidade_snapshot, 'KG');
  assert.equal(atualizado.observacoes, 'Observacao atualizada');

  await cleanupSolicitacaoById(solicitacao.id);
  await cleanupItemByCodigo(itemOriginal.codigo);
  await cleanupGrupoByNome(itemOriginal.grupoFixture.nome);
  await cleanupItemByCodigo(itemAtualizado.codigo);
  await cleanupGrupoByNome(itemAtualizado.grupoFixture.nome);
  await cleanupUsuarioByEmail(solicitacao.usuarioFixture.email);
}
