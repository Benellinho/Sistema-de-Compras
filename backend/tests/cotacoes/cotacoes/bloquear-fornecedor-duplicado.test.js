import assert from 'node:assert/strict';
import cotacoesService from '../../../src/modules/cotacoes/cotacoes/cotacoes.service.js';
import fornecedoresCotacaoService from '../../../src/modules/cotacoes/fornecedores/fornecedores-cotacao.service.js';
import {
  cleanupCotacaoFixtures,
  createFornecedorFixture,
  createSolicitacaoAprovadaComItemFixture
} from '../helpers/test-utils.js';

export default async function testBloquearFornecedorDuplicado() {
  const solicitacao = await createSolicitacaoAprovadaComItemFixture();
  const fornecedor = await createFornecedorFixture();
  const cotacao = await cotacoesService.create({ solicitacao_id: solicitacao.id });

  await fornecedoresCotacaoService.add(cotacao.id, {
    fornecedor_id: fornecedor.id
  });

  await assert.rejects(
    () => fornecedoresCotacaoService.add(cotacao.id, { fornecedor_id: fornecedor.id }),
    /Fornecedor ja participa desta cotacao./
  );

  await cleanupCotacaoFixtures({ solicitacao, fornecedores: [fornecedor] });
}
