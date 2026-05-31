import assert from 'node:assert/strict';
import itensService from '../../../src/modules/itens/itens.service.js';
import {
  cleanupGrupoByNome,
  cleanupItemByCodigo,
  createGrupoFixture,
  createItemPayload,
  setupDatabase
} from '../helpers/test-utils.js';

export default async function testValidarGrupoInativo() {
  await setupDatabase();

  const grupo = await createGrupoFixture({ ativo: 0 });
  const payload = createItemPayload({ grupo_id: grupo.id });
  await cleanupItemByCodigo(payload.codigo);

  await assert.rejects(
    () => itensService.create(payload),
    (error) => error.statusCode === 400 && error.message.includes('Grupo inativo')
  );

  await cleanupGrupoByNome(grupo.nome);
}
