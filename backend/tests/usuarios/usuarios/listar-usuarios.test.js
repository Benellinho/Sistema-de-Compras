import assert from 'node:assert/strict';
import usuariosService from '../../../src/modules/usuarios/usuarios.service.js';
import { cleanupUsuarioByEmail, createUsuarioFixture, setupDatabase } from '../helpers/test-utils.js';

export default async function testListarUsuarios() {
  await setupDatabase();

  const usuario = await createUsuarioFixture();

  const usuarios = await usuariosService.list();

  assert.ok(Array.isArray(usuarios));
  assert.ok(usuarios.some((registro) => registro.id === usuario.id), 'Usuario criado nao foi encontrado na listagem.');

  await cleanupUsuarioByEmail(usuario.email);
}
