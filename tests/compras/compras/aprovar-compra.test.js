import assert from 'node:assert/strict';
import comprasService from '../../../src/modules/compras/compras/compras.service.js';
import { cleanupCompraFixtures, createCotacaoAprovadaComRespostaFixture } from '../helpers/test-utils.js';

export default async function testAprovarCompra() {
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

  const aguardandoAprovacao = await comprasService.enviarAprovacao(compra.id, {
    usuario_id: solicitacao.usuarioFixture.id
  });

  assert.equal(aguardandoAprovacao.status, 'AGUARDANDO_APROVACAO');

  const compraAprovada = await comprasService.aprovar(compra.id, {
    aprovador_id: solicitacao.usuarioFixture.id
  });

  assert.equal(compraAprovada.status, 'APROVADA');

  await cleanupCompraFixtures({ solicitacao, fornecedores });
}
