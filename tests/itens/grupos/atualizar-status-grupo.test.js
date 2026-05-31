import assert from 'node:assert/strict';
import gruposService from '../../../src/modules/itens/grupos/grupos.service.js';
import { cleanupGrupoByNome, createGrupoFixture, setupDatabase } from '../helpers/test-utils.js';

export default async function testAtualizarStatusGrupo() {
  await setupDatabase();

  const grupo = await createGrupoFixture();

  const atualizado = await gruposService.updateStatus(grupo.id, {
    ativo: 0
  });

  assert.equal(atualizado.id, grupo.id);
  assert.equal(atualizado.ativo, 0);

  await cleanupGrupoByNome(grupo.nome);
}
