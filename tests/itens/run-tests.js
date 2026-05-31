import { getDatabase } from '../../src/db/connection.js';
import testCriarItem from './itens/criar-item.test.js';
import testListarItens from './itens/listar-itens.test.js';
import testValidarCodigoDuplicado from './itens/validar-codigo-duplicado.test.js';
import { printError, printGroup, printSuccess, printSummary } from '../helpers/testLogger.js';

const tests = [
  {
    group: 'ITENS',
    items: [
      ['criar item', testCriarItem],
      ['listar itens', testListarItens],
      ['validar codigo duplicado', testValidarCodigoDuplicado]
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
  printError('execucao dos testes de itens', error, { grupo: 'GERAL' });
  process.exitCode = 1;
});
