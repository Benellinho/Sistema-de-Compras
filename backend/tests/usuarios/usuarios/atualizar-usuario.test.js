import assert from 'node:assert/strict';
import usuariosService from '../../../src/modules/usuarios/usuarios.service.js';
import { cleanupUsuarioByEmail, createUsuarioFixture, setupDatabase } from '../helpers/test-utils.js';

export default async function testAtualizarUsuario() {
  await setupDatabase();

  const usuario = await createUsuarioFixture();
  const novoEmail = `atualizado-${usuario.email}`;

  const atualizado = await usuariosService.update(usuario.id, {
    nome: 'Usuario Atualizado',
    email: novoEmail,
    cargo: 'Aprovador',
    ativo: 0
  });

  assert.equal(atualizado.id, usuario.id);
  assert.equal(atualizado.nome, 'Usuario Atualizado');
  assert.equal(atualizado.email, novoEmail);
  assert.equal(atualizado.cargo, 'Aprovador');
  assert.equal(atualizado.ativo, 0);

  await cleanupUsuarioByEmail(novoEmail);
}
