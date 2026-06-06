import assert from 'node:assert/strict';
import comprasService from '../../../src/modules/compras/compras/compras.service.js';
import { createFornecedorFixture } from '../../cotacoes/helpers/test-utils.js';
import { cleanupCompraFixtures, createCotacaoAprovadaComRespostaFixture, setupDatabase } from '../helpers/test-utils.js';

export default async function testBloquearFornecedorForaCotacao() {
  const { solicitacao, cotacao, fornecedores } = await createCotacaoAprovadaComRespostaFixture();
  const fornecedorForaCotacao = await createFornecedorFixture();
  const compra = await comprasService.create({
    cotacao_id: cotacao.id,
    criado_por: solicitacao.usuarioFixture.id
  });

  await assert.rejects(
    () =>
      comprasService.addFornecedor(compra.id, {
        fornecedor_id: fornecedorForaCotacao.id,
        usuario_id: solicitacao.usuarioFixture.id,
        justificativas: ['MENOR_PRECO']
      }),
    /Fornecedor nao participou da cotacao da compra./
  );

  const database = await setupDatabase();
  await database.run('DELETE FROM FORNECEDORES WHERE id = ?', fornecedorForaCotacao.id);

  await cleanupCompraFixtures({ solicitacao, fornecedores });
}
