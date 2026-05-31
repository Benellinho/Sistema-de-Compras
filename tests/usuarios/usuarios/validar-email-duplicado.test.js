import assert from 'node:assert/strict';
import usuariosService from '../../../src/modules/usuarios/usuarios.service.js';
import { cleanupUsuarioByEmail, createUsuarioPayload, setupDatabase } from '../helpers/test-utils.js';

export default async function testValidarEmailDuplicado() {
  await setupDatabase();

  const payload = createUsuarioPayload();
  await cleanupUsuarioByEmail(payload.email);

  await usuariosService.create(payload);

  await assert.rejects(
    () => usuariosService.create(payload),
    (error) => error.statusCode === 409 && error.message.includes('email')
  );

  await cleanupUsuarioByEmail(payload.email);
}
