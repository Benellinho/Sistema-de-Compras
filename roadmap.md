# Roadmap — Sistema de Compras

# Objetivo

Desenvolver um sistema modular de compras com foco em:

* organização backend;
* modelagem relacional;
* APIs REST;
* arquitetura desacoplada;
* futura integração com ERP principal.

---

# FASE 1 — Estrutura Inicial do Projeto

## Objetivo

Criar a base técnica do sistema.

## Implementações

* Configuração Node.js
* Configuração Express
* Configuração SQLite
* Estrutura modular
* README
* .gitignore
* schema.sql
* Configuração de rotas

## Estrutura Inicial

```txt
src/
  db/
  modules/
  app.js
  server.js
```

## Funções Principais

* Inicialização do servidor
* Conexão com banco
* Carregamento de rotas

## Tabelas

Nenhuma regra de negócio ainda.

---

# FASE 2 — Cadastro de Fornecedores

## Objetivo

Permitir gerenciamento de fornecedores.

## Tabelas

### fornecedores

* id
* cnpj
* status
* razao_social
* nome_fantasia
* telefone
* email
* classificacao

### fornecedor_contatos

* id
* fornecedor_id
* nome
* cargo
* telefone
* email

## Endpoints

### Fornecedores

```http
GET /fornecedores
GET /fornecedores/:id
POST /fornecedores
PUT /fornecedores/:id
```

### Contatos

```http
POST /fornecedores/:id/contatos
```

## Funções

* Criar fornecedor
* Atualizar fornecedor
* Listar fornecedores
* Validar CNPJ duplicado
* Adicionar contatos

---

# FASE 3 — Cadastro de Grupos e Itens

## Objetivo

Cadastrar e organizar produtos e serviços através de grupos de classificação.

---

## Tabelas

### grupos_itens

- id
- nome
- ativo
- created_at
- updated_at

### itens_compra

- id
- codigo
- descricao
- unidade
- classificacao
- grupo_id
- controla_estoque
- ativo
- created_at
- updated_at

---

## Relacionamentos

```txt
GRUPOS_ITENS (1)
       │
       │
       ▼
ITENS_COMPRA (N)
```

Um grupo pode possuir vários itens.

---

## Endpoints de Grupo

### Listar grupos

```http
GET /grupos
```

### Buscar grupo

```http
GET /grupos/:id
```

### Criar grupo

```http
POST /grupos
```

### Atualizar grupo

```http
PUT /grupos/:id
```

### Ativar/Inativar grupo

```http
PATCH /grupos/:id/status
```

### Remover grupo

```http
DELETE /grupos/:id
```

---

## Endpoints de Itens

### Listar itens

```http
GET /itens
```

### Buscar item

```http
GET /itens/:id
```

### Criar item

```http
POST /itens
```

### Atualizar item

```http
PUT /itens/:id
```

### Ativar/Inativar item

```http
PATCH /itens/:id/status
```

### Remover item

```http
DELETE /itens/:id
```

---

## Regras de Negócio

### Grupo

- Nome deve ser único.
- Não permitir grupo duplicado.
- Grupo inativo não deve receber novos itens.
- Não excluir grupos que possuam itens vinculados.
- Permitir exclusão apenas de grupos sem itens vinculados.

### Item

- Código deve ser único.
- Descrição obrigatória.
- Classificação obrigatória.
- Grupo obrigatório.
- Não permitir item vinculado a grupo inexistente.
- Não permitir item em grupo inativo.
- Permitir ativação e inativação sem exclusão física.
- Permitir exclusão de item quando necessário.

---

## Validações

### Grupo

- Nome informado.
- Nome único.

### Item

- Código informado.
- Código único.
- Descrição informada.
- Grupo válido.
- Classificação válida.

---

## Testes

### Grupo

- Criar grupo.
- Atualizar grupo.
- Listar grupos.
- Buscar grupo.
- Validar nome duplicado.
- Ativar/Inativar grupo.
- Remover grupo.
- Bloquear remoção de grupo com itens vinculados.

### Item

- Criar item.
- Atualizar item.
- Listar itens.
- Buscar item.
- Validar código duplicado.
- Validar grupo inexistente.
- Validar grupo inativo.
- Ativar/Inativar item.
- Remover item.

---

## Resultado Esperado

Ao final desta fase o sistema deverá possuir:

