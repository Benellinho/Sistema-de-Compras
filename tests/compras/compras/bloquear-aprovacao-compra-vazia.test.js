import assert from 'node:assert/strict';
import comprasService from '../../../src/modules/compras/compras/compras.service.js';
import { cleanupCompraFixtures, createCotacaoAprovadaComRespostaFixture } from '../helpers/test-utils.js';

export default async function testBloquearAprovacaoCompraVazia() {
  const { solicitacao, cotacao, fornecedores } = await createCotacaoAprovadaComRespostaFixture();
  const compra = await comprasService.create({
    cotacao_id: cotacao.id,
    criado_por: solicitacao.usuarioFixture.id
  });

  await assert.rejects(
    () =>
      comprasService.enviarAprovacao(compra.id, {
        usuario_id: solicitacao.usuarioFixture.id
      }),
    /Compra precisa ter ao menos um fornecedor./
  );

  await cleanupCompraFixtures({ solicitacao, fornecedores });
}
