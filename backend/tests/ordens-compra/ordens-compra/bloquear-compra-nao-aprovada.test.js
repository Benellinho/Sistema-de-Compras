import assert from 'node:assert/strict';
import ordensCompraService from '../../../src/modules/ordens-compra/ordens-compra/ordens-compra.service.js';
import { cleanupOrdemCompraFixtures, createCompraAprovadaFixture } from '../helpers/test-utils.js';

export default async function testBloquearCompraNaoAprovada() {
  const fixture = await createCompraAprovadaFixture({ aprovar: false });

  await assert.rejects(
    () => ordensCompraService.create({
      compra_fornecedor_id: fixture.fornecedoresCompra[0].id,
      usuario_id: fixture.solicitacao.usuarioFixture.id
    }),
    /Ordem de compra so pode ser gerada para compra aprovada/
  );

  await cleanupOrdemCompraFixtures(fixture);
}
