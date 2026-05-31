import { getDatabase } from '../../src/db/connection.js';
import testAdicionarItemSolicitacao from './itens/adicionar-item-solicitacao.test.js';
import testRemoverItemSolicitacao from './itens/remover-item-solicitacao.test.js';
import testAtualizarStatusSolicitacao from './solicitacoes/atualizar-status-solicitacao.test.js';
import testBuscarSolicitacao from './solicitacoes/buscar-solicitacao.test.js';
import testCriarSolicitacao from './solicitacoes/criar-solicitacao.test.js';
import testListarSolicitacoes from './solicitacoes/listar-solicitacoes.test.js';
import { printError, printGroup, printSuccess, printSummary } from '../helpers/testLogger.js';

const tests = [
  {
    group: 'SOLICITACOES',
    items: [
      ['criar solicitacao', testCriarSolicitacao],
      ['listar solicitacoes', testListarSolicitacoes],
      ['buscar solicitacao', testBuscarSolicitacao],
      ['atualizar status solicitacao', testAtualizarStatusSolicitacao]
    ]
  },
  {
    group: 'ITENS DA SOLICITACAO',
    items: [
      ['adicionar item solicitacao', testAdicionarItemSolicitacao],
      ['remover item solicitacao', testRemoverItemSolicitacao]
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
