import assert from 'node:assert/strict';
import comprasService from '../../../src/modules/compras/compras/compras.service.js';
import { cleanupCompraFixtures, createCotacaoAprovadaComRespostaFixture, setupDatabase } from '../helpers/test-utils.js';

export default async function testNaoGerarOrdemCompra() {
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

  await comprasService.addItem(compra.id, fornecedorCompra.id, {
    solicitacao_item_id: solicitacao.itemSolicitacaoFixture.id,
    quantidade_pedida: 10,
    usuario_id: solicitacao.usuarioFixture.id
  });

  await comprasService.enviarAprovacao(compra.id, {
    usuario_id: solicitacao.usuarioFixture.id
  });

  await comprasService.aprovar(compra.id, {
    aprovador_id: solicitacao.usuarioFixture.id
  });

  const database = await setupDatabase();
  const result = await database.get(
    `
      SELECT COUNT(*) AS total
      FROM ordens_compra
      WHERE compra_fornecedor_id = ?
    `,
    fornecedorCompra.id
  );

  assert.equal(result.total, 0);

  await cleanupCompraFixtures({ solicitacao, fornecedores });
}
