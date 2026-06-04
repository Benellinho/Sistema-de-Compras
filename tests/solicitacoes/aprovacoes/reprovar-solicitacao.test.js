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

export default async function testReprovarSolicitacao() {
  await setupDatabase();

  const solicitacao = await createSolicitacaoFixture();
  const item = await createItemFixture();
  const observacao = 'Necessidade nao justificada para compra.';

  await itensSolicitacaoService.create(solicitacao.id, {
    item_id: item.id,
    descricao_necessidade: 'Reposicao para reprovacao',
    quantidade: 2
  });

  const resultado = await aprovacoesService.decide(solicitacao.id, {
    aprovador_id: solicitacao.usuarioFixture.id,
    decisao: 'REPROVADO',
    observacao
  });

  assert.equal(resultado.solicitacao.status, 'REPROVADA');
  assert.equal(resultado.aprovacao.decisao, 'REPROVADO');
  assert.equal(resultado.aprovacao.observacao, observacao);
  assert.equal(resultado.historico.etapa, 'SOLICITACAO');
  assert.equal(resultado.historico.acao, 'REPROVACAO');
  assert.equal(resultado.historico.status_anterior, 'ABERTA');
  assert.equal(resultado.historico.status_novo, 'REPROVADA');
  assert.equal(resultado.historico.observacao, observacao);

  const historico = await historicoService.listBySolicitacao(solicitacao.id);

  assert.equal(historico.length, 1);
  assert.equal(historico[0].acao, 'REPROVACAO');
  assert.equal(historico[0].observacao, observacao);

  await cleanupSolicitacaoById(solicitacao.id);
  await cleanupItemByCodigo(item.codigo);
  await cleanupGrupoByNome(item.grupoFixture.nome);
  await cleanupUsuarioByEmail(solicitacao.usuarioFixture.email);
}
