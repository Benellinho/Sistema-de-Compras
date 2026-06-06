import assert from 'node:assert/strict';
import comprasService from '../../../src/modules/compras/compras/compras.service.js';
import { cleanupCompraFixtures, createCotacaoAprovadaComRespostaFixture } from '../helpers/test-utils.js';

export default async function testBloquearSegundaCompra() {
  const { solicitacao, cotacao, fornecedores } = await createCotacaoAprovadaComRespostaFixture();

  await comprasService.create({
    cotacao_id: cotacao.id,
    criado_por: solicitacao.usuarioFixture.id
  });

  await assert.rejects(
    () =>
      comprasService.create({
        cotacao_id: cotacao.id,
        criado_por: solicitacao.usuarioFixture.id
      }),
    /Cotacao ja possui compra criada./
  );

  await cleanupCompraFixtures({ solicitacao, fornecedores });
}
