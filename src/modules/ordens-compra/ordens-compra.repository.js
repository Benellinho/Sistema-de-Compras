import { getDatabase } from '../../db/connection.js';

const ordemFields = `
  oc.id,
  oc.numero_oc,
  oc.compra_fornecedor_id,
  oc.ordem_substituida_id,
  substituida.numero_oc AS ordem_substituida_numero,
  cf.compra_id,
  c.solicitacao_id,
  cf.fornecedor_id,
  f.razao_social AS fornecedor_razao_social,
  f.nome_fantasia AS fornecedor_nome_fantasia,
  f.cnpj AS fornecedor_cnpj,
  oc.data_emissao,
  oc.status,
  oc.cancelada_em,
  oc.cancelada_por,
  u_cancelamento.nome AS cancelada_por_nome,
  oc.motivo_cancelamento,
  oc.observacoes,
  oc.created_at,
  oc.updated_at
`;

async function findById(id) {
  const database = await getDatabase();
  const ordem = await findByIdSemHydrate(database, id);

  if (!ordem) {
    return null;
  }

  return hydrateOrdem(database, ordem);
}

async function findAll(filters = {}) {
  const database = await getDatabase();
  const conditions = [];
  const params = [];

  if (filters.status) {
    conditions.push('oc.status = ?');
    params.push(filters.status);
  }

  if (filters.compra_fornecedor_id) {
    conditions.push('oc.compra_fornecedor_id = ?');
    params.push(filters.compra_fornecedor_id);
  }

  if (filters.compra_id) {
    conditions.push('cf.compra_id = ?');
    params.push(filters.compra_id);
  }

  if (filters.solicitacao_id) {
    conditions.push('c.solicitacao_id = ?');
    params.push(filters.solicitacao_id);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const ordens = await database.all(
    `
      SELECT ${ordemFields}
      FROM ordens_compra oc
      INNER JOIN compra_fornecedores cf ON cf.id = oc.compra_fornecedor_id
      INNER JOIN compras c ON c.id = cf.compra_id
      INNER JOIN FORNECEDORES f ON f.id = cf.fornecedor_id
      LEFT JOIN ordens_compra substituida ON substituida.id = oc.ordem_substituida_id
      LEFT JOIN USUARIOS u_cancelamento ON u_cancelamento.id = oc.cancelada_por
      ${where}
      ORDER BY oc.id DESC
    `,
    params
  );

  return Promise.all(ordens.map((ordem) => hydrateOrdem(database, ordem)));
}

async function create({
  numero_oc,
  compra_fornecedor_id,
  ordem_substituida_id = null,
  usuario_id,
  observacoes = null
}) {
  const database = await getDatabase();
  const context = await findCompraFornecedorContext(database, compra_fornecedor_id);

  await database.exec('BEGIN');

  try {
    const result = await database.run(
      `
        INSERT INTO ordens_compra (
          numero_oc,
          compra_fornecedor_id,
          ordem_substituida_id,
          status,
          observacoes
        )
        VALUES (?, ?, ?, 'GERADA', ?)
      `,
      [numero_oc, compra_fornecedor_id, ordem_substituida_id, observacoes]
    );

    if (ordem_substituida_id) {
      await database.run(
        `
          UPDATE ordens_compra
          SET status = 'SUBSTITUIDA',
              updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `,
        ordem_substituida_id
      );
    }

    const statusSolicitacao = await updateSolicitacaoStatusOrdemCompra(database, context.compra_id);

    await insertHistorico(database, {
      solicitacao_id: context.solicitacao_id,
      usuario_id,
      etapa: 'ORDEM_COMPRA',
      acao: ordem_substituida_id ? 'SUBSTITUICAO_ORDEM_COMPRA' : 'CRIACAO_ORDEM_COMPRA',
      status_anterior: statusSolicitacao.status_anterior,
      status_novo: statusSolicitacao.status_novo,
      observacao: ordem_substituida_id
        ? `Ordem de compra ${numero_oc} criada como substituta da OC ${ordem_substituida_id}.`
        : `Ordem de compra ${numero_oc} criada para o fornecedor da compra ${compra_fornecedor_id}.`
    });

    await database.exec('COMMIT');

    return findById(result.lastID);
  } catch (error) {
    await database.exec('ROLLBACK');
    throw error;
  }
}

async function cancelar(id, { usuario_id, observacao }) {
  const database = await getDatabase();
  const ordem = await findByIdSemHydrate(database, id);

  await database.exec('BEGIN');

  try {
    await database.run(
      `
        UPDATE ordens_compra
        SET status = 'CANCELADA',
            cancelada_em = CURRENT_TIMESTAMP,
            cancelada_por = ?,
            motivo_cancelamento = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
      [usuario_id, observacao, id]
    );

    const statusSolicitacao = await updateSolicitacaoStatusOrdemCompra(database, ordem.compra_id);

    await insertHistorico(database, {
      solicitacao_id: ordem.solicitacao_id,
      usuario_id,
      etapa: 'ORDEM_COMPRA',
      acao: 'CANCELAMENTO_ORDEM_COMPRA',
      status_anterior: statusSolicitacao.status_anterior,
      status_novo: statusSolicitacao.status_novo,
      observacao
    });

    await database.exec('COMMIT');

    return findById(id);
  } catch (error) {
    await database.exec('ROLLBACK');
    throw error;
  }
}

async function findCompraFornecedor(compraFornecedorId) {
  const database = await getDatabase();
  return findCompraFornecedorContext(database, compraFornecedorId);
}

async function findContatoFornecedor(fornecedorId, contatoId) {
  const database = await getDatabase();

  return database.get(
    `
      SELECT
        id,
        fornecedor_id,
        nome,
        cargo,
        telefone,
        email
      FROM FORNECEDOR_CONTATOS
      WHERE id = ?
        AND fornecedor_id = ?
    `,
    [contatoId, fornecedorId]
  );
}

async function findCompraById(compraId) {
  const database = await getDatabase();

  return database.get(
    `
      SELECT
        c.id,
        c.solicitacao_id,
        c.cotacao_id,
        c.status,
        sc.status AS solicitacao_status
      FROM compras c
      INNER JOIN solicitacoes_compra sc ON sc.id = c.solicitacao_id
      WHERE c.id = ?
    `,
    compraId
  );
}

async function countItensByCompraFornecedorId(compraFornecedorId) {
  const database = await getDatabase();
  const result = await database.get(
    `
      SELECT COUNT(*) AS total
      FROM compra_fornecedor_itens
      WHERE compra_fornecedor_id = ?
    `,
    compraFornecedorId
  );

  return result?.total ?? 0;
}

async function findActiveByCompraFornecedorId(compraFornecedorId) {
  const database = await getDatabase();

  return database.get(
    `
      SELECT id, numero_oc, status
      FROM ordens_compra
      WHERE compra_fornecedor_id = ?
        AND status = 'GERADA'
      LIMIT 1
    `,
    compraFornecedorId
  );
}

async function numeroOcExists(numeroOc) {
  const database = await getDatabase();
  const result = await database.get(
    `
      SELECT id
      FROM ordens_compra
      WHERE numero_oc = ?
      LIMIT 1
    `,
    numeroOc
  );

  return Boolean(result);
}

async function findNextNumeroOcSequence() {
  const database = await getDatabase();
  const result = await database.get(`
    SELECT COALESCE(MAX(id), 0) + 1 AS next_id
    FROM ordens_compra
  `);

  return result?.next_id ?? 1;
}

async function createEnvio({ ordem_compra_id, usuario_id, email_destino, observacao = null }) {
  const database = await getDatabase();
  const result = await database.run(
    `
      INSERT INTO ordem_compra_envios (
        ordem_compra_id,
        usuario_id,
        email_destino,
        status,
        observacao
      )
      VALUES (?, ?, ?, 'PENDENTE', ?)
    `,
    [ordem_compra_id, usuario_id, email_destino, observacao]
  );

  return findEnvioById(result.lastID);
}

async function marcarEnvioSucesso(envioId, { ordem, usuario_id, observacao = null }) {
  const database = await getDatabase();

  await database.exec('BEGIN');

  try {
    await database.run(
      `
        UPDATE ordem_compra_envios
        SET status = 'ENVIADO',
            enviado_em = CURRENT_TIMESTAMP,
            observacao = COALESCE(?, observacao)
        WHERE id = ?
      `,
      [observacao, envioId]
    );

    const envio = await findEnvioByIdInDatabase(database, envioId);
    const statusSolicitacao = await updateSolicitacaoStatusEnvio(database, ordem.compra_id);

    await insertHistorico(database, {
      solicitacao_id: ordem.solicitacao_id,
      usuario_id,
      etapa: 'ORDEM_COMPRA',
      acao: 'ENVIO_ORDEM_COMPRA',
      status_anterior: statusSolicitacao.status_anterior,
      status_novo: statusSolicitacao.status_novo,
      observacao: `Ordem de compra ${ordem.numero_oc} enviada para ${envio.email_destino}.`
    });

    await database.exec('COMMIT');

    return findEnvioById(envioId);
  } catch (error) {
    await database.exec('ROLLBACK');
    throw error;
  }
}

async function marcarEnvioFalha(envioId, { ordem, usuario_id, observacao }) {
  const database = await getDatabase();

  await database.exec('BEGIN');

  try {
    await database.run(
      `
        UPDATE ordem_compra_envios
        SET status = 'FALHA',
            observacao = ?
        WHERE id = ?
      `,
      [observacao, envioId]
    );

    const solicitacaoStatus = await findSolicitacaoStatusByCompraId(database, ordem.compra_id);

    await insertHistorico(database, {
      solicitacao_id: ordem.solicitacao_id,
      usuario_id,
      etapa: 'ORDEM_COMPRA',
      acao: 'FALHA_ENVIO_ORDEM_COMPRA',
      status_anterior: solicitacaoStatus?.status ?? null,
      status_novo: solicitacaoStatus?.status ?? null,
      observacao: `Falha ao enviar ordem de compra ${ordem.numero_oc}: ${observacao}`
    });

    await database.exec('COMMIT');

    return findEnvioById(envioId);
  } catch (error) {
    await database.exec('ROLLBACK');
    throw error;
  }
}

async function findEnvioById(id) {
  const database = await getDatabase();
  return findEnvioByIdInDatabase(database, id);
}

async function getResumoByCompraId(compraId) {
  const database = await getDatabase();
  return getResumoByCompraIdInDatabase(database, compraId);
}

async function findByIdSemHydrate(database, id) {
  return database.get(
    `
      SELECT ${ordemFields}
      FROM ordens_compra oc
      INNER JOIN compra_fornecedores cf ON cf.id = oc.compra_fornecedor_id
      INNER JOIN compras c ON c.id = cf.compra_id
      INNER JOIN FORNECEDORES f ON f.id = cf.fornecedor_id
      LEFT JOIN ordens_compra substituida ON substituida.id = oc.ordem_substituida_id
      LEFT JOIN USUARIOS u_cancelamento ON u_cancelamento.id = oc.cancelada_por
      WHERE oc.id = ?
    `,
    id
  );
}

async function hydrateOrdem(database, ordem) {
  const itens = await database.all(
    `
      SELECT
        cfi.id,
        cfi.solicitacao_item_id,
        si.descricao_necessidade,
        si.unidade_snapshot,
        i.codigo AS item_codigo,
        i.descricao AS item_descricao,
        cfi.quantidade_pedida,
        cfi.valor_unitario,
        cfi.valor_total
      FROM compra_fornecedor_itens cfi
      INNER JOIN solicitacao_compra_itens si ON si.id = cfi.solicitacao_item_id
      INNER JOIN ITENS_COMPRA i ON i.id = si.item_id
      WHERE cfi.compra_fornecedor_id = ?
      ORDER BY cfi.id ASC
    `,
    ordem.compra_fornecedor_id
  );

  const envios = await database.all(
    `
      SELECT
        oce.id,
        oce.ordem_compra_id,
        oce.usuario_id,
        u.nome AS usuario_nome,
        oce.email_destino,
        oce.enviado_em,
        oce.status,
        oce.observacao,
        oce.created_at
      FROM ordem_compra_envios oce
      LEFT JOIN USUARIOS u ON u.id = oce.usuario_id
      WHERE oce.ordem_compra_id = ?
      ORDER BY oce.id ASC
    `,
    ordem.id
  );

  return {
    ...ordem,
    itens,
    envios
  };
}

async function findCompraFornecedorContext(database, compraFornecedorId) {
  return database.get(
    `
      SELECT
        cf.id,
        cf.compra_id,
        cf.fornecedor_id,
        c.solicitacao_id,
        c.status AS compra_status,
        sc.status AS solicitacao_status,
        f.razao_social AS fornecedor_razao_social,
        f.nome_fantasia AS fornecedor_nome_fantasia,
        f.cnpj AS fornecedor_cnpj
      FROM compra_fornecedores cf
      INNER JOIN compras c ON c.id = cf.compra_id
      INNER JOIN solicitacoes_compra sc ON sc.id = c.solicitacao_id
      INNER JOIN FORNECEDORES f ON f.id = cf.fornecedor_id
      WHERE cf.id = ?
    `,
    compraFornecedorId
  );
}

async function updateSolicitacaoStatusOrdemCompra(database, compraId) {
  const compra = await database.get(
    `
      SELECT
        c.solicitacao_id,
        sc.status AS solicitacao_status
      FROM compras c
      INNER JOIN solicitacoes_compra sc ON sc.id = c.solicitacao_id
      WHERE c.id = ?
    `,
    compraId
  );
  const resumo = await getResumoByCompraIdInDatabase(database, compraId);
  const statusNovo = resumo.total_fornecedores_compra > 0 &&
    resumo.ocs_geradas === resumo.total_fornecedores_compra
    ? 'OC_GERADA'
    : 'COMPRA_APROVADA';

  if (compra.solicitacao_status !== statusNovo) {
    await database.run(
      `
        UPDATE solicitacoes_compra
        SET status = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
      [statusNovo, compra.solicitacao_id]
    );
  }

  return {
    solicitacao_id: compra.solicitacao_id,
    status_anterior: compra.solicitacao_status,
    status_novo: statusNovo
  };
}

async function getResumoByCompraIdInDatabase(database, compraId) {
  const resumo = await database.get(
    `
      SELECT
        COUNT(DISTINCT cf.id) AS total_fornecedores_compra,
        COUNT(DISTINCT CASE WHEN oc.status = 'GERADA' THEN oc.id END) AS ocs_geradas,
        COUNT(DISTINCT CASE WHEN oc.status = 'CANCELADA' THEN oc.id END) AS ocs_canceladas,
        COUNT(DISTINCT CASE WHEN oc.status = 'SUBSTITUIDA' THEN oc.id END) AS ocs_substituidas,
        COUNT(DISTINCT CASE WHEN oc.status = 'GERADA' AND oce.status = 'ENVIADO' THEN oc.id END) AS ocs_enviadas,
        COUNT(DISTINCT CASE WHEN oc.status = 'GERADA' AND oce.status = 'FALHA' THEN oc.id END) AS ocs_com_falha_envio
      FROM compra_fornecedores cf
      LEFT JOIN ordens_compra oc ON oc.compra_fornecedor_id = cf.id
      LEFT JOIN ordem_compra_envios oce ON oce.ordem_compra_id = oc.id
      WHERE cf.compra_id = ?
    `,
    compraId
  );

  const fornecedores = await database.all(
    `
      SELECT
        cf.id AS compra_fornecedor_id,
        cf.fornecedor_id,
        f.razao_social AS fornecedor_razao_social,
        f.nome_fantasia AS fornecedor_nome_fantasia,
        ativa.id AS ordem_ativa_id,
        ativa.numero_oc AS ordem_ativa_numero,
        COALESCE(ativa.status, 'PENDENTE') AS status_oc
      FROM compra_fornecedores cf
      INNER JOIN FORNECEDORES f ON f.id = cf.fornecedor_id
      LEFT JOIN ordens_compra ativa
        ON ativa.compra_fornecedor_id = cf.id
       AND ativa.status = 'GERADA'
      WHERE cf.compra_id = ?
      ORDER BY cf.id ASC
    `,
    compraId
  );

  const totalFornecedores = resumo?.total_fornecedores_compra ?? 0;
  const ocsGeradas = resumo?.ocs_geradas ?? 0;

  return {
    compra_id: Number(compraId),
    total_fornecedores_compra: totalFornecedores,
    ocs_geradas: ocsGeradas,
    ocs_pendentes: Math.max(totalFornecedores - ocsGeradas, 0),
    ocs_canceladas: resumo?.ocs_canceladas ?? 0,
    ocs_substituidas: resumo?.ocs_substituidas ?? 0,
    ocs_enviadas: resumo?.ocs_enviadas ?? 0,
    ocs_com_falha_envio: resumo?.ocs_com_falha_envio ?? 0,
    fornecedores
  };
}

async function findEnvioByIdInDatabase(database, id) {
  return database.get(
    `
      SELECT
        oce.id,
        oce.ordem_compra_id,
        oce.usuario_id,
        u.nome AS usuario_nome,
        oce.email_destino,
        oce.enviado_em,
        oce.status,
        oce.observacao,
        oce.created_at
      FROM ordem_compra_envios oce
      LEFT JOIN USUARIOS u ON u.id = oce.usuario_id
      WHERE oce.id = ?
    `,
    id
  );
}

async function findSolicitacaoStatusByCompraId(database, compraId) {
  return database.get(
    `
      SELECT
        sc.id,
        sc.status
      FROM compras c
      INNER JOIN solicitacoes_compra sc ON sc.id = c.solicitacao_id
      WHERE c.id = ?
    `,
    compraId
  );
}

async function updateSolicitacaoStatusEnvio(database, compraId) {
  const compra = await database.get(
    `
      SELECT
        c.solicitacao_id,
        sc.status AS solicitacao_status
      FROM compras c
      INNER JOIN solicitacoes_compra sc ON sc.id = c.solicitacao_id
      WHERE c.id = ?
    `,
    compraId
  );
  const resumo = await database.get(
    `
      SELECT
        COUNT(DISTINCT cf.id) AS total_fornecedores_compra,
        COUNT(DISTINCT CASE WHEN oc.status = 'GERADA' THEN oc.id END) AS ocs_geradas,
        COUNT(DISTINCT CASE WHEN oc.status = 'GERADA' AND oce.status = 'ENVIADO' THEN oc.id END) AS ocs_enviadas
      FROM compra_fornecedores cf
      LEFT JOIN ordens_compra oc ON oc.compra_fornecedor_id = cf.id
      LEFT JOIN ordem_compra_envios oce ON oce.ordem_compra_id = oc.id
      WHERE cf.compra_id = ?
    `,
    compraId
  );
  const totalFornecedores = resumo?.total_fornecedores_compra ?? 0;
  const ocsGeradas = resumo?.ocs_geradas ?? 0;
  const ocsEnviadas = resumo?.ocs_enviadas ?? 0;
  const statusNovo = totalFornecedores > 0 &&
    ocsGeradas === totalFornecedores &&
    ocsEnviadas === ocsGeradas
    ? 'OC_ENVIADA'
    : compra.solicitacao_status;

  if (compra.solicitacao_status !== statusNovo) {
    await database.run(
      `
        UPDATE solicitacoes_compra
        SET status = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
      [statusNovo, compra.solicitacao_id]
    );
  }

  return {
    solicitacao_id: compra.solicitacao_id,
    status_anterior: compra.solicitacao_status,
    status_novo: statusNovo
  };
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
  create,
  cancelar,
  findCompraFornecedor,
  findContatoFornecedor,
  findCompraById,
  countItensByCompraFornecedorId,
  findActiveByCompraFornecedorId,
  numeroOcExists,
  findNextNumeroOcSequence,
  createEnvio,
  marcarEnvioSucesso,
  marcarEnvioFalha,
  findEnvioById,
  getResumoByCompraId
};
