export function printGroup(title) {
  console.log(title);
}

export function printSuccess(testName) {
  console.log(`✓ ${testName}`);
}

export function printError(testName, error, context = {}) {
  console.error(`✗ ${testName}`);
  console.error(`Erro: ${error.message}`);

  if ('expected' in error) {
    console.error('Esperado:');
    console.table([{ valor: error.expected }]);
  }

  if ('actual' in error) {
    console.error('Recebido:');
    console.table([{ valor: error.actual }]);
  }

  console.error('Contexto:');
  console.table([context]);

  if (error.stack) {
    console.error(error.stack);
  }
}

export function printSummary(total, passed, failed) {
  console.log('');
  console.log('Resultado:');

  if (failed > 0) {
    console.log(`${passed}/${total} testes passaram, ${failed} falharam`);
    return;
  }

  console.log(`${passed}/${total} testes passaram`);
}
