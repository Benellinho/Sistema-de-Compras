-- Base de testes/desenvolvimento para PostgreSQL.
-- Execute com psql a partir da raiz do backend:
-- psql "host=postgresql.uhserver.com port=5432 user=usersistem dbname=sistemacompra" -f scripts/postgres-test-base.sql
--
-- Atencao: este script apaga os dados das tabelas da aplicacao antes de inserir a base de exemplo.

\ir ../src/db/schema.postgres.sql

BEGIN;

TRUNCATE TABLE
  ordem_compra_envios,
  ordens_compra,
  compra_aprovacoes,
  compra_fornecedor_justificativas,
  compra_fornecedor_itens,
  compra_fornecedores,
  compras,
  cotacao_fornecedor_anexos,
  cotacao_fornecedor_itens,
  cotacao_fornecedores,
  cotacoes,
  solicitacao_compra_historico,
  solicitacao_compra_aprovacoes,
  solicitacao_compra_itens,
  solicitacoes_compra,
  itens_compra,
  grupos_itens,
  fornecedor_contatos,
  fornecedores,
  usuarios
RESTART IDENTITY CASCADE;

INSERT INTO usuarios (id, nome, email, cargo, ativo)
VALUES
  (1, 'Ana Solicitante', 'ana.solicitante@sistemacompras.local', 'Solicitante', 1),
  (2, 'Bruno Aprovador', 'bruno.aprovador@sistemacompras.local', 'Aprovador', 1),
  (3, 'Carla Compras', 'carla.compras@sistemacompras.local', 'Compras', 1)
ON CONFLICT (id) DO UPDATE SET
  nome = EXCLUDED.nome,
  email = EXCLUDED.email,
  cargo = EXCLUDED.cargo,
  ativo = EXCLUDED.ativo,
  updated_at = CURRENT_TIMESTAMP;

INSERT INTO fornecedores (id, cnpj, status, razao_social, nome_fantasia, telefone, email)
VALUES
  (1, '11222333000181', 'ATIVO', 'Alpha Suprimentos Industriais Ltda', 'Alpha Suprimentos', '(11) 3000-1000', 'vendas@alpha.local'),
  (2, '22333444000192', 'ATIVO', 'Beta Pecas e Manutencao Ltda', 'Beta Pecas', '(11) 3000-2000', 'orcamentos@beta.local'),
  (3, '33444555000103', 'ATIVO', 'Gamma Tecnologia Ltda', 'Gamma Tech', '(11) 3000-3000', 'comercial@gamma.local')
ON CONFLICT (id) DO UPDATE SET
  cnpj = EXCLUDED.cnpj,
  status = EXCLUDED.status,
  razao_social = EXCLUDED.razao_social,
  nome_fantasia = EXCLUDED.nome_fantasia,
  telefone = EXCLUDED.telefone,
  email = EXCLUDED.email;

INSERT INTO fornecedor_contatos (id, fornecedor_id, nome, cargo, telefone, email)
VALUES
  (1, 1, 'Marina Alpha', 'Vendas', '(11) 98888-1000', 'marina@alpha.local'),
  (2, 2, 'Paulo Beta', 'Comercial', '(11) 98888-2000', 'paulo@beta.local'),
  (3, 3, 'Renata Gamma', 'Contas corporativas', '(11) 98888-3000', 'renata@gamma.local')
ON CONFLICT (id) DO UPDATE SET
  fornecedor_id = EXCLUDED.fornecedor_id,
  nome = EXCLUDED.nome,
  cargo = EXCLUDED.cargo,
  telefone = EXCLUDED.telefone,
  email = EXCLUDED.email;

INSERT INTO grupos_itens (id, nome, codigo, ultimo_sequencial, ativo)
VALUES
  (1, 'Manutencao industrial', 'MAN', 2, 1),
  (2, 'Tecnologia', 'TEC', 1, 1),
  (3, 'Escritorio', 'ESC', 0, 1)
ON CONFLICT (id) DO UPDATE SET
  nome = EXCLUDED.nome,
  codigo = EXCLUDED.codigo,
  ultimo_sequencial = EXCLUDED.ultimo_sequencial,
  ativo = EXCLUDED.ativo,
  updated_at = CURRENT_TIMESTAMP;

