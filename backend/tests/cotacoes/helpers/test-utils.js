import aprovacoesService from '../../../src/modules/solicitacoes/aprovacoes/aprovacoes.service.js';
import itensSolicitacaoService from '../../../src/modules/solicitacoes/itens-solicitacao/itens-solicitacao.service.js';
import fornecedoresService from '../../../src/modules/fornecedores/fornecedores/fornecedores.service.js';
import {
  cleanupGrupoByNome,
  cleanupItemByCodigo,
  cleanupSolicitacaoById,
  cleanupUsuarioByEmail,
  createItemFixture,
  createSolicitacaoFixture,
  setupDatabase
} from '../../solicitacoes/helpers/test-utils.js';

let sequence = 0;

function uniqueSuffix() {
  sequence += 1;
  return `${Date.now()}${sequence}`.slice(-10).padStart(10, '0');
}

export async function createFornecedorFixture(overrides = {}) {
  const unique = uniqueSuffix();

  return fornecedoresService.create({
    cnpj: unique.padStart(14, '0'),
    status: 'ATIVO',
    razao_social: `Fornecedor Cotacao ${unique}`,
    nome_fantasia: `FC ${unique}`,
    telefone: '11999999999',
    email: `fornecedor-${unique}@teste.com`,
    ...overrides
  });
}

export async function createSolicitacaoAprovadaComItemFixture() {
  await setupDatabase();

  const solicitacao = await createSolicitacaoFixture();
  const item = await createItemFixture();
  const itemSolicitacao = await itensSolicitacaoService.create(solicitacao.id, {
    item_id: item.id,
    descricao_necessidade: 'Reposicao para cotacao',
    quantidade: 10
  });

  await aprovacoesService.decide(solicitacao.id, {
    aprovador_id: solicitacao.usuarioFixture.id,
    decisao: 'APROVADO'
  });

  solicitacao.itemFixture = item;
  solicitacao.itemSolicitacaoFixture = itemSolicitacao;

  return solicitacao;
}

export async function cleanupCotacaoFixtures({ solicitacao, fornecedores = [] }) {
  await cleanupSolicitacaoById(solicitacao.id);

  for (const fornecedor of fornecedores) {
    await cleanupFornecedorByCnpj(fornecedor.cnpj);
  }

  await cleanupItemByCodigo(solicitacao.itemFixture.codigo);
  await cleanupGrupoByNome(solicitacao.itemFixture.grupoFixture.nome);
  await cleanupUsuarioByEmail(solicitacao.usuarioFixture.email);
}

export async function cleanupFornecedorByCnpj(cnpj) {
  const database = await setupDatabase();

  await database.run('DELETE FROM FORNECEDORES WHERE cnpj = ?', cnpj);
}

export { setupDatabase };
