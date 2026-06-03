import { getDatabase } from '../../../db/connection.js';

const itemFields = `
  i.id,
  i.codigo,
  i.descricao,
  i.unidade,
  i.classificacao,
  i.grupo_id,
  g.nome AS grupo_nome,
  i.controla_estoque,
  i.ativo,
  i.created_at,
  i.updated_at
`;

// Repositories são a única camada que executa SQL puro.
async function findAll() {
  const database = await getDatabase();

  return database.all(`
    SELECT ${itemFields}
    FROM ITENS_COMPRA i
    LEFT JOIN GRUPOS_ITENS g ON g.id = i.grupo_id
    ORDER BY i.id DESC
  `);
}

async function findById(id) {
  const database = await getDatabase();

  return database.get(
    `
      SELECT ${itemFields}
      FROM ITENS_COMPRA i
      LEFT JOIN GRUPOS_ITENS g ON g.id = i.grupo_id
      WHERE i.id = ?
    `,
    id
  );
}

async function findByCodigo(codigo) {
  const database = await getDatabase();

  return database.get(
    `
      SELECT ${itemFields}
      FROM ITENS_COMPRA i
      LEFT JOIN GRUPOS_ITENS g ON g.id = i.grupo_id
      WHERE i.codigo = ?
    `,
    codigo
  );
}

async function create({
  codigo,
  descricao,
  unidade,
  classificacao = 'CUSTO',
  grupo_id,
  controla_estoque = 0,
  ativo = 1
}) {
  const database = await getDatabase();
  const result = await database.run(
    `INSERT INTO ITENS_COMPRA (
       codigo,
       descricao,
       unidade,
       classificacao,
       grupo_id,
       controla_estoque,
       ativo,
       created_at,
       updated_at
     )
     VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
    [codigo, descricao, unidade, classificacao, grupo_id, controla_estoque, ativo]
  );

  return findById(result.lastID);
}

async function update(id, { codigo, descricao, unidade, classificacao, grupo_id, controla_estoque, ativo }) {
  const database = await getDatabase();
  await database.run(
    `UPDATE ITENS_COMPRA
     SET codigo = COALESCE(?, codigo),
         descricao = COALESCE(?, descricao),
         unidade = COALESCE(?, unidade),
         classificacao = COALESCE(?, classificacao),
         grupo_id = ?,
         controla_estoque = COALESCE(?, controla_estoque),
         ativo = COALESCE(?, ativo),
         updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [codigo, descricao, unidade, classificacao, grupo_id, controla_estoque, ativo, id]
  );

  return findById(id);
}

async function remove(id) {
  const database = await getDatabase();

  await database.run('DELETE FROM ITENS_COMPRA WHERE id = ?', id);
}

export default {
  findAll,
  findById,
  findByCodigo,
  create,
  update,
  remove
};
