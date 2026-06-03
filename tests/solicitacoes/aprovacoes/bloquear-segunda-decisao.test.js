import assert from 'node:assert/strict';
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
} from '../helpers/test-utils.js';

export default async function testBloquearSegundaDecisao() {
  await setupDatabase();

  const solicitacao = await createSolicitacaoFixture();
  const item = await createItemFixture();

  await itensSolicitacaoService.create(solicitacao.id, {
    item_id: item.id,
    descricao_necessidade: 'Reposicao para decisao unica',
    quantidade: 1
  });

  await aprovacoesService.decide(solicitacao.id, {
    aprovador_id: solicitacao.usuarioFixture.id,
    decisao: 'APROVADO'
  });

  await assert.rejects(
    () => aprovacoesService.decide(solicitacao.id, {
      aprovador_id: solicitacao.usuarioFixture.id,
      decisao: 'REPROVADO',
      observacao: 'Revisao posterior'
    }),
    /Apenas solicitacoes abertas/
  );

  await cleanupSolicitacaoById(solicitacao.id);
  await cleanupItemByCodigo(item.codigo);
  await cleanupGrupoByNome(item.grupoFixture.nome);
  await cleanupUsuarioByEmail(solicitacao.usuarioFixture.email);
}
