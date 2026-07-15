import { initializeDatabase, getDatabase } from '../src/db/connection.js';

const usuarios = [
  {
    nome: 'Ana Pereira',
    email: 'ana.pereira@example.com',
    cargo: 'Compradora',
    ativo: 1
  },
  {
    nome: 'Bruno Almeida',
    email: 'bruno.almeida@example.com',
    cargo: 'Aprovador',
    ativo: 1
  },
  {
    nome: 'Carla Mendes',
    email: 'carla.mendes@example.com',
    cargo: 'Almoxarifado',
    ativo: 1
  },
  {
    nome: 'Diego Santos',
    email: 'diego.santos@example.com',
    cargo: 'Financeiro',
    ativo: 1
  }
];

const fornecedores = [
  {
    cnpj: '11222333000181',
    status: 'ATIVO',
    razao_social: 'Metal Forte Industrial Ltda',
    nome_fantasia: 'Metal Forte',
    telefone: '1133301000',
    email: 'vendas@metalforte.example.com',
    contatos: [
      {
        nome: 'Marina Costa',
        cargo: 'Vendedora',
        telefone: '11988110001',
        email: 'marina.costa@metalforte.example.com'
      },
      {
        nome: 'Roberto Lima',
        cargo: 'Pos-venda',
        telefone: '11988110002',
        email: 'roberto.lima@metalforte.example.com'
      }
    ]
  },
  {
    cnpj: '22333444000172',
    status: 'ATIVO',
    razao_social: 'Parafusos Brasil Atacadista Ltda',
    nome_fantasia: 'Parafusos Brasil',
    telefone: '1133312000',
    email: 'comercial@parafusosbrasil.example.com',
    contatos: [
      {
        nome: 'Fernanda Rocha',
        cargo: 'Comercial',
        telefone: '11988220001',
        email: 'fernanda.rocha@parafusosbrasil.example.com'
      }
    ]
  },
  {
    cnpj: '33444555000163',
    status: 'ATIVO',
    razao_social: 'EPI Seguranca Total Ltda',
    nome_fantasia: 'Seguranca Total',
    telefone: '1133323000',
    email: 'atendimento@segurancatotal.example.com',
    contatos: [
      {
        nome: 'Lucas Martins',
        cargo: 'Consultor tecnico',
        telefone: '11988330001',
        email: 'lucas.martins@segurancatotal.example.com'
      }
    ]
  },
  {
    cnpj: '44555666000154',
    status: 'ATIVO',
    razao_social: 'Office Mais Suprimentos Ltda',
    nome_fantasia: 'Office Mais',
    telefone: '1133334000',
    email: 'pedidos@officemais.example.com',
    contatos: [
      {
        nome: 'Patricia Nunes',
        cargo: 'Atendimento',
        telefone: '11988440001',
        email: 'patricia.nunes@officemais.example.com'
      }
    ]
  }
];

const grupos = [
  { nome: 'Manutencao Industrial', codigo: 'MI', ativo: 1 },
  { nome: 'Materiais Eletricos', codigo: 'ELE', ativo: 1 },
  { nome: 'EPIs', codigo: 'EPI', ativo: 1 },
  { nome: 'Escritorio', codigo: 'ESC', ativo: 1 },
  { nome: 'Limpeza', codigo: 'LIMP', ativo: 1 },
  { nome: 'Parafusos', codigo: 'PARA', ativo: 1 },
  { nome: 'Porcas', codigo: 'PORC', ativo: 1 }
];

