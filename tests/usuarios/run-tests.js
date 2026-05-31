import { getDatabase } from '../../src/db/connection.js';
import testAtualizarUsuario from './usuarios/atualizar-usuario.test.js';
import testBuscarUsuario from './usuarios/buscar-usuario.test.js';
import testCriarUsuario from './usuarios/criar-usuario.test.js';
import testListarUsuarios from './usuarios/listar-usuarios.test.js';
import testRemoverUsuario from './usuarios/remover-usuario.test.js';
import testValidarEmailDuplicado from './usuarios/validar-email-duplicado.test.js';
import { printError, printGroup, printSuccess, printSummary } from '../helpers/testLogger.js';

const tests = [
  {
    group: 'USUARIOS',
    items: [
      ['criar usuario', testCriarUsuario],
      ['listar usuarios', testListarUsuarios],
      ['buscar usuario', testBuscarUsuario],
      ['atualizar usuario', testAtualizarUsuario],
      ['validar email duplicado', testValidarEmailDuplicado],
      ['remover usuario', testRemoverUsuario]
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
  printError('execucao dos testes de usuarios', error, { grupo: 'GERAL' });
  process.exitCode = 1;
});
