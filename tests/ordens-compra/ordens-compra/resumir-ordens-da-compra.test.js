import assert from 'node:assert/strict';
import ordensCompraService from '../../../src/modules/ordens-compra/ordens-compra.service.js';
import solicitacoesService from '../../../src/modules/solicitacoes/solicitacoes/solicitacoes.service.js';
import { cleanupOrdemCompraFixtures, createCompraAprovadaFixture } from '../helpers/test-utils.js';

export default async function testResumirOrdensDaCompra() {
  const fixture = await createCompraAprovadaFixture({ fornecedores: 2 });

  await ordensCompraService.create({
    compra_fornecedor_id: fixture.fornecedoresCompra[0].id,
    usuario_id: fixture.solicitacao.usuarioFixture.id
  });

  let resumo = await ordensCompraService.getResumoByCompraId(fixture.compra.id);

  assert.equal(resumo.total_fornecedores_compra, 2);
  assert.equal(resumo.ocs_geradas, 1);
  assert.equal(resumo.ocs_pendentes, 1);

  let solicitacao = await solicitacoesService.findOne(fixture.solicitacao.id);
  assert.equal(solicitacao.status, 'COMPRA_APROVADA');

  await ordensCompraService.create({
    compra_fornecedor_id: fixture.fornecedoresCompra[1].id,
    usuario_id: fixture.solicitacao.usuarioFixture.id
  });

  resumo = await ordensCompraService.getResumoByCompraId(fixture.compra.id);

  assert.equal(resumo.ocs_geradas, 2);
  assert.equal(resumo.ocs_pendentes, 0);

  solicitacao = await solicitacoesService.findOne(fixture.solicitacao.id);
  assert.equal(solicitacao.status, 'OC_GERADA');

  await cleanupOrdemCompraFixtures(fixture);
}
