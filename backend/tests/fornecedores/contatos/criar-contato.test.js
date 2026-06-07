import assert from 'node:assert/strict';
import contatosService from '../../../src/modules/fornecedores/contatos/contatos.service.js';
import { cleanupFornecedorByCnpj, createFornecedorFixture, setupDatabase } from '../helpers/test-utils.js';

export default async function testCriarContato() {
  await setupDatabase();

  const fornecedor = await createFornecedorFixture();
  const contato = await contatosService.create(fornecedor.id, {
    nome: 'Contato Teste',
    cargo: 'Compras',
    telefone: '11777777777',
    email: 'contato@teste.com'
  });

  assert.equal(contato.fornecedor_id, fornecedor.id);
  assert.equal(contato.nome, 'Contato Teste');
  assert.equal(contato.cargo, 'Compras');

  await cleanupFornecedorByCnpj(fornecedor.cnpj);
}
