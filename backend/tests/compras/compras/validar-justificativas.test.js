import assert from 'node:assert/strict';
import comprasService from '../../../src/modules/compras/compras/compras.service.js';
import { cleanupCompraFixtures, createCotacaoAprovadaComRespostaFixture } from '../helpers/test-utils.js';

export default async function testValidarJustificativas() {
  const { solicitacao, cotacao, fornecedores } = await createCotacaoAprovadaComRespostaFixture({ fornecedores: 2 });
  const compra = await comprasService.create({
    cotacao_id: cotacao.id,
    criado_por: solicitacao.usuarioFixture.id
  });

  await assert.rejects(
    () =>
      comprasService.addFornecedor(compra.id, {
        fornecedor_id: fornecedores[0].id,
        usuario_id: solicitacao.usuarioFixture.id,
        justificativas: ['OUTRO']
      }),
    /Justificativa OUTRO exige texto complementar./
  );

  await assert.rejects(
    () =>
      comprasService.addFornecedor(compra.id, {
        fornecedor_id: fornecedores[1].id,
        usuario_id: solicitacao.usuarioFixture.id,
        justificativas: ['PRAZO', 'PRAZO']
      }),
    /Justificativa duplicada para o fornecedor da compra./
  );

  await cleanupCompraFixtures({ solicitacao, fornecedores });
}
