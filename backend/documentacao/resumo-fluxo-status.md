# Resumo do Fluxo e Status

Este documento resume o fluxo principal do sistema de compras e os status previstos para cada etapa.

---

# Fluxo do Processo

```txt
Cadastro base
  -> Solicitação de compra
  -> Aprovação da solicitação
  -> Cotação com fornecedores
  -> Análise da cotação
  -> Compra
  -> Aprovação da compra
  -> Ordem de compra
  -> PDF e envio da OC
```

---

# Etapas

## 1. Cadastro base

Antes de iniciar o fluxo de compra, o sistema precisa ter:

- fornecedores cadastrados;
- usuários cadastrados;
- grupos de itens cadastrados;
- itens de compra cadastrados.

## 2. Solicitação de compra

O usuário abre uma solicitação e informa os itens necessários.

Status principais:

```txt
ABERTA
CANCELADA
FINALIZADA
```

Status adicionados com aprovação, cotação, compra e ordem de compra:

```txt
APROVADA
REPROVADA
EM_COTACAO
EM_ANALISE_COTACAO
COTACAO_REPROVADA
COTACAO_APROVADA
EM_ESCOLHA_FORNECEDOR
AGUARDANDO_APROVACAO_COMPRA
COMPRA_APROVADA
OC_GERADA
OC_ENVIADA
```

Status reservados para recebimento/estoque futuro:

```txt
AGUARDANDO_RECEBIMENTO
RECEBIDA_PARCIAL
RECEBIDA_TOTAL
```

## 3. Aprovação da solicitação

Um aprovador decide se a solicitação pode seguir para cotação.

Decisões:

```txt
APROVADO
REPROVADO
```

Resultado esperado:

- `APROVADA`: segue para cotação.
- `REPROVADA`: não segue no fluxo.

## 4. Cotação

A cotação é criada a partir de uma solicitação aprovada. Fornecedores são vinculados e podem enviar valores por item.

Se uma rodada de cotação for reprovada, a solicitação deve ficar com status `COTACAO_REPROVADA`. Esse status indica que a solicitação continua válida, mas precisa de uma nova rodada de cotação.

Status da cotação:

```txt
ABERTA
EM_ANDAMENTO
EM_ANALISE
APROVADA
REPROVADA
CANCELADA
ENCERRADA
```

Status do fornecedor na cotação:

```txt
PENDENTE
ENVIADO
RESPONDIDO
RECUSADO
SEM_RESPOSTA
```

## 5. Análise da cotação

O sistema compara os valores recebidos por item e fornecedor.

Nesta etapa o sistema deve mostrar:

- menor valor por item;
- total por fornecedor;
- itens sem resposta;
- prazo de entrega;
- forma de pagamento;
- observações do fornecedor.

## 6. Compra

A compra nasce a partir da cotação analisada e registra a escolha de fornecedores e itens.

Status da compra:

```txt
EM_MONTAGEM
AGUARDANDO_APROVACAO
APROVADA
CANCELADA
```

Justificativas previstas para escolha:

```txt
MENOR_PRECO
PRAZO
PECA_ORIGINAL
GARANTIA
QUALIDADE
DISPONIBILIDADE
OUTRO
```

## 7. Aprovação da compra

Um aprovador valida a compra antes da geração da ordem de compra.

Decisões:

```txt
APROVADO
CANCELADA
```

## 8. Ordem de compra

Após aprovação da compra, o sistema permite gerar a ordem de compra por rota explícita.

A geração não é automática nesta fase. A automação da geração e do envio depende de confirmação futura com o cliente.

Status da ordem de compra:

```txt
GERADA
CANCELADA
SUBSTITUIDA
```

Controle esperado:

- uma OC por fornecedor da compra;
- bloqueio de OC ativa duplicada;
- cancelamento de OC;
- geração de OC substituta após cancelamento;
- resumo de OCs geradas, pendentes, canceladas e substituídas por compra.

## 9. PDF e envio da OC

A fase seguinte fica dedicada à geração do PDF e ao envio da OC ao contato do fornecedor.

Resultados previstos:

- PDF gerado;
- PDF disponível para download;
- OC enviada ao contato do fornecedor;
- tentativa de envio registrada em histórico próprio.

## 10. Recebimento e estoque futuro

Recebimento, entrada em estoque e quantidades recebidas saíram do planejamento imediato e ficam reservados para fase futura, se confirmados.

Status reservados:

```txt
AGUARDANDO_RECEBIMENTO
RECEBIDA_PARCIAL
RECEBIDA_TOTAL
```

---

# Resumo Visual dos Status

```txt
Solicitação:
ABERTA -> APROVADA -> EM_COTACAO -> EM_ANALISE_COTACAO -> COTACAO_APROVADA

Cotação:
ABERTA -> EM_ANDAMENTO -> EM_ANALISE -> ENCERRADA

Compra:
EM_MONTAGEM -> AGUARDANDO_APROVACAO -> APROVADA

Ordem de compra:
GERADA

PDF e envio:
PDF_GERADO -> ENVIADA
```

Fluxos alternativos:

```txt
Solicitação:
ABERTA -> REPROVADA
ABERTA -> CANCELADA

Cotação:
ABERTA -> CANCELADA
EM_ANALISE -> REPROVADA

Solicitação após cotação reprovada:
EM_COTACAO -> COTACAO_REPROVADA -> EM_COTACAO

Compra:
AGUARDANDO_APROVACAO -> APROVADA
EM_MONTAGEM -> CANCELADA

Ordem de compra:
GERADA -> CANCELADA
CANCELADA -> SUBSTITUIDA -> GERADA
```
