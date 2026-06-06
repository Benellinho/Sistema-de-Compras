import assert from 'node:assert/strict';
import comprasService from '../../../src/modules/compras/compras/compras.service.js';
import { cleanupCompraFixtures, createCotacaoAprovadaComRespostaFixture } from '../helpers/test-utils.js';

export default async function testBloquearItemForaDaSolicitacao() {
  const { solicitacao, cotacao, fornecedores } = await createCotacaoAprovadaComRespostaFixture();
  const compra = await comprasService.create({
    cotacao_id: cotacao.id,
    criado_por: solicitacao.usuarioFixture.id
  });
  const fornecedorCompra = await comprasService.addFornecedor(compra.id, {
    fornecedor_id: fornecedores[0].id,
    usuario_id: solicitacao.usuarioFixture.id,
    justificativas: ['MENOR_PRECO']
  });

  await assert.rejects(
    () =>
      comprasService.addItem(compra.id, fornecedorCompra.id, {
        solicitacao_item_id: 999999999,
        quantidade_pedida: 1,
        usuario_id: solicitacao.usuarioFixture.id
      }),
    /Item nao pertence a solicitacao da compra./
  );

  await cleanupCompraFixtures({ solicitacao, fornecedores });
}
