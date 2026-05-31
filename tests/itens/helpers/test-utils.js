import assert from 'node:assert/strict';
import { initializeDatabase, getDatabase } from '../../../src/db/connection.js';
import itensService from '../../../src/modules/itens/itens.service.js';

let sequence = 0;

export async function setupDatabase() {
  await initializeDatabase();
  return getDatabase();
}

export function assertRequiredFields(record, fields) {
  for (const field of fields) {
    assert.ok(Object.hasOwn(record, field), `Campo ausente: ${field}`);
  }
}

export function createItemPayload(overrides = {}) {
  sequence += 1;
  const unique = `${Date.now()}${sequence}`.slice(-10).padStart(10, '0');

  return {
    codigo: `ITEM-${unique}`,
    descricao: `Item Teste ${unique}`,
    unidade: 'UN',
    ...overrides
  };
}

export async function createItemFixture(overrides = {}) {
  return itensService.create(createItemPayload(overrides));
}

export async function cleanupItemByCodigo(codigo) {
  const database = await setupDatabase();

  await database.run(
    `DELETE FROM SOLICITACAO_ITENS
     WHERE item_id IN (
       SELECT id FROM ITENS_COMPRA WHERE codigo = ?
     )`,
    codigo
  );

  await database.run('DELETE FROM ITENS_COMPRA WHERE codigo = ?', codigo);
}
