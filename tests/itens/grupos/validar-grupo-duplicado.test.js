import assert from 'node:assert/strict';
import gruposService from '../../../src/modules/itens/grupos/grupos.service.js';
import { cleanupGrupoByNome, createGrupoPayload, setupDatabase } from '../helpers/test-utils.js';

export default async function testValidarGrupoDuplicado() {
  await setupDatabase();

  const payload = createGrupoPayload();
  await cleanupGrupoByNome(payload.nome);

  await gruposService.create(payload);

  await assert.rejects(
    () => gruposService.create(payload),
    (error) => error.statusCode === 409 && error.message.includes('grupo')
  );

  await cleanupGrupoByNome(payload.nome);
}
