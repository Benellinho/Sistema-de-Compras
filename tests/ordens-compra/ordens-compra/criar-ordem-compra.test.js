import assert from 'node:assert/strict';
import ordensCompraService from '../../../src/modules/ordens-compra/ordens-compra.service.js';
import solicitacoesService from '../../../src/modules/solicitacoes/solicitacoes/solicitacoes.service.js';
import { cleanupOrdemCompraFixtures, createCompraAprovadaFixture } from '../helpers/test-utils.js';

export default async function testCriarOrdemCompra() {
  const fixture = await createCompraAprovadaFixture();

  const ordem = await ordensCompraService.create({
    compra_fornecedor_id: fixture.fornecedoresCompra[0].id,
    usuario_id: fixture.solicitacao.usuarioFixture.id,
    observacoes: 'OC gerada pelo teste'
  });

  assert.equal(ordem.status, 'GERADA');
  assert.equal(ordem.compra_fornecedor_id, fixture.fornecedoresCompra[0].id);
  assert.match(ordem.numero_oc, /^OC-\d{4}-\d{6}$/);
  assert.equal(ordem.itens.length, 1);

  const solicitacao = await solicitacoesService.findOne(fixture.solicitacao.id);
  assert.equal(solicitacao.status, 'OC_GERADA');

  await cleanupOrdemCompraFixtures(fixture);
}
