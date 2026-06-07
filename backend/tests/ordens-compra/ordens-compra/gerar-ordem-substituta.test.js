import assert from 'node:assert/strict';
import ordensCompraService from '../../../src/modules/ordens-compra/ordens-compra/ordens-compra.service.js';
import solicitacoesService from '../../../src/modules/solicitacoes/solicitacoes/solicitacoes.service.js';
import { cleanupOrdemCompraFixtures, createCompraAprovadaFixture } from '../helpers/test-utils.js';

export default async function testGerarOrdemSubstituta() {
  const fixture = await createCompraAprovadaFixture();
  const ordem = await ordensCompraService.create({
    compra_fornecedor_id: fixture.fornecedoresCompra[0].id,
    usuario_id: fixture.solicitacao.usuarioFixture.id
  });

  await ordensCompraService.cancelar(ordem.id, {
    usuario_id: fixture.solicitacao.usuarioFixture.id,
    observacao: 'Dados comerciais precisam ser revisados'
  });

  const substituta = await ordensCompraService.gerarSubstituta(ordem.id, {
    usuario_id: fixture.solicitacao.usuarioFixture.id,
    observacoes: 'OC substituta emitida apos cancelamento'
  });

  assert.equal(substituta.status, 'GERADA');
  assert.equal(substituta.ordem_substituida_id, ordem.id);
  assert.notStrictEqual(substituta.numero_oc, ordem.numero_oc);

  const original = await ordensCompraService.findOne(ordem.id);
  assert.equal(original.status, 'SUBSTITUIDA');

  const solicitacao = await solicitacoesService.findOne(fixture.solicitacao.id);
  assert.equal(solicitacao.status, 'OC_GERADA');

  await cleanupOrdemCompraFixtures(fixture);
}
