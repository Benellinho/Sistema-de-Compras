import assert from 'node:assert/strict';
import contatosService from '../../../src/modules/fornecedores/contatos/contatos.service.js';
import { cleanupFornecedorByCnpj, createFornecedorFixture, setupDatabase } from '../helpers/test-utils.js';

export default async function testAtualizarContato() {
  await setupDatabase();

  const fornecedor = await createFornecedorFixture();
  const contato = await contatosService.create(fornecedor.id, {
    nome: 'Contato Antigo',
    telefone: '11666666666'
  });
  const atualizado = await contatosService.update(fornecedor.id, contato.id, {
    nome: 'Contato Novo',
    telefone: '11555555555'
  });

  assert.equal(atualizado.id, contato.id);
  assert.equal(atualizado.nome, 'Contato Novo');
  assert.equal(atualizado.telefone, '11555555555');

  await cleanupFornecedorByCnpj(fornecedor.cnpj);
}
