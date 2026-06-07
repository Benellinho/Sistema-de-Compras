import comprasService from '../../../src/modules/compras/compras/compras.service.js';
import {
  cleanupCompraFixtures,
  createCotacaoAprovadaComRespostaFixture,
  setupDatabase
} from '../../compras/helpers/test-utils.js';

export async function createCompraAprovadaFixture({
  fornecedores = 1,
  aprovar = true,
  fornecedoresComItens = null
} = {}) {
  const fixture = await createCotacaoAprovadaComRespostaFixture({ fornecedores });
  const compra = await comprasService.create({
    cotacao_id: fixture.cotacao.id,
    criado_por: fixture.solicitacao.usuarioFixture.id
  });
  const fornecedoresCompra = [];
  const indicesComItens = fornecedoresComItens ?? Array.from({ length: fornecedores }, (_, index) => index);
  const quantidadePorFornecedor = fornecedores > 1 ? 5 : 10;

  for (let index = 0; index < fornecedores; index += 1) {
    const fornecedorCompra = await comprasService.addFornecedor(compra.id, {
      fornecedor_id: fixture.fornecedores[index].id,
      usuario_id: fixture.solicitacao.usuarioFixture.id,
      justificativas: ['MENOR_PRECO']
    });

    fornecedoresCompra.push(fornecedorCompra);

    if (indicesComItens.includes(index)) {
      await comprasService.addItem(compra.id, fornecedorCompra.id, {
        solicitacao_item_id: fixture.solicitacao.itemSolicitacaoFixture.id,
        quantidade_pedida: quantidadePorFornecedor,
        usuario_id: fixture.solicitacao.usuarioFixture.id
      });
    }
  }

  if (aprovar) {
    await comprasService.enviarAprovacao(compra.id, {
      usuario_id: fixture.solicitacao.usuarioFixture.id
    });

    await comprasService.aprovar(compra.id, {
      aprovador_id: fixture.solicitacao.usuarioFixture.id
    });
  }

  return {
    ...fixture,
    compra: await comprasService.findOne(compra.id),
    fornecedoresCompra
  };
}

export async function cleanupOrdemCompraFixtures({ solicitacao, fornecedores = [] }) {
  await cleanupCompraFixtures({ solicitacao, fornecedores });
}

export { setupDatabase };
