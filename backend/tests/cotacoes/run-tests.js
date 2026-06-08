import { getDatabase } from '../../src/db/connection.js';
import { printError, printGroup, printSuccess, printSummary } from '../helpers/testLogger.js';
import testAdicionarFotoOrcamento from './cotacoes/adicionar-foto-orcamento.test.js';
import testBloquearFornecedorDuplicado from './cotacoes/bloquear-fornecedor-duplicado.test.js';
import testBloquearFornecedorInexistente from './cotacoes/bloquear-fornecedor-inexistente.test.js';
import testBloquearItemForaDaSolicitacao from './cotacoes/bloquear-item-fora-da-solicitacao.test.js';
import testBloquearQuantidadeMaior from './cotacoes/bloquear-quantidade-maior.test.js';
import testBloquearRespostaCotacaoEncerrada from './cotacoes/bloquear-resposta-cotacao-encerrada.test.js';
import testBloquearSolicitacaoAprovadaSemItens from './cotacoes/bloquear-solicitacao-aprovada-sem-itens.test.js';
import testBloquearSolicitacaoAprovadaApenasNecessidadeLivre from './cotacoes/bloquear-solicitacao-aprovada-apenas-necessidade-livre.test.js';
import testBloquearSolicitacaoNaoAprovada from './cotacoes/bloquear-solicitacao-nao-aprovada.test.js';
import testBloquearSolicitacaoReprovada from './cotacoes/bloquear-solicitacao-reprovada.test.js';
import testBloquearValorNegativo from './cotacoes/bloquear-valor-negativo.test.js';
import testBuscarDetalhesCotacao from './cotacoes/buscar-detalhes-cotacao.test.js';
import testFluxoCotacao from './cotacoes/fluxo-cotacao.test.js';
import testGerarPdfSolicitacaoOrcamento from './cotacoes/gerar-pdf-solicitacao-orcamento.test.js';
import testListarCotacoesFiltradas from './cotacoes/listar-cotacoes-filtradas.test.js';
import testPermitirNovaRodadaCotacaoReprovada from './cotacoes/permitir-nova-rodada-cotacao-reprovada.test.js';
import testRegistrarFornecedorSemValores from './cotacoes/registrar-fornecedor-sem-valores.test.js';
import testRegistrarHistoricoStatusFinal from './cotacoes/registrar-historico-status-final.test.js';
import testRegistrarItemIndisponivel from './cotacoes/registrar-item-indisponivel.test.js';

const tests = [
  {
    group: 'COTACOES',
    items: [
      ['fluxo cotacao', testFluxoCotacao],
      ['gerar pdf solicitacao orcamento', testGerarPdfSolicitacaoOrcamento],
      ['adicionar foto orcamento', testAdicionarFotoOrcamento],
      ['listar cotacoes filtradas', testListarCotacoesFiltradas],
      ['buscar detalhes cotacao', testBuscarDetalhesCotacao],
      ['bloquear solicitacao nao aprovada', testBloquearSolicitacaoNaoAprovada],
      ['bloquear solicitacao reprovada', testBloquearSolicitacaoReprovada],
      ['bloquear solicitacao aprovada sem itens', testBloquearSolicitacaoAprovadaSemItens],
      ['bloquear solicitacao aprovada apenas necessidade livre', testBloquearSolicitacaoAprovadaApenasNecessidadeLivre],
      ['bloquear fornecedor duplicado', testBloquearFornecedorDuplicado],
      ['bloquear fornecedor inexistente', testBloquearFornecedorInexistente],
      ['bloquear quantidade maior', testBloquearQuantidadeMaior],
      ['bloquear item fora da solicitacao', testBloquearItemForaDaSolicitacao],
      ['bloquear valor negativo', testBloquearValorNegativo],
      ['bloquear resposta cotacao encerrada', testBloquearRespostaCotacaoEncerrada],
      ['permitir nova rodada cotacao reprovada', testPermitirNovaRodadaCotacaoReprovada],
      ['registrar fornecedor sem valores', testRegistrarFornecedorSemValores],
      ['registrar historico status final', testRegistrarHistoricoStatusFinal],
      ['registrar item indisponivel', testRegistrarItemIndisponivel]
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