const itens = [
  {
    codigo: 'MI - 001',
    sequencial: 1,
    descricao: 'Parafuso sextavado zincado 1/4',
    unidade: 'UN',
    classificacao: 'CUSTO',
    grupo: 'Manutencao Industrial',
    controla_estoque: 1,
    ativo: 1
  },
  {
    codigo: 'MI - 002',
    sequencial: 2,
    descricao: 'Rolamento industrial 6203',
    unidade: 'UN',
    classificacao: 'CUSTO',
    grupo: 'Manutencao Industrial',
    controla_estoque: 1,
    ativo: 1
  },
  {
    codigo: 'ELE - 001',
    sequencial: 1,
    descricao: 'Cabo flexivel 2,5 mm',
    unidade: 'M',
    classificacao: 'CUSTO',
    grupo: 'Materiais Eletricos',
    controla_estoque: 1,
    ativo: 1
  },
  {
    codigo: 'ELE - 002',
    sequencial: 2,
    descricao: 'Disjuntor monopolar 20A',
    unidade: 'UN',
    classificacao: 'CUSTO',
    grupo: 'Materiais Eletricos',
    controla_estoque: 1,
    ativo: 1
  },
  {
    codigo: 'EPI - 001',
    sequencial: 1,
    descricao: 'Luva de seguranca nitrilica',
    unidade: 'PAR',
    classificacao: 'CUSTO',
    grupo: 'EPIs',
    controla_estoque: 1,
    ativo: 1
  },
  {
    codigo: 'EPI - 002',
    sequencial: 2,
    descricao: 'Oculos de protecao transparente',
    unidade: 'UN',
    classificacao: 'CUSTO',
    grupo: 'EPIs',
    controla_estoque: 1,
    ativo: 1
  },
  {
    codigo: 'ESC - 001',
    sequencial: 1,
    descricao: 'Papel sulfite A4 caixa com 10 resmas',
    unidade: 'CX',
    classificacao: 'DESPESA',
    grupo: 'Escritorio',
    controla_estoque: 0,
    ativo: 1
  },
  {
    codigo: 'ESC - 002',
    sequencial: 2,
    descricao: 'Caneta esferografica azul caixa com 50 unidades',
    unidade: 'CX',
    classificacao: 'DESPESA',
    grupo: 'Escritorio',
    controla_estoque: 0,
    ativo: 1
  },
  {
    codigo: 'LIMP - 001',
    sequencial: 1,
    descricao: 'Detergente neutro 5 litros',
    unidade: 'GL',
    classificacao: 'DESPESA',
    grupo: 'Limpeza',
    controla_estoque: 1,
    ativo: 1
  },
  {
    codigo: 'LIMP - 002',
    sequencial: 2,
    descricao: 'Pano multiuso pacote com 50 unidades',
    unidade: 'PCT',
    classificacao: 'DESPESA',
    grupo: 'Limpeza',
    controla_estoque: 1,
    ativo: 1
  }
];

async function upsertUsuario(database, usuario) {
  const result = await database.get(
    `INSERT INTO usuarios (nome, email, cargo, ativo, created_at, updated_at)
     VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
     ON CONFLICT (email) DO UPDATE
       SET nome = EXCLUDED.nome,
           cargo = EXCLUDED.cargo,
           ativo = EXCLUDED.ativo,
           updated_at = CURRENT_TIMESTAMP
     RETURNING id`,
    [usuario.nome, usuario.email, usuario.cargo, usuario.ativo]
  );

  return result.id;
}

async function upsertFornecedor(database, fornecedor) {
  const result = await database.get(
    `INSERT INTO fornecedores (cnpj, status, razao_social, nome_fantasia, telefone, email)
     VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT (cnpj) DO UPDATE
       SET status = EXCLUDED.status,
           razao_social = EXCLUDED.razao_social,
           nome_fantasia = EXCLUDED.nome_fantasia,
           telefone = EXCLUDED.telefone,
           email = EXCLUDED.email
     RETURNING id`,
    [
      fornecedor.cnpj,
      fornecedor.status,
      fornecedor.razao_social,
      fornecedor.nome_fantasia,
      fornecedor.telefone,
      fornecedor.email
    ]
  );

  return result.id;
}

async function upsertContato(database, fornecedorId, contato) {
  const existing = await database.get(
    `SELECT id
     FROM fornecedor_contatos
     WHERE fornecedor_id = ?
       AND lower(email) = lower(?)`,
    [fornecedorId, contato.email]
  );

  if (existing) {
    await database.run(
      `UPDATE fornecedor_contatos
       SET nome = ?,
           cargo = ?,
           telefone = ?,
           email = ?
       WHERE id = ?`,
      [contato.nome, contato.cargo, contato.telefone, contato.email, existing.id]
    );

    return existing.id;
  }

  const result = await database.get(
    `INSERT INTO fornecedor_contatos (fornecedor_id, nome, cargo, telefone, email)
     VALUES (?, ?, ?, ?, ?)
     RETURNING id`,
    [fornecedorId, contato.nome, contato.cargo, contato.telefone, contato.email]
  );

  return result.id;
}

