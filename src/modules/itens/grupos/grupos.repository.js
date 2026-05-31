import { getDatabase } from '../../../db/connection.js';

const grupoFields = 'id, nome, ativo, created_at, updated_at';

// Repositories são a única camada que executa SQL puro.
async function findAll() {
  const database = await getDatabase();

  return database.all(`SELECT ${grupoFields} FROM GRUPOS_ITENS ORDER BY nome ASC`);
}

async function findById(id) {
  const database = await getDatabase();

  return database.get(`SELECT ${grupoFields} FROM GRUPOS_ITENS WHERE id = ?`, id);
}

async function findByNome(nome) {
  const database = await getDatabase();

  return database.get(`SELECT ${grupoFields} FROM GRUPOS_ITENS WHERE nome = ?`, nome);
}

async function create({ nome, ativo = 1 }) {
  const database = await getDatabase();
  const result = await database.run(
    `INSERT INTO GRUPOS_ITENS (nome, ativo)
     VALUES (?, ?)`,
    [nome, ativo]
  );

  return findById(result.lastID);
}

async function update(id, { nome, ativo }) {
  const database = await getDatabase();
  await database.run(
    `UPDATE GRUPOS_ITENS
     SET nome = COALESCE(?, nome),
         ativo = COALESCE(?, ativo),
         updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [nome, ativo, id]
  );

  return findById(id);
}

export default {
  findAll,
  findById,
  findByNome,
  create,
  update
};
