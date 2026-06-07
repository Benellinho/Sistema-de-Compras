import assert from 'node:assert/strict';
import usuariosService from '../../../src/modules/usuarios/usuarios.service.js';
import { cleanupUsuarioByEmail, createUsuarioFixture, setupDatabase } from '../helpers/test-utils.js';

export default async function testBuscarUsuario() {
  await setupDatabase();

  const usuario = await createUsuarioFixture();

  const encontrado = await usuariosService.findOne(usuario.id);

  assert.equal(encontrado.id, usuario.id);
  assert.equal(encontrado.email, usuario.email);

  await cleanupUsuarioByEmail(usuario.email);
}
