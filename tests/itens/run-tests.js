import { getDatabase } from '../../src/db/connection.js';
import testAtualizarGrupo from './grupos/atualizar-grupo.test.js';
import testAtualizarStatusGrupo from './grupos/atualizar-status-grupo.test.js';
import testBuscarGrupo from './grupos/buscar-grupo.test.js';
import testCriarGrupo from './grupos/criar-grupo.test.js';
import testListarGrupos from './grupos/listar-grupos.test.js';
import testValidarGrupoDuplicado from './grupos/validar-grupo-duplicado.test.js';
import testAtualizarItem from './itens/atualizar-item.test.js';
import testAtualizarStatusItem from './itens/atualizar-status-item.test.js';
import testBuscarItem from './itens/buscar-item.test.js';
import testCriarItem from './itens/criar-item.test.js';
import testListarItens from './itens/listar-itens.test.js';
import testValidarCodigoDuplicado from './itens/validar-codigo-duplicado.test.js';
import testValidarGrupoInativo from './itens/validar-grupo-inativo.test.js';
import testValidarGrupoInexistente from './itens/validar-grupo-inexistente.test.js';
import { printError, printGroup, printSuccess, printSummary } from '../helpers/testLogger.js';

const tests = [
  {
    group: 'GRUPOS DE ITENS',
    items: [
      ['criar grupo', testCriarGrupo],
      ['listar grupos', testListarGrupos],
      ['buscar grupo', testBuscarGrupo],
      ['atualizar grupo', testAtualizarGrupo],
      ['validar grupo duplicado', testValidarGrupoDuplicado],
      ['atualizar status grupo', testAtualizarStatusGrupo]
    ]
  },
  {
    group: 'ITENS',
    items: [
      ['criar item', testCriarItem],
      ['listar itens', testListarItens],
      ['buscar item', testBuscarItem],
      ['atualizar item', testAtualizarItem],
      ['validar codigo duplicado', testValidarCodigoDuplicado],
      ['validar grupo inexistente', testValidarGrupoInexistente],
      ['validar grupo inativo', testValidarGrupoInativo],
      ['atualizar status item', testAtualizarStatusItem]
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
