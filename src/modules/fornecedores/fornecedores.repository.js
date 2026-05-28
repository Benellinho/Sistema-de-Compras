import { getDatabase } from '../../db/connection.js';

// Repositories são a única camada que executa SQL puro.
async function findAll() {
  const database = await getDatabase();

  return database.all('SELECT id, cnpj, razao_social, nome_fantasia, status FROM FORNECEDORES ORDER BY id DESC');
}

async function create({ cnpj, razao_social, nome_fantasia = null, status = 'ATIVO' }) {
  const database = await getDatabase();
  const result = await database.run(
    `INSERT INTO FORNECEDORES (cnpj, razao_social, nome_fantasia, status)
     VALUES (?, ?, ?, ?)`,
    [cnpj, razao_social, nome_fantasia, status]
  );

  return database.get('SELECT id, cnpj, razao_social, nome_fantasia, status FROM FORNECEDORES WHERE id = ?', result.lastID);
}

export default {
  findAll,
  create
};
