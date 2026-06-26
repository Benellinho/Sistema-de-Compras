import { getDatabase } from '../../src/db/connection.js';
import { printError, printGroup, printSuccess, printSummary } from '../helpers/testLogger.js';
import testAprovarCotacaoPorItens from './compras/aprovar-cotacao-por-itens.test.js';
import testAprovarCompra from './compras/aprovar-compra.test.js';
import testBloquearAprovacaoCompraVazia from './compras/bloquear-aprovacao-compra-vazia.test.js';
import testBloquearCotacaoNaoAprovada from './compras/bloquear-cotacao-nao-aprovada.test.js';
import testBloquearCriacaoInvalida from './compras/bloquear-criacao-invalida.test.js';
import testBloquearFornecedorForaCotacao from './compras/bloquear-fornecedor-fora-cotacao.test.js';
import testBloquearItemForaDaSolicitacao from './compras/bloquear-item-fora-da-solicitacao.test.js';
import testBloquearItemIndisponivel from './compras/bloquear-item-indisponivel.test.js';
import testBloquearSegundaCompra from './compras/bloquear-segunda-compra.test.js';
import testBloquearSegundaDecisao from './compras/bloquear-segunda-decisao.test.js';
import testCancelarCompra from './compras/cancelar-compra.test.js';
import testCriarCompra from './compras/criar-compra.test.js';
import testNaoGerarOrdemCompra from './compras/nao-gerar-ordem-compra.test.js';
import testSinalizarInconsistenciaQuantidade from './compras/sinalizar-inconsistencia-quantidade.test.js';
import testValidarJustificativas from './compras/validar-justificativas.test.js';

const tests = [
  {
    group: 'COMPRAS',
    items: [
      ['criar compra', testCriarCompra],
      ['bloquear criacao invalida', testBloquearCriacaoInvalida],
      ['bloquear cotacao nao aprovada', testBloquearCotacaoNaoAprovada],
      ['bloquear segunda compra', testBloquearSegundaCompra],
      ['bloquear fornecedor fora da cotacao', testBloquearFornecedorForaCotacao],
      ['bloquear item fora da solicitacao', testBloquearItemForaDaSolicitacao],
      ['bloquear item indisponivel', testBloquearItemIndisponivel],
      ['validar justificativas', testValidarJustificativas],
      ['sinalizar inconsistencia quantidade', testSinalizarInconsistenciaQuantidade],
      ['aprovar cotacao por itens', testAprovarCotacaoPorItens],
      ['bloquear aprovacao compra vazia', testBloquearAprovacaoCompraVazia],
      ['aprovar compra', testAprovarCompra],
      ['cancelar compra', testCancelarCompra],
      ['bloquear segunda decisao', testBloquearSegundaDecisao],
      ['nao gerar ordem de compra', testNaoGerarOrdemCompra]
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
  printError('execucao dos testes de compras', error, { grupo: 'GERAL' });
  process.exitCode = 1;
});
