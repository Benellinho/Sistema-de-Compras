# Resumo dos Testes

Este documento resume os arquivos de teste do projeto, indicando o caminho, a função principal e o tipo de cobertura.

Legenda:

- **Banco**: valida schema, constraints, relacionamentos ou persistência SQLite.
- **Regra de negócio**: valida service, regras de fluxo e mensagens de erro.
- **Endpoint**: valida rota HTTP diretamente. Atualmente os testes chamam services/repositories; não há suíte HTTP com `supertest` ou cliente similar.
- **Runner/helper**: organiza execução ou cria fixtures.

---

# Banco

| Arquivo | Função | Cobertura |
|---|---|---|
| `tests/db/test-db-connection.js` | Inicializa o banco, valida conexão SQLite, `foreign_keys`, tabelas e colunas principais. | Banco |

---

# Fornecedores

## Runner e helpers

| Arquivo | Função | Cobertura |
|---|---|---|
| `tests/fornecedores/run-tests.js` | Executa todos os testes de fornecedores e contatos. | Runner/helper |
| `tests/fornecedores/helpers/test-utils.js` | Cria payloads, fixtures e limpeza dos dados de fornecedores/contatos. | Runner/helper |

## Cadastro de fornecedores

| Arquivo | Função | Cobertura |
|---|---|---|
| `tests/fornecedores/fornecedores/criar-fornecedor.test.js` | Testa criação de fornecedor com dados obrigatórios e persistência. | Regra de negócio, Banco |
| `tests/fornecedores/fornecedores/atualizar-fornecedor.test.js` | Testa atualização de dados do fornecedor existente. | Regra de negócio, Banco |
| `tests/fornecedores/fornecedores/listar-fornecedores.test.js` | Testa listagem de fornecedores cadastrados. | Regra de negócio, Banco |
| `tests/fornecedores/fornecedores/validar-cnpj-duplicado.test.js` | Testa bloqueio de fornecedor com CNPJ duplicado. | Regra de negócio, Banco |

## Contatos de fornecedores

| Arquivo | Função | Cobertura |
|---|---|---|
| `tests/fornecedores/contatos/criar-contato.test.js` | Testa criação de contato vinculado a fornecedor. | Regra de negócio, Banco |
| `tests/fornecedores/contatos/listar-contatos.test.js` | Testa listagem de contatos por fornecedor. | Regra de negócio, Banco |
| `tests/fornecedores/contatos/buscar-contato.test.js` | Testa busca de contato específico. | Regra de negócio, Banco |
| `tests/fornecedores/contatos/atualizar-contato.test.js` | Testa atualização dos dados do contato. | Regra de negócio, Banco |
| `tests/fornecedores/contatos/remover-contato.test.js` | Testa remoção de contato do fornecedor. | Regra de negócio, Banco |

---

# Usuários

## Runner e helpers

| Arquivo | Função | Cobertura |
|---|---|---|
| `tests/usuarios/run-tests.js` | Executa todos os testes de usuários. | Runner/helper |
| `tests/usuarios/helpers/test-utils.js` | Cria payloads, fixtures e limpeza dos dados de usuários. | Runner/helper |

## Cadastro de usuários

| Arquivo | Função | Cobertura |
|---|---|---|
| `tests/usuarios/usuarios/criar-usuario.test.js` | Testa criação de usuário com dados obrigatórios. | Regra de negócio, Banco |
| `tests/usuarios/usuarios/listar-usuarios.test.js` | Testa listagem de usuários cadastrados. | Regra de negócio, Banco |
| `tests/usuarios/usuarios/buscar-usuario.test.js` | Testa busca de usuário por ID. | Regra de negócio, Banco |
| `tests/usuarios/usuarios/atualizar-usuario.test.js` | Testa atualização de usuário. | Regra de negócio, Banco |
| `tests/usuarios/usuarios/remover-usuario.test.js` | Testa remoção de usuário. | Regra de negócio, Banco |
| `tests/usuarios/usuarios/validar-email-duplicado.test.js` | Testa bloqueio de email duplicado. | Regra de negócio, Banco |

---

# Grupos e Itens

## Runner e helpers

