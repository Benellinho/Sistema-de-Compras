import { getDatabase } from '../../../db/connection.js';

const compraFields = `
  c.id,
  c.solicitacao_id,
  c.cotacao_id,
  c.status,
  c.criado_por,
  u.nome AS criado_por_nome,
  c.data_compra,
  c.observacoes,
  c.created_at,
  c.updated_at
`;

async function findById(id) {
  const database = await getDatabase();

  const compra = await database.get(
    `
      SELECT ${compraFields}
      FROM compras c
      LEFT JOIN USUARIOS u ON u.id = c.criado_por
      WHERE c.id = ?
    `,
    id
  );

  if (!compra) {
    return null;
  }

  return hydrateCompra(database, compra);
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

  if (filters.cotacao_id) {
    conditions.push('c.cotacao_id = ?');
    params.push(filters.cotacao_id);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const compras = await database.all(
    `
      SELECT ${compraFields}
      FROM compras c
      LEFT JOIN USUARIOS u ON u.id = c.criado_por
      ${where}
      ORDER BY c.id DESC
    `,
    params
  );

  return Promise.all(compras.map((compra) => hydrateCompra(database, compra)));
}

async function findByCotacaoId(cotacaoId) {
  const database = await getDatabase();

  return database.get(
    `
      SELECT ${compraFields}
      FROM compras c
      LEFT JOIN USUARIOS u ON u.id = c.criado_por
      WHERE c.cotacao_id = ?
      LIMIT 1
    `,
    cotacaoId
  );
}

async function create({ solicitacao_id, cotacao_id, criado_por = null, observacoes = null, status_anterior }) {
  const database = await getDatabase();

  await database.exec('BEGIN');

  try {
    const result = await database.run(
      `
        INSERT INTO compras (solicitacao_id, cotacao_id, status, criado_por, observacoes)
        VALUES (?, ?, 'EM_MONTAGEM', ?, ?)
      `,
      [solicitacao_id, cotacao_id, criado_por, observacoes]
    );

    await database.run(
      `
        UPDATE solicitacoes_compra
        SET status = 'EM_ESCOLHA_FORNECEDOR',
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
      solicitacao_id
    );

    await insertHistorico(database, {
      solicitacao_id,
      usuario_id: criado_por,
      etapa: 'COMPRA',
      acao: 'CRIACAO_COMPRA',
      status_anterior,
      status_novo: 'EM_ESCOLHA_FORNECEDOR',
      observacao: `Compra criada a partir da cotacao ${cotacao_id}.`
    });

    await database.exec('COMMIT');

    return findById(result.lastID);
  } catch (error) {
    await database.exec('ROLLBACK');
    throw error;
  }
}

async function findCompraFornecedorById(id) {
  const database = await getDatabase();

  return database.get(
    `
      SELECT
        cf.id,
        cf.compra_id,
        cf.fornecedor_id,
        cf.prazo_entrega,
        cf.forma_pagamento,
        cf.justificativa_texto,
        cf.orcamento_anexo_id,
        f.razao_social AS fornecedor_razao_social,
        f.nome_fantasia AS fornecedor_nome_fantasia,
        f.cnpj AS fornecedor_cnpj
      FROM compra_fornecedores cf
      INNER JOIN FORNECEDORES f ON f.id = cf.fornecedor_id
      WHERE cf.id = ?
    `,
    id
  );
}

async function findCompraFornecedorByCompraAndFornecedor(compraId, fornecedorId) {
  const database = await getDatabase();

  return database.get(
    `
      SELECT id
      FROM compra_fornecedores
      WHERE compra_id = ?
        AND fornecedor_id = ?
    `,
    [compraId, fornecedorId]
  );
}

async function addFornecedor({
  compra_id,
  fornecedor_id,
  prazo_entrega = null,
  forma_pagamento = null,
  justificativa_texto = null,
  justificativas = [],
  usuario_id = null
}) {
  const database = await getDatabase();
  const compra = await findCompraSemHydrate(database, compra_id);

  await database.exec('BEGIN');

  try {
    const result = await database.run(
      `
        INSERT INTO compra_fornecedores (
          compra_id,
          fornecedor_id,
          prazo_entrega,
          forma_pagamento,
          justificativa_texto
        )
        VALUES (?, ?, ?, ?, ?)
      `,
      [compra_id, fornecedor_id, prazo_entrega, forma_pagamento, justificativa_texto]
    );

    for (const justificativa of justificativas) {
      await database.run(
        `
          INSERT INTO compra_fornecedor_justificativas (compra_fornecedor_id, justificativa)
          VALUES (?, ?)
        `,
        [result.lastID, justificativa]
      );
    }

    await insertHistorico(database, {
      solicitacao_id: compra.solicitacao_id,
      usuario_id,
      etapa: 'COMPRA',
      acao: 'FORNECEDOR_COMPRA_ADICIONADO',
      status_anterior: compra.status,
      status_novo: compra.status,
      observacao: `Fornecedor ${fornecedor_id} adicionado a compra ${compra_id}.`
    });

    await database.exec('COMMIT');

    return findCompraFornecedorById(result.lastID);
  } catch (error) {
    await database.exec('ROLLBACK');
    throw error;
  }
}

async function addItem({
  compra_id,
  compra_fornecedor_id,
  solicitacao_item_id,
  quantidade_pedida,
  valor_unitario,
  usuario_id = null
}) {
  const database = await getDatabase();
  const compra = await findCompraSemHydrate(database, compra_id);

  await database.exec('BEGIN');

  try {
    const result = await database.run(
      `
        INSERT INTO compra_fornecedor_itens (
          compra_fornecedor_id,
          solicitacao_item_id,
          quantidade_pedida,
          valor_unitario
        )
        VALUES (?, ?, ?, ?)
        ON CONFLICT(compra_fornecedor_id, solicitacao_item_id)
        DO UPDATE SET
          quantidade_pedida = excluded.quantidade_pedida,
          valor_unitario = excluded.valor_unitario
      `,
      [compra_fornecedor_id, solicitacao_item_id, quantidade_pedida, valor_unitario]
    );

    await insertHistorico(database, {
      solicitacao_id: compra.solicitacao_id,
      usuario_id,
      etapa: 'COMPRA',
      acao: 'ITEM_COMPRA_ADICIONADO',
      status_anterior: compra.status,
      status_novo: compra.status,
      observacao: `Item ${solicitacao_item_id} adicionado a compra ${compra_id}.`
    });

    await database.exec('COMMIT');

    const itemId = result.lastID || (await findItemByCompraFornecedorAndSolicitacaoItem(
      compra_fornecedor_id,
      solicitacao_item_id
    ))?.id;

    return findItemById(itemId);
  } catch (error) {
    await database.exec('ROLLBACK');
    throw error;
  }
}

async function enviarAprovacao(id, { usuario_id = null, observacao = null }) {
  return updateCompraStatus(id, {
    status: 'AGUARDANDO_APROVACAO',
    usuario_id,
    acao: 'ENVIO_APROVACAO_COMPRA',
    observacao,
    statusSolicitacao: 'AGUARDANDO_APROVACAO_COMPRA'
  });
}

async function aprovar(id, { aprovador_id, observacao = null }) {
  const database = await getDatabase();
  const compra = await findCompraSemHydrate(database, id);

  await database.exec('BEGIN');

  try {
    await database.run(
      `
        INSERT INTO compra_aprovacoes (compra_id, aprovador_id, decisao, observacao)
        VALUES (?, ?, 'APROVADO', ?)
      `,
      [id, aprovador_id, observacao]
    );

    await database.run(
      `
        UPDATE compras
        SET status = 'APROVADA',
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
      id
    );

    await database.run(
      `
        UPDATE solicitacoes_compra
        SET status = 'COMPRA_APROVADA',
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
      compra.solicitacao_id
    );

    await insertHistorico(database, {
      solicitacao_id: compra.solicitacao_id,
      usuario_id: aprovador_id,
      etapa: 'COMPRA',
      acao: 'APROVACAO_COMPRA',
      status_anterior: compra.status,
      status_novo: 'APROVADA',
      observacao
    });

    await database.exec('COMMIT');

    return findById(id);
  } catch (error) {
    await database.exec('ROLLBACK');
    throw error;
  }
}

async function cancelar(id, { usuario_id, observacao }) {
  const database = await getDatabase();
  const compra = await findCompraSemHydrate(database, id);

  await database.exec('BEGIN');

  try {
    await database.run(
      `
        INSERT INTO compra_aprovacoes (compra_id, aprovador_id, decisao, observacao)
        VALUES (?, ?, 'CANCELADA', ?)
      `,
      [id, usuario_id, observacao]
    );

    await database.run(
      `
        UPDATE compras
        SET status = 'CANCELADA',
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
      id
    );

    await database.run(
      `
        UPDATE solicitacoes_compra
        SET status = 'CANCELADA',
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
      compra.solicitacao_id
    );

    await insertHistorico(database, {
      solicitacao_id: compra.solicitacao_id,
      usuario_id,
      etapa: 'COMPRA',
      acao: 'CANCELAMENTO_COMPRA',
      status_anterior: compra.status,
      status_novo: 'CANCELADA',
      observacao
    });

    await database.exec('COMMIT');

    return findById(id);
  } catch (error) {
    await database.exec('ROLLBACK');
    throw error;
  }
}

async function countFornecedores(id) {
  const database = await getDatabase();
  const result = await database.get(
    `
      SELECT COUNT(*) AS total
      FROM compra_fornecedores
      WHERE compra_id = ?
    `,
    id
  );

  return result?.total ?? 0;
}

async function countItens(id) {
  const database = await getDatabase();
  const result = await database.get(
    `
      SELECT COUNT(*) AS total
      FROM compra_fornecedor_itens cfi
      INNER JOIN compra_fornecedores cf ON cf.id = cfi.compra_fornecedor_id
      WHERE cf.compra_id = ?
    `,
    id
  );

  return result?.total ?? 0;
}

async function findSolicitacaoItemForCompra(compraId, solicitacaoItemId) {
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
      INNER JOIN compras c ON c.solicitacao_id = si.solicitacao_id
      WHERE c.id = ?
        AND si.id = ?
    `,
    [compraId, solicitacaoItemId]
  );
}

async function findCotacaoRespostaItem(cotacaoId, fornecedorId, solicitacaoItemId) {
  const database = await getDatabase();

  return database.get(
    `
      SELECT
        cfi.id,
        cfi.cotacao_fornecedor_id,
        cf.fornecedor_id,
        cfi.solicitacao_item_id,
        cfi.status_item,
        cfi.quantidade,
        cfi.valor_unitario,
        cfi.valor_total,
        cf.prazo_entrega,
        cf.forma_pagamento
      FROM cotacao_fornecedor_itens cfi
      INNER JOIN cotacao_fornecedores cf ON cf.id = cfi.cotacao_fornecedor_id
      WHERE cf.cotacao_id = ?
        AND cf.fornecedor_id = ?
        AND cfi.solicitacao_item_id = ?
    `,
    [cotacaoId, fornecedorId, solicitacaoItemId]
  );
}

async function findCotacaoFornecedor(cotacaoId, fornecedorId) {
  const database = await getDatabase();

  return database.get(
    `
      SELECT
        cf.id,
        cf.cotacao_id,
        cf.fornecedor_id,
        cf.status,
        cf.prazo_entrega,
        cf.forma_pagamento
      FROM cotacao_fornecedores cf
      WHERE cf.cotacao_id = ?
        AND cf.fornecedor_id = ?
    `,
    [cotacaoId, fornecedorId]
  );
}

async function hasDecisaoFinal(id) {
  const database = await getDatabase();
  const result = await database.get(
    `
      SELECT id
      FROM compra_aprovacoes
      WHERE compra_id = ?
      LIMIT 1
    `,
    id
  );

  return Boolean(result);
}

async function hydrateCompra(database, compra) {
  const fornecedores = await database.all(
    `
      SELECT
        cf.id,
        cf.compra_id,
        cf.fornecedor_id,
        f.razao_social AS fornecedor_razao_social,
        f.nome_fantasia AS fornecedor_nome_fantasia,
        f.cnpj AS fornecedor_cnpj,
        cf.prazo_entrega,
        cf.forma_pagamento,
        cf.justificativa_texto,
        cf.orcamento_anexo_id,
        cf.created_at
      FROM compra_fornecedores cf
      INNER JOIN FORNECEDORES f ON f.id = cf.fornecedor_id
      WHERE cf.compra_id = ?
      ORDER BY cf.id ASC
    `,
    compra.id
  );

  for (const fornecedor of fornecedores) {
    fornecedor.justificativas = await database.all(
      `
        SELECT justificativa
        FROM compra_fornecedor_justificativas
        WHERE compra_fornecedor_id = ?
        ORDER BY id ASC
      `,
      fornecedor.id
    );

    fornecedor.justificativas = fornecedor.justificativas.map((item) => item.justificativa);
    fornecedor.itens = await findItensByCompraFornecedorId(fornecedor.id);
  }

  const inconsistencias = await getInconsistenciasQuantidade(compra.id);

  return {
    ...compra,
    inconsistencia_quantidade: inconsistencias.some((item) => item.inconsistencia_quantidade),
    inconsistencias_quantidade: inconsistencias,
    fornecedores
  };
}

async function findItensByCompraFornecedorId(compraFornecedorId) {
  const database = await getDatabase();

  return database.all(
    `
      SELECT
        cfi.id,
        cfi.compra_fornecedor_id,
        cf.compra_id,
        cfi.solicitacao_item_id,
        si.descricao_necessidade,
        si.quantidade AS quantidade_solicitada,
        si.unidade_snapshot,
        i.codigo AS item_codigo,
        i.descricao AS item_descricao,
        cfi.quantidade_pedida,
        cfi.quantidade_recebida,
        cfi.valor_unitario,
        cfi.valor_total,
        CASE
          WHEN total_item.total_quantidade > si.quantidade THEN 1
          ELSE 0
        END AS inconsistencia_quantidade
      FROM compra_fornecedor_itens cfi
      INNER JOIN compra_fornecedores cf ON cf.id = cfi.compra_fornecedor_id
      INNER JOIN solicitacao_compra_itens si ON si.id = cfi.solicitacao_item_id
      INNER JOIN ITENS_COMPRA i ON i.id = si.item_id
      INNER JOIN (
        SELECT
          cfi2.solicitacao_item_id,
          SUM(cfi2.quantidade_pedida) AS total_quantidade
        FROM compra_fornecedor_itens cfi2
        INNER JOIN compra_fornecedores cf2 ON cf2.id = cfi2.compra_fornecedor_id
        WHERE cf2.compra_id = (
          SELECT compra_id
          FROM compra_fornecedores
          WHERE id = ?
        )
        GROUP BY cfi2.solicitacao_item_id
      ) total_item ON total_item.solicitacao_item_id = cfi.solicitacao_item_id
      WHERE cfi.compra_fornecedor_id = ?
      ORDER BY cfi.id ASC
    `,
    [compraFornecedorId, compraFornecedorId]
  );
}

async function findItemById(id) {
  const database = await getDatabase();

  return database.get(
    `
      SELECT
        cfi.id,
        cfi.compra_fornecedor_id,
        cf.compra_id,
        cfi.solicitacao_item_id,
        si.quantidade AS quantidade_solicitada,
        cfi.quantidade_pedida,
        cfi.quantidade_recebida,
        cfi.valor_unitario,
        cfi.valor_total,
        CASE
          WHEN total_item.total_quantidade > si.quantidade THEN 1
          ELSE 0
        END AS inconsistencia_quantidade
      FROM compra_fornecedor_itens cfi
      INNER JOIN compra_fornecedores cf ON cf.id = cfi.compra_fornecedor_id
      INNER JOIN solicitacao_compra_itens si ON si.id = cfi.solicitacao_item_id
      INNER JOIN (
        SELECT
          cfi2.solicitacao_item_id,
          SUM(cfi2.quantidade_pedida) AS total_quantidade
        FROM compra_fornecedor_itens cfi2
        INNER JOIN compra_fornecedores cf2 ON cf2.id = cfi2.compra_fornecedor_id
        WHERE cf2.compra_id = (
          SELECT cf3.compra_id
          FROM compra_fornecedor_itens cfi3
          INNER JOIN compra_fornecedores cf3 ON cf3.id = cfi3.compra_fornecedor_id
          WHERE cfi3.id = ?
        )
        GROUP BY cfi2.solicitacao_item_id
      ) total_item ON total_item.solicitacao_item_id = cfi.solicitacao_item_id
      WHERE cfi.id = ?
    `,
    [id, id]
  );
}

async function findItemByCompraFornecedorAndSolicitacaoItem(compraFornecedorId, solicitacaoItemId) {
  const database = await getDatabase();

  return database.get(
    `
      SELECT id
      FROM compra_fornecedor_itens
      WHERE compra_fornecedor_id = ?
        AND solicitacao_item_id = ?
    `,
    [compraFornecedorId, solicitacaoItemId]
  );
}

async function getInconsistenciasQuantidade(compraId) {
  const database = await getDatabase();

  return database.all(
    `
      SELECT
        cfi.solicitacao_item_id,
        si.quantidade AS quantidade_solicitada,
        SUM(cfi.quantidade_pedida) AS quantidade_pedida_total,
        CASE
          WHEN SUM(cfi.quantidade_pedida) > si.quantidade THEN 1
          ELSE 0
        END AS inconsistencia_quantidade
      FROM compra_fornecedor_itens cfi
      INNER JOIN compra_fornecedores cf ON cf.id = cfi.compra_fornecedor_id
      INNER JOIN solicitacao_compra_itens si ON si.id = cfi.solicitacao_item_id
      WHERE cf.compra_id = ?
      GROUP BY cfi.solicitacao_item_id, si.quantidade
      ORDER BY cfi.solicitacao_item_id ASC
    `,
    compraId
  );
}

async function findCompraSemHydrate(database, id) {
  return database.get(
    `
      SELECT ${compraFields}
      FROM compras c
      LEFT JOIN USUARIOS u ON u.id = c.criado_por
      WHERE c.id = ?
    `,
    id
  );
}

async function updateCompraStatus(id, {
  status,
  usuario_id = null,
  acao,
  observacao = null,
  statusSolicitacao = null
}) {
  const database = await getDatabase();
  const compra = await findCompraSemHydrate(database, id);

  await database.exec('BEGIN');

  try {
    await database.run(
      `
        UPDATE compras
        SET status = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
      [status, id]
    );

    if (statusSolicitacao) {
      await database.run(
        `
          UPDATE solicitacoes_compra
          SET status = ?,
              updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `,
        [statusSolicitacao, compra.solicitacao_id]
      );
    }

    await insertHistorico(database, {
      solicitacao_id: compra.solicitacao_id,
      usuario_id,
      etapa: 'COMPRA',
      acao,
      status_anterior: compra.status,
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
  findByCotacaoId,
  create,
  findCompraFornecedorById,
  findCompraFornecedorByCompraAndFornecedor,
  addFornecedor,
  addItem,
  enviarAprovacao,
  aprovar,
  cancelar,
  countFornecedores,
  countItens,
  findSolicitacaoItemForCompra,
  findCotacaoRespostaItem,
  findCotacaoFornecedor,
  hasDecisaoFinal
};
