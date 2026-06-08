CREATE TABLE IF NOT EXISTS fornecedores (
  id SERIAL PRIMARY KEY,
  cnpj TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'ATIVO',
  razao_social TEXT NOT NULL,
  nome_fantasia TEXT,
  telefone TEXT,
  email TEXT
);

CREATE TABLE IF NOT EXISTS fornecedor_contatos (
  id SERIAL PRIMARY KEY,
  fornecedor_id INTEGER NOT NULL,
  nome TEXT NOT NULL,
  cargo TEXT,
  telefone TEXT,
  email TEXT,
  FOREIGN KEY (fornecedor_id) REFERENCES fornecedores (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  cargo TEXT,
  ativo INTEGER NOT NULL DEFAULT 1 CHECK (ativo IN (0, 1)),
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS grupos_itens (
  id SERIAL PRIMARY KEY,
  nome TEXT NOT NULL UNIQUE,
  ativo INTEGER NOT NULL DEFAULT 1 CHECK (ativo IN (0, 1)),
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS itens_compra (
  id SERIAL PRIMARY KEY,
  codigo TEXT NOT NULL UNIQUE,
  descricao TEXT NOT NULL,
  unidade TEXT NOT NULL,
  classificacao TEXT NOT NULL DEFAULT 'CUSTO' CHECK (classificacao IN ('CUSTO', 'DESPESA', 'INVESTIMENTO', 'PLR')),
  grupo_id INTEGER NOT NULL,
  controla_estoque INTEGER NOT NULL DEFAULT 0 CHECK (controla_estoque IN (0, 1)),
  ativo INTEGER NOT NULL DEFAULT 1 CHECK (ativo IN (0, 1)),
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (grupo_id) REFERENCES grupos_itens (id)
);

CREATE TABLE IF NOT EXISTS solicitacoes_compra (
  id SERIAL PRIMARY KEY,
  solicitante_id INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'ABERTA' CHECK (status IN (
    'ABERTA',
    'APROVADA',
    'REPROVADA',
    'EM_COTACAO',
    'EM_ANALISE_COTACAO',
    'COTACAO_REPROVADA',
    'COTACAO_APROVADA',
    'EM_ESCOLHA_FORNECEDOR',
    'AGUARDANDO_APROVACAO_COMPRA',
    'COMPRA_APROVADA',
    'OC_GERADA',
    'OC_ENVIADA',
    'AGUARDANDO_RECEBIMENTO',
    'RECEBIDA_PARCIAL',
    'RECEBIDA_TOTAL',
    'CANCELADA',
    'FINALIZADA'
  )),
  observacoes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (solicitante_id) REFERENCES usuarios (id)
);

CREATE TABLE IF NOT EXISTS solicitacao_compra_itens (
  id SERIAL PRIMARY KEY,
  solicitacao_id INTEGER NOT NULL,
  item_id INTEGER,
  descricao_necessidade TEXT NOT NULL,
  quantidade DOUBLE PRECISION NOT NULL CHECK (quantidade > 0),
  unidade_snapshot TEXT NOT NULL,
  observacoes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (solicitacao_id) REFERENCES solicitacoes_compra (id) ON DELETE CASCADE,
  FOREIGN KEY (item_id) REFERENCES itens_compra (id)
);

ALTER TABLE solicitacao_compra_itens
  ALTER COLUMN item_id DROP NOT NULL;

CREATE TABLE IF NOT EXISTS solicitacao_compra_aprovacoes (
  id SERIAL PRIMARY KEY,
  solicitacao_id INTEGER NOT NULL UNIQUE,
  aprovador_id INTEGER NOT NULL,
  decisao TEXT NOT NULL CHECK (decisao IN ('APROVADO', 'REPROVADO')),
  observacao TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (solicitacao_id) REFERENCES solicitacoes_compra (id) ON DELETE CASCADE,
  FOREIGN KEY (aprovador_id) REFERENCES usuarios (id)
);

CREATE TABLE IF NOT EXISTS solicitacao_compra_historico (
  id SERIAL PRIMARY KEY,
  solicitacao_id INTEGER NOT NULL,
  usuario_id INTEGER,
  etapa TEXT NOT NULL,
  acao TEXT NOT NULL,
  status_anterior TEXT,
  status_novo TEXT,
  observacao TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (solicitacao_id) REFERENCES solicitacoes_compra (id) ON DELETE CASCADE,
  FOREIGN KEY (usuario_id) REFERENCES usuarios (id)
);

CREATE TABLE IF NOT EXISTS cotacoes (
  id SERIAL PRIMARY KEY,
  solicitacao_id INTEGER NOT NULL,
  numero_rodada INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'ABERTA' CHECK (status IN (
    'ABERTA',
    'EM_ANDAMENTO',
    'EM_ANALISE',
    'APROVADA',
    'REPROVADA',
    'CANCELADA',
    'ENCERRADA'
  )),
  criado_por INTEGER,
  data_abertura TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  data_encerramento TIMESTAMPTZ,
  observacoes TEXT,
  UNIQUE (solicitacao_id, numero_rodada),
  FOREIGN KEY (solicitacao_id) REFERENCES solicitacoes_compra (id) ON DELETE CASCADE,
  FOREIGN KEY (criado_por) REFERENCES usuarios (id)
);

CREATE TABLE IF NOT EXISTS cotacao_fornecedores (
  id SERIAL PRIMARY KEY,
  cotacao_id INTEGER NOT NULL,
  fornecedor_id INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDENTE' CHECK (status IN ('PENDENTE', 'ENVIADO', 'RESPONDIDO', 'RECUSADO', 'SEM_RESPOSTA')),
  data_envio TIMESTAMPTZ,
  data_resposta TIMESTAMPTZ,
  prazo_entrega TEXT,
  forma_pagamento TEXT,
  observacoes TEXT,
  UNIQUE (cotacao_id, fornecedor_id),
  FOREIGN KEY (cotacao_id) REFERENCES cotacoes (id) ON DELETE CASCADE,
  FOREIGN KEY (fornecedor_id) REFERENCES fornecedores (id)
);

CREATE TABLE IF NOT EXISTS cotacao_fornecedor_itens (
  id SERIAL PRIMARY KEY,
  cotacao_fornecedor_id INTEGER NOT NULL,
  solicitacao_item_id INTEGER NOT NULL,
  status_item TEXT NOT NULL DEFAULT 'DISPONIVEL' CHECK (status_item IN ('DISPONIVEL', 'INDISPONIVEL')),
  quantidade DOUBLE PRECISION CHECK (quantidade IS NULL OR quantidade > 0),
  valor_unitario DOUBLE PRECISION CHECK (valor_unitario >= 0),
  valor_total DOUBLE PRECISION,
  observacoes TEXT,
  CHECK (
    (status_item = 'DISPONIVEL' AND quantidade IS NOT NULL AND valor_unitario IS NOT NULL)
    OR
    (status_item = 'INDISPONIVEL' AND quantidade IS NULL AND valor_unitario IS NULL)
  ),
  UNIQUE (cotacao_fornecedor_id, solicitacao_item_id),
  FOREIGN KEY (cotacao_fornecedor_id) REFERENCES cotacao_fornecedores (id) ON DELETE CASCADE,
  FOREIGN KEY (solicitacao_item_id) REFERENCES solicitacao_compra_itens (id) ON DELETE CASCADE
);

ALTER TABLE cotacao_fornecedor_itens
  DROP CONSTRAINT IF EXISTS cotacao_fornecedor_itens_solicitacao_item_id_fkey;

ALTER TABLE cotacao_fornecedor_itens
  ADD CONSTRAINT cotacao_fornecedor_itens_solicitacao_item_id_fkey
  FOREIGN KEY (solicitacao_item_id) REFERENCES solicitacao_compra_itens (id) ON DELETE CASCADE;

CREATE TABLE IF NOT EXISTS cotacao_fornecedor_anexos (
  id SERIAL PRIMARY KEY,
  cotacao_fornecedor_id INTEGER NOT NULL,
  nome_arquivo TEXT NOT NULL,
  caminho_arquivo TEXT NOT NULL,
  tipo_arquivo TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (cotacao_fornecedor_id) REFERENCES cotacao_fornecedores (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS compras (
  id SERIAL PRIMARY KEY,
  solicitacao_id INTEGER NOT NULL,
  cotacao_id INTEGER,
  status TEXT NOT NULL DEFAULT 'EM_MONTAGEM' CHECK (status IN (
    'EM_MONTAGEM',
    'AGUARDANDO_APROVACAO',
    'APROVADA',
    'CANCELADA'
  )),
  criado_por INTEGER,
  data_compra TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  observacoes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (solicitacao_id) REFERENCES solicitacoes_compra (id),
  FOREIGN KEY (cotacao_id) REFERENCES cotacoes (id),
  FOREIGN KEY (criado_por) REFERENCES usuarios (id)
);

CREATE TABLE IF NOT EXISTS compra_fornecedores (
  id SERIAL PRIMARY KEY,
  compra_id INTEGER NOT NULL,
  fornecedor_id INTEGER NOT NULL,
  prazo_entrega TEXT,
  forma_pagamento TEXT,
  justificativa_texto TEXT,
  orcamento_anexo_id INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (compra_id, fornecedor_id),
  FOREIGN KEY (compra_id) REFERENCES compras (id) ON DELETE CASCADE,
  FOREIGN KEY (fornecedor_id) REFERENCES fornecedores (id),
  FOREIGN KEY (orcamento_anexo_id) REFERENCES cotacao_fornecedor_anexos (id)
);

CREATE TABLE IF NOT EXISTS compra_fornecedor_itens (
  id SERIAL PRIMARY KEY,
  compra_fornecedor_id INTEGER NOT NULL,
  solicitacao_item_id INTEGER NOT NULL,
  quantidade_pedida DOUBLE PRECISION NOT NULL CHECK (quantidade_pedida > 0),
  quantidade_recebida DOUBLE PRECISION NOT NULL DEFAULT 0 CHECK (quantidade_recebida >= 0),
  valor_unitario DOUBLE PRECISION NOT NULL CHECK (valor_unitario >= 0),
  valor_total DOUBLE PRECISION,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_compra_item_recebido_limite CHECK (quantidade_recebida <= quantidade_pedida),
  UNIQUE (compra_fornecedor_id, solicitacao_item_id),
  FOREIGN KEY (compra_fornecedor_id) REFERENCES compra_fornecedores (id) ON DELETE CASCADE,
  FOREIGN KEY (solicitacao_item_id) REFERENCES solicitacao_compra_itens (id) ON DELETE CASCADE
);

ALTER TABLE compra_fornecedor_itens
  DROP CONSTRAINT IF EXISTS compra_fornecedor_itens_solicitacao_item_id_fkey;

ALTER TABLE compra_fornecedor_itens
  ADD CONSTRAINT compra_fornecedor_itens_solicitacao_item_id_fkey
  FOREIGN KEY (solicitacao_item_id) REFERENCES solicitacao_compra_itens (id) ON DELETE CASCADE;

CREATE TABLE IF NOT EXISTS compra_fornecedor_justificativas (
  id SERIAL PRIMARY KEY,
  compra_fornecedor_id INTEGER NOT NULL,
  justificativa TEXT NOT NULL CHECK (
    justificativa IN (
      'MENOR_PRECO',
      'PRAZO',
      'PECA_ORIGINAL',
      'GARANTIA',
      'QUALIDADE',
      'DISPONIBILIDADE',
      'OUTRO'
    )
  ),
  UNIQUE (compra_fornecedor_id, justificativa),
  FOREIGN KEY (compra_fornecedor_id) REFERENCES compra_fornecedores (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS compra_aprovacoes (
  id SERIAL PRIMARY KEY,
  compra_id INTEGER NOT NULL,
  aprovador_id INTEGER NOT NULL,
  decisao TEXT NOT NULL CHECK (decisao IN ('APROVADO', 'CANCELADA')),
  observacao TEXT,
  data_decisao TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (compra_id) REFERENCES compras (id) ON DELETE CASCADE,
  FOREIGN KEY (aprovador_id) REFERENCES usuarios (id)
);

CREATE TABLE IF NOT EXISTS ordens_compra (
  id SERIAL PRIMARY KEY,
  numero_oc TEXT NOT NULL UNIQUE,
  compra_fornecedor_id INTEGER NOT NULL,
  ordem_substituida_id INTEGER,
  data_emissao TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status TEXT NOT NULL DEFAULT 'GERADA' CHECK (status IN ('GERADA', 'CANCELADA', 'SUBSTITUIDA')),
  cancelada_em TIMESTAMPTZ,
  cancelada_por INTEGER,
  motivo_cancelamento TEXT,
  observacoes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (compra_fornecedor_id) REFERENCES compra_fornecedores (id) ON DELETE CASCADE,
  FOREIGN KEY (ordem_substituida_id) REFERENCES ordens_compra (id),
  FOREIGN KEY (cancelada_por) REFERENCES usuarios (id)
);

CREATE TABLE IF NOT EXISTS ordem_compra_envios (
  id SERIAL PRIMARY KEY,
  ordem_compra_id INTEGER NOT NULL,
  usuario_id INTEGER,
  email_destino TEXT NOT NULL,
  enviado_em TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'PENDENTE' CHECK (status IN ('PENDENTE', 'ENVIADO', 'FALHA')),
  observacao TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ordem_compra_id) REFERENCES ordens_compra (id) ON DELETE CASCADE,
  FOREIGN KEY (usuario_id) REFERENCES usuarios (id)
);

CREATE INDEX IF NOT EXISTS idx_fornecedor_contatos_fornecedor_id
  ON fornecedor_contatos (fornecedor_id);

CREATE INDEX IF NOT EXISTS idx_itens_compra_grupo_id
  ON itens_compra (grupo_id);

CREATE INDEX IF NOT EXISTS idx_solicitacoes_compra_solicitante_id
  ON solicitacoes_compra (solicitante_id);

CREATE INDEX IF NOT EXISTS idx_solicitacoes_compra_status
  ON solicitacoes_compra (status);

CREATE INDEX IF NOT EXISTS idx_solicitacao_compra_itens_solicitacao_id
  ON solicitacao_compra_itens (solicitacao_id);

CREATE INDEX IF NOT EXISTS idx_solicitacao_compra_historico_solicitacao_id
  ON solicitacao_compra_historico (solicitacao_id);

CREATE INDEX IF NOT EXISTS idx_cotacoes_solicitacao_id
  ON cotacoes (solicitacao_id);

CREATE INDEX IF NOT EXISTS idx_cotacao_fornecedores_cotacao_id
  ON cotacao_fornecedores (cotacao_id);

CREATE INDEX IF NOT EXISTS idx_cotacao_fornecedor_itens_cotacao_fornecedor_id
  ON cotacao_fornecedor_itens (cotacao_fornecedor_id);

CREATE INDEX IF NOT EXISTS idx_cotacao_fornecedor_anexos_fornecedor_id
  ON cotacao_fornecedor_anexos (cotacao_fornecedor_id);

CREATE INDEX IF NOT EXISTS idx_compras_solicitacao_id
  ON compras (solicitacao_id);

CREATE INDEX IF NOT EXISTS idx_compra_fornecedores_compra_id
  ON compra_fornecedores (compra_id);

CREATE INDEX IF NOT EXISTS idx_compra_fornecedor_itens_compra_fornecedor_id
  ON compra_fornecedor_itens (compra_fornecedor_id);

CREATE INDEX IF NOT EXISTS idx_ordens_compra_compra_fornecedor_id
  ON ordens_compra (compra_fornecedor_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_ordens_compra_compra_fornecedor_ativa
  ON ordens_compra (compra_fornecedor_id)
  WHERE status = 'GERADA';

CREATE INDEX IF NOT EXISTS idx_ordem_compra_envios_ordem_compra_id
  ON ordem_compra_envios (ordem_compra_id);

CREATE OR REPLACE FUNCTION set_cotacao_fornecedor_item_valor_total()
RETURNS TRIGGER AS $$
BEGIN
  NEW.valor_total := NEW.quantidade * NEW.valor_unitario;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_cotacao_fornecedor_itens_valor_total ON cotacao_fornecedor_itens;
CREATE TRIGGER trg_cotacao_fornecedor_itens_valor_total
BEFORE INSERT OR UPDATE OF quantidade, valor_unitario
ON cotacao_fornecedor_itens
FOR EACH ROW
EXECUTE PROCEDURE set_cotacao_fornecedor_item_valor_total();

CREATE OR REPLACE FUNCTION set_compra_fornecedor_item_valor_total()
RETURNS TRIGGER AS $$
BEGIN
  NEW.valor_total := NEW.quantidade_pedida * NEW.valor_unitario;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_compra_fornecedor_itens_valor_total ON compra_fornecedor_itens;
CREATE TRIGGER trg_compra_fornecedor_itens_valor_total
BEFORE INSERT OR UPDATE OF quantidade_pedida, valor_unitario
ON compra_fornecedor_itens
FOR EACH ROW
EXECUTE PROCEDURE set_compra_fornecedor_item_valor_total();
