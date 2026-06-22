export const statusLabels = {
  ABERTA: 'Aberta',
  APROVADA: 'Aprovada',
  REPROVADA: 'Reprovada',
  COTACAO_REPROVADA: 'Cotacao reprovada',
  EM_COTACAO: 'Em cotacao',
  EM_ANDAMENTO: 'Em andamento',
  EM_ANALISE: 'Em analise',
  ENCERRADA: 'Encerrada',
  CANCELADA: 'Cancelada',
  EM_MONTAGEM: 'Em montagem',
  AGUARDANDO_APROVACAO: 'Aguardando aprovacao',
  GERADA: 'Gerada',
  SUBSTITUIDA: 'Substituida',
  CONVIDADO: 'Convidado',
  ENVIADO: 'Enviado',
  PENDENTE: 'Pendente',
  RESPONDIDO: 'Respondido',
  RECUSADO: 'Recusado',
  SEM_RESPOSTA: 'Sem resposta',
  DISPONIVEL: 'Disponivel',
  INDISPONIVEL: 'Indisponivel',
  ATIVO: 'Ativo',
  INATIVO: 'Inativo',
  APROVAR: 'Aprovar',
  REPROVAR: 'Reprovar',
}

export const statusClass = {
  ABERTA: 'info',
  APROVADA: 'success',
  REPROVADA: 'danger',
  COTACAO_REPROVADA: 'danger',
  EM_COTACAO: 'warning',
  EM_ANDAMENTO: 'warning',
  EM_ANALISE: 'warning',
  ENCERRADA: 'neutral',
  CANCELADA: 'danger',
  EM_MONTAGEM: 'info',
  AGUARDANDO_APROVACAO: 'warning',
  GERADA: 'success',
  SUBSTITUIDA: 'neutral',
  CONVIDADO: 'info',
  ENVIADO: 'warning',
  PENDENTE: 'warning',
  RESPONDIDO: 'success',
  RECUSADO: 'danger',
  SEM_RESPOSTA: 'neutral',
  DISPONIVEL: 'success',
  INDISPONIVEL: 'danger',
  ATIVO: 'success',
  INATIVO: 'neutral',
}

export const finalCotacaoStatuses = new Set([
  'APROVADA',
  'REPROVADA',
  'CANCELADA',
  'ENCERRADA',
])

export const retornoFornecedorStatuses = new Set([
  'RESPONDIDO',
  'RECUSADO',
  'SEM_RESPOSTA',
])

export const ACTIONS = {
  criarSolicitacao: 'Criando solicitacao',
  lancarItem: 'Lancando item',
  editarItem: 'Salvando item',
  removerItem: 'Removendo item',
  limparSolicitacoes: 'Limpando solicitacoes',
  enviarCotacao: 'Criando e enviando solicitação de orçamento',
  registrarRetorno: 'Registrando retorno',
  aceitarCotacao: 'Aceitando cotacao',
  recusarCotacao: 'Recusando cotacao',
  gerarOrdemCompra: 'Gerando ordem de compra',
  cadastrarFornecedor: 'Cadastrando fornecedor',
  cadastrarContato: 'Cadastrando contato',
  cadastrarGrupo: 'Cadastrando grupo',
  cadastrarItem: 'Cadastrando item',
}

export const DEFAULT_URGENCIA = 'Baixa'
export const DEFAULT_ENVIO_OBSERVACOES =
  'Solicitar orcamento formal com prazo de entrega e condicao de pagamento.'
export const DEFAULT_RETORNO_PRAZO = '5 dias'
export const DEFAULT_RETORNO_TIPO_PAGAMENTO = 'BOLETO'
export const DEFAULT_RETORNO_PARCELAS = '1'
export const DEFAULT_RETORNO_OBSERVACOES =
  'Condicoes recebidas por email e lancadas manualmente.'
export const DEFAULT_APROVACAO_OBSERVACAO = ''
export const CLASSIFICACAO_CREATE_SOLICITACAO_VALUE = '__CREATE_SOLICITACAO__'
export const CENTROS_CUSTO_ORDEM_COMPRA = ['Oficina', 'RH', 'Operação', 'Escritorio']
export const RETORNO_PARCELAS_OPTIONS = Array.from({ length: 12 }, (_, index) =>
  String(index + 1),
)

export const APROVACAO_JUSTIFICATIVAS = [
  ['MENOR_PRECO', 'Menor preço'],
  ['PRAZO', 'Melhor prazo'],
  ['PECA_ORIGINAL', 'Peça original'],
  ['GARANTIA', 'Melhor garantia'],
  ['QUALIDADE', 'Qualidade técnica'],
  ['DISPONIBILIDADE', 'Disponibilidade imediata'],
  ['OUTRO', 'Outro'],
]

