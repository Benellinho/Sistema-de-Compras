import { getDatabase } from '../../src/db/connection.js';
import { printError, printGroup, printSuccess, printSummary } from '../helpers/testLogger.js';
import testBaixarPdfContentType from './ordens-compra/baixar-pdf-content-type.test.js';
import testBloquearCompraNaoAprovada from './ordens-compra/bloquear-compra-nao-aprovada.test.js';
import testBloquearContatoForaFornecedor from './ordens-compra/bloquear-contato-fora-fornecedor.test.js';
import testBloquearContatoSemEmail from './ordens-compra/bloquear-contato-sem-email.test.js';
import testBloquearEnvioOcCancelada from './ordens-compra/bloquear-envio-oc-cancelada.test.js';
import testBloquearEnvioOcSubstituida from './ordens-compra/bloquear-envio-oc-substituida.test.js';
import testBloquearFornecedorSemItens from './ordens-compra/bloquear-fornecedor-sem-itens.test.js';
import testBloquearOrdemDuplicada from './ordens-compra/bloquear-ordem-duplicada.test.js';
import testBloquearPdfOrdemInexistente from './ordens-compra/bloquear-pdf-ordem-inexistente.test.js';
import testCancelarOrdemCompra from './ordens-compra/cancelar-ordem-compra.test.js';
import testCriarOrdemCompra from './ordens-compra/criar-ordem-compra.test.js';
import testEnviarOrdemContato from './ordens-compra/enviar-ordem-contato.test.js';
import testEnviarOrdemLocalwebSmtpProvider from './ordens-compra/enviar-ordem-localweb-smtp-provider.test.js';
import testGerarPdfHtml from './ordens-compra/gerar-pdf-html.test.js';
import testGerarOrdemSubstituta from './ordens-compra/gerar-ordem-substituta.test.js';
import testListarOrdensPorCompra from './ordens-compra/listar-ordens-por-compra.test.js';
import testManterStatusEnvioParcial from './ordens-compra/manter-status-envio-parcial.test.js';
import testRegistrarFalhaEnvio from './ordens-compra/registrar-falha-envio.test.js';
import testResumirOrdensDaCompra from './ordens-compra/resumir-ordens-da-compra.test.js';
import testSalvarPdfReal from './ordens-compra/salvar-pdf-real.test.js';
import testUsarPuppeteerProviderPdf from './ordens-compra/usar-puppeteer-provider-pdf.test.js';

const tests = [
  {
    group: 'ORDENS DE COMPRA',
    items: [
      ['criar ordem de compra', testCriarOrdemCompra],
      ['bloquear compra nao aprovada', testBloquearCompraNaoAprovada],
      ['bloquear fornecedor sem itens', testBloquearFornecedorSemItens],
      ['bloquear ordem duplicada', testBloquearOrdemDuplicada],
      ['cancelar ordem de compra', testCancelarOrdemCompra],
      ['gerar ordem substituta', testGerarOrdemSubstituta],
      ['listar ordens por compra', testListarOrdensPorCompra],
      ['resumir ordens da compra', testResumirOrdensDaCompra],
      ['usar puppeteer provider para pdf', testUsarPuppeteerProviderPdf],
      ['gerar pdf html', testGerarPdfHtml],
      ['salvar pdf real', testSalvarPdfReal],
      ['baixar pdf com content type', testBaixarPdfContentType],
      ['bloquear pdf de ordem inexistente', testBloquearPdfOrdemInexistente],
      ['enviar ordem via localweb smtp provider', testEnviarOrdemLocalwebSmtpProvider],
      ['enviar ordem para contato', testEnviarOrdemContato],
      ['bloquear contato fora do fornecedor', testBloquearContatoForaFornecedor],
      ['bloquear contato sem email', testBloquearContatoSemEmail],
      ['bloquear envio de oc cancelada', testBloquearEnvioOcCancelada],
      ['bloquear envio de oc substituida', testBloquearEnvioOcSubstituida],
      ['manter status em envio parcial', testManterStatusEnvioParcial],
      ['registrar falha de envio', testRegistrarFalhaEnvio]
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
  printError('execucao dos testes de ordens de compra', error, { grupo: 'GERAL' });
  process.exitCode = 1;
});
