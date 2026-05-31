import assert from 'node:assert/strict';
import itensService from '../../../src/modules/itens/itens.service.js';
import { cleanupItemByCodigo, createItemPayload, setupDatabase } from '../helpers/test-utils.js';

export default async function testValidarCodigoDuplicado() {
  await setupDatabase();

  const payload = createItemPayload();
  await cleanupItemByCodigo(payload.codigo);

  await itensService.create(payload);

  await assert.rejects(
    () => itensService.create(payload),
    (error) => error.message.includes('UNIQUE') || error.message.includes('codigo')
  );

  await cleanupItemByCodigo(payload.codigo);
}
