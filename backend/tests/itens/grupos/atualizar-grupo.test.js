import assert from 'node:assert/strict';
import gruposService from '../../../src/modules/itens/grupos/grupos.service.js';
import { cleanupGrupoByNome, createGrupoFixture, setupDatabase } from '../helpers/test-utils.js';

export default async function testAtualizarGrupo() {
  await setupDatabase();

  const grupo = await createGrupoFixture();
  const novoNome = `${grupo.nome} Atualizado`;

  const atualizado = await gruposService.update(grupo.id, {
    nome: novoNome,
    ativo: 0
  });

  assert.equal(atualizado.id, grupo.id);
  assert.equal(atualizado.nome, novoNome);
  assert.equal(atualizado.ativo, 0);

  await cleanupGrupoByNome(novoNome);
}
