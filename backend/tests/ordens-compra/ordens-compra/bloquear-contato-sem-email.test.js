import assert from 'node:assert/strict';
import contatosService from '../../../src/modules/fornecedores/contatos/contatos.service.js';
import ordensCompraService from '../../../src/modules/ordens-compra/ordens-compra/ordens-compra.service.js';
import { cleanupOrdemCompraFixtures, createCompraAprovadaFixture } from '../helpers/test-utils.js';

export default async function testBloquearContatoSemEmail() {
  const fixture = await createCompraAprovadaFixture();
  const contato = await contatosService.create(fixture.fornecedores[0].id, {
    nome: 'Contato sem email'
  });
  const ordem = await ordensCompraService.create({
    compra_fornecedor_id: fixture.fornecedoresCompra[0].id,
    usuario_id: fixture.solicitacao.usuarioFixture.id
  });

  await assert.rejects(
    () => ordensCompraService.enviar(ordem.id, {
      usuario_id: fixture.solicitacao.usuarioFixture.id,
      contato_id: contato.id
    }),
    /Contato do fornecedor precisa possuir email/
  );

  await cleanupOrdemCompraFixtures(fixture);
}
