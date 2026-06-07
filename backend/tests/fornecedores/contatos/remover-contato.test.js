import assert from 'node:assert/strict';
import contatosService from '../../../src/modules/fornecedores/contatos/contatos.service.js';
import { cleanupFornecedorByCnpj, createFornecedorFixture, setupDatabase } from '../helpers/test-utils.js';

export default async function testRemoverContato() {
  await setupDatabase();

  const fornecedor = await createFornecedorFixture();
  const contato = await contatosService.create(fornecedor.id, {
    nome: 'Contato Remover'
  });

  await contatosService.remove(fornecedor.id, contato.id);

  await assert.rejects(
    () => contatosService.findOne(fornecedor.id, contato.id),
    (error) => error.statusCode === 404
  );

  await cleanupFornecedorByCnpj(fornecedor.cnpj);
}
