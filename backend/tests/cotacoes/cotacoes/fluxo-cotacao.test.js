import assert from 'node:assert/strict';
import comparativoCotacaoService from '../../../src/modules/cotacoes/comparativo/comparativo-cotacao.service.js';
import cotacoesService from '../../../src/modules/cotacoes/cotacoes/cotacoes.service.js';
import fornecedoresCotacaoService from '../../../src/modules/cotacoes/fornecedores/fornecedores-cotacao.service.js';
import respostasCotacaoService from '../../../src/modules/cotacoes/respostas/respostas-cotacao.service.js';
import {
  cleanupCotacaoFixtures,
  createFornecedorFixture,
  createSolicitacaoAprovadaComItemFixture
} from '../helpers/test-utils.js';

export default async function testFluxoCotacao() {
  const solicitacao = await createSolicitacaoAprovadaComItemFixture();
  const fornecedor = await createFornecedorFixture();

  const cotacao = await cotacoesService.create({
    solicitacao_id: solicitacao.id,
    criado_por: solicitacao.usuarioFixture.id,
    observacoes: 'Cotacao de teste'
  });

  assert.equal(cotacao.solicitacao_id, solicitacao.id);
  assert.equal(cotacao.numero_rodada, 1);
  assert.equal(cotacao.status, 'ABERTA');

  const fornecedorCotacao = await fornecedoresCotacaoService.add(cotacao.id, {
    fornecedor_id: fornecedor.id,
    usuario_id: solicitacao.usuarioFixture.id
  });

  assert.equal(fornecedorCotacao.status, 'PENDENTE');

  const fornecedorEnviado = await fornecedoresCotacaoService.marcarEnvio(cotacao.id, fornecedorCotacao.id, {
    usuario_id: solicitacao.usuarioFixture.id
  });

  assert.equal(fornecedorEnviado.status, 'ENVIADO');

  const cotacaoEmAndamento = await cotacoesService.findOne(cotacao.id);

  assert.equal(cotacaoEmAndamento.status, 'EM_ANDAMENTO');

  await respostasCotacaoService.registrar(cotacao.id, fornecedorCotacao.id, {
    usuario_id: solicitacao.usuarioFixture.id,
    prazo_entrega: '5 dias',
    forma_pagamento: 'Boleto',
    itens: [
      {
        solicitacao_item_id: solicitacao.itemSolicitacaoFixture.id,
        quantidade: 6,
        valor_unitario: 12.5
      }
    ]
  });

  const inicioAnalise = await cotacoesService.updateStatus(cotacao.id, {
    status: 'EM_ANALISE',
    usuario_id: solicitacao.usuarioFixture.id
  });

  assert.equal(inicioAnalise.cotacao.status, 'EM_ANALISE');
  assert.equal(inicioAnalise.resumo_respostas.fornecedores_convidados, 1);
  assert.equal(inicioAnalise.resumo_respostas.respostas_recebidas, 1);
  assert.equal(inicioAnalise.resumo_respostas.pendentes, 0);

  const comparativo = await comparativoCotacaoService.get(cotacao.id);

  assert.equal(comparativo.itens.length, 1);
  assert.equal(comparativo.itens[0].menor_valor.valor_unitario, 12.5);
  assert.equal(comparativo.fornecedores[0].total, 75);

  await cleanupCotacaoFixtures({ solicitacao, fornecedores: [fornecedor] });
}
