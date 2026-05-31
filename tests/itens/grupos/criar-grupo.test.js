import assert from 'node:assert/strict';
import gruposService from '../../../src/modules/itens/grupos/grupos.service.js';
import {
  assertRequiredFields,
  cleanupGrupoByNome,
  createGrupoPayload,
  setupDatabase
} from '../helpers/test-utils.js';

export default async function testCriarGrupo() {
  await setupDatabase();

  const payload = createGrupoPayload();
  await cleanupGrupoByNome(payload.nome);

  const grupo = await gruposService.create(payload);

  assertRequiredFields(grupo, ['id', 'nome', 'ativo', 'created_at', 'updated_at']);
  assert.equal(grupo.nome, payload.nome);
  assert.equal(grupo.ativo, payload.ativo);

  await cleanupGrupoByNome(payload.nome);
}
