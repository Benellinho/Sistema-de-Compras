import { getDatabase } from '../../db/connection.js';

// Repositories são a única camada que executa SQL puro.
async function findAll() {
  const database = await getDatabase();

  return database.all(
    'SELECT id, solicitante, status, data_solicitacao FROM SOLICITACOES ORDER BY id DESC'
  );
}

async function create({ solicitante, status = 'ABERTA', data_solicitacao = null }) {
  const database = await getDatabase();
  const result = await database.run(
    `INSERT INTO SOLICITACOES (solicitante, status, data_solicitacao)
     VALUES (?, ?, COALESCE(?, CURRENT_TIMESTAMP))`,
    [solicitante, status, data_solicitacao]
  );

  return database.get(
    'SELECT id, solicitante, status, data_solicitacao FROM SOLICITACOES WHERE id = ?',
    result.lastID
  );
}

export default {
  findAll,
  create
};
