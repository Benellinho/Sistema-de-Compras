import assert from 'node:assert/strict';
import aprovacoesService from '../../../src/modules/solicitacoes/aprovacoes/aprovacoes.service.js';
import itensSolicitacaoService from '../../../src/modules/solicitacoes/itens-solicitacao/itens-solicitacao.service.js';
import {
  cleanupSolicitacaoById,
  cleanupUsuarioByEmail,
  createSolicitacaoFixture,
  setupDatabase
} from '../helpers/test-utils.js';

export default async function testBloquearAprovacaoApenasNecessidadeLivre() {
  await setupDatabase();

  const solicitacao = await createSolicitacaoFixture();

  await itensSolicitacaoService.create(solicitacao.id, {
    descricao_necessidade: 'Texto livre ainda nao classificado'
  });

  await assert.rejects(
    () => aprovacoesService.decide(solicitacao.id, {
      aprovador_id: solicitacao.usuarioFixture.id,
      decisao: 'APROVADO'
    }),
    /item cadastrado/
  );

  await cleanupSolicitacaoById(solicitacao.id);
  await cleanupUsuarioByEmail(solicitacao.usuarioFixture.email);
}
