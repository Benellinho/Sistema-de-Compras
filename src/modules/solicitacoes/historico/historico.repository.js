import { getDatabase } from '../../../db/connection.js';

async function findBySolicitacaoId(id) {
  const database = await getDatabase();

  return database.all(
    `
      SELECT
        h.id,
        h.solicitacao_id,
        h.usuario_id,
        u.nome AS usuario_nome,
        u.email AS usuario_email,
        h.etapa,
        h.acao,
        h.status_anterior,
        h.status_novo,
        h.observacao,
        h.created_at
      FROM solicitacao_compra_historico h
      LEFT JOIN USUARIOS u ON u.id = h.usuario_id
      WHERE h.solicitacao_id = ?
      ORDER BY h.id ASC
    `,
    id
  );
}

export default {
  findBySolicitacaoId
};
