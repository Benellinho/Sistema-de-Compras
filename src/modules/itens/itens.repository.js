import { getDatabase } from '../../db/connection.js';

// Repositories são a única camada que executa SQL puro.
async function findAll() {
  const database = await getDatabase();

  return database.all('SELECT id, codigo, descricao, unidade FROM ITENS_COMPRA ORDER BY id DESC');
}

async function create({ codigo, descricao, unidade }) {
  const database = await getDatabase();
  const result = await database.run(
    `INSERT INTO ITENS_COMPRA (codigo, descricao, unidade)
     VALUES (?, ?, ?)`,
    [codigo, descricao, unidade]
  );

  return database.get('SELECT id, codigo, descricao, unidade FROM ITENS_COMPRA WHERE id = ?', result.lastID);
}

export default {
  findAll,
  create
};