| Arquivo | Função | Cobertura |
|---|---|---|
| `tests/itens/run-tests.js` | Executa todos os testes de grupos e itens. | Runner/helper |
| `tests/itens/helpers/test-utils.js` | Cria payloads, fixtures e limpeza dos dados de grupos/itens. | Runner/helper |

## Grupos

| Arquivo | Função | Cobertura |
|---|---|---|
| `tests/itens/grupos/criar-grupo.test.js` | Testa criação de grupo de itens. | Regra de negócio, Banco |
| `tests/itens/grupos/listar-grupos.test.js` | Testa listagem de grupos. | Regra de negócio, Banco |
| `tests/itens/grupos/buscar-grupo.test.js` | Testa busca de grupo por ID. | Regra de negócio, Banco |
| `tests/itens/grupos/atualizar-grupo.test.js` | Testa atualização de grupo. | Regra de negócio, Banco |
| `tests/itens/grupos/atualizar-status-grupo.test.js` | Testa ativação/inativação de grupo. | Regra de negócio, Banco |
| `tests/itens/grupos/remover-grupo.test.js` | Testa remoção de grupo sem itens vinculados. | Regra de negócio, Banco |
| `tests/itens/grupos/validar-grupo-duplicado.test.js` | Testa bloqueio de nome de grupo duplicado. | Regra de negócio, Banco |
| `tests/itens/grupos/bloquear-remocao-grupo-com-itens.test.js` | Testa bloqueio de remoção de grupo com item vinculado. | Regra de negócio, Banco |

## Itens

| Arquivo | Função | Cobertura |
|---|---|---|
| `tests/itens/itens/criar-item.test.js` | Testa criação de item vinculado a grupo ativo. | Regra de negócio, Banco |
| `tests/itens/itens/listar-itens.test.js` | Testa listagem de itens. | Regra de negócio, Banco |
| `tests/itens/itens/buscar-item.test.js` | Testa busca de item por ID. | Regra de negócio, Banco |
| `tests/itens/itens/atualizar-item.test.js` | Testa atualização de item. | Regra de negócio, Banco |
| `tests/itens/itens/atualizar-status-item.test.js` | Testa ativação/inativação de item. | Regra de negócio, Banco |
| `tests/itens/itens/remover-item.test.js` | Testa remoção de item. | Regra de negócio, Banco |
| `tests/itens/itens/validar-codigo-duplicado.test.js` | Testa bloqueio de código de item duplicado. | Regra de negócio, Banco |
| `tests/itens/itens/validar-grupo-inexistente.test.js` | Testa bloqueio de item vinculado a grupo inexistente. | Regra de negócio, Banco |
| `tests/itens/itens/validar-grupo-inativo.test.js` | Testa bloqueio de item vinculado a grupo inativo. | Regra de negócio, Banco |

---

# Solicitações

## Runner e helpers

| Arquivo | Função | Cobertura |
|---|---|---|
| `tests/solicitacoes/run-tests.js` | Executa todos os testes de solicitações, itens e aprovações. | Runner/helper |
| `tests/solicitacoes/helpers/test-utils.js` | Cria fixtures de usuário, grupo, item e solicitação; também faz limpeza dos dados. | Runner/helper |

## Solicitações

| Arquivo | Função | Cobertura |
|---|---|---|
| `tests/solicitacoes/solicitacoes/criar-solicitacao.test.js` | Testa criação de solicitação com solicitante válido. | Regra de negócio, Banco |
| `tests/solicitacoes/solicitacoes/listar-solicitacoes.test.js` | Testa listagem de solicitações. | Regra de negócio, Banco |
| `tests/solicitacoes/solicitacoes/buscar-solicitacao.test.js` | Testa busca de solicitação com seus dados. | Regra de negócio, Banco |
| `tests/solicitacoes/solicitacoes/atualizar-status-solicitacao.test.js` | Testa alteração de status da solicitação. | Regra de negócio, Banco |
| `tests/solicitacoes/solicitacoes/validar-solicitante-inexistente.test.js` | Testa bloqueio de criação com solicitante inexistente. | Regra de negócio, Banco |
| `tests/solicitacoes/solicitacoes/validar-status-invalido.test.js` | Testa bloqueio de status inválido na solicitação. | Regra de negócio |

