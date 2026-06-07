export const demoUsuarios = [
  {
    id: 1,
    nome: 'Ana Compras',
    cargo: 'Compradora',
    email: 'ana.compras@empresa.test',
    status: 'ATIVO',
  },
  {
    id: 2,
    nome: 'Bruno Operacao',
    cargo: 'Solicitante',
    email: 'bruno.operacao@empresa.test',
    status: 'ATIVO',
  },
  {
    id: 3,
    nome: 'Carla Gestora',
    cargo: 'Aprovadora',
    email: 'carla.gestora@empresa.test',
    status: 'ATIVO',
  },
]

export const demoFornecedores = [
  {
    id: 1,
    razaoSocial: 'Alpha Ferramentas Industriais',
    cnpj: '12.345.678/0001-90',
    cidade: 'Sao Paulo',
    uf: 'SP',
    classificacao: 'CRITICO',
    status: 'ATIVO',
    prazoMedio: '3 dias',
  },
  {
    id: 2,
    razaoSocial: 'Beta EPIs e Suprimentos',
    cnpj: '18.222.332/0001-55',
    cidade: 'Campinas',
    uf: 'SP',
    classificacao: 'NAO_CRITICO',
    status: 'ATIVO',
    prazoMedio: '5 dias',
  },
  {
    id: 3,
    razaoSocial: 'Delta Componentes Mecanicos',
    cnpj: '22.781.441/0001-10',
    cidade: 'Curitiba',
    uf: 'PR',
    classificacao: 'CRITICO',
    status: 'ATIVO',
    prazoMedio: '7 dias',
  },
]

export const demoItens = [
  {
    id: 1,
    codigo: 'MAT-001',
    descricao: 'Rolamento 6205 blindado',
    grupo: 'Manutencao',
    unidade: 'UN',
    classificacao: 'CUSTO',
    ativo: true,
  },
  {
    id: 2,
    codigo: 'EPI-014',
    descricao: 'Luva nitrilica industrial',
    grupo: 'EPI',
    unidade: 'PAR',
    classificacao: 'DESPESA',
    ativo: true,
  },
  {
    id: 3,
    codigo: 'SER-009',
    descricao: 'Calibracao de balanca',
    grupo: 'Servicos',
    unidade: 'SV',
    classificacao: 'CUSTO',
    ativo: true,
  },
]

export const demoSolicitacoes = [
  {
    id: 101,
    numero: 'SC-2026-000101',
    solicitante: 'Bruno Operacao',
    centroCusto: 'Manutencao',
    item: 'Rolamento 6205 blindado',
    quantidade: 24,
    unidade: 'UN',
    status: 'ABERTA',
    prioridade: 'Alta',
    valorEstimado: 1680,
    data: '2026-06-05',
  },
  {
    id: 102,
    numero: 'SC-2026-000102',
    solicitante: 'Bruno Operacao',
    centroCusto: 'Seguranca',
    item: 'Luva nitrilica industrial',
    quantidade: 150,
    unidade: 'PAR',
    status: 'EM_COTACAO',
    prioridade: 'Media',
    valorEstimado: 2250,
    data: '2026-06-04',
  },
  {
    id: 103,
    numero: 'SC-2026-000103',
    solicitante: 'Ana Compras',
    centroCusto: 'Qualidade',
    item: 'Calibracao de balanca',
    quantidade: 2,
    unidade: 'SV',
    status: 'COMPRA_APROVADA',
    prioridade: 'Normal',
    valorEstimado: 1900,
    data: '2026-06-02',
  },
]

export const demoCotacoes = [
  {
    id: 301,
    numero: 'CT-2026-000301',
    solicitacao: 'SC-2026-000102',
    rodada: 1,
    status: 'EM_ANDAMENTO',
    respostas: 2,
    fornecedores: 3,
    melhorValor: 2115,
  },
  {
    id: 302,
    numero: 'CT-2026-000302',
    solicitacao: 'SC-2026-000103',
    rodada: 1,
    status: 'APROVADA',
    respostas: 3,
    fornecedores: 3,
    melhorValor: 1840,
  },
]

export const demoCotacaoRespostas = [
  {
    id: 1,
    cotacaoId: 301,
    fornecedorId: 1,
    fornecedor: 'Alpha Ferramentas Industriais',
    status: 'RESPONDIDO',
    prazoEntrega: '4 dias',
    formaPagamento: '28 dias',
    observacoes: 'Preco valido por 7 dias.',
    anexo: 'orcamento-alpha-301.pdf',
    total: 2190,
    itens: [
      {
        descricao: 'Luva nitrilica industrial',
        quantidade: 150,
        unidade: 'PAR',
        statusItem: 'DISPONIVEL',
        valorUnitario: 14.6,
      },
    ],
  },
  {
    id: 2,
    cotacaoId: 301,
    fornecedorId: 2,
    fornecedor: 'Beta EPIs e Suprimentos',
    status: 'RESPONDIDO',
    prazoEntrega: '5 dias',
    formaPagamento: '30 dias',
    observacoes: 'Inclui frete para entrega unica.',
    anexo: 'orcamento-beta-301.pdf',
    total: 2115,
    itens: [
      {
        descricao: 'Luva nitrilica industrial',
        quantidade: 150,
        unidade: 'PAR',
        statusItem: 'DISPONIVEL',
        valorUnitario: 14.1,
      },
    ],
  },
]

export const demoCompras = [
  {
    id: 501,
    numero: 'CP-2026-000501',
    solicitacao: 'SC-2026-000103',
    fornecedor: 'Delta Componentes Mecanicos',
    status: 'APROVADA',
    total: 1840,
    aprovador: 'Carla Gestora',
  },
  {
    id: 502,
    numero: 'CP-2026-000502',
    solicitacao: 'SC-2026-000102',
    fornecedor: 'Beta EPIs e Suprimentos',
    status: 'EM_MONTAGEM',
    total: 2115,
    aprovador: '-',
  },
]

export const demoOrdensCompra = [
  {
    id: 701,
    numero: 'OC-2026-000701',
    compra: 'CP-2026-000501',
    fornecedor: 'Delta Componentes Mecanicos',
    status: 'GERADA',
    envio: 'PENDENTE',
    total: 1840,
  },
]