INSERT INTO itens_compra (
  id,
  codigo,
  sequencial,
  descricao,
  unidade,
  classificacao,
  grupo_id,
  controla_estoque,
  ativo
)
VALUES
  (1, 'MAN - 001', 1, 'Rolamento 6203 blindado', 'UN', 'CUSTO', 1, 1, 1),
  (2, 'MAN - 002', 2, 'Oleo hidraulico ISO VG 68', 'L', 'CUSTO', 1, 1, 1),
  (3, 'TEC - 001', 1, 'Notebook corporativo Intel i5 16GB RAM', 'UN', 'INVESTIMENTO', 2, 0, 1)
ON CONFLICT (id) DO UPDATE SET
  codigo = EXCLUDED.codigo,
  sequencial = EXCLUDED.sequencial,
  descricao = EXCLUDED.descricao,
  unidade = EXCLUDED.unidade,
  classificacao = EXCLUDED.classificacao,
  grupo_id = EXCLUDED.grupo_id,
  controla_estoque = EXCLUDED.controla_estoque,
  ativo = EXCLUDED.ativo,
  updated_at = CURRENT_TIMESTAMP;

INSERT INTO solicitacoes_compra (id, solicitante_id, status, observacoes)
VALUES
  (1, 1, 'APROVADA', 'Reposicao de materiais para manutencao preventiva.'),
  (2, 1, 'EM_ANALISE_COTACAO', 'Compra de notebook para novo colaborador.')
ON CONFLICT (id) DO UPDATE SET
  solicitante_id = EXCLUDED.solicitante_id,
  status = EXCLUDED.status,
  observacoes = EXCLUDED.observacoes,
  updated_at = CURRENT_TIMESTAMP;

INSERT INTO solicitacao_compra_itens (
  id,
  solicitacao_id,
  item_id,
  descricao_necessidade,
  quantidade,
  unidade_snapshot,
  observacoes
)
VALUES
  (1, 1, 1, 'Rolamentos para manutencao das esteiras', 20, 'UN', 'Uso na linha de producao A.'),
  (2, 1, 2, 'Oleo hidraulico para manutencao preventiva', 60, 'L', 'Tambor ou fracionado.'),
  (3, 2, 3, 'Notebook para area administrativa', 1, 'UN', 'Preferencia por garantia de 3 anos.')
ON CONFLICT (id) DO UPDATE SET
  solicitacao_id = EXCLUDED.solicitacao_id,
  item_id = EXCLUDED.item_id,
  descricao_necessidade = EXCLUDED.descricao_necessidade,
  quantidade = EXCLUDED.quantidade,
  unidade_snapshot = EXCLUDED.unidade_snapshot,
  observacoes = EXCLUDED.observacoes;

INSERT INTO solicitacao_compra_aprovacoes (id, solicitacao_id, aprovador_id, decisao, observacao)
VALUES
  (1, 1, 2, 'APROVADO', 'Solicitacao aprovada para cotacao.')
ON CONFLICT (id) DO UPDATE SET
  solicitacao_id = EXCLUDED.solicitacao_id,
  aprovador_id = EXCLUDED.aprovador_id,
  decisao = EXCLUDED.decisao,
  observacao = EXCLUDED.observacao;

INSERT INTO cotacoes (id, solicitacao_id, numero_rodada, status, criado_por, observacoes)
VALUES
  (1, 1, 1, 'EM_ANALISE', 3, 'Cotacao inicial para manutencao.'),
  (2, 2, 1, 'ABERTA', 3, 'Cotacao de notebook aberta.')
ON CONFLICT (id) DO UPDATE SET
  solicitacao_id = EXCLUDED.solicitacao_id,
  numero_rodada = EXCLUDED.numero_rodada,
  status = EXCLUDED.status,
  criado_por = EXCLUDED.criado_por,
  observacoes = EXCLUDED.observacoes;

INSERT INTO cotacao_fornecedores (
  id,
  cotacao_id,
  fornecedor_id,
  status,
  data_envio,
  data_resposta,
  prazo_entrega,
  forma_pagamento,
  observacoes
)
VALUES
  (1, 1, 1, 'RESPONDIDO', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, '5 dias uteis', '28 dias', 'Fornecedor respondeu todos os itens.'),
  (2, 1, 2, 'RESPONDIDO', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, '3 dias uteis', '21 dias', 'Menor prazo de entrega.'),
  (3, 2, 3, 'PENDENTE', CURRENT_TIMESTAMP, NULL, NULL, NULL, 'Aguardando retorno do fornecedor.')
