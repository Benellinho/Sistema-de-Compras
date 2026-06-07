import assert from 'node:assert/strict';
import usuariosService from '../../../src/modules/usuarios/usuarios.service.js';
import {
  assertRequiredFields,
  cleanupUsuarioByEmail,
  createUsuarioPayload,
  setupDatabase
} from '../helpers/test-utils.js';

export default async function testCriarUsuario() {
  await setupDatabase();

  const payload = createUsuarioPayload();
  await cleanupUsuarioByEmail(payload.email);

  const usuario = await usuariosService.create(payload);

  assertRequiredFields(usuario, ['id', 'nome', 'email', 'cargo', 'ativo', 'created_at', 'updated_at']);
  assert.equal(usuario.nome, payload.nome);
  assert.equal(usuario.email, payload.email);
  assert.equal(usuario.cargo, payload.cargo);
  assert.equal(usuario.ativo, payload.ativo);

  await cleanupUsuarioByEmail(payload.email);
}
