import { mkdir, stat, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import ordensCompraService from '../../../src/modules/ordens-compra/ordens-compra/ordens-compra.service.js';
import { cleanupOrdemCompraFixtures, createCompraAprovadaFixture } from '../helpers/test-utils.js';

export default async function testSalvarPdfReal() {
  const fixture = await createCompraAprovadaFixture();
  const ordem = await ordensCompraService.create({
    compra_fornecedor_id: fixture.fornecedoresCompra[0].id,
    usuario_id: fixture.solicitacao.usuarioFixture.id,
    observacoes: 'PDF salvo pelo teste'
  });

  const pdf = await ordensCompraService.gerarPdf(ordem.id);
  const outputDir = 'pdf/ordens-compra/testes';
  const outputPath = `${outputDir}/${pdf.filename}`;

  assert.equal(pdf.filename, `${ordem.numero_oc}.pdf`);
  assert.ok(Buffer.isBuffer(pdf.buffer));
  assert.equal(pdf.buffer.subarray(0, 5).toString('latin1'), '%PDF-');
  assert.match(pdf.buffer.toString('latin1'), /%%EOF/);

  await mkdir(outputDir, { recursive: true });
  await writeFile(outputPath, pdf.buffer);

  const file = await stat(outputPath);
  assert.ok(file.size > 100);

  await cleanupOrdemCompraFixtures(fixture);
}
