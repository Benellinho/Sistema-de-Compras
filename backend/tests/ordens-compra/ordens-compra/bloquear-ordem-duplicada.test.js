import assert from 'node:assert/strict';
import ordensCompraService from '../../../src/modules/ordens-compra/ordens-compra/ordens-compra.service.js';
import { cleanupOrdemCompraFixtures, createCompraAprovadaFixture } from '../helpers/test-utils.js';

export default async function testBloquearOrdemDuplicada() {
  const fixture = await createCompraAprovadaFixture();

  await ordensCompraService.create({
    compra_fornecedor_id: fixture.fornecedoresCompra[0].id,
    usuario_id: fixture.solicitacao.usuarioFixture.id
  });

  await assert.rejects(
    () => ordensCompraService.create({
      compra_fornecedor_id: fixture.fornecedoresCompra[0].id,
      usuario_id: fixture.solicitacao.usuarioFixture.id
    }),
    /Fornecedor da compra ja possui ordem de compra ativa/
  );

  await cleanupOrdemCompraFixtures(fixture);
}
