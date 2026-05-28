import assert from 'node:assert/strict';
import fornecedoresService from '../../src/modules/fornecedores/fornecedores.service.js';
import {
  cleanupFornecedorByCnpj,
  createFornecedorPayload,
  setupDatabase
} from './helpers/test-utils.js';

export default async function testValidarCnpjDuplicado() {
  await setupDatabase();

  const payload = createFornecedorPayload();
  await fornecedoresService.create(payload);

  await assert.rejects(
    () => fornecedoresService.create({ ...payload, razao_social: 'Fornecedor Duplicado' }),
    (error) => error.statusCode === 409
  );

  await cleanupFornecedorByCnpj(payload.cnpj);
}
