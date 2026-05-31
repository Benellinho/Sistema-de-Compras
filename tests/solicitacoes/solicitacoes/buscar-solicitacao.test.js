import assert from 'node:assert/strict';
import solicitacoesService from '../../../src/modules/solicitacoes/solicitacoes.service.js';
import itensSolicitacaoService from '../../../src/modules/solicitacoes/itens/itens-solicitacao.service.js';
import {
  cleanupGrupoByNome,
  cleanupItemByCodigo,
  cleanupSolicitacaoById,
  cleanupUsuarioByEmail,
  createItemFixture,
  createSolicitacaoFixture,
  setupDatabase
} from '../helpers/test-utils.js';

export default async function testBuscarSolicitacao() {
  await setupDatabase();

  const solicitacao = await createSolicitacaoFixture();
  const item = await createItemFixture();

  await itensSolicitacaoService.create(solicitacao.id, {
    item_id: item.id,
    descricao_necessidade: 'Necessidade para detalhe',
    quantidade: 2
  });

  const encontrada = await solicitacoesService.findOne(solicitacao.id);

  assert.equal(encontrada.id, solicitacao.id);
  assert.ok(Array.isArray(encontrada.itens));
  assert.equal(encontrada.itens.length, 1);
  assert.equal(encontrada.itens[0].unidade_snapshot, item.unidade);

  await cleanupSolicitacaoById(solicitacao.id);
  await cleanupItemByCodigo(item.codigo);
  await cleanupGrupoByNome(item.grupoFixture.nome);
  await cleanupUsuarioByEmail(solicitacao.usuarioFixture.email);
}
