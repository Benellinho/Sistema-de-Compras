import assert from 'node:assert/strict';
import cotacoesService from '../../../src/modules/cotacoes/cotacoes/cotacoes.service.js';
import comprasService from '../../../src/modules/compras/compras/compras.service.js';
import {
  cleanupCotacaoFixtures,
  createSolicitacaoAprovadaComItemFixture
} from '../../cotacoes/helpers/test-utils.js';

export default async function testBloquearCotacaoNaoAprovada() {
  const solicitacao = await createSolicitacaoAprovadaComItemFixture();
  const cotacao = await cotacoesService.create({
    solicitacao_id: solicitacao.id,
    criado_por: solicitacao.usuarioFixture.id
  });

  await assert.rejects(
    () =>
      comprasService.create({
        cotacao_id: cotacao.id,
        criado_por: solicitacao.usuarioFixture.id
      }),
    /Compra so pode ser criada para cotacao aprovada./
  );

  await cleanupCotacaoFixtures({ solicitacao });
}
