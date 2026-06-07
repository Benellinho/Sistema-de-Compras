import cotacoesService from '../../../src/modules/cotacoes/cotacoes/cotacoes.service.js';
import fornecedoresCotacaoService from '../../../src/modules/cotacoes/fornecedores/fornecedores-cotacao.service.js';
import respostasCotacaoService from '../../../src/modules/cotacoes/respostas/respostas-cotacao.service.js';
import {
  cleanupCotacaoFixtures,
  createFornecedorFixture,
  createSolicitacaoAprovadaComItemFixture,
  setupDatabase
} from '../../cotacoes/helpers/test-utils.js';

export async function createCotacaoAprovadaComRespostaFixture({ fornecedores = 1 } = {}) {
  await setupDatabase();

  const solicitacao = await createSolicitacaoAprovadaComItemFixture();
  const cotacao = await cotacoesService.create({
    solicitacao_id: solicitacao.id,
    criado_por: solicitacao.usuarioFixture.id,
    observacoes: 'Cotacao para compra'
  });

  const fornecedoresFixture = [];
  const fornecedoresCotacaoFixture = [];

  for (let index = 0; index < fornecedores; index += 1) {
    const fornecedor = await createFornecedorFixture();
    fornecedoresFixture.push(fornecedor);

    const fornecedorCotacao = await fornecedoresCotacaoService.add(cotacao.id, {
      fornecedor_id: fornecedor.id,
      usuario_id: solicitacao.usuarioFixture.id
    });

    await fornecedoresCotacaoService.marcarEnvio(cotacao.id, fornecedorCotacao.id, {
      usuario_id: solicitacao.usuarioFixture.id
    });

    await respostasCotacaoService.registrar(cotacao.id, fornecedorCotacao.id, {
      usuario_id: solicitacao.usuarioFixture.id,
      prazo_entrega: `${index + 3} dias`,
      forma_pagamento: 'Boleto',
      itens: [
        {
          solicitacao_item_id: solicitacao.itemSolicitacaoFixture.id,
          quantidade: 10,
          valor_unitario: 10 + index
        }
      ]
    });

    fornecedoresCotacaoFixture.push(fornecedorCotacao);
  }

  await cotacoesService.updateStatus(cotacao.id, {
    status: 'APROVADA',
    usuario_id: solicitacao.usuarioFixture.id
  });

  return {
    solicitacao,
    cotacao: await cotacoesService.findOne(cotacao.id),
    fornecedores: fornecedoresFixture,
    fornecedoresCotacao: fornecedoresCotacaoFixture
  };
}

export async function cleanupCompraFixtures({ solicitacao, fornecedores = [] }) {
  const database = await setupDatabase();

  await database.run('DELETE FROM compras WHERE solicitacao_id = ?', solicitacao.id);

  await cleanupCotacaoFixtures({ solicitacao, fornecedores });
}

export { setupDatabase };
