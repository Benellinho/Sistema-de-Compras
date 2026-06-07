import assert from 'node:assert/strict';
import comprasService from '../../../src/modules/compras/compras/compras.service.js';
import { cleanupCompraFixtures, createCotacaoAprovadaComRespostaFixture } from '../helpers/test-utils.js';

export default async function testSinalizarInconsistenciaQuantidade() {
  const { solicitacao, cotacao, fornecedores } = await createCotacaoAprovadaComRespostaFixture({ fornecedores: 2 });

  const compra = await comprasService.create({
    cotacao_id: cotacao.id,
    criado_por: solicitacao.usuarioFixture.id
  });

  const primeiroFornecedor = await comprasService.addFornecedor(compra.id, {
    fornecedor_id: fornecedores[0].id,
    usuario_id: solicitacao.usuarioFixture.id,
    justificativas: ['MENOR_PRECO']
  });

  const segundoFornecedor = await comprasService.addFornecedor(compra.id, {
    fornecedor_id: fornecedores[1].id,
    usuario_id: solicitacao.usuarioFixture.id,
    justificativas: ['PRAZO']
  });

  const primeiroItem = await comprasService.addItem(compra.id, primeiroFornecedor.id, {
    solicitacao_item_id: solicitacao.itemSolicitacaoFixture.id,
    quantidade_pedida: 7,
    usuario_id: solicitacao.usuarioFixture.id
  });

  assert.equal(primeiroItem.inconsistencia_quantidade, 0);

  const segundoItem = await comprasService.addItem(compra.id, segundoFornecedor.id, {
    solicitacao_item_id: solicitacao.itemSolicitacaoFixture.id,
    quantidade_pedida: 6,
    usuario_id: solicitacao.usuarioFixture.id
  });

  assert.equal(segundoItem.inconsistencia_quantidade, 1);

  const compraAtualizada = await comprasService.findOne(compra.id);

  assert.equal(compraAtualizada.inconsistencia_quantidade, true);
  assert.equal(compraAtualizada.inconsistencias_quantidade[0].quantidade_pedida_total, 13);

  await cleanupCompraFixtures({ solicitacao, fornecedores });
}
