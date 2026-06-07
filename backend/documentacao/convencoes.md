# Convenções de Commit e Versionamento

# Prefixos de Commit

## feat

Nova funcionalidade.

```txt
feat: adicionar cadastro de fornecedores
```

---

## fix

Correção de bug.

```txt
fix: corrigir validação de quantidade
```

---

## refactor

Reorganização interna sem alterar comportamento.

```txt
refactor: separar validações do service
```

---

## chore

Configuração, manutenção ou infraestrutura.

```txt
chore: configurar sqlite
```

---

## docs

Documentação.

```txt
docs: atualizar roadmap
```

---

## test

Adição ou alteração de testes.

```txt
test: adicionar testes de fornecedores
```

---

## style

Alterações visuais/formatação sem mudar lógica.

```txt
style: padronizar indentação
```

---

# Estrutura Recomendada

```txt
tipo: descrição curta
```

Exemplo:

```txt
feat: implementar criação de solicitações
```

---

# Versionamento Semântico (SemVer)

Formato:

```txt
MAJOR.MINOR.PATCH
```

Exemplo:

```txt
1.4.2
```

---

# PATCH

```txt
1.0.0 -> 1.0.1
```

Correções pequenas sem alterar funcionalidades.

Exemplos:

* corrigir bug;
* ajuste de validação;
* correção SQL.

---

# MINOR

```txt
1.0.0 -> 1.1.0
```

Nova funcionalidade compatível.

Exemplos:

* novo endpoint;
* módulo de fornecedores;
* geração de PDF.

---

# MAJOR

```txt
1.0.0 -> 2.0.0
```

Mudanças incompatíveis ou grandes refatorações.

Exemplos:

* alteração de arquitetura;
* quebra de API;
* mudança estrutural importante.

---

# Exemplos Práticos

## Início do projeto

```txt
0.1.0
```

---

## MVP funcional

```txt
1.0.0
```

---

## Adicionou cotações

```txt
1.1.0
```

---

## Corrigiu bug de aprovação

```txt
1.1.1
```

---

# Recomendações

* Fazer commits pequenos e organizados.
* Separar refatoração de novas funcionalidades.
* Não misturar correções com reorganizações.
* Sempre escrever mensagens claras.
* Evitar commits genéricos:

```txt
teste
ajustes
update
aaa
```

---

# Fluxo Recomendado

```txt
chore -> feat -> refactor -> test -> docs
```