export const RECUSA_JUSTIFICATIVAS = [
  ['VALOR_ACIMA', 'Valor acima do esperado'],
  ['PRAZO_INCOMPATIVEL', 'Prazo incompatível'],
  ['ESCOPO_INCORRETO', 'Escopo incorreto'],
  ['DADOS_INSUFICIENTES', 'Dados insuficientes'],
  ['OUTRO', 'Outro'],
]

export const SCREEN_ROUTES = {
  inicio: '/status-api',
  painel: '/',
  solicitacoes: '/solicitacoes',
  'classificar-solicitacao': '/solicitacoes/classificar',
  'enviar-cotacao': '/cotacoes/enviar',
  cotacoes: '/cotacoes',
  'retorno-cotacao': '/cotacoes/retorno',
  'aprovar-cotacao': '/cotacoes/aprovar',
  compras: '/compras',
  fornecedores: '/fornecedores',
  itens: '/itens',
  usuarios: '/usuarios',
  'ordens-compra': '/ordens-compra',
  'cadastro-base': '/cadastros/novo',
  cadastros: '/cadastros',
}

export const NAV_ITEMS = [
  { screenId: 'painel', label: 'Dashboard', path: SCREEN_ROUTES.painel },
  {
    label: 'Solicitacoes',
    children: [
      { screenId: 'solicitacoes', label: 'Solicitacoes', path: SCREEN_ROUTES.solicitacoes },
      {
        screenId: 'classificar-solicitacao',
        label: 'Classificar solicitacoes',
        path: SCREEN_ROUTES['classificar-solicitacao'],
      },
    ],
  },
  {
    label: 'Cotacoes',
    children: [
      { screenId: 'cotacoes', label: 'Cotacoes', path: SCREEN_ROUTES.cotacoes },
      {
        screenId: 'enviar-cotacao',
        label: 'Enviar cotacao',
        path: SCREEN_ROUTES['enviar-cotacao'],
      },
      {
        screenId: 'retorno-cotacao',
        label: 'Retorno cotacao',
        path: SCREEN_ROUTES['retorno-cotacao'],
      },
      {
        screenId: 'aprovar-cotacao',
        label: 'Aprovar cotacao',
        path: SCREEN_ROUTES['aprovar-cotacao'],
      },
    ],
  },
  { screenId: 'compras', label: 'Compras', path: SCREEN_ROUTES.compras },
  { screenId: 'ordens-compra', label: 'Ordens de compra', path: SCREEN_ROUTES['ordens-compra'] },
  { screenId: 'fornecedores', label: 'Fornecedores', path: SCREEN_ROUTES.fornecedores },
  { screenId: 'itens', label: 'Itens', path: SCREEN_ROUTES.itens },
  { screenId: 'usuarios', label: 'Usuarios', path: SCREEN_ROUTES.usuarios },
  { screenId: 'inicio', label: 'Status API', path: SCREEN_ROUTES.inicio },
]

export function routeToScreen(pathname) {
  if (pathname === '/') {
    return 'painel'
  }

  if (pathname.startsWith('/solicitacoes/classificar')) {
    return 'classificar-solicitacao'
  }

  if (pathname.startsWith('/cotacoes/enviar')) {
    return 'enviar-cotacao'
  }

  if (pathname.startsWith('/cotacoes/retorno')) {
    return 'retorno-cotacao'
  }

  if (pathname.startsWith('/cotacoes/aprovar')) {
    return 'aprovar-cotacao'
  }

  if (pathname.startsWith('/solicitacoes')) {
    return 'solicitacoes'
  }

  if (pathname.startsWith('/cotacoes')) {
    return 'cotacoes'
  }

  if (pathname.startsWith('/compras')) {
    return 'compras'
  }

  if (pathname.startsWith('/ordens-compra')) {
    return 'ordens-compra'
  }

  if (pathname.startsWith('/fornecedores')) {
    return 'fornecedores'
  }

  if (pathname.startsWith('/itens')) {
    return 'itens'
  }

  if (pathname.startsWith('/usuarios')) {
    return 'usuarios'
  }

  if (pathname.startsWith('/cadastros/novo')) {
    return 'cadastro-base'
  }

  if (pathname.startsWith('/cadastros')) {
    return 'cadastros'
  }

  if (pathname.startsWith('/status-api')) {
    return 'inicio'
  }

  return 'painel'
}
