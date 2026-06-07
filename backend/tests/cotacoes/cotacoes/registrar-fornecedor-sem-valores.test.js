import assert from 'node:assert/strict';
import cotacoesService from '../../../src/modules/cotacoes/cotacoes/cotacoes.service.js';
import fornecedoresCotacaoService from '../../../src/modules/cotacoes/fornecedores/fornecedores-cotacao.service.js';
import {
  cleanupCotacaoFixtures,
  createFornecedorFixture,
  createSolicitacaoAprovadaComItemFixture
} from '../helpers/test-utils.js';

export default async function testRegistrarFornecedorSemValores() {
  const solicitacao = await createSolicitacaoAprovadaComItemFixture();
  const fornecedorRecusado = await createFornecedorFixture();
  const fornecedorSemResposta = await createFornecedorFixture();
  const cotacao = await cotacoesService.create({ solicitacao_id: solicitacao.id });

  const recusado = await fornecedoresCotacaoService.add(cotacao.id, {
    fornecedor_id: fornecedorRecusado.id
  });
  const semResposta = await fornecedoresCotacaoService.add(cotacao.id, {
    fornecedor_id: fornecedorSemResposta.id
  });

  const fornecedorRecusadoAtualizado = await fornecedoresCotacaoService.updateStatus(cotacao.id, recusado.id, {
    status: 'RECUSADO',
    observacoes: 'Fornecedor recusou participar.'
  });
  const fornecedorSemRespostaAtualizado = await fornecedoresCotacaoService.updateStatus(cotacao.id, semResposta.id, {
    status: 'SEM_RESPOSTA',
    observacoes: 'Fornecedor nao respondeu no prazo.'
  });

  assert.equal(fornecedorRecusadoAtualizado.status, 'RECUSADO');
  assert.equal(fornecedorSemRespostaAtualizado.status, 'SEM_RESPOSTA');

  const detalhes = await cotacoesService.findOne(cotacao.id);

  assert.equal(detalhes.resumo_respostas.recusados, 1);
  assert.equal(detalhes.resumo_respostas.sem_resposta, 1);

  await cleanupCotacaoFixtures({
    solicitacao,
    fornecedores: [fornecedorRecusado, fornecedorSemResposta]
  });
}
