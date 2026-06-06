-- ============================================================
-- Modulo de Compras
-- SQLite
-- ============================================================

PRAGMA foreign_keys = ON;

-- ============================================================
-- Observacoes de adaptacao para SQLite
-- ============================================================
-- SQLite nao possui CREATE TYPE/ENUM. Os enums foram convertidos para
-- colunas TEXT com CHECK.
-- SQLite nao possui BIGSERIAL. As chaves primarias foram convertidas para
-- INTEGER PRIMARY KEY AUTOINCREMENT.
-- SQLite nao possui BOOLEAN real. Use 0 para falso e 1 para verdadeiro.
-- Datas e timestamps sao armazenados como TEXT com DEFAULT CURRENT_TIMESTAMP.

-- ============================================================
-- CADASTROS BASE
-- ============================================================

CREATE TABLE IF NOT EXISTS fornecedores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cnpj TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'ATIVO'
        CHECK (status IN ('ATIVO', 'INATIVO')),
    razao_social TEXT NOT NULL,
    nome_fantasia TEXT,
    inscricao_estadual TEXT,
    logradouro TEXT,
    numero TEXT,
    complemento TEXT,
    bairro TEXT,
    cidade TEXT,
    uf TEXT CHECK (uf IS NULL OR length(uf) = 2),
    cep TEXT,
    telefone TEXT,
    email TEXT,
    classificacao TEXT
        CHECK (classificacao IS NULL OR classificacao IN ('CRITICO', 'NAO_CRITICO')),
    data_desomologacao TEXT,
    responsavel_desomologacao INTEGER,
    descricao_desomologacao TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_fornecedores_desomologacao
        CHECK (
            status = 'ATIVO'
            OR (
                status = 'INATIVO'
                AND data_desomologacao IS NOT NULL
                AND descricao_desomologacao IS NOT NULL
            )
        ),
    FOREIGN KEY (responsavel_desomologacao) REFERENCES usuarios(id)
);

CREATE TABLE IF NOT EXISTS fornecedor_contatos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fornecedor_id INTEGER NOT NULL,
    nome TEXT NOT NULL,
    cargo TEXT,
    telefone TEXT,
    email TEXT,
    principal INTEGER NOT NULL DEFAULT 0 CHECK (principal IN (0, 1)),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (fornecedor_id) REFERENCES fornecedores(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS grupos_itens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL UNIQUE,
    ativo INTEGER NOT NULL DEFAULT 1 CHECK (ativo IN (0, 1)),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS itens_compra (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo TEXT NOT NULL UNIQUE,
    descricao TEXT NOT NULL,
    unidade TEXT,
    classificacao TEXT NOT NULL
        CHECK (classificacao IN ('CUSTO', 'DESPESA', 'INVESTIMENTO', 'PLR')),
    grupo_id INTEGER,
    controla_estoque INTEGER NOT NULL DEFAULT 0 CHECK (controla_estoque IN (0, 1)),
    ativo INTEGER NOT NULL DEFAULT 1 CHECK (ativo IN (0, 1)),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (grupo_id) REFERENCES grupos_itens(id)
);

-- ============================================================
-- SOLICITACAO
-- ============================================================

CREATE TABLE IF NOT EXISTS solicitacoes_compra (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    solicitante_id INTEGER NOT NULL,
    data_solicitacao TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status TEXT NOT NULL DEFAULT 'ABERTA'
        CHECK (
            status IN (
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
            )
        ),
    observacoes TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (solicitante_id) REFERENCES usuarios(id)
);

CREATE TABLE IF NOT EXISTS solicitacao_compra_itens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    solicitacao_id INTEGER NOT NULL,
    item_id INTEGER,
    descricao_necessidade TEXT NOT NULL,
    quantidade REAL NOT NULL CHECK (quantidade > 0),
    unidade_snapshot TEXT,
    link_referencia TEXT,
    observacoes TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_solicitacao_item_cadastrado_ou_manual
        CHECK (item_id IS NOT NULL OR descricao_necessidade IS NOT NULL),
    FOREIGN KEY (solicitacao_id) REFERENCES solicitacoes_compra(id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES itens_compra(id)
);

CREATE TABLE IF NOT EXISTS solicitacao_compra_anexos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    solicitacao_id INTEGER NOT NULL,
    nome_arquivo TEXT NOT NULL,
    caminho_arquivo TEXT NOT NULL,
    tipo_arquivo TEXT,
    uploaded_by INTEGER,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (solicitacao_id) REFERENCES solicitacoes_compra(id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES usuarios(id)
);

CREATE TABLE IF NOT EXISTS solicitacao_compra_aprovacoes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    solicitacao_id INTEGER NOT NULL,
    aprovador_id INTEGER NOT NULL,
    decisao TEXT NOT NULL CHECK (decisao IN ('APROVADO', 'REPROVADO')),
    observacao TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (solicitacao_id),
    FOREIGN KEY (solicitacao_id) REFERENCES solicitacoes_compra(id) ON DELETE CASCADE,
    FOREIGN KEY (aprovador_id) REFERENCES usuarios(id)
);

