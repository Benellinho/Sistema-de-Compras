import { getDatabase } from '../../../db/connection.js';

const itemSolicitacaoFields = `
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
`;

// Repositories são a única camada que executa SQL puro.
async function findById(id) {
  const database = await getDatabase();

  return database.get(
    `
      SELECT ${itemSolicitacaoFields}
      FROM solicitacao_compra_itens si
      INNER JOIN ITENS_COMPRA i ON i.id = si.item_id
      WHERE si.id = ?
    `,
    id
  );
}

async function create({ solicitacao_id, item_id, descricao_necessidade, quantidade, unidade_snapshot, observacoes = null }) {
  const database = await getDatabase();
  const result = await database.run(
    `INSERT INTO solicitacao_compra_itens (
       solicitacao_id,
       item_id,
       descricao_necessidade,
       quantidade,
       unidade_snapshot,
       observacoes,
       created_at
     )
     VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
    [solicitacao_id, item_id, descricao_necessidade, quantidade, unidade_snapshot, observacoes]
  );

  return findById(result.lastID);
}

async function remove(id) {
  const database = await getDatabase();

  await database.run('DELETE FROM solicitacao_compra_itens WHERE id = ?', id);
}

export default {
  findById,
  create,
  remove
};
