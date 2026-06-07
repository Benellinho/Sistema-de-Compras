import { getDatabase } from '../../db/connection.js';

const usuarioFields = 'id, nome, email, cargo, ativo, created_at, updated_at';

// Repositories são a única camada que executa SQL puro.
async function findAll() {
  const database = await getDatabase();

  return database.all(`SELECT ${usuarioFields} FROM USUARIOS ORDER BY id DESC`);
}

async function findById(id) {
  const database = await getDatabase();

  return database.get(`SELECT ${usuarioFields} FROM USUARIOS WHERE id = ?`, id);
}

async function findByEmail(email) {
  const database = await getDatabase();

  return database.get(`SELECT ${usuarioFields} FROM USUARIOS WHERE email = ?`, email);
}

async function create({ nome, email, cargo = null, ativo = 1 }) {
  const database = await getDatabase();
  const result = await database.run(
    `INSERT INTO USUARIOS (nome, email, cargo, ativo, created_at, updated_at)
     VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
    [nome, email, cargo, ativo]
  );

  return findById(result.lastID);
}

async function update(id, { nome, email, cargo, ativo }) {
  const database = await getDatabase();
  await database.run(
    `UPDATE USUARIOS
     SET nome = COALESCE(?, nome),
         email = COALESCE(?, email),
         cargo = COALESCE(?, cargo),
         ativo = COALESCE(?, ativo),
         updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [nome, email, cargo, ativo, id]
  );

  return findById(id);
}

async function remove(id) {
  const database = await getDatabase();

  await database.run('DELETE FROM USUARIOS WHERE id = ?', id);
}

export default {
  findAll,
  findById,
  findByEmail,
  create,
  update,
  remove
};
