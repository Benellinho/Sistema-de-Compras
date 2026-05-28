import assert from 'node:assert/strict';
import fornecedoresService from '../../src/modules/fornecedores/fornecedores.service.js';
import { cleanupFornecedorByCnpj, createFornecedorFixture, setupDatabase } from './helpers/test-utils.js';

export default async function testListarFornecedores() {
  await setupDatabase();

  const fornecedor = await createFornecedorFixture();
  const fornecedores = await fornecedoresService.list();
  const encontrado = fornecedores.find((item) => item.id === fornecedor.id);

  assert.ok(Array.isArray(fornecedores));
  assert.ok(encontrado, 'Fornecedor criado nao foi encontrado na listagem.');
  assert.equal(encontrado.cnpj, fornecedor.cnpj);

  await cleanupFornecedorByCnpj(fornecedor.cnpj);
}