## Itens da solicitação

| Arquivo | Função | Cobertura |
|---|---|---|
| `tests/solicitacoes/itens/adicionar-item-solicitacao.test.js` | Testa inclusão de item em solicitação aberta, incluindo `unidade_snapshot`. | Regra de negócio, Banco |
| `tests/solicitacoes/itens/remover-item-solicitacao.test.js` | Testa remoção física de item da solicitação. | Regra de negócio, Banco |
| `tests/solicitacoes/itens/validar-item-inexistente.test.js` | Testa bloqueio de item de compra inexistente. | Regra de negócio, Banco |
| `tests/solicitacoes/itens/validar-quantidade-invalida.test.js` | Testa bloqueio de quantidade inválida. | Regra de negócio, Banco |
| `tests/solicitacoes/itens/validar-descricao-obrigatoria.test.js` | Testa obrigatoriedade da descrição da necessidade. | Regra de negócio |
| `tests/solicitacoes/itens/bloquear-adicao-item-solicitacao-encerrada.test.js` | Testa bloqueio de adição em solicitação cancelada/finalizada. | Regra de negócio |
| `tests/solicitacoes/itens/bloquear-remocao-item-solicitacao-encerrada.test.js` | Testa bloqueio de remoção em solicitação cancelada/finalizada. | Regra de negócio |

## Aprovações

| Arquivo | Função | Cobertura |
|---|---|---|
| `tests/solicitacoes/aprovacoes/aprovar-solicitacao.test.js` | Testa aprovação, mudança para `APROVADA` e registro de histórico. | Regra de negócio, Banco |
| `tests/solicitacoes/aprovacoes/reprovar-solicitacao.test.js` | Testa reprovação, mudança para `REPROVADA`, observação e histórico. | Regra de negócio, Banco |
| `tests/solicitacoes/aprovacoes/bloquear-aprovacao-sem-itens.test.js` | Testa bloqueio de aprovação quando a solicitação não tem itens. | Regra de negócio |
| `tests/solicitacoes/aprovacoes/bloquear-aprovador-inativo.test.js` | Testa bloqueio de decisão por aprovador inativo. | Regra de negócio, Banco |
| `tests/solicitacoes/aprovacoes/bloquear-reprovacao-sem-observacao.test.js` | Testa obrigatoriedade de observação ao reprovar. | Regra de negócio |
| `tests/solicitacoes/aprovacoes/bloquear-segunda-decisao.test.js` | Testa bloqueio de segunda decisão na mesma solicitação. | Regra de negócio, Banco |

---

# Cotações

## Runner e helpers

| Arquivo | Função | Cobertura |
|---|---|---|
| `tests/cotacoes/run-tests.js` | Executa todos os testes de cotações. | Runner/helper |
| `tests/cotacoes/helpers/test-utils.js` | Cria fixtures de solicitação aprovada, item de solicitação e fornecedor. | Runner/helper |

## Fluxo de cotação

