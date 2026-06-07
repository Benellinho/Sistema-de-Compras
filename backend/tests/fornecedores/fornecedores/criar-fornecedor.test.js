import assert from 'node:assert/strict';
import fornecedoresService from '../../../src/modules/fornecedores/fornecedores/fornecedores.service.js';
import {
  assertRequiredFields,
  cleanupFornecedorByCnpj,
  createFornecedorPayload,
  setupDatabase
} from '../helpers/test-utils.js';

export default async function testCriarFornecedor() {
  await setupDatabase();

  const payload = createFornecedorPayload();
  const fornecedor = await fornecedoresService.create(payload);

  assertRequiredFields(fornecedor, ['id', 'cnpj', 'status', 'razao_social', 'nome_fantasia', 'telefone', 'email']);
  assert.equal(fornecedor.cnpj, payload.cnpj);
  assert.equal(fornecedor.razao_social, payload.razao_social);
  assert.equal(fornecedor.telefone, payload.telefone);
  assert.equal(fornecedor.email, payload.email);

  await cleanupFornecedorByCnpj(payload.cnpj);
}
