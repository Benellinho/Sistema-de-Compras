import assert from 'node:assert/strict';
import itensService from '../../../src/modules/itens/itens/itens.service.js';
import { cleanupGrupoByNome, cleanupItemByCodigo, createGrupoFixture, createItemPayload, setupDatabase } from '../helpers/test-utils.js';

export default async function testValidarCodigoDuplicado() {
  await setupDatabase();

  const grupo = await createGrupoFixture();
  const primeiro = await itensService.create(createItemPayload({ grupo_id: grupo.id }));
  const segundo = await itensService.create(createItemPayload({ grupo_id: grupo.id }));

  assert.equal(primeiro.codigo, `${grupo.codigo} - 001`);
  assert.equal(segundo.codigo, `${grupo.codigo} - 002`);
  assert.notEqual(primeiro.codigo, segundo.codigo);

  await cleanupItemByCodigo(primeiro.codigo);
  await cleanupItemByCodigo(segundo.codigo);
  await cleanupGrupoByNome(grupo.nome);
}