- Cadastro de grupos.
- Cadastro de itens.
- Relacionamento entre grupos e itens.
- Validações básicas.
- CRUD completo para ambas as entidades.

---

# FASE 3.5 — Cadastro Básico de Usuários

## Objetivo

Criar uma base mínima de usuários para permitir vínculo com solicitações de compra.

---

## Tabela

### usuarios

- id
- nome
- email
- cargo
- ativo
- created_at
- updated_at

---

## Endpoints

```http
GET /usuarios
GET /usuarios/:id
POST /usuarios
PUT /usuarios/:id
DELETE /usuarios/:id
```

---

## Regras de Negócio

- Nome deve ser obrigatório.
- Email deve ser obrigatório.
- Email deve ser único.
- Usuário pode ser ativado/inativado pelo campo ativo.
- Não haverá autenticação ou senha nesta etapa.

---

## Testes

- Criar usuário.
- Atualizar usuário.
- Listar usuários.
- Buscar usuário.
- Validar email duplicado.
- Remover usuário.

---

## Resultado Esperado

Ao final desta etapa o sistema deverá possuir:

- CRUD mínimo de usuários.
- Base para uso de `solicitante_id` nas solicitações de compra.

# FASE 4 — Solicitações de Compra (MVP)

## Objetivo

Criar fluxo mínimo funcional para abertura, detalhamento e acompanhamento básico de solicitações de compra.

---

## Tabelas

### solicitacoes_compra

- id
- solicitante_id
- status
- observacoes
- created_at
- updated_at

### solicitacao_compra_itens

- id
- solicitacao_id
- item_id
- descricao_necessidade
- quantidade
- unidade_snapshot
- observacoes
- created_at

---

## Status do MVP

```txt
ABERTA
CANCELADA
FINALIZADA
```

Os demais status de aprovação, cotação, compra e ordem de compra ficam reservados para fases posteriores.

---

## Endpoints

### Listar solicitações

```http
GET /solicitacoes
```

### Visualizar detalhes da solicitação

```http
GET /solicitacoes/:id
```

Deve retornar o cabeçalho da solicitação com os itens vinculados.

### Criar solicitação

```http
POST /solicitacoes
```

Payload mínimo:

```json
{
  "solicitante_id": 1,
  "observacoes": "Compra para reposição"
}
```

### Alterar status

```http
PUT /solicitacoes/:id/status
```

Payload mínimo:

```json
{
  "status": "FINALIZADA"
}
```

### Adicionar item na solicitação

```http
POST /solicitacoes/:id/itens
```

Payload mínimo:

```json
{
  "item_id": 1,
  "descricao_necessidade": "Reposição de estoque",
  "quantidade": 10,
  "observacoes": "Uso no setor operacional"
}
```

### Remover item da solicitação

```http
DELETE /solicitacoes/:id/itens/:itemSolicitacaoId
```

---

## Regras de Negócio

### Solicitação

- Solicitante deve existir em `usuarios`.
- Solicitação deve iniciar com status `ABERTA`.
- Apenas status do MVP devem ser aceitos nesta fase.
- Solicitações `CANCELADA` ou `FINALIZADA` não devem receber novos itens.
- Solicitações `CANCELADA` ou `FINALIZADA` não devem permitir remoção de itens.
- Visualização de detalhes deve incluir os itens da solicitação.

### Itens da Solicitação

- Solicitação deve existir.
- Item de compra deve existir em `itens_compra`.
- Quantidade deve ser maior que zero.
- `descricao_necessidade` deve ser obrigatória.
- `unidade_snapshot` deve copiar a unidade atual do item no momento da inclusão.
- Remoção de item deve ser física no MVP.

---

## Validações

### Solicitação

- `solicitante_id` informado.
- `solicitante_id` válido.
- `status` válido ao alterar status.
- Não alterar status de solicitação inexistente.

### Item da Solicitação

- `item_id` informado.
- `item_id` válido.
- `quantidade` informada.
- `quantidade` maior que zero.
- `descricao_necessidade` informada.
- Não adicionar item em solicitação inexistente.
- Não adicionar item em solicitação encerrada.
- Não remover item de solicitação encerrada.

---

## Testes

### Solicitação

- Criar solicitação.
- Listar solicitações.
- Buscar detalhes da solicitação.
- Alterar status.
- Validar solicitante inexistente.
- Validar status inválido.

### Itens da Solicitação

