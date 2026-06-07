import assert from 'node:assert/strict';
import contatosService from '../../../src/modules/fornecedores/contatos/contatos.service.js';
import { cleanupFornecedorByCnpj, createFornecedorFixture, setupDatabase } from '../helpers/test-utils.js';

export default async function testBuscarContato() {
  await setupDatabase();

  const fornecedor = await createFornecedorFixture();
  const contato = await contatosService.create(fornecedor.id, {
    nome: 'Contato Busca',
    email: 'busca@teste.com'
  });
  const encontrado = await contatosService.findOne(fornecedor.id, contato.id);

  assert.equal(encontrado.id, contato.id);
  assert.equal(encontrado.nome, 'Contato Busca');

  await cleanupFornecedorByCnpj(fornecedor.cnpj);
}
