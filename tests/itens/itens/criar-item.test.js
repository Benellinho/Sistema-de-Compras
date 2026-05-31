import assert from 'node:assert/strict';
import itensService from '../../../src/modules/itens/itens.service.js';
import {
  assertRequiredFields,
  cleanupItemByCodigo,
  createItemPayload,
  setupDatabase
} from '../helpers/test-utils.js';

export default async function testCriarItem() {
  await setupDatabase();

  const payload = createItemPayload();
  await cleanupItemByCodigo(payload.codigo);

  const item = await itensService.create(payload);

  assertRequiredFields(item, ['id', 'codigo', 'descricao', 'unidade']);
  assert.equal(item.codigo, payload.codigo);
  assert.equal(item.descricao, payload.descricao);
  assert.equal(item.unidade, payload.unidade);

  await cleanupItemByCodigo(payload.codigo);
}
