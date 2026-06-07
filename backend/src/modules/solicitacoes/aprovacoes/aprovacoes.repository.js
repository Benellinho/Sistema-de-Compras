import { getDatabase } from '../../../db/connection.js';
import solicitacoesRepository from '../solicitacoes/solicitacoes.repository.js';

async function findBySolicitacaoId(id) {
  const database = await getDatabase();

  return database.get(
    `
      SELECT
        a.id,
        a.solicitacao_id,
        a.aprovador_id,
        u.nome AS aprovador_nome,
        u.email AS aprovador_email,
        a.decisao,
        a.observacao,
        a.created_at
      FROM solicitacao_compra_aprovacoes a
      INNER JOIN USUARIOS u ON u.id = a.aprovador_id
      WHERE a.solicitacao_id = ?
    `,
    id
  );
}

async function applyDecisao({
  solicitacao_id,
  aprovador_id,
  decisao,
  observacao = null,
  status_novo,
  etapa,
  acao,
  status_anterior
}) {
  const database = await getDatabase();
  let aprovacaoId;
  let historicoId;

  await database.exec('BEGIN');

  try {
    const aprovacaoResult = await database.run(
      `INSERT INTO solicitacao_compra_aprovacoes (
         solicitacao_id,
         aprovador_id,
         decisao,
         observacao,
         created_at
       )
       VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [solicitacao_id, aprovador_id, decisao, observacao]
    );
    aprovacaoId = aprovacaoResult.lastID;

    await database.run(
      `UPDATE solicitacoes_compra
       SET status = ?,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [status_novo, solicitacao_id]
    );

    const historicoResult = await database.run(
      `INSERT INTO solicitacao_compra_historico (
         solicitacao_id,
         usuario_id,
         etapa,
         acao,
         status_anterior,
         status_novo,
         observacao,
         created_at
       )
       VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [solicitacao_id, aprovador_id, etapa, acao, status_anterior, status_novo, observacao]
    );
    historicoId = historicoResult.lastID;

    await database.exec('COMMIT');
  } catch (error) {
    await database.exec('ROLLBACK');
    throw error;
  }

  const solicitacao = await solicitacoesRepository.findById(solicitacao_id);
  const aprovacao = await database.get(
    `
      SELECT
        id,
        solicitacao_id,
        aprovador_id,
        decisao,
        observacao,
        created_at
      FROM solicitacao_compra_aprovacoes
      WHERE id = ?
    `,
    aprovacaoId
  );
  const historico = await database.get(
    `
      SELECT
        id,
        solicitacao_id,
        usuario_id,
        etapa,
        acao,
        status_anterior,
        status_novo,
        observacao,
        created_at
      FROM solicitacao_compra_historico
      WHERE id = ?
    `,
    historicoId
  );

  return {
    solicitacao,
    aprovacao,
    historico
  };
}

export default {
  findBySolicitacaoId,
  applyDecisao
};