| Arquivo | Função | Cobertura |
|---|---|---|
| `tests/cotacoes/cotacoes/fluxo-cotacao.test.js` | Testa fluxo principal: criar cotação para solicitação aprovada, adicionar fornecedor, marcar envio, registrar resposta parcial, iniciar análise manualmente e gerar comparativo. | Regra de negócio, Banco |
| `tests/cotacoes/cotacoes/listar-cotacoes-filtradas.test.js` | Testa listagem de cotações com filtros por status e solicitação. | Regra de negócio, Banco |
| `tests/cotacoes/cotacoes/buscar-detalhes-cotacao.test.js` | Testa busca detalhada da cotação com fornecedores e itens respondidos. | Regra de negócio, Banco |
| `tests/cotacoes/cotacoes/bloquear-solicitacao-nao-aprovada.test.js` | Testa bloqueio de cotação para solicitação que ainda não foi aprovada. | Regra de negócio |
| `tests/cotacoes/cotacoes/bloquear-solicitacao-reprovada.test.js` | Testa bloqueio de cotação para solicitação reprovada na aprovação. | Regra de negócio |
| `tests/cotacoes/cotacoes/bloquear-solicitacao-aprovada-sem-itens.test.js` | Testa bloqueio de cotação para solicitação aprovada sem itens. | Regra de negócio |
| `tests/cotacoes/cotacoes/bloquear-fornecedor-duplicado.test.js` | Testa bloqueio de fornecedor duplicado na mesma cotação. | Regra de negócio, Banco |
| `tests/cotacoes/cotacoes/bloquear-fornecedor-inexistente.test.js` | Testa bloqueio de fornecedor inexistente na cotação. | Regra de negócio |
| `tests/cotacoes/cotacoes/bloquear-quantidade-maior.test.js` | Testa bloqueio de quantidade cotada maior que a quantidade solicitada. | Regra de negócio |
| `tests/cotacoes/cotacoes/bloquear-item-fora-da-solicitacao.test.js` | Testa bloqueio de resposta para item que não pertence à solicitação da cotação. | Regra de negócio |
| `tests/cotacoes/cotacoes/bloquear-valor-negativo.test.js` | Testa bloqueio de valor unitário negativo. | Regra de negócio |
| `tests/cotacoes/cotacoes/bloquear-resposta-cotacao-encerrada.test.js` | Testa bloqueio de resposta em cotação cancelada ou encerrada. | Regra de negócio |
| `tests/cotacoes/cotacoes/permitir-nova-rodada-cotacao-reprovada.test.js` | Testa nova rodada quando a cotação anterior foi reprovada e a solicitação ficou `COTACAO_REPROVADA`. | Regra de negócio, Banco |
| `tests/cotacoes/cotacoes/registrar-fornecedor-sem-valores.test.js` | Testa registro de fornecedor como `RECUSADO` e `SEM_RESPOSTA` sem exigir valores por item. | Regra de negócio, Banco |
| `tests/cotacoes/cotacoes/registrar-historico-status-final.test.js` | Testa ações específicas de histórico para cancelamento e encerramento da cotação. | Regra de negócio, Banco |
| `tests/cotacoes/cotacoes/registrar-item-indisponivel.test.js` | Testa item indisponível com `valor_unitario = null`, fora do menor preço e do total do fornecedor. | Regra de negócio, Banco |

---

# Compras

## Runner e helpers

| Arquivo | Função | Cobertura |
|---|---|---|
| `tests/compras/run-tests.js` | Executa todos os testes de compras. | Runner/helper |
| `tests/compras/helpers/test-utils.js` | Cria fixtures de cotação aprovada com fornecedor respondido para montagem da compra. | Runner/helper |

## Fluxo de compra

| Arquivo | Função | Cobertura |
|---|---|---|
| `tests/compras/compras/criar-compra.test.js` | Testa criação de compra a partir de cotação aprovada. | Regra de negócio, Banco |
| `tests/compras/compras/bloquear-criacao-invalida.test.js` | Testa bloqueio de compra sem cotação e com cotação inexistente. | Regra de negócio |
| `tests/compras/compras/bloquear-cotacao-nao-aprovada.test.js` | Testa bloqueio de compra quando a cotação ainda não está aprovada. | Regra de negócio |
| `tests/compras/compras/bloquear-segunda-compra.test.js` | Testa bloqueio de segunda compra para a mesma cotação. | Regra de negócio, Banco |
| `tests/compras/compras/bloquear-fornecedor-fora-cotacao.test.js` | Testa bloqueio de fornecedor que não participou da cotação da compra. | Regra de negócio |
| `tests/compras/compras/bloquear-item-fora-da-solicitacao.test.js` | Testa bloqueio de item que não pertence à solicitação da compra. | Regra de negócio |
| `tests/compras/compras/bloquear-item-indisponivel.test.js` | Testa bloqueio de compra de item marcado como indisponível na cotação. | Regra de negócio, Banco |
| `tests/compras/compras/validar-justificativas.test.js` | Testa `OUTRO` sem texto complementar e justificativa duplicada. | Regra de negócio |
| `tests/compras/compras/sinalizar-inconsistencia-quantidade.test.js` | Testa compra dividida entre fornecedores e sinalização de `inconsistencia_quantidade` quando a quantidade comprada ultrapassa a solicitada. | Regra de negócio, Banco |
| `tests/compras/compras/bloquear-aprovacao-compra-vazia.test.js` | Testa bloqueio de envio para aprovação quando a compra não tem fornecedor/item. | Regra de negócio |
| `tests/compras/compras/aprovar-compra.test.js` | Testa envio para aprovação e aprovação final da compra completa. | Regra de negócio, Banco |
| `tests/compras/compras/cancelar-compra.test.js` | Testa cancelamento de compra com observação obrigatória por imprevisto operacional/fornecedor. | Regra de negócio, Banco |
| `tests/compras/compras/bloquear-segunda-decisao.test.js` | Testa bloqueio de nova decisão após aprovação final da compra. | Regra de negócio, Banco |
| `tests/compras/compras/nao-gerar-ordem-compra.test.js` | Testa que a aprovação da compra não gera ordem de compra na Fase 7. | Regra de negócio, Banco |

