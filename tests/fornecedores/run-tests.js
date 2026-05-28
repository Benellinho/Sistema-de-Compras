import { getDatabase } from '../../src/db/connection.js';
import testAtualizarFornecedor from './atualizar-fornecedor.test.js';
import testCriarFornecedor from './criar-fornecedor.test.js';
import testListarFornecedores from './listar-fornecedores.test.js';
import testValidarCnpjDuplicado from './validar-cnpj-duplicado.test.js';
import testAtualizarContato from './contatos/atualizar-contato.test.js';
import testBuscarContato from './contatos/buscar-contato.test.js';
import testCriarContato from './contatos/criar-contato.test.js';
import testListarContatos from './contatos/listar-contatos.test.js';
import testRemoverContato from './contatos/remover-contato.test.js';
import { printError, printGroup, printSuccess, printSummary } from '../helpers/testLogger.js';

const tests = [
  {
    group: 'FORNECEDORES',
    items: [
      ['criar fornecedor', testCriarFornecedor],
      ['atualizar fornecedor', testAtualizarFornecedor],
      ['listar fornecedores', testListarFornecedores],
      ['validar CNPJ duplicado', testValidarCnpjDuplicado]
    ]
  },
  {
    group: 'CONTATOS DE FORNECEDOR',
    items: [
      ['criar contato', testCriarContato],
      ['listar contatos', testListarContatos],
      ['buscar contato', testBuscarContato],
      ['atualizar contato', testAtualizarContato],
      ['remover contato', testRemoverContato]
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
  printError('execucao dos testes de fornecedores', error, { grupo: 'GERAL' });
  process.exitCode = 1;
});
