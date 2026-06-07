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
  await ensureComprasSchema(database);
  await ensureOrdensCompraSchema(database);
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
      status_item TEXT NOT NULL DEFAULT 'DISPONIVEL' CHECK (status_item IN ('DISPONIVEL', 'INDISPONIVEL')),
      quantidade REAL CHECK (quantidade IS NULL OR quantidade > 0),
      valor_unitario REAL CHECK (valor_unitario >= 0),
      valor_total REAL GENERATED ALWAYS AS (quantidade * valor_unitario) STORED,
      observacoes TEXT,
      CHECK (
        (status_item = 'DISPONIVEL' AND quantidade IS NOT NULL AND valor_unitario IS NOT NULL)
        OR
        (status_item = 'INDISPONIVEL' AND quantidade IS NULL AND valor_unitario IS NULL)
      ),
      UNIQUE (cotacao_fornecedor_id, solicitacao_item_id),
      FOREIGN KEY (cotacao_fornecedor_id) REFERENCES cotacao_fornecedores (id) ON DELETE CASCADE,
      FOREIGN KEY (solicitacao_item_id) REFERENCES solicitacao_compra_itens (id)
    );

    CREATE TABLE IF NOT EXISTS cotacao_fornecedor_anexos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cotacao_fornecedor_id INTEGER NOT NULL,
      nome_arquivo TEXT NOT NULL,
      caminho_arquivo TEXT NOT NULL,
      tipo_arquivo TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (cotacao_fornecedor_id) REFERENCES cotacao_fornecedores (id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_cotacao_fornecedor_anexos_fornecedor_id
      ON cotacao_fornecedor_anexos (cotacao_fornecedor_id);
  `);

  await ensureCotacaoFornecedorItensDisponibilidadeSchema(database);
}

async function ensureCotacaoFornecedorItensDisponibilidadeSchema(database) {
  const table = await database.get(`
    SELECT sql
    FROM sqlite_master
    WHERE type = 'table'
      AND name = 'cotacao_fornecedor_itens'
  `);

  if (!table?.sql || table.sql.includes('status_item') && !table.sql.includes('quantidade REAL NOT NULL')) {
    return;
  }

  await database.exec('PRAGMA foreign_keys = OFF');

  try {
    await database.exec(`
      CREATE TABLE cotacao_fornecedor_itens_nova (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        cotacao_fornecedor_id INTEGER NOT NULL,
        solicitacao_item_id INTEGER NOT NULL,
        status_item TEXT NOT NULL DEFAULT 'DISPONIVEL' CHECK (status_item IN ('DISPONIVEL', 'INDISPONIVEL')),
        quantidade REAL CHECK (quantidade IS NULL OR quantidade > 0),
        valor_unitario REAL CHECK (valor_unitario >= 0),
        valor_total REAL GENERATED ALWAYS AS (quantidade * valor_unitario) STORED,
        observacoes TEXT,
        CHECK (
          (status_item = 'DISPONIVEL' AND quantidade IS NOT NULL AND valor_unitario IS NOT NULL)
          OR
          (status_item = 'INDISPONIVEL' AND quantidade IS NULL AND valor_unitario IS NULL)
        ),
        UNIQUE (cotacao_fornecedor_id, solicitacao_item_id),
        FOREIGN KEY (cotacao_fornecedor_id) REFERENCES cotacao_fornecedores (id) ON DELETE CASCADE,
        FOREIGN KEY (solicitacao_item_id) REFERENCES solicitacao_compra_itens (id)
      );

      INSERT INTO cotacao_fornecedor_itens_nova (
        id,
        cotacao_fornecedor_id,
        solicitacao_item_id,
        status_item,
        quantidade,
        valor_unitario,
        observacoes
      )
      SELECT
        id,
        cotacao_fornecedor_id,
        solicitacao_item_id,
        CASE
          WHEN valor_unitario IS NULL THEN 'INDISPONIVEL'
          ELSE 'DISPONIVEL'
        END,
        CASE
          WHEN valor_unitario IS NULL THEN NULL
          ELSE quantidade
        END,
        valor_unitario,
        observacoes
      FROM cotacao_fornecedor_itens;

      DROP TABLE cotacao_fornecedor_itens;
      ALTER TABLE cotacao_fornecedor_itens_nova RENAME TO cotacao_fornecedor_itens;
    `);
  } finally {
    await database.exec('PRAGMA foreign_keys = ON');
  }
}

async function ensureSolicitacoesCompraStatus(database) {
  const table = await database.get(`
    SELECT sql
    FROM sqlite_master
    WHERE type = 'table'
      AND name = 'solicitacoes_compra'
  `);

  if (
    !table?.sql ||
    table.sql.includes('EM_COTACAO') &&
      table.sql.includes('RECEBIDA_TOTAL') &&
      !table.sql.includes('COMPRA_REPROVADA')
  ) {
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

async function ensureComprasSchema(database) {
  await database.exec(`
    CREATE TABLE IF NOT EXISTS compras (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      solicitacao_id INTEGER NOT NULL,
      cotacao_id INTEGER,
      status TEXT NOT NULL DEFAULT 'EM_MONTAGEM' CHECK (status IN (
        'EM_MONTAGEM',
        'AGUARDANDO_APROVACAO',
        'APROVADA',
        'CANCELADA'
      )),
      criado_por INTEGER,
      data_compra TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      observacoes TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (solicitacao_id) REFERENCES solicitacoes_compra (id),
      FOREIGN KEY (cotacao_id) REFERENCES cotacoes (id),
      FOREIGN KEY (criado_por) REFERENCES USUARIOS (id)
    );

    CREATE TABLE IF NOT EXISTS compra_fornecedores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      compra_id INTEGER NOT NULL,
      fornecedor_id INTEGER NOT NULL,
      prazo_entrega TEXT,
      forma_pagamento TEXT,
      justificativa_texto TEXT,
      orcamento_anexo_id INTEGER,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (compra_id, fornecedor_id),
      FOREIGN KEY (compra_id) REFERENCES compras (id) ON DELETE CASCADE,
      FOREIGN KEY (fornecedor_id) REFERENCES FORNECEDORES (id)
    );

    CREATE TABLE IF NOT EXISTS compra_fornecedor_itens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      compra_fornecedor_id INTEGER NOT NULL,
      solicitacao_item_id INTEGER NOT NULL,
      quantidade_pedida REAL NOT NULL CHECK (quantidade_pedida > 0),
      quantidade_recebida REAL NOT NULL DEFAULT 0 CHECK (quantidade_recebida >= 0),
      valor_unitario REAL NOT NULL CHECK (valor_unitario >= 0),
      valor_total REAL GENERATED ALWAYS AS (quantidade_pedida * valor_unitario) STORED,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT chk_compra_item_recebido_limite
        CHECK (quantidade_recebida <= quantidade_pedida),
      UNIQUE (compra_fornecedor_id, solicitacao_item_id),
      FOREIGN KEY (compra_fornecedor_id) REFERENCES compra_fornecedores (id) ON DELETE CASCADE,
      FOREIGN KEY (solicitacao_item_id) REFERENCES solicitacao_compra_itens (id)
    );

    CREATE TABLE IF NOT EXISTS compra_fornecedor_justificativas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      compra_fornecedor_id INTEGER NOT NULL,
      justificativa TEXT NOT NULL CHECK (
        justificativa IN (
          'MENOR_PRECO',
          'PRAZO',
          'PECA_ORIGINAL',
          'GARANTIA',
          'QUALIDADE',
          'DISPONIBILIDADE',
          'OUTRO'
        )
      ),
      UNIQUE (compra_fornecedor_id, justificativa),
      FOREIGN KEY (compra_fornecedor_id) REFERENCES compra_fornecedores (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS compra_aprovacoes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      compra_id INTEGER NOT NULL,
      aprovador_id INTEGER NOT NULL,
      decisao TEXT NOT NULL CHECK (decisao IN ('APROVADO', 'CANCELADA')),
      observacao TEXT,
      data_decisao TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (compra_id) REFERENCES compras (id) ON DELETE CASCADE,
      FOREIGN KEY (aprovador_id) REFERENCES USUARIOS (id)
    );
  `);

  await ensureComprasStatusSchema(database);
  await ensureCompraAprovacoesCanceladaSchema(database);
}

async function ensureComprasStatusSchema(database) {
  const table = await database.get(`
    SELECT sql
    FROM sqlite_master
    WHERE type = 'table'
      AND name = 'compras'
  `);

  if (!table?.sql || !table.sql.includes('REPROVADA')) {
    return;
  }

  await database.exec('PRAGMA foreign_keys = OFF');

  try {
    await database.exec(`
      CREATE TABLE compras_nova (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        solicitacao_id INTEGER NOT NULL,
        cotacao_id INTEGER,
        status TEXT NOT NULL DEFAULT 'EM_MONTAGEM' CHECK (status IN (
          'EM_MONTAGEM',
          'AGUARDANDO_APROVACAO',
          'APROVADA',
          'CANCELADA'
        )),
        criado_por INTEGER,
        data_compra TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        observacoes TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (solicitacao_id) REFERENCES solicitacoes_compra (id),
        FOREIGN KEY (cotacao_id) REFERENCES cotacoes (id),
        FOREIGN KEY (criado_por) REFERENCES USUARIOS (id)
      );

      INSERT INTO compras_nova (
        id,
        solicitacao_id,
        cotacao_id,
        CASE
          WHEN status = 'COMPRA_REPROVADA' THEN 'CANCELADA'
          ELSE status
        END,
        criado_por,
        data_compra,
        observacoes,
        created_at,
        updated_at
      )
      SELECT
        id,
        solicitacao_id,
        cotacao_id,
        CASE
          WHEN status = 'REPROVADA' THEN 'CANCELADA'
          ELSE status
        END,
        criado_por,
        data_compra,
        observacoes,
        created_at,
        updated_at
      FROM compras;

      DROP TABLE compras;
      ALTER TABLE compras_nova RENAME TO compras;
    `);
  } finally {
    await database.exec('PRAGMA foreign_keys = ON');
  }
}

async function ensureCompraAprovacoesCanceladaSchema(database) {
  const table = await database.get(`
    SELECT sql
    FROM sqlite_master
    WHERE type = 'table'
      AND name = 'compra_aprovacoes'
  `);

  if (!table?.sql || table.sql.includes('CANCELADA') && !table.sql.includes('RECUSADO')) {
    return;
  }

  await database.exec('PRAGMA foreign_keys = OFF');

  try {
    await database.exec(`
      CREATE TABLE compra_aprovacoes_nova (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        compra_id INTEGER NOT NULL,
        aprovador_id INTEGER NOT NULL,
        decisao TEXT NOT NULL CHECK (decisao IN ('APROVADO', 'CANCELADA')),
        observacao TEXT,
        data_decisao TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (compra_id) REFERENCES compras (id) ON DELETE CASCADE,
        FOREIGN KEY (aprovador_id) REFERENCES USUARIOS (id)
      );

      INSERT INTO compra_aprovacoes_nova (
        id,
        compra_id,
        aprovador_id,
        decisao,
        observacao,
        data_decisao
      )
      SELECT
        id,
        compra_id,
        aprovador_id,
        CASE
          WHEN decisao = 'APROVADO' THEN 'APROVADO'
          ELSE 'CANCELADA'
        END,
        observacao,
        data_decisao
      FROM compra_aprovacoes;

      DROP TABLE compra_aprovacoes;
      ALTER TABLE compra_aprovacoes_nova RENAME TO compra_aprovacoes;
    `);
  } finally {
    await database.exec('PRAGMA foreign_keys = ON');
  }
}

async function ensureOrdensCompraSchema(database) {
  await ensureOrdensCompraTable(database);
  await ensureOrdemCompraEnviosTable(database);

  await database.exec(`
    CREATE INDEX IF NOT EXISTS idx_ordens_compra_compra_fornecedor_id
      ON ordens_compra (compra_fornecedor_id);

    CREATE UNIQUE INDEX IF NOT EXISTS idx_ordens_compra_compra_fornecedor_ativa
      ON ordens_compra (compra_fornecedor_id)
      WHERE status = 'GERADA';

    CREATE INDEX IF NOT EXISTS idx_ordem_compra_envios_ordem_compra_id
      ON ordem_compra_envios (ordem_compra_id);
  `);
}

async function ensureOrdensCompraTable(database) {
  const table = await database.get(`
    SELECT sql
    FROM sqlite_master
    WHERE type = 'table'
      AND name = 'ordens_compra'
  `);

  if (!table?.sql) {
    await database.exec(`
      CREATE TABLE ordens_compra (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        numero_oc TEXT NOT NULL UNIQUE,
        compra_fornecedor_id INTEGER NOT NULL,
        ordem_substituida_id INTEGER,
        data_emissao TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        status TEXT NOT NULL DEFAULT 'GERADA' CHECK (status IN ('GERADA', 'CANCELADA', 'SUBSTITUIDA')),
        cancelada_em TEXT,
        cancelada_por INTEGER,
        motivo_cancelamento TEXT,
        observacoes TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (compra_fornecedor_id) REFERENCES compra_fornecedores (id) ON DELETE CASCADE,
        FOREIGN KEY (ordem_substituida_id) REFERENCES ordens_compra (id),
        FOREIGN KEY (cancelada_por) REFERENCES USUARIOS (id)
      );
    `);
    return;
  }

  if (table.sql.includes('SUBSTITUIDA') && !table.sql.includes('pdf_caminho')) {
    return;
  }

  await database.exec('PRAGMA foreign_keys = OFF');

  try {
    await database.exec(`
      CREATE TABLE ordens_compra_nova (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        numero_oc TEXT NOT NULL UNIQUE,
        compra_fornecedor_id INTEGER NOT NULL,
        ordem_substituida_id INTEGER,
        data_emissao TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        status TEXT NOT NULL DEFAULT 'GERADA' CHECK (status IN ('GERADA', 'CANCELADA', 'SUBSTITUIDA')),
        cancelada_em TEXT,
        cancelada_por INTEGER,
        motivo_cancelamento TEXT,
        observacoes TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (compra_fornecedor_id) REFERENCES compra_fornecedores (id) ON DELETE CASCADE,
        FOREIGN KEY (ordem_substituida_id) REFERENCES ordens_compra (id),
        FOREIGN KEY (cancelada_por) REFERENCES USUARIOS (id)
      );

      INSERT INTO ordens_compra_nova (
        id,
        numero_oc,
        compra_fornecedor_id,
        ordem_substituida_id,
        data_emissao,
        status,
        cancelada_em,
        cancelada_por,
        motivo_cancelamento,
        observacoes,
        created_at,
        updated_at
      )
      SELECT
        id,
        numero_oc,
        compra_fornecedor_id,
        NULL,
        COALESCE(data_emissao, CURRENT_TIMESTAMP),
        CASE
          WHEN status = 'CANCELADA' THEN 'CANCELADA'
          ELSE 'GERADA'
        END,
        NULL,
        NULL,
        NULL,
        observacoes,
        COALESCE(data_emissao, CURRENT_TIMESTAMP),
        CURRENT_TIMESTAMP
      FROM ordens_compra;

      DROP TABLE ordens_compra;
      ALTER TABLE ordens_compra_nova RENAME TO ordens_compra;
    `);
  } finally {
    await database.exec('PRAGMA foreign_keys = ON');
  }
}

async function ensureOrdemCompraEnviosTable(database) {
  await database.exec(`
    CREATE TABLE IF NOT EXISTS ordem_compra_envios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ordem_compra_id INTEGER NOT NULL,
      usuario_id INTEGER,
      email_destino TEXT NOT NULL,
      enviado_em TEXT,
      status TEXT NOT NULL DEFAULT 'PENDENTE' CHECK (status IN ('PENDENTE', 'ENVIADO', 'FALHA')),
      observacao TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (ordem_compra_id) REFERENCES ordens_compra (id) ON DELETE CASCADE,
      FOREIGN KEY (usuario_id) REFERENCES USUARIOS (id)
    );
  `);
}