ON CONFLICT (id) DO UPDATE SET
  cotacao_id = EXCLUDED.cotacao_id,
  fornecedor_id = EXCLUDED.fornecedor_id,
  status = EXCLUDED.status,
  data_envio = EXCLUDED.data_envio,
  data_resposta = EXCLUDED.data_resposta,
  prazo_entrega = EXCLUDED.prazo_entrega,
  forma_pagamento = EXCLUDED.forma_pagamento,
  observacoes = EXCLUDED.observacoes;

INSERT INTO cotacao_fornecedor_itens (
  id,
  cotacao_fornecedor_id,
  solicitacao_item_id,
  status_item,
  quantidade,
  valor_unitario,
  observacoes
)
VALUES
  (1, 1, 1, 'DISPONIVEL', 20, 18.50, 'Marca SKF.'),
  (2, 1, 2, 'DISPONIVEL', 60, 31.90, 'Entrega em embalagem lacrada.'),
  (3, 2, 1, 'DISPONIVEL', 20, 17.80, 'Marca equivalente homologada.'),
  (4, 2, 2, 'DISPONIVEL', 60, 34.20, 'Disponivel em estoque.'),
  (5, 3, 3, 'INDISPONIVEL', NULL, NULL, 'Aguardando disponibilidade.')
ON CONFLICT (id) DO UPDATE SET
  cotacao_fornecedor_id = EXCLUDED.cotacao_fornecedor_id,
  solicitacao_item_id = EXCLUDED.solicitacao_item_id,
  status_item = EXCLUDED.status_item,
  quantidade = EXCLUDED.quantidade,
  valor_unitario = EXCLUDED.valor_unitario,
  observacoes = EXCLUDED.observacoes;

INSERT INTO compras (id, solicitacao_id, cotacao_id, status, criado_por, observacoes)
VALUES
  (1, 1, 1, 'EM_MONTAGEM', 3, 'Compra criada para comparacao e escolha de fornecedores.')
ON CONFLICT (id) DO UPDATE SET
  solicitacao_id = EXCLUDED.solicitacao_id,
  cotacao_id = EXCLUDED.cotacao_id,
  status = EXCLUDED.status,
  criado_por = EXCLUDED.criado_por,
  observacoes = EXCLUDED.observacoes,
  updated_at = CURRENT_TIMESTAMP;

INSERT INTO compra_fornecedores (
  id,
  compra_id,
  fornecedor_id,
  prazo_entrega,
  forma_pagamento,
  justificativa_texto
)
VALUES
  (1, 1, 2, '3 dias uteis', '21 dias', 'Fornecedor escolhido pelo menor prazo com preco competitivo.')
ON CONFLICT (id) DO UPDATE SET
  compra_id = EXCLUDED.compra_id,
  fornecedor_id = EXCLUDED.fornecedor_id,
  prazo_entrega = EXCLUDED.prazo_entrega,
  forma_pagamento = EXCLUDED.forma_pagamento,
  justificativa_texto = EXCLUDED.justificativa_texto;

INSERT INTO compra_fornecedor_justificativas (id, compra_fornecedor_id, justificativa)
VALUES
  (1, 1, 'PRAZO'),
  (2, 1, 'MENOR_PRECO')
ON CONFLICT (id) DO UPDATE SET
  compra_fornecedor_id = EXCLUDED.compra_fornecedor_id,
  justificativa = EXCLUDED.justificativa;

INSERT INTO compra_fornecedor_itens (
  id,
  compra_fornecedor_id,
  solicitacao_item_id,
  quantidade_pedida,
  valor_unitario
)
VALUES
  (1, 1, 1, 20, 17.80),
  (2, 1, 2, 60, 34.20)
ON CONFLICT (id) DO UPDATE SET
  compra_fornecedor_id = EXCLUDED.compra_fornecedor_id,
  solicitacao_item_id = EXCLUDED.solicitacao_item_id,
  quantidade_pedida = EXCLUDED.quantidade_pedida,
  valor_unitario = EXCLUDED.valor_unitario;

