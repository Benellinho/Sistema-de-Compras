import assert from 'node:assert/strict';
import usuariosService from '../../../src/modules/usuarios/usuarios.service.js';
import { createUsuarioFixture, setupDatabase } from '../helpers/test-utils.js';

export default async function testRemoverUsuario() {
  await setupDatabase();

  const usuario = await createUsuarioFixture();

  await usuariosService.remove(usuario.id);

  await assert.rejects(
    () => usuariosService.findOne(usuario.id),
    (error) => error.statusCode === 404 && error.message.includes('Usuario')
  );
}
