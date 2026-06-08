import assert from 'node:assert/strict';
import itensSolicitacaoService from '../../../src/modules/solicitacoes/itens-solicitacao/itens-solicitacao.service.js';
import {
  cleanupSolicitacaoById,
  cleanupUsuarioByEmail,
  createSolicitacaoFixture,
  setupDatabase
} from '../helpers/test-utils.js';

export default async function testAdicionarNecessidadeLivre() {
  await setupDatabase();

  const solicitacao = await createSolicitacaoFixture();

  const itemSolicitacao = await itensSolicitacaoService.create(solicitacao.id, {
    descricao_necessidade: 'Preciso de material para manutencao corretiva'
  });

  assert.equal(itemSolicitacao.solicitacao_id, solicitacao.id);
  assert.equal(itemSolicitacao.item_id, null);
  assert.equal(itemSolicitacao.descricao_necessidade, 'Preciso de material para manutencao corretiva');
  assert.equal(itemSolicitacao.unidade_snapshot, 'UN');
  assert.equal(itemSolicitacao.quantidade, 1);

  await cleanupSolicitacaoById(solicitacao.id);
  await cleanupUsuarioByEmail(solicitacao.usuarioFixture.email);
}