INSERT INTO solicitacao_compra_historico (
  id,
  solicitacao_id,
  usuario_id,
  etapa,
  acao,
  status_anterior,
  status_novo,
  observacao
)
VALUES
  (1, 1, 1, 'SOLICITACAO', 'CRIACAO_SOLICITACAO', NULL, 'ABERTA', 'Solicitacao criada para base de testes.'),
  (2, 1, 2, 'APROVACAO', 'APROVACAO_SOLICITACAO', 'ABERTA', 'APROVADA', 'Solicitacao aprovada.'),
  (3, 1, 3, 'COTACAO', 'CRIACAO_COTACAO', 'APROVADA', 'EM_COTACAO', 'Cotacao criada.'),
  (4, 1, 3, 'COMPRA', 'CRIACAO_COMPRA', 'EM_ANALISE_COTACAO', 'EM_ESCOLHA_FORNECEDOR', 'Compra criada para base de testes.'),
  (5, 2, 1, 'SOLICITACAO', 'CRIACAO_SOLICITACAO', NULL, 'ABERTA', 'Solicitacao de notebook criada.')
ON CONFLICT (id) DO UPDATE SET
  solicitacao_id = EXCLUDED.solicitacao_id,
  usuario_id = EXCLUDED.usuario_id,
  etapa = EXCLUDED.etapa,
  acao = EXCLUDED.acao,
  status_anterior = EXCLUDED.status_anterior,
  status_novo = EXCLUDED.status_novo,
  observacao = EXCLUDED.observacao;

SELECT setval(pg_get_serial_sequence('usuarios', 'id'), COALESCE((SELECT MAX(id) FROM usuarios), 1), true);
SELECT setval(pg_get_serial_sequence('fornecedores', 'id'), COALESCE((SELECT MAX(id) FROM fornecedores), 1), true);
SELECT setval(pg_get_serial_sequence('fornecedor_contatos', 'id'), COALESCE((SELECT MAX(id) FROM fornecedor_contatos), 1), true);
SELECT setval(pg_get_serial_sequence('grupos_itens', 'id'), COALESCE((SELECT MAX(id) FROM grupos_itens), 1), true);
SELECT setval(pg_get_serial_sequence('itens_compra', 'id'), COALESCE((SELECT MAX(id) FROM itens_compra), 1), true);
SELECT setval(pg_get_serial_sequence('solicitacoes_compra', 'id'), COALESCE((SELECT MAX(id) FROM solicitacoes_compra), 1), true);
SELECT setval(pg_get_serial_sequence('solicitacao_compra_itens', 'id'), COALESCE((SELECT MAX(id) FROM solicitacao_compra_itens), 1), true);
SELECT setval(pg_get_serial_sequence('solicitacao_compra_aprovacoes', 'id'), COALESCE((SELECT MAX(id) FROM solicitacao_compra_aprovacoes), 1), true);
SELECT setval(pg_get_serial_sequence('solicitacao_compra_historico', 'id'), COALESCE((SELECT MAX(id) FROM solicitacao_compra_historico), 1), true);
SELECT setval(pg_get_serial_sequence('cotacoes', 'id'), COALESCE((SELECT MAX(id) FROM cotacoes), 1), true);
SELECT setval(pg_get_serial_sequence('cotacao_fornecedores', 'id'), COALESCE((SELECT MAX(id) FROM cotacao_fornecedores), 1), true);
SELECT setval(pg_get_serial_sequence('cotacao_fornecedor_itens', 'id'), COALESCE((SELECT MAX(id) FROM cotacao_fornecedor_itens), 1), true);
SELECT setval(pg_get_serial_sequence('compras', 'id'), COALESCE((SELECT MAX(id) FROM compras), 1), true);
SELECT setval(pg_get_serial_sequence('compra_fornecedores', 'id'), COALESCE((SELECT MAX(id) FROM compra_fornecedores), 1), true);
SELECT setval(pg_get_serial_sequence('compra_fornecedor_justificativas', 'id'), COALESCE((SELECT MAX(id) FROM compra_fornecedor_justificativas), 1), true);
SELECT setval(pg_get_serial_sequence('compra_fornecedor_itens', 'id'), COALESCE((SELECT MAX(id) FROM compra_fornecedor_itens), 1), true);

COMMIT;
