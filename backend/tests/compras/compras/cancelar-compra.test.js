import assert from 'node:assert/strict';
import comprasService from '../../../src/modules/compras/compras/compras.service.js';
import { cleanupCompraFixtures, createCotacaoAprovadaComRespostaFixture } from '../helpers/test-utils.js';

export default async function testCancelarCompra() {
  const { solicitacao, cotacao, fornecedores } = await createCotacaoAprovadaComRespostaFixture();

  const compra = await comprasService.create({
    cotacao_id: cotacao.id,
    criado_por: solicitacao.usuarioFixture.id
  });

  await assert.rejects(
    () =>
      comprasService.cancelar(compra.id, {
        usuario_id: solicitacao.usuarioFixture.id
      }),
    /Observacao e obrigatoria para cancelar compra./
  );

  const compraCancelada = await comprasService.cancelar(compra.id, {
    usuario_id: solicitacao.usuarioFixture.id,
    observacao: 'Fornecedor informou indisponibilidade apos aprovacao da cotacao.'
  });

  assert.equal(compraCancelada.status, 'CANCELADA');

  await cleanupCompraFixtures({ solicitacao, fornecedores });
}
