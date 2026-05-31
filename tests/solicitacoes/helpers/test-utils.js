import assert from 'node:assert/strict';
import { initializeDatabase, getDatabase } from '../../../src/db/connection.js';
import gruposService from '../../../src/modules/itens/grupos/grupos.service.js';
import itensService from '../../../src/modules/itens/itens.service.js';
import solicitacoesService from '../../../src/modules/solicitacoes/solicitacoes.service.js';
import usuariosService from '../../../src/modules/usuarios/usuarios.service.js';

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

function uniqueSuffix() {
  sequence += 1;
  return `${Date.now()}${sequence}`.slice(-10).padStart(10, '0');
}

export function createUsuarioPayload(overrides = {}) {
  const unique = uniqueSuffix();

  return {
    nome: `Solicitante Teste ${unique}`,
    email: `solicitante-${unique}@teste.com`,
    cargo: 'Solicitante',
    ativo: 1,
    ...overrides
  };
}

export function createGrupoPayload(overrides = {}) {
  const unique = uniqueSuffix();

  return {
    nome: `Grupo Solicitacao ${unique}`,
    ativo: 1,
    ...overrides
  };
}

export function createItemPayload(overrides = {}) {
  const unique = uniqueSuffix();

  return {
    codigo: `SOL-${unique}`,
    descricao: `Item Solicitacao ${unique}`,
    unidade: 'UN',
    classificacao: 'CUSTO',
    controla_estoque: 0,
    ativo: 1,
    ...overrides
  };
}

export async function createUsuarioFixture(overrides = {}) {
  return usuariosService.create(createUsuarioPayload(overrides));
}

export async function createItemFixture(overrides = {}) {
  const grupo = await gruposService.create(createGrupoPayload());
  const item = await itensService.create(createItemPayload({ grupo_id: grupo.id, ...overrides }));

  item.grupoFixture = grupo;

  return item;
}

export async function createSolicitacaoFixture(overrides = {}) {
  const usuario = overrides.usuario ?? await createUsuarioFixture();
  const solicitacao = await solicitacoesService.create({
    solicitante_id: usuario.id,
    observacoes: 'Solicitacao de teste',
    ...overrides
  });

  solicitacao.usuarioFixture = usuario;

  return solicitacao;
}

export async function cleanupSolicitacaoById(id) {
  const database = await setupDatabase();

  await database.run('DELETE FROM solicitacoes_compra WHERE id = ?', id);
}

export async function cleanupUsuarioByEmail(email) {
  const database = await setupDatabase();

  await database.run(
    `DELETE FROM solicitacoes_compra
     WHERE solicitante_id IN (
       SELECT id FROM USUARIOS WHERE email = ?
     )`,
    email
  );

  await database.run('DELETE FROM USUARIOS WHERE email = ?', email);
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

  await database.run('DELETE FROM GRUPOS_ITENS WHERE nome = ?', nome);
}
