# Sistema de Compras

Sistema de gestão de compras desenvolvido para controlar solicitações, cotações, aprovação de compras e geração de ordens de compra.

O projeto foi criado de forma desacoplada do ERP principal para permitir desenvolvimento independente, testes locais e utilização como portfólio técnico. Inicialmente utiliza SQLite local, mas foi estruturado para futura migração para PostgreSQL sem grandes alterações na arquitetura.

---

# Objetivo

O sistema tem como foco organizar o fluxo de compras da empresa:

- Solicitação de materiais
- Aprovação de solicitações
- Solicitação de orçamentos
- Análise de fornecedores
- Escolha de fornecedores
- Aprovação de compra
- Geração de Ordem de Compra
- Registro futuro no estoque

---

# Tecnologias

- Node.js
- Express
- SQLite
- JavaScript ESModules
- Nodemon

---

# Estrutura do Projeto

```txt
src/
  db/
    connection.js
    schema.sql

  modules/
    fornecedores/
      fornecedores.routes.js
      fornecedores.controller.js
      fornecedores.service.js
      fornecedores.repository.js

    itens/
      itens.routes.js
      itens.controller.js
      itens.service.js
      itens.repository.js

    solicitacoes/
      solicitacoes.routes.js
      solicitacoes.controller.js
      solicitacoes.service.js
      solicitacoes.repository.js

  app.js
  server.js
```

---

# Arquitetura

O projeto utiliza separação por camadas:

## Routes
Responsáveis por definir os endpoints da API.

## Controllers
Recebem as requisições HTTP e retornam as respostas.

## Services
Contêm as regras de negócio e validações.

## Repositories
Executam SQL diretamente no banco de dados.

## DB
Responsável pela conexão e estrutura do banco.

---

# Banco de Dados

Inicialmente o sistema utiliza SQLite local para facilitar:

- desenvolvimento
- testes
- portabilidade
- demonstração em portfólio

O acesso ao banco foi isolado para permitir futura migração para PostgreSQL.

---

# Entidades Iniciais

## Fornecedores
Cadastro de fornecedores homologados.

## Itens de Compra
Produtos e serviços disponíveis para solicitação.

## Solicitações
Pedidos realizados pelos usuários.

## Solicitação de Itens
Itens vinculados a uma solicitação.

---

# Fluxo Inicial

```txt
Solicitação
    ↓
Análise/Aprovação
    ↓
Cotação
    ↓
Escolha de fornecedor
    ↓
Aprovação da compra
    ↓
Geração da Ordem de Compra
```

---

# Como Executar

## Instalar dependências

```bash
npm install
```

## Executar em desenvolvimento

```bash
npm run dev
```

## Executar em produção

```bash
npm start
```

---

# Endpoints Iniciais

## Fornecedores

```http
GET /fornecedores
POST /fornecedores
```

## Itens

```http
GET /itens
POST /itens
```

## Solicitações

```http
GET /solicitacoes
POST /solicitacoes
```

---

# Objetivos Futuros

- Sistema de cotações
- Aprovação multinível
- Upload de anexos
- Geração automática de PDF
- Histórico de alterações
- Controle de estoque
- Integração com ERP principal
- Migração para PostgreSQL
- Autenticação de usuários
- Dashboard gerencial

---

# Motivação do Projeto

Este projeto foi desenvolvido como estudo prático de:

- arquitetura backend
- separação de responsabilidades
- modelagem de banco de dados
- fluxos empresariais reais
- construção de APIs REST
- organização modular de sistemas

Além disso, o sistema busca simular um ambiente corporativo real de compras e suprimentos.