CREATE TABLE IF NOT EXISTS solicitacao_compra_historico (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    solicitacao_id INTEGER NOT NULL,
    usuario_id INTEGER,
    etapa TEXT NOT NULL,
    acao TEXT NOT NULL,
    status_anterior TEXT,
    status_novo TEXT,
    observacao TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (solicitacao_id) REFERENCES solicitacoes_compra(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- ============================================================
-- COTACAO
-- ============================================================

CREATE TABLE IF NOT EXISTS cotacoes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    solicitacao_id INTEGER NOT NULL,
    numero_rodada INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'ABERTA'
        CHECK (
            status IN (
                'ABERTA',
                'EM_ANDAMENTO',
                'EM_ANALISE',
                'APROVADA',
                'REPROVADA',
                'CANCELADA',
                'ENCERRADA'
            )
        ),
    criado_por INTEGER,
    data_abertura TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_encerramento TEXT,
    observacoes TEXT,
    UNIQUE (solicitacao_id, numero_rodada),
    FOREIGN KEY (solicitacao_id) REFERENCES solicitacoes_compra(id) ON DELETE CASCADE,
    FOREIGN KEY (criado_por) REFERENCES usuarios(id)
);

CREATE TABLE IF NOT EXISTS cotacao_fornecedores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cotacao_id INTEGER NOT NULL,
    fornecedor_id INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDENTE'
        CHECK (status IN ('PENDENTE', 'ENVIADO', 'RESPONDIDO', 'RECUSADO', 'SEM_RESPOSTA')),
    data_envio TEXT,
    data_resposta TEXT,
    prazo_entrega TEXT,
    forma_pagamento TEXT,
    observacoes TEXT,
    UNIQUE (cotacao_id, fornecedor_id),
    FOREIGN KEY (cotacao_id) REFERENCES cotacoes(id) ON DELETE CASCADE,
    FOREIGN KEY (fornecedor_id) REFERENCES fornecedores(id)
);

CREATE TABLE IF NOT EXISTS cotacao_fornecedor_itens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cotacao_fornecedor_id INTEGER NOT NULL,
    solicitacao_item_id INTEGER NOT NULL,
    status_item TEXT NOT NULL DEFAULT 'DISPONIVEL' CHECK (status_item IN ('DISPONIVEL', 'INDISPONIVEL')),
    quantidade REAL CHECK (quantidade IS NULL OR quantidade > 0),
    valor_unitario REAL CHECK (valor_unitario >= 0),
    valor_total REAL GENERATED ALWAYS AS (quantidade * valor_unitario) STORED,
    observacoes TEXT,
    CHECK (
        (status_item = 'DISPONIVEL' AND quantidade IS NOT NULL AND valor_unitario IS NOT NULL)
        OR
        (status_item = 'INDISPONIVEL' AND quantidade IS NULL AND valor_unitario IS NULL)
    ),
    UNIQUE (cotacao_fornecedor_id, solicitacao_item_id),
    FOREIGN KEY (cotacao_fornecedor_id) REFERENCES cotacao_fornecedores(id) ON DELETE CASCADE,
    FOREIGN KEY (solicitacao_item_id) REFERENCES solicitacao_compra_itens(id)
);

CREATE TABLE IF NOT EXISTS cotacao_fornecedor_anexos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cotacao_fornecedor_id INTEGER NOT NULL,
    nome_arquivo TEXT NOT NULL,
    caminho_arquivo TEXT NOT NULL,
    tipo_arquivo TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cotacao_fornecedor_id) REFERENCES cotacao_fornecedores(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS cotacao_aprovacoes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cotacao_id INTEGER NOT NULL,
    aprovador_id INTEGER NOT NULL,
    decisao TEXT NOT NULL CHECK (decisao IN ('APROVADO', 'REPROVADO')),
    observacao TEXT,
    data_decisao TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cotacao_id) REFERENCES cotacoes(id) ON DELETE CASCADE,
    FOREIGN KEY (aprovador_id) REFERENCES usuarios(id)
);

-- ============================================================
-- COMPRA
-- ============================================================

CREATE TABLE IF NOT EXISTS compras (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    solicitacao_id INTEGER NOT NULL,
    cotacao_id INTEGER,
    status TEXT NOT NULL DEFAULT 'EM_MONTAGEM'
        CHECK (status IN ('EM_MONTAGEM', 'AGUARDANDO_APROVACAO', 'APROVADA', 'CANCELADA')),
    criado_por INTEGER,
    data_compra TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    observacoes TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (solicitacao_id) REFERENCES solicitacoes_compra(id),
    FOREIGN KEY (cotacao_id) REFERENCES cotacoes(id),
    FOREIGN KEY (criado_por) REFERENCES usuarios(id)
);

