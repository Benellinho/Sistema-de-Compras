import assert from 'node:assert/strict';
import contatosService from '../../../src/modules/fornecedores/contatos/contatos.service.js';
import { cleanupFornecedorByCnpj, createFornecedorFixture, setupDatabase } from '../helpers/test-utils.js';

export default async function testListarContatos() {
  await setupDatabase();

  const fornecedor = await createFornecedorFixture();
  const contato = await contatosService.create(fornecedor.id, {
    nome: 'Contato Lista',
    cargo: 'Financeiro'
  });
  const contatos = await contatosService.list(fornecedor.id);

  assert.ok(Array.isArray(contatos));
  assert.ok(contatos.some((item) => item.id === contato.id), 'Contato criado nao foi encontrado na listagem.');

  await cleanupFornecedorByCnpj(fornecedor.cnpj);
}
