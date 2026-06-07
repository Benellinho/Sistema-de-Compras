import assert from 'node:assert/strict';
import contatosService from '../../../src/modules/fornecedores/contatos/contatos.service.js';
import ordensCompraService from '../../../src/modules/ordens-compra/ordens-compra.service.js';
import { cleanupOrdemCompraFixtures, createCompraAprovadaFixture } from '../helpers/test-utils.js';

export default async function testBloquearEnvioOcSubstituida() {
  const fixture = await createCompraAprovadaFixture();
  const contato = await contatosService.create(fixture.fornecedores[0].id, {
    nome: 'Contato Compras',
    email: 'compras-substituida@fornecedor.test'
  });
  const ordem = await ordensCompraService.create({
    compra_fornecedor_id: fixture.fornecedoresCompra[0].id,
    usuario_id: fixture.solicitacao.usuarioFixture.id
  });

  await ordensCompraService.cancelar(ordem.id, {
    usuario_id: fixture.solicitacao.usuarioFixture.id,
    observacao: 'Cancelamento para gerar substituta'
  });

  await ordensCompraService.gerarSubstituta(ordem.id, {
    usuario_id: fixture.solicitacao.usuarioFixture.id,
    observacoes: 'Substituta para testar bloqueio'
  });

  await assert.rejects(
    () => ordensCompraService.enviar(ordem.id, {
      usuario_id: fixture.solicitacao.usuarioFixture.id,
      contato_id: contato.id
    }),
    /Apenas ordem de compra gerada pode ser enviada/
  );

  await cleanupOrdemCompraFixtures(fixture);
}
