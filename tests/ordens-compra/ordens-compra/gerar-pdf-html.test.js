import assert from 'node:assert/strict';
import ordensCompraService from '../../../src/modules/ordens-compra/ordens-compra/ordens-compra.service.js';
import { cleanupOrdemCompraFixtures, createCompraAprovadaFixture } from '../helpers/test-utils.js';

export default async function testGerarPdfHtml() {
  const fixture = await createCompraAprovadaFixture();
  const ordem = await ordensCompraService.create({
    compra_fornecedor_id: fixture.fornecedoresCompra[0].id,
    usuario_id: fixture.solicitacao.usuarioFixture.id,
    observacoes: 'Observacao para o PDF'
  });

  const pdf = await ordensCompraService.gerarPdfHtml(ordem.id);

  assert.equal(pdf.filename, `${ordem.numero_oc}.html`);
  assert.match(pdf.html, /Pedido de Compra/);
  assert.match(pdf.html, /Data do pedido/);
  assert.match(pdf.html, new RegExp(ordem.numero_oc));
  assert.match(pdf.html, new RegExp(fixture.fornecedores[0].razao_social));
  assert.match(pdf.html, /Observacao para o PDF/);
  assert.match(pdf.html, /<table>/);
  assert.doesNotMatch(pdf.html, /Compra:/);
  assert.doesNotMatch(pdf.html, /Solicitacao:/);
  assert.doesNotMatch(pdf.html, /Comprador \/ Responsavel/);

  await cleanupOrdemCompraFixtures(fixture);
}
