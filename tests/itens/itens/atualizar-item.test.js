import assert from 'node:assert/strict';
import itensService from '../../../src/modules/itens/itens.service.js';
import {
  cleanupGrupoByNome,
  cleanupItemByCodigo,
  createGrupoFixture,
  createItemFixture,
  setupDatabase
} from '../helpers/test-utils.js';

export default async function testAtualizarItem() {
  await setupDatabase();

  const grupo = await createGrupoFixture();
  const item = await createItemFixture();

  const atualizado = await itensService.update(item.id, {
    descricao: 'Item Teste Atualizado',
    classificacao: 'DESPESA',
    grupo_id: grupo.id,
    controla_estoque: 1,
    ativo: 0
  });

  assert.equal(atualizado.id, item.id);
  assert.equal(atualizado.descricao, 'Item Teste Atualizado');
  assert.equal(atualizado.classificacao, 'DESPESA');
  assert.equal(atualizado.grupo_id, grupo.id);
  assert.equal(atualizado.grupo_nome, grupo.nome);
  assert.equal(atualizado.controla_estoque, 1);
  assert.equal(atualizado.ativo, 0);

  await cleanupItemByCodigo(item.codigo);
  await cleanupGrupoByNome(grupo.nome);
  await cleanupGrupoByNome(item.grupoFixture.nome);
}
