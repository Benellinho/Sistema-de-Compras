import assert from 'node:assert/strict';
import contatosService from '../../../src/modules/fornecedores/contatos/contatos.service.js';
import ordensCompraService from '../../../src/modules/ordens-compra/ordens-compra/ordens-compra.service.js';
import { cleanupOrdemCompraFixtures, createCompraAprovadaFixture } from '../helpers/test-utils.js';

export default async function testBloquearContatoForaFornecedor() {
  const fixture = await createCompraAprovadaFixture({ fornecedores: 2 });
  const contatoOutroFornecedor = await contatosService.create(fixture.fornecedores[1].id, {
    nome: 'Contato de outro fornecedor',
    email: 'outro-fornecedor@teste.com'
  });
  const ordem = await ordensCompraService.create({
    compra_fornecedor_id: fixture.fornecedoresCompra[0].id,
    usuario_id: fixture.solicitacao.usuarioFixture.id
  });

  await assert.rejects(
    () => ordensCompraService.enviar(ordem.id, {
      usuario_id: fixture.solicitacao.usuarioFixture.id,
      contato_id: contatoOutroFornecedor.id
    }),
    /Contato nao encontrado para o fornecedor da ordem de compra/
  );

  await cleanupOrdemCompraFixtures(fixture);
}
