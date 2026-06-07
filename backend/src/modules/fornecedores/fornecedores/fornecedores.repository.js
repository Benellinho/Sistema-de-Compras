import { getDatabase } from '../../../db/connection.js';

const fornecedorFields = 'id, cnpj, status, razao_social, nome_fantasia, telefone, email';

// Repositories são a única camada que executa SQL puro.
async function findAll() {
  const database = await getDatabase();

  return database.all(`SELECT ${fornecedorFields} FROM FORNECEDORES ORDER BY id DESC`);
}

async function findById(id) {
  const database = await getDatabase();

  return database.get(`SELECT ${fornecedorFields} FROM FORNECEDORES WHERE id = ?`, id);
}

async function findByCnpj(cnpj) {
  const database = await getDatabase();

  return database.get(`SELECT ${fornecedorFields} FROM FORNECEDORES WHERE cnpj = ?`, cnpj);
}

async function create({ cnpj, status = 'ATIVO', razao_social, nome_fantasia = null, telefone = null, email = null }) {
  const database = await getDatabase();
  const result = await database.run(
    `INSERT INTO FORNECEDORES (cnpj, status, razao_social, nome_fantasia, telefone, email)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [cnpj, status, razao_social, nome_fantasia, telefone, email]
  );

  return findById(result.lastID);
}

async function update(id, { cnpj, status, razao_social, nome_fantasia, telefone, email }) {
  const database = await getDatabase();
  await database.run(
    `UPDATE FORNECEDORES
     SET cnpj = COALESCE(?, cnpj),
         status = COALESCE(?, status),
         razao_social = COALESCE(?, razao_social),
         nome_fantasia = COALESCE(?, nome_fantasia),
         telefone = COALESCE(?, telefone),
         email = COALESCE(?, email)
     WHERE id = ?`,
    [cnpj, status, razao_social, nome_fantasia, telefone, email, id]
  );

  return findById(id);
}

export default {
  findAll,
  findById,
  findByCnpj,
  create,
  update
};
