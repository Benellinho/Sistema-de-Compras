import assert from 'node:assert/strict';
import itensService from '../../../src/modules/itens/itens/itens.service.js';
import {
  cleanupGrupoByNome,
  cleanupItemByCodigo,
  createGrupoFixture,
  createItemPayload,
  setupDatabase
} from '../helpers/test-utils.js';

export default async function testValidarCodigoDuplicado() {
  await setupDatabase();

  const grupo = await createGrupoFixture();
  const payload = createItemPayload();
  payload.grupo_id = grupo.id;
  await cleanupItemByCodigo(payload.codigo);

  await itensService.create(payload);

  await assert.rejects(
    () => itensService.create(payload),
    (error) => error.statusCode === 409 && error.message.includes('codigo')
  );

  await cleanupItemByCodigo(payload.codigo);
  await cleanupGrupoByNome(grupo.nome);
}
