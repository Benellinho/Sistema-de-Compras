import assert from 'node:assert/strict';
import { initializeDatabase, getDatabase } from '../../../src/db/connection.js';
import itensService from '../../../src/modules/itens/itens/itens.service.js';
import gruposService from '../../../src/modules/itens/grupos/grupos.service.js';

let sequence = 0;

export async function setupDatabase() {
  await initializeDatabase();
  return getDatabase();
}

export function assertRequiredFields(record, fields) {
  for (const field of fields) {
    assert.ok(Object.hasOwn(record, field), `Campo ausente: ${field}`);
  }
}

export function createItemPayload(overrides = {}) {
  sequence += 1;
  const unique = `${Date.now()}${sequence}`.slice(-10).padStart(10, '0');

  return {
    codigo: `ITEM-${unique}`,
    descricao: `Item Teste ${unique}`,
    unidade: 'UN',
    classificacao: 'CUSTO',
    controla_estoque: 0,
    ativo: 1,
    ...overrides
  };
}

export function createGrupoPayload(overrides = {}) {
  sequence += 1;
  const unique = `${Date.now()}${sequence}`.slice(-10).padStart(10, '0');

  return {
    nome: `Grupo Teste ${unique}`,
    codigo: `GT${unique}`,
    ativo: 1,
    ...overrides
  };
}

export async function createItemFixture(overrides = {}) {
  let grupo;
  let payload = createItemPayload(overrides);

  if (payload.grupo_id === undefined) {
    grupo = await createGrupoFixture();
    payload = {
      ...payload,
      grupo_id: grupo.id
    };
  }

  const item = await itensService.create(payload);

  if (grupo) {
    item.grupoFixture = grupo;
  }

  return item;
}

export async function createGrupoFixture(overrides = {}) {
  return gruposService.create(createGrupoPayload(overrides));
}

export async function cleanupItemByCodigo(codigo) {
  const database = await setupDatabase();

  await database.run(
    `DELETE FROM solicitacao_compra_itens
     WHERE item_id IN (
       SELECT id FROM ITENS_COMPRA WHERE codigo = ?
     )`,
    codigo
  );

  await database.run('DELETE FROM ITENS_COMPRA WHERE codigo = ?', codigo);
}

export async function cleanupGrupoByNome(nome) {
  const database = await setupDatabase();

  await database.run(
    `DELETE FROM ITENS_COMPRA
     WHERE grupo_id IN (
       SELECT id FROM GRUPOS_ITENS WHERE nome = ?
     )`,
    nome
  );

  await database.run('DELETE FROM GRUPOS_ITENS WHERE nome = ?', nome);
}
