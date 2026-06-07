import assert from 'node:assert/strict';
import { initializeDatabase, getDatabase } from '../../../src/db/connection.js';
import fornecedoresService from '../../../src/modules/fornecedores/fornecedores/fornecedores.service.js';

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

export function createFornecedorPayload(overrides = {}) {
  sequence += 1;
  const unique = `${Date.now()}${sequence}`.slice(-14).padStart(14, '0');

  return {
    cnpj: unique,
    status: 'ATIVO',
    razao_social: `Fornecedor Teste ${unique}`,
    nome_fantasia: `Teste ${unique}`,
    telefone: '11999999999',
    email: `fornecedor-${unique}@teste.com`,
    ...overrides
  };
}

export async function createFornecedorFixture(overrides = {}) {
  return fornecedoresService.create(createFornecedorPayload(overrides));
}

export async function cleanupFornecedorByCnpj(cnpj) {
  const database = await setupDatabase();

  await database.run(
    `DELETE FROM FORNECEDOR_CONTATOS
     WHERE fornecedor_id IN (
       SELECT id FROM FORNECEDORES WHERE cnpj = ?
     )`,
    cnpj
  );

  await database.run('DELETE FROM FORNECEDORES WHERE cnpj = ?', cnpj);
}
