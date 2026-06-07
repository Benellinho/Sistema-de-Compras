import assert from 'node:assert/strict';
import contatosService from '../../../src/modules/fornecedores/contatos/contatos.service.js';
import ordensCompraService from '../../../src/modules/ordens-compra/ordens-compra/ordens-compra.service.js';
import { cleanupOrdemCompraFixtures, createCompraAprovadaFixture } from '../helpers/test-utils.js';

export default async function testRegistrarFalhaEnvio() {
  const fixture = await createCompraAprovadaFixture();
  const contato = await contatosService.create(fixture.fornecedores[0].id, {
    nome: 'Contato Falha',
    email: 'falha@fornecedor.test'
  });
  const ordem = await ordensCompraService.create({
    compra_fornecedor_id: fixture.fornecedoresCompra[0].id,
    usuario_id: fixture.solicitacao.usuarioFixture.id
  });

  ordensCompraService.setEnvioAdapter({
    async enviarOrdemCompra() {
      throw new Error('SMTP indisponivel');
    }
  });

  try {
    await assert.rejects(
      () => ordensCompraService.enviar(ordem.id, {
        usuario_id: fixture.solicitacao.usuarioFixture.id,
        contato_id: contato.id
      }),
      /Falha ao enviar ordem de compra: SMTP indisponivel/
    );

    const ordemAtualizada = await ordensCompraService.findOne(ordem.id);
    assert.equal(ordemAtualizada.envios.length, 1);
    assert.equal(ordemAtualizada.envios[0].status, 'FALHA');
    assert.equal(ordemAtualizada.envios[0].observacao, 'SMTP indisponivel');
  } finally {
    ordensCompraService.resetEnvioAdapter();
    await cleanupOrdemCompraFixtures(fixture);
  }
}
