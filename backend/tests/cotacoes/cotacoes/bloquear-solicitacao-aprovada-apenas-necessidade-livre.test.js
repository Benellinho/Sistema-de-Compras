import assert from 'node:assert/strict';
import cotacoesService from '../../../src/modules/cotacoes/cotacoes/cotacoes.service.js';
import itensSolicitacaoService from '../../../src/modules/solicitacoes/itens-solicitacao/itens-solicitacao.service.js';
import solicitacoesService from '../../../src/modules/solicitacoes/solicitacoes/solicitacoes.service.js';
import {
  cleanupSolicitacaoById,
  cleanupUsuarioByEmail,
  createSolicitacaoFixture,
  setupDatabase
} from '../../solicitacoes/helpers/test-utils.js';

export default async function testBloquearSolicitacaoAprovadaApenasNecessidadeLivre() {
  await setupDatabase();

  const solicitacao = await createSolicitacaoFixture();

  await itensSolicitacaoService.create(solicitacao.id, {
    descricao_necessidade: 'Texto livre ainda nao classificado'
  });

  await solicitacoesService.updateStatus(solicitacao.id, {
    status: 'APROVADA'
  });

  await assert.rejects(
    () => cotacoesService.create({ solicitacao_id: solicitacao.id }),
    /item cadastrado/
  );

  await cleanupSolicitacaoById(solicitacao.id);
  await cleanupUsuarioByEmail(solicitacao.usuarioFixture.email);
}