- Adicionar item.
- Remover item.
- Validar item inexistente.
- Validar quantidade inválida.
- Validar descrição obrigatória.
- Bloquear adição de item em solicitação encerrada.
- Bloquear remoção de item em solicitação encerrada.

---

## Funções

- Criar solicitação.
- Adicionar itens.
- Remover itens.
- Alterar status.
- Listar solicitações.
- Visualizar detalhes com itens.

## Estrutura Recomendada

```txt
src/modules/solicitacoes/
  solicitacoes.controller.js
  solicitacoes.service.js
  solicitacoes.repository.js
  solicitacoes.routes.js
  itens/
    itens-solicitacao.controller.js
    itens-solicitacao.service.js
    itens-solicitacao.repository.js
    itens-solicitacao.routes.js
```

---

## Pendências Deliberadas Para Fases Futuras

- Aprovação de solicitações.
- Histórico de mudanças.
- Anexos.
- Cotação.
- Compra.
- Ordem de compra.

---

## Resultado Esperado

Primeira versão utilizável do fluxo de solicitação de compra, permitindo abrir uma solicitação, incluir itens, consultar detalhes e controlar status básico.

---

# FASE 5 — Aprovação de Solicitações

## Objetivo

Adicionar controle de aprovação.

## Tabelas

### solicitacao_compra_aprovacoes

* id
* solicitacao_id
* aprovador_id
* decisao
* observacao

### solicitacao_compra_historico

* id
* solicitacao_id
* usuario_id
* etapa
* acao
* status_anterior
* status_novo

## Endpoints

```http
POST /solicitacoes/:id/aprovacao
GET /solicitacoes/:id/historico
```

## Funções

* Aprovar solicitação
* Reprovar solicitação
* Registrar histórico
* Auditoria de alterações

---

# FASE 6 — Sistema de Cotações

## Objetivo

Permitir envio e análise de orçamentos.

## Tabelas

### cotacoes

* id
* solicitacao_id
* numero_rodada
* status

### cotacao_fornecedores

* id
* cotacao_id
* fornecedor_id
* status

### cotacao_fornecedor_itens

* id
* cotacao_fornecedor_id
* solicitacao_item_id
* quantidade
* valor_unitario

## Endpoints

```http
POST /cotacoes
POST /cotacoes/:id/fornecedores
POST /cotacoes/:id/respostas
GET /cotacoes/:id
```

## Funções

* Criar cotação
* Enviar para fornecedores
* Registrar valores
* Comparar orçamentos

---

# FASE 7 — Compras

## Objetivo

Transformar cotação aprovada em compra.

## Tabelas

### compras

* id
* solicitacao_id
* cotacao_id
* status

### compra_fornecedores

* id
* compra_id
* fornecedor_id
* prazo_entrega
* forma_pagamento

### compra_fornecedor_itens

* id
* compra_fornecedor_id
* solicitacao_item_id
* quantidade_pedida
* valor_unitario

## Endpoints

```http
POST /compras
POST /compras/:id/fornecedores
GET /compras/:id
```

## Funções

* Escolher fornecedor
* Dividir compra entre fornecedores
* Registrar justificativas
* Aprovação final

---

# FASE 8 — Ordem de Compra

## Objetivo

Gerar documento oficial de compra.

## Tabelas

### ordens_compra

* id
* numero_oc
* compra_fornecedor_id
* status
* pdf_caminho

## Endpoints

```http
POST /ordens-compra
GET /ordens-compra/:id/pdf
```

## Funções

* Gerar PDF
* Download da OC
* Histórico de envio
* Registro de envio ao fornecedor

---

# FASE 9 — Estoque

## Objetivo

Registrar recebimento dos itens.

## Implementações

* Recebimento parcial
* Recebimento total
* Entrada em estoque

## Funções

* Atualizar quantidade recebida
* Registrar movimentação
* Atualizar status da compra

---

# FASE 10 — Melhorias Futuras

## Possíveis Evoluções

* PostgreSQL
* JWT/Auth
* Controle de usuários
* Dashboard
* Upload de anexos
* E-mail automático
* WebSocket
* Logs centralizados
* Docker
* Testes automatizados
* CI/CD
* Deploy cloud

---

# Objetivo Final da Arquitetura

O sistema deverá:

* funcionar isoladamente;
* permitir integração futura;
* manter separação de responsabilidades;
* suportar crescimento modular;
* facilitar manutenção e testes.
