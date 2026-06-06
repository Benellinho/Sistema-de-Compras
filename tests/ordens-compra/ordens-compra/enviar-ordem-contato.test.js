import assert from 'node:assert/strict';
import contatosService from '../../../src/modules/fornecedores/contatos/contatos.service.js';
import ordensCompraService from '../../../src/modules/ordens-compra/ordens-compra.service.js';
import solicitacoesService from '../../../src/modules/solicitacoes/solicitacoes/solicitacoes.service.js';
import { cleanupOrdemCompraFixtures, createCompraAprovadaFixture } from '../helpers/test-utils.js';

export default async function testEnviarOrdemContato() {
  const fixture = await createCompraAprovadaFixture();
  const contato = await contatosService.create(fixture.fornecedores[0].id, {
    nome: 'Contato Compras',
    cargo: 'Compras',
    telefone: '11999999999',
    email: 'contato-compras@fornecedor.test'
  });
  const ordem = await ordensCompraService.create({
    compra_fornecedor_id: fixture.fornecedoresCompra[0].id,
    usuario_id: fixture.solicitacao.usuarioFixture.id
  });

  const envio = await ordensCompraService.enviar(ordem.id, {
    usuario_id: fixture.solicitacao.usuarioFixture.id,
    contato_id: contato.id,
    observacao: 'Envio para contato escolhido'
  });

  assert.equal(envio.status, 'ENVIADO');
  assert.equal(envio.email_destino, contato.email);

  const ordemAtualizada = await ordensCompraService.findOne(ordem.id);
  assert.equal(ordemAtualizada.envios.length, 1);
  assert.equal(ordemAtualizada.envios[0].status, 'ENVIADO');

  const solicitacao = await solicitacoesService.findOne(fixture.solicitacao.id);
  assert.equal(solicitacao.status, 'OC_ENVIADA');

  await cleanupOrdemCompraFixtures(fixture);
}
