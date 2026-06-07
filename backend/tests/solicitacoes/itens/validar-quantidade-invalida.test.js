import assert from 'node:assert/strict';
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

export default async function testValidarQuantidadeInvalida() {
  await setupDatabase();

  const solicitacao = await createSolicitacaoFixture();
  const item = await createItemFixture();

  await assert.rejects(
    () => itensSolicitacaoService.create(solicitacao.id, {
      item_id: item.id,
      descricao_necessidade: 'Quantidade invalida',
      quantidade: 0
    }),
    (error) => error.statusCode === 400 && error.message.includes('Quantidade')
  );

  await cleanupSolicitacaoById(solicitacao.id);
  await cleanupItemByCodigo(item.codigo);
  await cleanupGrupoByNome(item.grupoFixture.nome);
  await cleanupUsuarioByEmail(solicitacao.usuarioFixture.email);
}
