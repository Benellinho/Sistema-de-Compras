import assert from 'node:assert/strict';
import gruposService from '../../../src/modules/itens/grupos/grupos.service.js';
import { createGrupoFixture, setupDatabase } from '../helpers/test-utils.js';

export default async function testRemoverGrupo() {
  await setupDatabase();

  const grupo = await createGrupoFixture();

  await gruposService.remove(grupo.id);

  await assert.rejects(
    () => gruposService.findOne(grupo.id),
    (error) => error.statusCode === 404 && error.message.includes('Grupo')
  );
}
