import assert from 'node:assert/strict';
import ordensCompraService from '../../../src/modules/ordens-compra/ordens-compra.service.js';
import solicitacoesService from '../../../src/modules/solicitacoes/solicitacoes/solicitacoes.service.js';
import { cleanupOrdemCompraFixtures, createCompraAprovadaFixture } from '../helpers/test-utils.js';

export default async function testCancelarOrdemCompra() {
  const fixture = await createCompraAprovadaFixture();
  const ordem = await ordensCompraService.create({
    compra_fornecedor_id: fixture.fornecedoresCompra[0].id,
    usuario_id: fixture.solicitacao.usuarioFixture.id
  });

  const cancelada = await ordensCompraService.cancelar(ordem.id, {
    usuario_id: fixture.solicitacao.usuarioFixture.id,
    observacao: 'Fornecedor solicitou revisao da OC'
  });

  assert.equal(cancelada.status, 'CANCELADA');
  assert.equal(cancelada.motivo_cancelamento, 'Fornecedor solicitou revisao da OC');

  const solicitacao = await solicitacoesService.findOne(fixture.solicitacao.id);
  assert.equal(solicitacao.status, 'COMPRA_APROVADA');

  await cleanupOrdemCompraFixtures(fixture);
}
