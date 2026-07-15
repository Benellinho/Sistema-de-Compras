import assert from 'node:assert/strict';
import itensService from '../../../src/modules/itens/itens/itens.service.js';
import {
  assertRequiredFields,
  cleanupGrupoByNome,
  cleanupItemByCodigo,
  createGrupoFixture,
  createItemPayload,
  setupDatabase
} from '../helpers/test-utils.js';

export default async function testCriarItem() {
  await setupDatabase();

  const grupo = await createGrupoFixture();
  const payload = createItemPayload();
  payload.grupo_id = grupo.id;
  await cleanupItemByCodigo(payload.codigo);

  const item = await itensService.create(payload);

  assertRequiredFields(item, [
    'id',
    'codigo',
    'sequencial',
    'descricao',
    'unidade',
    'classificacao',
    'grupo_id',
    'grupo_nome',
    'controla_estoque',
    'ativo'
  ]);
  assert.equal(item.codigo, `${grupo.codigo} - 001`);
  assert.equal(item.sequencial, 1);
  assert.equal(item.descricao, payload.descricao);
  assert.equal(item.unidade, payload.unidade);
  assert.equal(item.classificacao, payload.classificacao);
  assert.equal(item.grupo_id, grupo.id);
  assert.equal(item.grupo_nome, grupo.nome);
  assert.equal(item.controla_estoque, payload.controla_estoque);
  assert.equal(item.ativo, payload.ativo);

  await cleanupItemByCodigo(payload.codigo);
  await cleanupGrupoByNome(grupo.nome);
}