async function upsertGrupo(database, grupo) {
  const result = await database.get(
    `INSERT INTO grupos_itens (nome, codigo, ativo, created_at, updated_at)
     VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
     ON CONFLICT (nome) DO UPDATE
       SET codigo = EXCLUDED.codigo,
           ativo = EXCLUDED.ativo,
           updated_at = CURRENT_TIMESTAMP
     RETURNING id`,
    [grupo.nome, grupo.codigo, grupo.ativo]
  );

  await database.run(
    `UPDATE itens_compra
     SET codigo = ? || ' - ' || LPAD(sequencial::TEXT, 3, '0'),
         updated_at = CURRENT_TIMESTAMP
     WHERE grupo_id = ?`,
    [grupo.codigo, result.id]
  );

  return result.id;
}

async function upsertItem(database, item, grupoId) {
  const result = await database.get(
    `INSERT INTO itens_compra (
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
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
     ON CONFLICT (codigo) DO UPDATE
       SET descricao = EXCLUDED.descricao,
           sequencial = EXCLUDED.sequencial,
           unidade = EXCLUDED.unidade,
           classificacao = EXCLUDED.classificacao,
           grupo_id = EXCLUDED.grupo_id,
           controla_estoque = EXCLUDED.controla_estoque,
           ativo = EXCLUDED.ativo,
           updated_at = CURRENT_TIMESTAMP
     RETURNING id`,
    [
      item.codigo,
      item.sequencial,
      item.descricao,
      item.unidade,
      item.classificacao,
      grupoId,
      item.controla_estoque,
      item.ativo
    ]
  );

  await database.run(
    `UPDATE grupos_itens
     SET ultimo_sequencial = GREATEST(ultimo_sequencial, ?),
         updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [item.sequencial, grupoId]
  );

  return result.id;
}

async function countRows(database) {
  const rows = await database.all(`
    SELECT 'fornecedores' AS tabela, COUNT(*)::int AS total FROM fornecedores
    UNION ALL
    SELECT 'fornecedor_contatos' AS tabela, COUNT(*)::int AS total FROM fornecedor_contatos
    UNION ALL
    SELECT 'grupos_itens' AS tabela, COUNT(*)::int AS total FROM grupos_itens
    UNION ALL
    SELECT 'itens_compra' AS tabela, COUNT(*)::int AS total FROM itens_compra
    UNION ALL
    SELECT 'usuarios' AS tabela, COUNT(*)::int AS total FROM usuarios
  `);

  return Object.fromEntries(rows.map((row) => [row.tabela, row.total]));
}

async function seed() {
  await initializeDatabase();

  const database = await getDatabase();
  const grupoIds = new Map();
  const totaisAplicados = {
    fornecedores: 0,
    contatos: 0,
    grupos: 0,
    itens: 0,
    usuarios: 0
  };

  try {
    await database.exec('BEGIN');

    for (const usuario of usuarios) {
      await upsertUsuario(database, usuario);
      totaisAplicados.usuarios += 1;
    }

    for (const fornecedor of fornecedores) {
      const fornecedorId = await upsertFornecedor(database, fornecedor);
      totaisAplicados.fornecedores += 1;

      for (const contato of fornecedor.contatos) {
        await upsertContato(database, fornecedorId, contato);
        totaisAplicados.contatos += 1;
      }
    }

    for (const grupo of grupos) {
      const grupoId = await upsertGrupo(database, grupo);
      grupoIds.set(grupo.nome, grupoId);
      totaisAplicados.grupos += 1;
    }

    for (const item of itens) {
      const grupoId = grupoIds.get(item.grupo);

      if (!grupoId) {
        throw new Error(`Grupo nao encontrado para o item ${item.codigo}: ${item.grupo}`);
      }

      await upsertItem(database, item, grupoId);
      totaisAplicados.itens += 1;
    }

    await database.exec('COMMIT');

    const totaisBanco = await countRows(database);

    console.log('Seed de dados base finalizado.');
    console.table(totaisAplicados);
    console.log('Totais atuais no banco:');
    console.table(totaisBanco);
  } catch (error) {
    await database.exec('ROLLBACK');
    console.error('Falha ao executar seed de dados base.');
    console.error(error);
    process.exitCode = 1;
  } finally {
    await database.close();
  }
}

seed();
