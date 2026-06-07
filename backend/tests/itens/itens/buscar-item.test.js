import assert from 'node:assert/strict';
import itensService from '../../../src/modules/itens/itens/itens.service.js';
import { cleanupGrupoByNome, cleanupItemByCodigo, createItemFixture, setupDatabase } from '../helpers/test-utils.js';

export default async function testBuscarItem() {
  await setupDatabase();

  const item = await createItemFixture();

  const encontrado = await itensService.findOne(item.id);

  assert.equal(encontrado.id, item.id);
  assert.equal(encontrado.codigo, item.codigo);

  await cleanupItemByCodigo(item.codigo);
  await cleanupGrupoByNome(item.grupoFixture.nome);
}
