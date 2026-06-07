import assert from 'node:assert/strict';
import cotacoesService from '../../../src/modules/cotacoes/cotacoes/cotacoes.service.js';
import fornecedoresCotacaoService from '../../../src/modules/cotacoes/fornecedores/fornecedores-cotacao.service.js';
import {
  cleanupCotacaoFixtures,
  createSolicitacaoAprovadaComItemFixture
} from '../helpers/test-utils.js';

export default async function testBloquearFornecedorInexistente() {
  const solicitacao = await createSolicitacaoAprovadaComItemFixture();
  const cotacao = await cotacoesService.create({ solicitacao_id: solicitacao.id });

  await assert.rejects(
    () =>
      fornecedoresCotacaoService.add(cotacao.id, {
        fornecedor_id: 999999999
      }),
    /Fornecedor nao encontrado./
  );

  await cleanupCotacaoFixtures({ solicitacao });
}
