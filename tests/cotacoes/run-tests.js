import { getDatabase } from '../../src/db/connection.js';
import { printError, printGroup, printSuccess, printSummary } from '../helpers/testLogger.js';
import testBloquearFornecedorDuplicado from './cotacoes/bloquear-fornecedor-duplicado.test.js';
import testBloquearQuantidadeMaior from './cotacoes/bloquear-quantidade-maior.test.js';
import testBloquearSolicitacaoNaoAprovada from './cotacoes/bloquear-solicitacao-nao-aprovada.test.js';
import testFluxoCotacao from './cotacoes/fluxo-cotacao.test.js';

const tests = [
  {
    group: 'COTACOES',
    items: [
      ['fluxo cotacao', testFluxoCotacao],
      ['bloquear solicitacao nao aprovada', testBloquearSolicitacaoNaoAprovada],
      ['bloquear fornecedor duplicado', testBloquearFornecedorDuplicado],
      ['bloquear quantidade maior', testBloquearQuantidadeMaior]
    ]
  }
];

async function main() {
  let passed = 0;
  const total = tests.reduce((sum, group) => sum + group.items.length, 0);

  for (const { group, items } of tests) {
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
  printError('execucao dos testes de cotacoes', error, { grupo: 'GERAL' });
  process.exitCode = 1;
});
