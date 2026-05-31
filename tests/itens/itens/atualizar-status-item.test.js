import assert from 'node:assert/strict';
import itensService from '../../../src/modules/itens/itens.service.js';
import { cleanupGrupoByNome, cleanupItemByCodigo, createItemFixture, setupDatabase } from '../helpers/test-utils.js';

export default async function testAtualizarStatusItem() {
  await setupDatabase();

  const item = await createItemFixture();

  const atualizado = await itensService.updateStatus(item.id, {
    ativo: 0
  });

  assert.equal(atualizado.id, item.id);
  assert.equal(atualizado.ativo, 0);

  await cleanupItemByCodigo(item.codigo);
  await cleanupGrupoByNome(item.grupoFixture.nome);
}
