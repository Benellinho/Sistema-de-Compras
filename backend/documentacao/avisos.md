# Avisos

## Aprovador fixo no prototipo

Durante o periodo de teste, a tela de aprovacao de cotacao nao exibe o campo "Usuario aprovador".
O frontend usa automaticamente o primeiro usuario ativo carregado da base para registrar aceite ou recusa.

Quando houver autenticacao/usuario ativo na aplicacao, esse valor deve vir da sessao do usuario logado.
