import assert from 'node:assert/strict';
import ordensCompraService from '../../../src/modules/ordens-compra/ordens-compra.service.js';
import { cleanupOrdemCompraFixtures, createCompraAprovadaFixture } from '../helpers/test-utils.js';

export default async function testListarOrdensPorCompra() {
  const fixture = await createCompraAprovadaFixture({ fornecedores: 2 });

  await ordensCompraService.create({
    compra_fornecedor_id: fixture.fornecedoresCompra[0].id,
    usuario_id: fixture.solicitacao.usuarioFixture.id
  });

  let ordens = await ordensCompraService.list({
    compra_id: fixture.compra.id
  });

  assert.equal(ordens.length, 1);

  await ordensCompraService.create({
    compra_fornecedor_id: fixture.fornecedoresCompra[1].id,
    usuario_id: fixture.solicitacao.usuarioFixture.id
  });

  ordens = await ordensCompraService.list({
    compra_id: fixture.compra.id
  });

  assert.equal(ordens.length, 2);
  assert.ok(ordens.every((ordem) => ordem.compra_id === fixture.compra.id));

  await cleanupOrdemCompraFixtures(fixture);
}
