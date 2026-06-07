import assert from 'node:assert/strict';
import cotacoesService from '../../../src/modules/cotacoes/cotacoes/cotacoes.service.js';
import aprovacoesService from '../../../src/modules/solicitacoes/aprovacoes/aprovacoes.service.js';
import itensSolicitacaoService from '../../../src/modules/solicitacoes/itens-solicitacao/itens-solicitacao.service.js';
import {
  cleanupGrupoByNome,
  cleanupItemByCodigo,
  cleanupSolicitacaoById,
  cleanupUsuarioByEmail,
  createItemFixture,
  createSolicitacaoFixture,
  setupDatabase
} from '../../solicitacoes/helpers/test-utils.js';

export default async function testBloquearSolicitacaoReprovada() {
  await setupDatabase();

  const solicitacao = await createSolicitacaoFixture();
  const item = await createItemFixture();

  await itensSolicitacaoService.create(solicitacao.id, {
    item_id: item.id,
    descricao_necessidade: 'Reposicao reprovada',
    quantidade: 2
  });

  await aprovacoesService.decide(solicitacao.id, {
    aprovador_id: solicitacao.usuarioFixture.id,
    decisao: 'REPROVADO',
    observacao: 'Solicitacao nao aprovada.'
  });

  await assert.rejects(
    () => cotacoesService.create({ solicitacao_id: solicitacao.id }),
    /Cotacao so pode ser criada para solicitacao aprovada ou com cotacao reprovada./
  );

  await cleanupSolicitacaoById(solicitacao.id);
  await cleanupItemByCodigo(item.codigo);
  await cleanupGrupoByNome(item.grupoFixture.nome);
  await cleanupUsuarioByEmail(solicitacao.usuarioFixture.email);
}
