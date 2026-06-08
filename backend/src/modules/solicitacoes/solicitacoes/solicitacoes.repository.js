import { getDatabase } from '../../../db/connection.js';

const solicitacaoFields = `
  s.id,
  s.solicitante_id,
  u.nome AS solicitante_nome,
  u.email AS solicitante_email,
  s.status,
  s.observacoes,
  s.created_at,
  s.updated_at
`;

// Repositories são a única camada que executa SQL puro.
async function findAll() {
  const database = await getDatabase();

  return database.all(`
    SELECT ${solicitacaoFields}
    FROM solicitacoes_compra s
    INNER JOIN USUARIOS u ON u.id = s.solicitante_id
    ORDER BY s.id DESC
  `);
}

async function findById(id) {
  const database = await getDatabase();

  return database.get(
    `
      SELECT ${solicitacaoFields}
      FROM solicitacoes_compra s
      INNER JOIN USUARIOS u ON u.id = s.solicitante_id
      WHERE s.id = ?
    `,
    id
  );
}

async function findItensBySolicitacaoId(id) {
  const database = await getDatabase();

  return database.all(
    `
      SELECT
        si.id,
        si.solicitacao_id,
        si.item_id,
        i.codigo AS item_codigo,
        i.descricao AS item_descricao,
        si.descricao_necessidade,
        si.quantidade,
        si.unidade_snapshot,
        si.observacoes,
        si.created_at
      FROM solicitacao_compra_itens si
      LEFT JOIN ITENS_COMPRA i ON i.id = si.item_id
      WHERE si.solicitacao_id = ?
      ORDER BY si.id ASC
    `,
    id
  );
}

async function countItensBySolicitacaoId(id) {
  const database = await getDatabase();
  const result = await database.get(
    `
      SELECT COUNT(*) AS total
      FROM solicitacao_compra_itens
      WHERE solicitacao_id = ?
    `,
    id
  );

  return result?.total ?? 0;
}

async function countItensCatalogadosBySolicitacaoId(id) {
  const database = await getDatabase();
  const result = await database.get(
    `
      SELECT COUNT(*) AS total
      FROM solicitacao_compra_itens
      WHERE solicitacao_id = ?
        AND item_id IS NOT NULL
    `,
    id
  );

  return result?.total ?? 0;
}

async function create({ solicitante_id, status = 'ABERTA', observacoes = null }) {
  const database = await getDatabase();
  const result = await database.run(
    `INSERT INTO solicitacoes_compra (solicitante_id, status, observacoes, created_at, updated_at)
     VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
    [solicitante_id, status, observacoes]
  );

  return findById(result.lastID);
}

async function updateStatus(id, status) {
  const database = await getDatabase();
  await database.run(
    `UPDATE solicitacoes_compra
     SET status = ?,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [status, id]
  );

  return findById(id);
}

export default {
  findAll,
  findById,
  findItensBySolicitacaoId,
  countItensBySolicitacaoId,
  countItensCatalogadosBySolicitacaoId,
  create,
  updateStatus
};
