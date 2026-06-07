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
  createUsuarioFixture,
  setupDatabase
} from '../helpers/test-utils.js';

export default async function testBloquearAprovadorInativo() {
  await setupDatabase();

  const solicitacao = await createSolicitacaoFixture();
  const item = await createItemFixture();
  const aprovador = await createUsuarioFixture({
    nome: 'Aprovador Inativo',
    cargo: 'Aprovador',
    ativo: 0
  });

  await itensSolicitacaoService.create(solicitacao.id, {
    item_id: item.id,
    descricao_necessidade: 'Reposicao para aprovador inativo',
    quantidade: 4
  });

  await assert.rejects(
    () => aprovacoesService.decide(solicitacao.id, {
      aprovador_id: aprovador.id,
      decisao: 'APROVADO'
    }),
    /Aprovador deve estar ativo/
  );

  await cleanupSolicitacaoById(solicitacao.id);
  await cleanupItemByCodigo(item.codigo);
  await cleanupGrupoByNome(item.grupoFixture.nome);
  await cleanupUsuarioByEmail(aprovador.email);
  await cleanupUsuarioByEmail(solicitacao.usuarioFixture.email);
}
