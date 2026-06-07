import assert from 'node:assert/strict';
import { getOrdemCompraPdf } from '../../../src/modules/ordens-compra/ordens-compra/ordens-compra.controller.js';
import ordensCompraService from '../../../src/modules/ordens-compra/ordens-compra/ordens-compra.service.js';
import { cleanupOrdemCompraFixtures, createCompraAprovadaFixture } from '../helpers/test-utils.js';

export default async function testBaixarPdfContentType() {
  const fixture = await createCompraAprovadaFixture();
  const ordem = await ordensCompraService.create({
    compra_fornecedor_id: fixture.fornecedoresCompra[0].id,
    usuario_id: fixture.solicitacao.usuarioFixture.id
  });
  const headers = {};
  let sentBody = null;

  await getOrdemCompraPdf(
    { params: { id: ordem.id } },
    {
      setHeader(name, value) {
        headers[name] = value;
      },
      send(body) {
        sentBody = body;
      },
      status() {
        return this;
      },
      json() {}
    }
  );

  assert.equal(headers['Content-Type'], 'application/pdf');
  assert.match(headers['Content-Disposition'], new RegExp(`${ordem.numero_oc}\\.pdf`));
  assert.ok(Buffer.isBuffer(sentBody));

  await cleanupOrdemCompraFixtures(fixture);
}
