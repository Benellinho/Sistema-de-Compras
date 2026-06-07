import assert from 'node:assert/strict';
import fornecedoresService from '../../../src/modules/fornecedores/fornecedores/fornecedores.service.js';
import {
  cleanupFornecedorByCnpj,
  createFornecedorFixture,
  setupDatabase
} from '../helpers/test-utils.js';

export default async function testAtualizarFornecedor() {
  await setupDatabase();

  const fornecedor = await createFornecedorFixture();
  const atualizado = await fornecedoresService.update(fornecedor.id, {
    nome_fantasia: 'Fornecedor Atualizado',
    telefone: '11888888888',
    email: 'atualizado@teste.com'
  });

  assert.equal(atualizado.id, fornecedor.id);
  assert.equal(atualizado.nome_fantasia, 'Fornecedor Atualizado');
  assert.equal(atualizado.telefone, '11888888888');
  assert.equal(atualizado.email, 'atualizado@teste.com');

  await cleanupFornecedorByCnpj(fornecedor.cnpj);
}
