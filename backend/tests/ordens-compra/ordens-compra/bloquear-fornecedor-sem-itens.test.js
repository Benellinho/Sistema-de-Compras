import assert from 'node:assert/strict';
import ordensCompraService from '../../../src/modules/ordens-compra/ordens-compra/ordens-compra.service.js';
import { cleanupOrdemCompraFixtures, createCompraAprovadaFixture } from '../helpers/test-utils.js';

export default async function testBloquearFornecedorSemItens() {
  const fixture = await createCompraAprovadaFixture({
    fornecedores: 2,
    fornecedoresComItens: [0]
  });

  await assert.rejects(
    () => ordensCompraService.create({
      compra_fornecedor_id: fixture.fornecedoresCompra[1].id,
      usuario_id: fixture.solicitacao.usuarioFixture.id
    }),
    /Fornecedor da compra precisa ter ao menos um item para gerar OC/
  );

  await cleanupOrdemCompraFixtures(fixture);
}
