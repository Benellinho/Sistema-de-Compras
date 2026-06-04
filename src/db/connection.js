import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const databasePath = path.resolve(__dirname, 'database.sqlite');
const schemaPath = path.resolve(__dirname, 'schema.sql');

let db;

export async function getDatabase() {
  if (!db) {
    db = await open({
      filename: databasePath,
      driver: sqlite3.Database
    });

    await db.exec('PRAGMA foreign_keys = ON');
  }

  return db;
}

export async function initializeDatabase() {
  const database = await getDatabase();
  const schema = await fs.readFile(schemaPath, 'utf8');

  await database.exec(schema);
  await ensureFornecedorColumns(database);
  await ensureGruposItensColumns(database);
  await ensureItensColumns(database);
  await ensureSolicitacoesSchema(database);
  await ensureSolicitacoesAprovacoesSchema(database);
  await ensureCotacoesSchema(database);
}

async function ensureFornecedorColumns(database) {
  const columns = await database.all('PRAGMA table_info(FORNECEDORES)');
  const columnNames = new Set(columns.map((column) => column.name));

  if (!columnNames.has('telefone')) {
    await database.exec('ALTER TABLE FORNECEDORES ADD COLUMN telefone TEXT');
  }

  if (!columnNames.has('email')) {
    await database.exec('ALTER TABLE FORNECEDORES ADD COLUMN email TEXT');
  }
}

async function ensureGruposItensColumns(database) {
  const columns = await database.all('PRAGMA table_info(GRUPOS_ITENS)');
  const columnNames = new Set(columns.map((column) => column.name));

  if (!columnNames.has('created_at')) {
    await database.exec('ALTER TABLE GRUPOS_ITENS ADD COLUMN created_at TEXT');
  }

  if (!columnNames.has('updated_at')) {
    await database.exec('ALTER TABLE GRUPOS_ITENS ADD COLUMN updated_at TEXT');
  }

  await database.exec(`
    UPDATE GRUPOS_ITENS
    SET created_at = COALESCE(created_at, CURRENT_TIMESTAMP),
        updated_at = COALESCE(updated_at, CURRENT_TIMESTAMP)
  `);
}

async function ensureItensColumns(database) {
  const columns = await database.all('PRAGMA table_info(ITENS_COMPRA)');
  const columnNames = new Set(columns.map((column) => column.name));

  if (!columnNames.has('classificacao')) {
    await database.exec("ALTER TABLE ITENS_COMPRA ADD COLUMN classificacao TEXT NOT NULL DEFAULT 'CUSTO'");
  }

  if (!columnNames.has('grupo_id')) {
    await database.exec('ALTER TABLE ITENS_COMPRA ADD COLUMN grupo_id INTEGER');
  }

  if (!columnNames.has('controla_estoque')) {
    await database.exec('ALTER TABLE ITENS_COMPRA ADD COLUMN controla_estoque INTEGER NOT NULL DEFAULT 0');
  }

  if (!columnNames.has('ativo')) {
    await database.exec('ALTER TABLE ITENS_COMPRA ADD COLUMN ativo INTEGER NOT NULL DEFAULT 1');
  }

  if (!columnNames.has('created_at')) {
    await database.exec('ALTER TABLE ITENS_COMPRA ADD COLUMN created_at TEXT');
  }

  if (!columnNames.has('updated_at')) {
    await database.exec('ALTER TABLE ITENS_COMPRA ADD COLUMN updated_at TEXT');
  }

  await database.exec(`
    UPDATE ITENS_COMPRA
    SET created_at = COALESCE(created_at, CURRENT_TIMESTAMP),
        updated_at = COALESCE(updated_at, CURRENT_TIMESTAMP)
  `);
}

async function ensureSolicitacoesSchema(database) {
  await ensureSolicitacoesCompraStatus(database);
}

async function ensureSolicitacoesAprovacoesSchema(database) {
  await database.exec(`
    CREATE TABLE IF NOT EXISTS solicitacao_compra_aprovacoes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      solicitacao_id INTEGER NOT NULL UNIQUE,
      aprovador_id INTEGER NOT NULL,
      decisao TEXT NOT NULL CHECK (decisao IN ('APROVADO', 'REPROVADO')),
      observacao TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (solicitacao_id) REFERENCES solicitacoes_compra (id) ON DELETE CASCADE,
      FOREIGN KEY (aprovador_id) REFERENCES USUARIOS (id)
    );

    CREATE TABLE IF NOT EXISTS solicitacao_compra_historico (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      solicitacao_id INTEGER NOT NULL,
      usuario_id INTEGER,
      etapa TEXT NOT NULL,
      acao TEXT NOT NULL,
      status_anterior TEXT,
      status_novo TEXT,
      observacao TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (solicitacao_id) REFERENCES solicitacoes_compra (id) ON DELETE CASCADE,
      FOREIGN KEY (usuario_id) REFERENCES USUARIOS (id)
    );
  `);
}

