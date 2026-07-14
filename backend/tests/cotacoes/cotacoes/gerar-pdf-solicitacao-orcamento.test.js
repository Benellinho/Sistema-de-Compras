import assert from 'node:assert/strict';
import cotacoesService from '../../../src/modules/cotacoes/cotacoes/cotacoes.service.js';
import cotacoesPdfService from '../../../src/modules/cotacoes/pdf/cotacoes-pdf.service.js';
import fornecedoresCotacaoService from '../../../src/modules/cotacoes/fornecedores/fornecedores-cotacao.service.js';
import { resetPdfProvider, setPdfProvider } from '../../../src/modules/shared/pdf/pdf-provider.js';
import {
  cleanupCotacaoFixtures,
  createFornecedorFixture,
  createSolicitacaoAprovadaComItemFixture
} from '../helpers/test-utils.js';

export default async function testGerarPdfSolicitacaoOrcamento() {
  const solicitacao = await createSolicitacaoAprovadaComItemFixture();
  const fornecedor = await createFornecedorFixture({
    razao_social: 'Fornecedor PDF Orcamento',
    email: 'pdf-orcamento@fornecedor.test'
  });

  try {
    const cotacao = await cotacoesService.create({
      solicitacao_id: solicitacao.id,
      criado_por: solicitacao.usuarioFixture.id,
      observacoes: 'Solicitacao de cotacao com PDF'
    });
    const fornecedorCotacao = await fornecedoresCotacaoService.add(cotacao.id, {
      fornecedor_id: fornecedor.id,
      usuario_id: solicitacao.usuarioFixture.id
    });

    setPdfProvider({
      name: 'test-pdf',
      async renderPdf({ html }) {
        assert.match(html, /Solicitação de Orçamento/);
        assert.match(html, /Fornecedor PDF Orcamento/);
        assert.match(html, new RegExp(solicitacao.usuarioFixture.nome));
        assert.match(html, /Item Solicitacao|Reposicao para cotacao/);
        assert.match(html, /Empresa Compradora/);
        assert.match(html, new RegExp(`SOL-${solicitacao.id} / COT-${cotacao.id} / R1`));
        assert.match(html, /<td class="item-index text-center">1<\/td>/);
        assert.match(html, /<th class="text-center">Qtd\.<\/th>/);
        assert.match(html, /<th class="text-center">Un\.<\/th>/);
        assert.match(html, /data:image\/jpeg;base64,/);
        assert.doesNotMatch(html, /Valor Unit\./);
        assert.doesNotMatch(html, /Total geral/);
        assert.doesNotMatch(html, /{{[^}]+}}/);

        return Buffer.from('%PDF-cotacao-orcamento');
      }
    });

    const pdf = await cotacoesPdfService.gerarSolicitacaoOrcamentoPdf(
      cotacao.id,
      fornecedorCotacao.id
    );

    assert.equal(pdf.filename, `cotacao-${cotacao.id}-fornecedor-${fornecedor.id}-solicitacao-orcamento.pdf`);
    assert.equal(pdf.buffer.toString(), '%PDF-cotacao-orcamento');
    assert.match(pdf.html, /Solicitacao de cotacao com PDF/);
  } finally {
    resetPdfProvider();
    await cleanupCotacaoFixtures({ solicitacao, fornecedores: [fornecedor] });
  }
}
