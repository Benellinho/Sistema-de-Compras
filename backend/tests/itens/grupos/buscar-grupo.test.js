import assert from 'node:assert/strict';
import gruposService from '../../../src/modules/itens/grupos/grupos.service.js';
import { cleanupGrupoByNome, createGrupoFixture, setupDatabase } from '../helpers/test-utils.js';

export default async function testBuscarGrupo() {
  await setupDatabase();

  const grupo = await createGrupoFixture();

  const encontrado = await gruposService.findOne(grupo.id);

  assert.equal(encontrado.id, grupo.id);
  assert.equal(encontrado.nome, grupo.nome);

  await cleanupGrupoByNome(grupo.nome);
}
