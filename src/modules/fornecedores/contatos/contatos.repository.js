import { getDatabase } from '../../../db/connection.js';

const contatoFields = 'id, fornecedor_id, nome, cargo, telefone, email';

// Repositories são a única camada que executa SQL puro.
async function findAllByFornecedorId(fornecedorId) {
  const database = await getDatabase();

  return database.all(
    `SELECT ${contatoFields}
     FROM FORNECEDOR_CONTATOS
     WHERE fornecedor_id = ?
     ORDER BY id DESC`,
    fornecedorId
  );
}

async function findById(id) {
  const database = await getDatabase();

  return database.get(`SELECT ${contatoFields} FROM FORNECEDOR_CONTATOS WHERE id = ?`, id);
}

async function create(fornecedorId, { nome, cargo = null, telefone = null, email = null }) {
  const database = await getDatabase();
  const result = await database.run(
    `INSERT INTO FORNECEDOR_CONTATOS (fornecedor_id, nome, cargo, telefone, email)
     VALUES (?, ?, ?, ?, ?)`,
    [fornecedorId, nome, cargo, telefone, email]
  );

  return database.get(`SELECT ${contatoFields} FROM FORNECEDOR_CONTATOS WHERE id = ?`, result.lastID);
}

async function update(id, { nome, cargo, telefone, email }) {
  const database = await getDatabase();
  await database.run(
    `UPDATE FORNECEDOR_CONTATOS
     SET nome = COALESCE(?, nome),
         cargo = COALESCE(?, cargo),
         telefone = COALESCE(?, telefone),
         email = COALESCE(?, email)
     WHERE id = ?`,
    [nome, cargo, telefone, email, id]
  );

  return findById(id);
}

async function remove(id) {
  const database = await getDatabase();

  return database.run('DELETE FROM FORNECEDOR_CONTATOS WHERE id = ?', id);
}

export default {
  findAllByFornecedorId,
  findById,
  create,
  update,
  remove
};