---

# Ordens de Compra

## Runner e helpers

| Arquivo | Função | Cobertura |
|---|---|---|
| `tests/ordens-compra/run-tests.js` | Executa todos os testes de ordens de compra. | Runner/helper |
| `tests/ordens-compra/helpers/test-utils.js` | Cria fixtures de compra aprovada com fornecedores e itens para geração de OC. | Runner/helper |

## Fluxo de ordem de compra

| Arquivo | Função | Cobertura |
|---|---|---|
| `tests/ordens-compra/ordens-compra/criar-ordem-compra.test.js` | Testa geração explícita de OC para fornecedor de compra aprovada e atualização da solicitação para `OC_GERADA`. | Regra de negócio, Banco |
| `tests/ordens-compra/ordens-compra/bloquear-compra-nao-aprovada.test.js` | Testa bloqueio de OC para compra que ainda não foi aprovada. | Regra de negócio |
| `tests/ordens-compra/ordens-compra/bloquear-fornecedor-sem-itens.test.js` | Testa bloqueio de OC para fornecedor da compra sem itens comprados. | Regra de negócio |
| `tests/ordens-compra/ordens-compra/bloquear-ordem-duplicada.test.js` | Testa bloqueio de segunda OC ativa para o mesmo fornecedor da compra. | Regra de negócio, Banco |
| `tests/ordens-compra/ordens-compra/cancelar-ordem-compra.test.js` | Testa cancelamento de OC e retorno da solicitação para `COMPRA_APROVADA` quando fica sem OCs ativas. | Regra de negócio, Banco |
| `tests/ordens-compra/ordens-compra/gerar-ordem-substituta.test.js` | Testa geração de OC substituta após cancelamento e marca a OC anterior como `SUBSTITUIDA`. | Regra de negócio, Banco |
| `tests/ordens-compra/ordens-compra/listar-ordens-por-compra.test.js` | Testa listagem de OCs filtradas por compra. | Regra de negócio, Banco |
| `tests/ordens-compra/ordens-compra/resumir-ordens-da-compra.test.js` | Testa resumo granular de OCs geradas e pendentes por compra com múltiplos fornecedores. | Regra de negócio, Banco |

---

# Infraestrutura de teste

| Arquivo | Função | Cobertura |
|---|---|---|
| `tests/helpers/testLogger.js` | Padroniza saída dos testes no console. | Runner/helper |

---

# Observação Sobre Endpoints

Os testes atuais validam o comportamento chamando diretamente services e repositories. Isso cobre bem regra de negócio e persistência, mas não valida diretamente:

- roteamento Express;
- status HTTP;
- formato final de resposta dos controllers;
- serialização de erros da API.

Para cobrir endpoints, o próximo passo seria criar testes HTTP para rotas como:

```txt
POST /solicitacoes
POST /solicitacoes/:id/itens
POST /solicitacoes/:id/aprovacao
POST /cotacoes
PATCH /cotacoes/:id/status
GET /cotacoes/:id/comparativo
POST /ordens-compra
PATCH /ordens-compra/:id/cancelamento
POST /ordens-compra/:id/substituta
GET /compras/:id/ordens-compra-resumo
```
