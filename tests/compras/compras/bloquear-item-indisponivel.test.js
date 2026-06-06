import assert from 'node:assert/strict';
import cotacoesService from '../../../src/modules/cotacoes/cotacoes/cotacoes.service.js';
import fornecedoresCotacaoService from '../../../src/modules/cotacoes/fornecedores/fornecedores-cotacao.service.js';
import respostasCotacaoService from '../../../src/modules/cotacoes/respostas/respostas-cotacao.service.js';
import comprasService from '../../../src/modules/compras/compras/compras.service.js';
import {
  createFornecedorFixture,
  createSolicitacaoAprovadaComItemFixture
} from '../../cotacoes/helpers/test-utils.js';
import { cleanupCompraFixtures } from '../helpers/test-utils.js';

export default async function testBloquearItemIndisponivel() {
  const solicitacao = await createSolicitacaoAprovadaComItemFixture();
  const fornecedor = await createFornecedorFixture();
  const cotacao = await cotacoesService.create({
    solicitacao_id: solicitacao.id,
    criado_por: solicitacao.usuarioFixture.id
  });
  const fornecedorCotacao = await fornecedoresCotacaoService.add(cotacao.id, {
    fornecedor_id: fornecedor.id,
    usuario_id: solicitacao.usuarioFixture.id
  });

  await fornecedoresCotacaoService.marcarEnvio(cotacao.id, fornecedorCotacao.id, {
    usuario_id: solicitacao.usuarioFixture.id
  });

  await respostasCotacaoService.registrar(cotacao.id, fornecedorCotacao.id, {
    usuario_id: solicitacao.usuarioFixture.id,
    itens: [
      {
        solicitacao_item_id: solicitacao.itemSolicitacaoFixture.id,
        status_item: 'INDISPONIVEL'
      }
    ]
  });

  await cotacoesService.updateStatus(cotacao.id, {
    status: 'APROVADA',
    usuario_id: solicitacao.usuarioFixture.id
  });

  const compra = await comprasService.create({
    cotacao_id: cotacao.id,
    criado_por: solicitacao.usuarioFixture.id
  });
  const fornecedorCompra = await comprasService.addFornecedor(compra.id, {
    fornecedor_id: fornecedor.id,
    usuario_id: solicitacao.usuarioFixture.id,
    justificativas: ['DISPONIBILIDADE']
  });

  await assert.rejects(
    () =>
      comprasService.addItem(compra.id, fornecedorCompra.id, {
        solicitacao_item_id: solicitacao.itemSolicitacaoFixture.id,
        quantidade_pedida: 1,
        usuario_id: solicitacao.usuarioFixture.id
      }),
    /Item indisponivel na cotacao nao pode ser comprado./
  );

  await cleanupCompraFixtures({ solicitacao, fornecedores: [fornecedor] });
}