async function ensureCotacoesSchema(database) {
  await database.exec(`
    CREATE TABLE IF NOT EXISTS cotacoes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      solicitacao_id INTEGER NOT NULL,
      numero_rodada INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'ABERTA' CHECK (status IN (
        'ABERTA',
        'EM_ANDAMENTO',
        'EM_ANALISE',
        'APROVADA',
        'REPROVADA',
        'CANCELADA',
        'ENCERRADA'
      )),
      criado_por INTEGER,
      data_abertura TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      data_encerramento TEXT,
      observacoes TEXT,
      UNIQUE (solicitacao_id, numero_rodada),
      FOREIGN KEY (solicitacao_id) REFERENCES solicitacoes_compra (id) ON DELETE CASCADE,
      FOREIGN KEY (criado_por) REFERENCES USUARIOS (id)
    );

    CREATE TABLE IF NOT EXISTS cotacao_fornecedores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cotacao_id INTEGER NOT NULL,
      fornecedor_id INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'PENDENTE' CHECK (status IN ('PENDENTE', 'ENVIADO', 'RESPONDIDO', 'RECUSADO', 'SEM_RESPOSTA')),
      data_envio TEXT,
      data_resposta TEXT,
      prazo_entrega TEXT,
      forma_pagamento TEXT,
      observacoes TEXT,
      UNIQUE (cotacao_id, fornecedor_id),
      FOREIGN KEY (cotacao_id) REFERENCES cotacoes (id) ON DELETE CASCADE,
      FOREIGN KEY (fornecedor_id) REFERENCES FORNECEDORES (id)
    );

    CREATE TABLE IF NOT EXISTS cotacao_fornecedor_itens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cotacao_fornecedor_id INTEGER NOT NULL,
      solicitacao_item_id INTEGER NOT NULL,
      quantidade REAL NOT NULL CHECK (quantidade > 0),
      valor_unitario REAL CHECK (valor_unitario >= 0),
      valor_total REAL GENERATED ALWAYS AS (quantidade * valor_unitario) STORED,
      observacoes TEXT,
      UNIQUE (cotacao_fornecedor_id, solicitacao_item_id),
      FOREIGN KEY (cotacao_fornecedor_id) REFERENCES cotacao_fornecedores (id) ON DELETE CASCADE,
      FOREIGN KEY (solicitacao_item_id) REFERENCES solicitacao_compra_itens (id)
    );
  `);
}

async function ensureSolicitacoesCompraStatus(database) {
  const table = await database.get(`
    SELECT sql
    FROM sqlite_master
    WHERE type = 'table'
      AND name = 'solicitacoes_compra'
  `);

  if (!table?.sql || table.sql.includes('EM_COTACAO') && table.sql.includes('RECEBIDA_TOTAL')) {
    return;
  }

  await database.exec('PRAGMA foreign_keys = OFF');

  try {
    await database.exec(`
      CREATE TABLE solicitacoes_compra_nova (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        solicitante_id INTEGER NOT NULL,
        status TEXT NOT NULL DEFAULT 'ABERTA' CHECK (status IN (
          'ABERTA',
          'APROVADA',
          'REPROVADA',
          'EM_COTACAO',
          'EM_ANALISE_COTACAO',
          'COTACAO_REPROVADA',
          'COTACAO_APROVADA',
          'EM_ESCOLHA_FORNECEDOR',
          'AGUARDANDO_APROVACAO_COMPRA',
          'COMPRA_APROVADA',
          'COMPRA_REPROVADA',
          'OC_GERADA',
          'OC_ENVIADA',
          'AGUARDANDO_RECEBIMENTO',
          'RECEBIDA_PARCIAL',
          'RECEBIDA_TOTAL',
          'CANCELADA',
          'FINALIZADA'
        )),
        observacoes TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (solicitante_id) REFERENCES USUARIOS (id)
      );

      INSERT INTO solicitacoes_compra_nova (
        id,
        solicitante_id,
        status,
        observacoes,
        created_at,
        updated_at
      )
      SELECT
        id,
        solicitante_id,
        status,
        observacoes,
        COALESCE(created_at, CURRENT_TIMESTAMP),
        COALESCE(updated_at, CURRENT_TIMESTAMP)
      FROM solicitacoes_compra;

      DROP TABLE solicitacoes_compra;
      ALTER TABLE solicitacoes_compra_nova RENAME TO solicitacoes_compra;
    `);
  } finally {
    await database.exec('PRAGMA foreign_keys = ON');
  }
}
