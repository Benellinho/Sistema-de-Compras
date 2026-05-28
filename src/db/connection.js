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
}
