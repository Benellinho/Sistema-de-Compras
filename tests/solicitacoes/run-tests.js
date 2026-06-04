import { getDatabase } from '../../src/db/connection.js';
import testAprovarSolicitacao from './aprovacoes/aprovar-solicitacao.test.js';
import testBloquearAprovadorInativo from './aprovacoes/bloquear-aprovador-inativo.test.js';
import testBloquearAprovacaoSemItens from './aprovacoes/bloquear-aprovacao-sem-itens.test.js';
import testBloquearReprovacaoSemObservacao from './aprovacoes/bloquear-reprovacao-sem-observacao.test.js';
import testBloquearSegundaDecisao from './aprovacoes/bloquear-segunda-decisao.test.js';
import testReprovarSolicitacao from './aprovacoes/reprovar-solicitacao.test.js';
import testAdicionarItemSolicitacao from './itens/adicionar-item-solicitacao.test.js';
import testBloquearAdicaoItemSolicitacaoEncerrada from './itens/bloquear-adicao-item-solicitacao-encerrada.test.js';
import testBloquearRemocaoItemSolicitacaoEncerrada from './itens/bloquear-remocao-item-solicitacao-encerrada.test.js';
import testRemoverItemSolicitacao from './itens/remover-item-solicitacao.test.js';
import testValidarDescricaoObrigatoria from './itens/validar-descricao-obrigatoria.test.js';
import testValidarItemInexistente from './itens/validar-item-inexistente.test.js';
import testValidarQuantidadeInvalida from './itens/validar-quantidade-invalida.test.js';
import testAtualizarStatusSolicitacao from './solicitacoes/atualizar-status-solicitacao.test.js';
import testBuscarSolicitacao from './solicitacoes/buscar-solicitacao.test.js';
import testCriarSolicitacao from './solicitacoes/criar-solicitacao.test.js';
import testListarSolicitacoes from './solicitacoes/listar-solicitacoes.test.js';
import testValidarSolicitanteInexistente from './solicitacoes/validar-solicitante-inexistente.test.js';
import testValidarStatusInvalido from './solicitacoes/validar-status-invalido.test.js';
import { printError, printGroup, printSuccess, printSummary } from '../helpers/testLogger.js';

const tests = [
  {
    group: 'SOLICITACOES',
    items: [
      ['criar solicitacao', testCriarSolicitacao],
      ['listar solicitacoes', testListarSolicitacoes],
      ['buscar solicitacao', testBuscarSolicitacao],
      ['atualizar status solicitacao', testAtualizarStatusSolicitacao],
      ['validar solicitante inexistente', testValidarSolicitanteInexistente],
      ['validar status invalido', testValidarStatusInvalido]
    ]
  },
  {
    group: 'ITENS DA SOLICITACAO',
    items: [
      ['adicionar item solicitacao', testAdicionarItemSolicitacao],
      ['remover item solicitacao', testRemoverItemSolicitacao],
      ['validar item inexistente', testValidarItemInexistente],
      ['validar quantidade invalida', testValidarQuantidadeInvalida],
      ['validar descricao obrigatoria', testValidarDescricaoObrigatoria],
      ['bloquear adicao item solicitacao encerrada', testBloquearAdicaoItemSolicitacaoEncerrada],
      ['bloquear remocao item solicitacao encerrada', testBloquearRemocaoItemSolicitacaoEncerrada]
    ]
  },
  {
    group: 'APROVACOES',
    items: [
      ['aprovar solicitacao', testAprovarSolicitacao],
      ['reprovar solicitacao', testReprovarSolicitacao],
      ['bloquear aprovador inativo', testBloquearAprovadorInativo],
      ['bloquear aprovacao sem itens', testBloquearAprovacaoSemItens],
      ['bloquear reprovacao sem observacao', testBloquearReprovacaoSemObservacao],
      ['bloquear segunda decisao', testBloquearSegundaDecisao]
    ]
  }
];

async function main() {
  let passed = 0;
  const total = tests.reduce((sum, group) => sum + group.items.length, 0);

  for (const [groupIndex, { group, items }] of tests.entries()) {
    if (groupIndex > 0) {
      console.log('');
    }

    printGroup(group);

    for (const [name, test] of items) {
      try {
        await test();
        passed += 1;
        printSuccess(name);
      } catch (error) {
        printError(name, error, { grupo: group, teste: name });
        printSummary(total, passed, total - passed);
        process.exitCode = 1;
        return;
      }
    }
  }

  const database = await getDatabase();
  await database.close();

  printSummary(total, passed, total - passed);
}

main().catch((error) => {
  printError('execucao dos testes de solicitacoes', error, { grupo: 'GERAL' });
  process.exitCode = 1;
});
