import 'dotenv/config';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const { Pool, types } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const schemaPath = path.resolve(__dirname, 'schema.postgres.sql');

types.setTypeParser(20, (value) => Number(value));
types.setTypeParser(1700, (value) => Number(value));

let db;

function normalizeBoolean(value, defaultValue = false) {
  if (value === undefined || value === null || value === '') {
    return defaultValue;
  }

  return ['1', 'true', 'yes', 'on'].includes(String(value).toLowerCase());
}

function getPoolConfig() {
  const ssl = normalizeBoolean(process.env.DB_SSL)
    ? { rejectUnauthorized: false }
    : false;

  if (process.env.DATABASE_URL) {
    return {
      connectionString: process.env.DATABASE_URL,
      ssl
    };
  }

  const requiredVariables = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
  const missingVariables = requiredVariables.filter((variable) => !process.env[variable]);

  if (missingVariables.length > 0) {
    throw new Error(`Variaveis de banco ausentes: ${missingVariables.join(', ')}`);
  }

  return {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 5432),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl
  };
}

function normalizeParams(args) {
  if (args.length === 1 && Array.isArray(args[0])) {
    return args[0];
  }

  return args;
}

function convertPlaceholders(sql) {
  let index = 0;

  return sql.replace(/\?/g, () => {
    index += 1;
    return `$${index}`;
  });
}

function addReturningId(sql) {
  if (!/^\s*insert\s+into\s+/i.test(sql) || /\breturning\b/i.test(sql)) {
    return sql;
  }

  return sql.replace(/;\s*$/, '').trimEnd() + ' RETURNING id';
}

class PostgresDatabase {
  constructor() {
    this.pool = new Pool(getPoolConfig());
    this.transactionClient = null;
  }

  async query(sql, params = []) {
    const query = convertPlaceholders(sql);
    const client = this.transactionClient ?? this.pool;

    return client.query(query, params);
  }

  async all(sql, ...args) {
    const result = await this.query(sql, normalizeParams(args));

    return result.rows;
  }

  async get(sql, ...args) {
    const result = await this.query(sql, normalizeParams(args));

    return result.rows[0];
  }

  async run(sql, ...args) {
    const result = await this.query(addReturningId(sql), normalizeParams(args));

    return {
      lastID: result.rows[0]?.id,
      changes: result.rowCount
    };
  }

  async exec(sql) {
    const statement = sql.trim().toUpperCase();

    if (statement === 'BEGIN') {
      if (this.transactionClient) {
        throw new Error('Ja existe uma transacao ativa nesta conexao.');
      }

      this.transactionClient = await this.pool.connect();
      await this.transactionClient.query('BEGIN');
      return;
    }

    if (statement === 'COMMIT' || statement === 'ROLLBACK') {
      if (!this.transactionClient) {
        return;
      }

      try {
        await this.transactionClient.query(statement);
      } finally {
        this.transactionClient.release();
        this.transactionClient = null;
      }

      return;
    }

    await this.query(sql);
  }

  async close() {
    if (this.transactionClient) {
      this.transactionClient.release();
      this.transactionClient = null;
    }

    await this.pool.end();

    if (db === this) {
      db = null;
    }
  }
}

export async function getDatabase() {
  if (!db) {
    db = new PostgresDatabase();
  }

  return db;
}

export async function initializeDatabase() {
  const database = await getDatabase();
  const schema = await fs.readFile(schemaPath, 'utf8');

  await database.exec(schema);
}
