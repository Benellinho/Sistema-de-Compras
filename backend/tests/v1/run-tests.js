import { getDatabase } from '../../src/db/connection.js';
import { printError, printGroup, printSuccess, printSummary } from '../helpers/testLogger.js';
import testFluxoCompletoV1 from './fluxo-completo-v1.test.js';

const tests = [
  {
    group: 'V1.0',
    items: [
      ['fluxo completo com dados ficticios', testFluxoCompletoV1]
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
  printError('execucao dos testes da V1.0', error, { grupo: 'GERAL' });
  process.exitCode = 1;
});
