import assert from 'node:assert/strict';
import contatosService from '../../../src/modules/fornecedores/contatos/contatos.service.js';
import ordensCompraService from '../../../src/modules/ordens-compra/ordens-compra/ordens-compra.service.js';
import solicitacoesService from '../../../src/modules/solicitacoes/solicitacoes/solicitacoes.service.js';
import { cleanupOrdemCompraFixtures, createCompraAprovadaFixture } from '../helpers/test-utils.js';

export default async function testManterStatusEnvioParcial() {
  const fixture = await createCompraAprovadaFixture({ fornecedores: 2 });
  const contato = await contatosService.create(fixture.fornecedores[0].id, {
    nome: 'Contato Compras',
    email: 'compras-parcial@fornecedor.test'
  });
  const primeiraOrdem = await ordensCompraService.create({
    compra_fornecedor_id: fixture.fornecedoresCompra[0].id,
    usuario_id: fixture.solicitacao.usuarioFixture.id
  });

  await ordensCompraService.create({
    compra_fornecedor_id: fixture.fornecedoresCompra[1].id,
    usuario_id: fixture.solicitacao.usuarioFixture.id
  });

  await ordensCompraService.enviar(primeiraOrdem.id, {
    usuario_id: fixture.solicitacao.usuarioFixture.id,
    contato_id: contato.id
  });

  const solicitacao = await solicitacoesService.findOne(fixture.solicitacao.id);
  const resumo = await ordensCompraService.getResumoByCompraId(fixture.compra.id);

  assert.equal(solicitacao.status, 'OC_GERADA');
  assert.equal(resumo.ocs_geradas, 2);
  assert.equal(resumo.ocs_enviadas, 1);

  await cleanupOrdemCompraFixtures(fixture);
}
