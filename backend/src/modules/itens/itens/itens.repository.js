import { getDatabase } from '../../../db/connection.js';

const itemFields = `
  i.id,
  i.codigo,
  i.sequencial,
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
  descricao,
  unidade,
  classificacao = 'CUSTO',
  grupo_id,
  controla_estoque = 0,
  ativo = 1
}) {
  const database = await getDatabase();
  const result = await database.run(
    `WITH proximo_codigo AS (
       UPDATE GRUPOS_ITENS
       SET ultimo_sequencial = ultimo_sequencial + 1,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?
       RETURNING id, codigo, ultimo_sequencial
     )
     INSERT INTO ITENS_COMPRA (
       codigo,
       sequencial,
       descricao,
       unidade,
       classificacao,
       grupo_id,
       controla_estoque,
       ativo,
       created_at,
       updated_at
     )
     SELECT codigo || ' - ' || LPAD(ultimo_sequencial::TEXT, 3, '0'),
            ultimo_sequencial,
            ?, ?, ?, id, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
     FROM proximo_codigo
     RETURNING id`,
    [grupo_id, descricao, unidade, classificacao, controla_estoque, ativo]
  );

  return findById(result.lastID);
}

async function update(id, { descricao, unidade, classificacao, grupo_id, controla_estoque, ativo }) {
  const database = await getDatabase();
  await database.run(
    `WITH item_atual AS (
       SELECT grupo_id
       FROM ITENS_COMPRA
       WHERE id = ?
     ),
     proximo_codigo AS (
       UPDATE GRUPOS_ITENS g
       SET ultimo_sequencial = ultimo_sequencial + 1,
           updated_at = CURRENT_TIMESTAMP
       WHERE g.id = ?
         AND EXISTS (
           SELECT 1 FROM item_atual WHERE grupo_id <> ?
         )
       RETURNING codigo, ultimo_sequencial
     )
     UPDATE ITENS_COMPRA
     SET codigo = COALESCE(
           (SELECT codigo || ' - ' || LPAD(ultimo_sequencial::TEXT, 3, '0') FROM proximo_codigo),
           codigo
         ),
         sequencial = COALESCE(
           (SELECT ultimo_sequencial FROM proximo_codigo),
           sequencial
         ),
         descricao = COALESCE(?, descricao),
         unidade = COALESCE(?, unidade),
         classificacao = COALESCE(?, classificacao),
         grupo_id = ?,
         controla_estoque = COALESCE(?, controla_estoque),
         ativo = COALESCE(?, ativo),
         updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [id, grupo_id, grupo_id, descricao, unidade, classificacao, grupo_id, controla_estoque, ativo, id]
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
