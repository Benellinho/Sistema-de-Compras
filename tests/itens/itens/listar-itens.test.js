import assert from 'node:assert/strict';
import itensService from '../../../src/modules/itens/itens.service.js';
import { cleanupItemByCodigo, createItemFixture, setupDatabase } from '../helpers/test-utils.js';

export default async function testListarItens() {
  await setupDatabase();

  const item = await createItemFixture();

  const itens = await itensService.list();

  assert.ok(Array.isArray(itens));
  assert.ok(itens.some((registro) => registro.id === item.id), 'Item criado nao foi encontrado na listagem.');

  await cleanupItemByCodigo(item.codigo);
}
