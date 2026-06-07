import assert from 'node:assert/strict';
import aprovacoesService from '../../../src/modules/solicitacoes/aprovacoes/aprovacoes.service.js';
import historicoService from '../../../src/modules/solicitacoes/historico/historico.service.js';
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

export default async function testAprovarSolicitacao() {
  await setupDatabase();

  const solicitacao = await createSolicitacaoFixture();
  const item = await createItemFixture();

  await itensSolicitacaoService.create(solicitacao.id, {
    item_id: item.id,
    descricao_necessidade: 'Reposicao para aprovacao',
    quantidade: 3
  });

  const resultado = await aprovacoesService.decide(solicitacao.id, {
    aprovador_id: solicitacao.usuarioFixture.id,
    decisao: 'APROVADO'
  });

  assert.equal(resultado.solicitacao.status, 'APROVADA');
  assert.equal(resultado.aprovacao.decisao, 'APROVADO');
  assert.equal(resultado.historico.etapa, 'SOLICITACAO');
  assert.equal(resultado.historico.acao, 'APROVACAO');
  assert.equal(resultado.historico.status_anterior, 'ABERTA');
  assert.equal(resultado.historico.status_novo, 'APROVADA');

  const historico = await historicoService.listBySolicitacao(solicitacao.id);

  assert.equal(historico.length, 1);
  assert.equal(historico[0].acao, 'APROVACAO');

  await cleanupSolicitacaoById(solicitacao.id);
  await cleanupItemByCodigo(item.codigo);
  await cleanupGrupoByNome(item.grupoFixture.nome);
  await cleanupUsuarioByEmail(solicitacao.usuarioFixture.email);
}
