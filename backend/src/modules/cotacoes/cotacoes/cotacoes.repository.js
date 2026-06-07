import { getDatabase } from '../../../db/connection.js';

const cotacaoFields = `
  c.id,
  c.solicitacao_id,
  c.numero_rodada,
  c.status,
  c.criado_por,
  u.nome AS criado_por_nome,
  c.data_abertura,
  c.data_encerramento,
  c.observacoes
`;

async function findById(id) {
  const database = await getDatabase();

  return database.get(
    `
      SELECT ${cotacaoFields}
      FROM cotacoes c
      LEFT JOIN USUARIOS u ON u.id = c.criado_por
      WHERE c.id = ?
    `,
    id
  );
}

async function findAll(filters = {}) {
  const database = await getDatabase();
  const conditions = [];
  const params = [];

  if (filters.status) {
    conditions.push('c.status = ?');
    params.push(filters.status);
  }

  if (filters.solicitacao_id) {
    conditions.push('c.solicitacao_id = ?');
    params.push(filters.solicitacao_id);
  }

  if (filters.criado_por) {
    conditions.push('c.criado_por = ?');
    params.push(filters.criado_por);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  return database.all(
    `
      SELECT ${cotacaoFields}
      FROM cotacoes c
      LEFT JOIN USUARIOS u ON u.id = c.criado_por
      ${where}
      ORDER BY c.id DESC
    `,
    params
  );
}

async function findOpenBySolicitacaoId(solicitacaoId) {
  const database = await getDatabase();

  return database.get(
    `
      SELECT ${cotacaoFields}
      FROM cotacoes c
      LEFT JOIN USUARIOS u ON u.id = c.criado_por
      WHERE c.solicitacao_id = ?
        AND c.status IN ('ABERTA', 'EM_ANDAMENTO', 'EM_ANALISE')
      ORDER BY c.numero_rodada DESC
      LIMIT 1
    `,
    solicitacaoId
  );
}

async function findNextRodadaBySolicitacaoId(solicitacaoId) {
  const database = await getDatabase();
  const result = await database.get(
    `
      SELECT COALESCE(MAX(numero_rodada), 0) + 1 AS numero_rodada
      FROM cotacoes
      WHERE solicitacao_id = ?
    `,
    solicitacaoId
  );

  return result.numero_rodada;
}

async function create({ solicitacao_id, numero_rodada, criado_por = null, observacoes = null, status_anterior }) {
  const database = await getDatabase();

  await database.exec('BEGIN');

  try {
    const result = await database.run(
      `
        INSERT INTO cotacoes (solicitacao_id, numero_rodada, status, criado_por, observacoes)
        VALUES (?, ?, 'ABERTA', ?, ?)
      `,
      [solicitacao_id, numero_rodada, criado_por, observacoes]
    );

    await database.run(
      `
        UPDATE solicitacoes_compra
        SET status = 'EM_COTACAO',
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
      solicitacao_id
    );

    await insertHistorico(database, {
      solicitacao_id,
      usuario_id: criado_por,
      etapa: 'COTACAO',
      acao: 'CRIACAO_COTACAO',
      status_anterior,
      status_novo: 'EM_COTACAO',
      observacao: `Cotacao rodada ${numero_rodada} criada.`
    });

    await database.exec('COMMIT');

    return findById(result.lastID);
  } catch (error) {
    await database.exec('ROLLBACK');
    throw error;
  }
}

async function updateStatus(id, { status, usuario_id = null, observacao = null, acao = 'ALTERACAO_STATUS' }) {
  const database = await getDatabase();
  const cotacao = await findById(id);

  await database.exec('BEGIN');

  try {
    await database.run(
      `
        UPDATE cotacoes
        SET status = ?,
            data_encerramento = CASE
              WHEN ? IN ('APROVADA', 'REPROVADA', 'CANCELADA', 'ENCERRADA') THEN CURRENT_TIMESTAMP
              ELSE data_encerramento
            END
        WHERE id = ?
      `,
      [status, status, id]
    );

    if (status === 'REPROVADA') {
      await database.run(
        `
          UPDATE solicitacoes_compra
          SET status = 'COTACAO_REPROVADA',
              updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `,
        cotacao.solicitacao_id
      );
    }

    await insertHistorico(database, {
      solicitacao_id: cotacao.solicitacao_id,
      usuario_id,
      etapa: 'COTACAO',
      acao,
      status_anterior: cotacao.status,
      status_novo: status,
      observacao
    });

    await database.exec('COMMIT');

    return findById(id);
  } catch (error) {
    await database.exec('ROLLBACK');
    throw error;
  }
}

async function findFornecedoresByCotacaoId(cotacaoId) {
  const database = await getDatabase();

  return database.all(
    `
      SELECT
        cf.id,
        cf.cotacao_id,
        cf.fornecedor_id,
        f.razao_social AS fornecedor_razao_social,
        f.nome_fantasia AS fornecedor_nome_fantasia,
        f.cnpj AS fornecedor_cnpj,
        cf.status,
        cf.data_envio,
        cf.data_resposta,
        cf.prazo_entrega,
        cf.forma_pagamento,
        cf.observacoes
      FROM cotacao_fornecedores cf
      INNER JOIN FORNECEDORES f ON f.id = cf.fornecedor_id
      WHERE cf.cotacao_id = ?
      ORDER BY cf.id ASC
    `,
    cotacaoId
  );
}

async function findFornecedorById(id) {
  const database = await getDatabase();

  return database.get(
    `
      SELECT
        cf.id,
        cf.cotacao_id,
        cf.fornecedor_id,
        f.razao_social AS fornecedor_razao_social,
        f.nome_fantasia AS fornecedor_nome_fantasia,
        f.cnpj AS fornecedor_cnpj,
        f.email AS fornecedor_email,
        cf.status,
        cf.data_envio,
        cf.data_resposta,
        cf.prazo_entrega,
        cf.forma_pagamento,
        cf.observacoes
      FROM cotacao_fornecedores cf
      INNER JOIN FORNECEDORES f ON f.id = cf.fornecedor_id
      WHERE cf.id = ?
    `,
    id
  );
}

async function findFornecedorByCotacaoAndFornecedor(cotacaoId, fornecedorId) {
  const database = await getDatabase();

  return database.get(
    `
      SELECT id
      FROM cotacao_fornecedores
      WHERE cotacao_id = ?
        AND fornecedor_id = ?
    `,
    [cotacaoId, fornecedorId]
  );
}

async function addFornecedor({ cotacao_id, fornecedor_id, usuario_id = null }) {
  const database = await getDatabase();
  const cotacao = await findById(cotacao_id);

  await database.exec('BEGIN');

  try {
    const result = await database.run(
      `
        INSERT INTO cotacao_fornecedores (cotacao_id, fornecedor_id, status)
        VALUES (?, ?, 'PENDENTE')
      `,
      [cotacao_id, fornecedor_id]
    );

    await insertHistorico(database, {
      solicitacao_id: cotacao.solicitacao_id,
      usuario_id,
      etapa: 'COTACAO',
      acao: 'FORNECEDOR_ADICIONADO',
      status_anterior: cotacao.status,
      status_novo: cotacao.status,
      observacao: `Fornecedor ${fornecedor_id} adicionado a cotacao ${cotacao_id}.`
    });

    await database.exec('COMMIT');

    return findFornecedorById(result.lastID);
  } catch (error) {
    await database.exec('ROLLBACK');
    throw error;
  }
}

async function marcarEnvio({ cotacao_id, cotacao_fornecedor_id, usuario_id = null }) {
  const database = await getDatabase();
  const cotacao = await findById(cotacao_id);

  await database.exec('BEGIN');

  try {
    await database.run(
      `
        UPDATE cotacao_fornecedores
        SET status = 'ENVIADO',
            data_envio = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
      cotacao_fornecedor_id
    );

    if (cotacao.status === 'ABERTA') {
      await database.run(
        `
          UPDATE cotacoes
          SET status = 'EM_ANDAMENTO'
          WHERE id = ?
        `,
        cotacao_id
      );
    }

    await insertHistorico(database, {
      solicitacao_id: cotacao.solicitacao_id,
      usuario_id,
      etapa: 'COTACAO',
      acao: 'ENVIO_FORNECEDOR',
      status_anterior: cotacao.status,
      status_novo: cotacao.status === 'ABERTA' ? 'EM_ANDAMENTO' : cotacao.status,
      observacao: `Cotacao enviada ao fornecedor da cotacao ${cotacao_fornecedor_id}.`
    });

    await database.exec('COMMIT');

    return findFornecedorById(cotacao_fornecedor_id);
  } catch (error) {
    await database.exec('ROLLBACK');
    throw error;
  }
}

async function registrarResposta({
  cotacao_id,
  cotacao_fornecedor_id,
  prazo_entrega = null,
  forma_pagamento = null,
  observacoes = null,
  itens,
  usuario_id = null
}) {
  const database = await getDatabase();
  const cotacao = await findById(cotacao_id);

  await database.exec('BEGIN');

  try {
    await database.run(
      `
        UPDATE cotacao_fornecedores
        SET status = 'RESPONDIDO',
            data_resposta = CURRENT_TIMESTAMP,
            prazo_entrega = ?,
            forma_pagamento = ?,
            observacoes = ?
        WHERE id = ?
      `,
      [prazo_entrega, forma_pagamento, observacoes, cotacao_fornecedor_id]
    );

    for (const item of itens) {
      await database.run(
        `
          INSERT INTO cotacao_fornecedor_itens (
            cotacao_fornecedor_id,
            solicitacao_item_id,
            status_item,
            quantidade,
            valor_unitario,
            observacoes
          )
          VALUES (?, ?, ?, ?, ?, ?)
          ON CONFLICT(cotacao_fornecedor_id, solicitacao_item_id)
          DO UPDATE SET
            status_item = excluded.status_item,
            quantidade = excluded.quantidade,
            valor_unitario = excluded.valor_unitario,
            observacoes = excluded.observacoes
        `,
        [
          cotacao_fornecedor_id,
          item.solicitacao_item_id,
          item.status_item,
          item.quantidade,
          item.valor_unitario,
          item.observacoes ?? null
        ]
      );
    }

    await insertHistorico(database, {
      solicitacao_id: cotacao.solicitacao_id,
      usuario_id,
      etapa: 'COTACAO',
      acao: 'RESPOSTA_FORNECEDOR',
      status_anterior: cotacao.status,
      status_novo: cotacao.status,
      observacao: `Fornecedor da cotacao ${cotacao_fornecedor_id} respondeu ${itens.length} item(ns).`
    });

    await database.exec('COMMIT');

    return findFornecedorById(cotacao_fornecedor_id);
  } catch (error) {
    await database.exec('ROLLBACK');
    throw error;
  }
}

async function updateFornecedorStatus({
  cotacao_id,
  cotacao_fornecedor_id,
  status,
  observacoes = null,
  usuario_id = null
}) {
  const database = await getDatabase();
  const cotacao = await findById(cotacao_id);

  await database.exec('BEGIN');

  try {
    await database.run(
      `
        UPDATE cotacao_fornecedores
        SET status = ?,
            observacoes = COALESCE(?, observacoes)
        WHERE id = ?
      `,
      [status, observacoes, cotacao_fornecedor_id]
    );

    await insertHistorico(database, {
      solicitacao_id: cotacao.solicitacao_id,
      usuario_id,
      etapa: 'COTACAO',
      acao: `FORNECEDOR_${status}`,
      status_anterior: cotacao.status,
      status_novo: cotacao.status,
      observacao: observacoes
    });

    await database.exec('COMMIT');

    return findFornecedorById(cotacao_fornecedor_id);
  } catch (error) {
    await database.exec('ROLLBACK');
    throw error;
  }
}

async function findItensByCotacaoFornecedorId(cotacaoFornecedorId) {
  const database = await getDatabase();

  return database.all(
    `
      SELECT
        cfi.id,
        cfi.cotacao_fornecedor_id,
        cfi.solicitacao_item_id,
        si.descricao_necessidade,
        i.codigo AS item_codigo,
        i.descricao AS item_descricao,
        si.quantidade AS quantidade_solicitada,
        cfi.status_item,
        cfi.quantidade,
        cfi.valor_unitario,
        cfi.valor_total,
        cfi.observacoes
      FROM cotacao_fornecedor_itens cfi
      INNER JOIN solicitacao_compra_itens si ON si.id = cfi.solicitacao_item_id
      INNER JOIN ITENS_COMPRA i ON i.id = si.item_id
      WHERE cfi.cotacao_fornecedor_id = ?
      ORDER BY cfi.id ASC
    `,
    cotacaoFornecedorId
  );
}

async function findSolicitacaoItensByCotacaoId(cotacaoId) {
  const database = await getDatabase();

  return database.all(
    `
      SELECT
        si.id AS solicitacao_item_id,
        si.descricao_necessidade,
        si.quantidade,
        si.unidade_snapshot,
        si.observacoes,
        i.codigo AS item_codigo,
        i.descricao AS item_descricao
      FROM cotacoes c
      INNER JOIN solicitacao_compra_itens si ON si.solicitacao_id = c.solicitacao_id
      LEFT JOIN ITENS_COMPRA i ON i.id = si.item_id
      WHERE c.id = ?
      ORDER BY si.id ASC
    `,
    cotacaoId
  );
}

async function addFornecedorAnexo({
  cotacao_fornecedor_id,
  nome_arquivo,
  caminho_arquivo,
  tipo_arquivo = null
}) {
  const database = await getDatabase();
  const result = await database.run(
    `
      INSERT INTO cotacao_fornecedor_anexos (
        cotacao_fornecedor_id,
        nome_arquivo,
        caminho_arquivo,
        tipo_arquivo
      )
      VALUES (?, ?, ?, ?)
    `,
    [cotacao_fornecedor_id, nome_arquivo, caminho_arquivo, tipo_arquivo]
  );

  return findFornecedorAnexoById(result.lastID);
}

async function findFornecedorAnexoById(id) {
  const database = await getDatabase();

  return database.get(
    `
      SELECT
        id,
        cotacao_fornecedor_id,
        nome_arquivo,
        caminho_arquivo,
        tipo_arquivo,
        created_at
      FROM cotacao_fornecedor_anexos
      WHERE id = ?
    `,
    id
  );
}

async function findAnexosByCotacaoFornecedorId(cotacaoFornecedorId) {
  const database = await getDatabase();

  return database.all(
    `
      SELECT
        id,
        cotacao_fornecedor_id,
        nome_arquivo,
        caminho_arquivo,
        tipo_arquivo,
        created_at
      FROM cotacao_fornecedor_anexos
      WHERE cotacao_fornecedor_id = ?
      ORDER BY id ASC
    `,
    cotacaoFornecedorId
  );
}

async function findSolicitacaoItemForCotacao(cotacaoId, solicitacaoItemId) {
  const database = await getDatabase();

  return database.get(
    `
      SELECT
        si.id,
        si.solicitacao_id,
        si.item_id,
        si.descricao_necessidade,
        si.quantidade,
        si.unidade_snapshot
      FROM solicitacao_compra_itens si
      INNER JOIN cotacoes c ON c.solicitacao_id = si.solicitacao_id
      WHERE c.id = ?
        AND si.id = ?
    `,
    [cotacaoId, solicitacaoItemId]
  );
}

async function getResumoRespostas(cotacaoId) {
  const database = await getDatabase();
  const result = await database.get(
    `
      SELECT
        COUNT(*) AS fornecedores_convidados,
        SUM(CASE WHEN status = 'RESPONDIDO' THEN 1 ELSE 0 END) AS respostas_recebidas,
        SUM(CASE WHEN status IN ('PENDENTE', 'ENVIADO') THEN 1 ELSE 0 END) AS pendentes,
        SUM(CASE WHEN status = 'RECUSADO' THEN 1 ELSE 0 END) AS recusados,
        SUM(CASE WHEN status = 'SEM_RESPOSTA' THEN 1 ELSE 0 END) AS sem_resposta
      FROM cotacao_fornecedores
      WHERE cotacao_id = ?
    `,
    cotacaoId
  );

  return {
    fornecedores_convidados: result?.fornecedores_convidados ?? 0,
    respostas_recebidas: result?.respostas_recebidas ?? 0,
    pendentes: result?.pendentes ?? 0,
    recusados: result?.recusados ?? 0,
    sem_resposta: result?.sem_resposta ?? 0
  };
}

async function getComparativo(cotacaoId) {
  const database = await getDatabase();

  const itens = await database.all(
    `
      SELECT
        si.id AS solicitacao_item_id,
        si.descricao_necessidade,
        si.quantidade AS quantidade_solicitada,
        si.unidade_snapshot,
        i.codigo AS item_codigo,
        i.descricao AS item_descricao
      FROM cotacoes c
      INNER JOIN solicitacao_compra_itens si ON si.solicitacao_id = c.solicitacao_id
      INNER JOIN ITENS_COMPRA i ON i.id = si.item_id
      WHERE c.id = ?
      ORDER BY si.id ASC
    `,
    cotacaoId
  );

  const respostas = await database.all(
    `
      SELECT
        cf.id AS cotacao_fornecedor_id,
        cf.fornecedor_id,
        f.razao_social AS fornecedor_razao_social,
        cf.status AS fornecedor_status,
        cf.prazo_entrega,
        cf.forma_pagamento,
        cfi.solicitacao_item_id,
        cfi.status_item,
        cfi.quantidade,
        cfi.valor_unitario,
        cfi.valor_total,
        cfi.observacoes
      FROM cotacao_fornecedores cf
      INNER JOIN FORNECEDORES f ON f.id = cf.fornecedor_id
      LEFT JOIN cotacao_fornecedor_itens cfi ON cfi.cotacao_fornecedor_id = cf.id
      WHERE cf.cotacao_id = ?
      ORDER BY cf.id ASC, cfi.solicitacao_item_id ASC
    `,
    cotacaoId
  );

  return { itens, respostas };
}

async function insertHistorico(database, data) {
  await database.run(
    `
      INSERT INTO solicitacao_compra_historico (
        solicitacao_id,
        usuario_id,
        etapa,
        acao,
        status_anterior,
        status_novo,
        observacao
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    [
      data.solicitacao_id,
      data.usuario_id ?? null,
      data.etapa,
      data.acao,
      data.status_anterior ?? null,
      data.status_novo ?? null,
      data.observacao ?? null
    ]
  );
}

export default {
  findById,
  findAll,
  findOpenBySolicitacaoId,
  findNextRodadaBySolicitacaoId,
  create,
  updateStatus,
  findFornecedoresByCotacaoId,
  findFornecedorById,
  findFornecedorByCotacaoAndFornecedor,
  addFornecedor,
  marcarEnvio,
  registrarResposta,
  updateFornecedorStatus,
  findItensByCotacaoFornecedorId,
  findSolicitacaoItensByCotacaoId,
  findSolicitacaoItemForCotacao,
  addFornecedorAnexo,
  findFornecedorAnexoById,
  findAnexosByCotacaoFornecedorId,
  getResumoRespostas,
  getComparativo
};
