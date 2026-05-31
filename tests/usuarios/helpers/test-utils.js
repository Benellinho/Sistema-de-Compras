import assert from 'node:assert/strict';
import { initializeDatabase, getDatabase } from '../../../src/db/connection.js';
import usuariosService from '../../../src/modules/usuarios/usuarios.service.js';

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

export function createUsuarioPayload(overrides = {}) {
  sequence += 1;
  const unique = `${Date.now()}${sequence}`.slice(-10).padStart(10, '0');

  return {
    nome: `Usuario Teste ${unique}`,
    email: `usuario-${unique}@teste.com`,
    cargo: 'Comprador',
    ativo: 1,
    ...overrides
  };
}

export async function createUsuarioFixture(overrides = {}) {
  return usuariosService.create(createUsuarioPayload(overrides));
}

export async function cleanupUsuarioByEmail(email) {
  const database = await setupDatabase();

  await database.run('DELETE FROM USUARIOS WHERE email = ?', email);
}
