import assert from 'node:assert/strict';
import gruposService from '../../../src/modules/itens/grupos/grupos.service.js';
import { cleanupGrupoByNome, createGrupoFixture, setupDatabase } from '../helpers/test-utils.js';

export default async function testListarGrupos() {
  await setupDatabase();

  const grupo = await createGrupoFixture();

  const grupos = await gruposService.list();

  assert.ok(Array.isArray(grupos));
  assert.ok(grupos.some((registro) => registro.id === grupo.id), 'Grupo criado nao foi encontrado na listagem.');

  await cleanupGrupoByNome(grupo.nome);
}
