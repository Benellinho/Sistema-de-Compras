import assert from 'node:assert/strict';
import comprasService from '../../../src/modules/compras/compras/compras.service.js';
import { cleanupCompraFixtures, createCotacaoEmAnaliseComRespostaFixture } from '../helpers/test-utils.js';

export default async function testAprovarCotacaoPorItens() {
  const { solicitacao, cotacao, fornecedores } = await createCotacaoEmAnaliseComRespostaFixture({
    fornecedores: 2
  });
  const fornecedorEscolhido = fornecedores[1];

  const compra = await comprasService.aprovarCotacaoPorItens(cotacao.id, {
    usuario_id: solicitacao.usuarioFixture.id,
    observacao: 'Aprovacao por item no teste',
    justificativas: ['MENOR_PRECO'],
    itens: [
      {
        solicitacao_item_id: solicitacao.itemSolicitacaoFixture.id,
        fornecedor_id: fornecedorEscolhido.id
      }
    ]
  });

  assert.equal(compra.status, 'APROVADA');
  assert.equal(compra.cotacao_id, cotacao.id);
  assert.equal(compra.fornecedores.length, 1);
  assert.equal(compra.fornecedores[0].fornecedor_id, fornecedorEscolhido.id);
  assert.equal(compra.fornecedores[0].itens.length, 1);
  assert.equal(
    compra.fornecedores[0].itens[0].solicitacao_item_id,
    solicitacao.itemSolicitacaoFixture.id
  );

  await cleanupCompraFixtures({ solicitacao, fornecedores });
}
