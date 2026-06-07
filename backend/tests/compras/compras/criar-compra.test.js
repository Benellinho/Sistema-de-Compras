import assert from 'node:assert/strict';
import comprasService from '../../../src/modules/compras/compras/compras.service.js';
import { cleanupCompraFixtures, createCotacaoAprovadaComRespostaFixture } from '../helpers/test-utils.js';

export default async function testCriarCompra() {
  const { solicitacao, cotacao, fornecedores } = await createCotacaoAprovadaComRespostaFixture();

  const compra = await comprasService.create({
    cotacao_id: cotacao.id,
    criado_por: solicitacao.usuarioFixture.id,
    observacoes: 'Compra de teste'
  });

  assert.equal(compra.cotacao_id, cotacao.id);
  assert.equal(compra.solicitacao_id, solicitacao.id);
  assert.equal(compra.status, 'EM_MONTAGEM');
  assert.equal(compra.inconsistencia_quantidade, false);

  await cleanupCompraFixtures({ solicitacao, fornecedores });
}