CREATE TABLE IF NOT EXISTS compra_fornecedores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    compra_id INTEGER NOT NULL,
    fornecedor_id INTEGER NOT NULL,
    prazo_entrega TEXT,
    forma_pagamento TEXT,
    justificativa_texto TEXT,
    orcamento_anexo_id INTEGER,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (compra_id, fornecedor_id),
    FOREIGN KEY (compra_id) REFERENCES compras(id) ON DELETE CASCADE,
    FOREIGN KEY (fornecedor_id) REFERENCES fornecedores(id),
    FOREIGN KEY (orcamento_anexo_id) REFERENCES cotacao_fornecedor_anexos(id)
);

CREATE TABLE IF NOT EXISTS compra_fornecedor_itens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    compra_fornecedor_id INTEGER NOT NULL,
    solicitacao_item_id INTEGER NOT NULL,
    quantidade_pedida REAL NOT NULL CHECK (quantidade_pedida > 0),
    quantidade_recebida REAL NOT NULL DEFAULT 0 CHECK (quantidade_recebida >= 0),
    valor_unitario REAL NOT NULL CHECK (valor_unitario >= 0),
    valor_total REAL GENERATED ALWAYS AS (quantidade_pedida * valor_unitario) STORED,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_compra_item_recebido_limite
        CHECK (quantidade_recebida <= quantidade_pedida),
    UNIQUE (compra_fornecedor_id, solicitacao_item_id),
    FOREIGN KEY (compra_fornecedor_id) REFERENCES compra_fornecedores(id) ON DELETE CASCADE,
    FOREIGN KEY (solicitacao_item_id) REFERENCES solicitacao_compra_itens(id)
);

CREATE TABLE IF NOT EXISTS compra_fornecedor_justificativas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    compra_fornecedor_id INTEGER NOT NULL,
    justificativa TEXT NOT NULL
        CHECK (
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
    FOREIGN KEY (compra_fornecedor_id) REFERENCES compra_fornecedores(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS compra_aprovacoes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    compra_id INTEGER NOT NULL,
    aprovador_id INTEGER NOT NULL,
    decisao TEXT NOT NULL CHECK (decisao IN ('APROVADO', 'CANCELADA')),
    observacao TEXT,
    data_decisao TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (compra_id) REFERENCES compras(id) ON DELETE CASCADE,
    FOREIGN KEY (aprovador_id) REFERENCES usuarios(id)
);

-- ============================================================
-- ORDEM DE COMPRA
-- ============================================================

CREATE TABLE IF NOT EXISTS ordens_compra (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    numero_oc TEXT NOT NULL UNIQUE,
    compra_fornecedor_id INTEGER NOT NULL,
    data_emissao TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status TEXT NOT NULL DEFAULT 'GERADA'
        CHECK (
            status IN (
                'GERADA',
                'ENVIADA',
                'AGUARDANDO_RECEBIMENTO',
                'RECEBIDA_PARCIAL',
                'RECEBIDA_TOTAL',
                'CANCELADA'
            )
        ),
    pdf_caminho TEXT,
    enviada_em TEXT,
    enviado_para_email TEXT,
    observacoes TEXT,
    FOREIGN KEY (compra_fornecedor_id) REFERENCES compra_fornecedores(id)
);

-- ============================================================
-- INDICES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_fornecedor_contatos_fornecedor_id
    ON fornecedor_contatos(fornecedor_id);

CREATE INDEX IF NOT EXISTS idx_itens_compra_grupo_id
    ON itens_compra(grupo_id);

CREATE INDEX IF NOT EXISTS idx_solicitacoes_compra_solicitante_id
    ON solicitacoes_compra(solicitante_id);

CREATE INDEX IF NOT EXISTS idx_solicitacoes_compra_status
    ON solicitacoes_compra(status);

CREATE INDEX IF NOT EXISTS idx_solicitacao_compra_itens_solicitacao_id
    ON solicitacao_compra_itens(solicitacao_id);

CREATE INDEX IF NOT EXISTS idx_solicitacao_compra_historico_solicitacao_id
    ON solicitacao_compra_historico(solicitacao_id);

CREATE INDEX IF NOT EXISTS idx_cotacoes_solicitacao_id
    ON cotacoes(solicitacao_id);

CREATE INDEX IF NOT EXISTS idx_cotacao_fornecedores_cotacao_id
    ON cotacao_fornecedores(cotacao_id);

CREATE INDEX IF NOT EXISTS idx_cotacao_fornecedor_itens_cotacao_fornecedor_id
    ON cotacao_fornecedor_itens(cotacao_fornecedor_id);

CREATE INDEX IF NOT EXISTS idx_compras_solicitacao_id
    ON compras(solicitacao_id);

CREATE INDEX IF NOT EXISTS idx_compra_fornecedores_compra_id
    ON compra_fornecedores(compra_id);

CREATE INDEX IF NOT EXISTS idx_compra_fornecedor_itens_compra_fornecedor_id
    ON compra_fornecedor_itens(compra_fornecedor_id);

CREATE INDEX IF NOT EXISTS idx_ordens_compra_compra_fornecedor_id
    ON ordens_compra(compra_fornecedor_id);
