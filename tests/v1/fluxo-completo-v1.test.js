import assert from 'node:assert/strict';
import comprasService from '../../src/modules/compras/compras/compras.service.js';
import anexosCotacaoService from '../../src/modules/cotacoes/anexos/anexos-cotacao.service.js';
import cotacoesService from '../../src/modules/cotacoes/cotacoes/cotacoes.service.js';
import cotacoesPdfService from '../../src/modules/cotacoes/pdf/cotacoes-pdf.service.js';
import fornecedoresCotacaoService from '../../src/modules/cotacoes/fornecedores/fornecedores-cotacao.service.js';
import respostasCotacaoService from '../../src/modules/cotacoes/respostas/respostas-cotacao.service.js';
import contatosService from '../../src/modules/fornecedores/contatos/contatos.service.js';
import ordensCompraService from '../../src/modules/ordens-compra/ordens-compra/ordens-compra.service.js';
import solicitacoesService from '../../src/modules/solicitacoes/solicitacoes/solicitacoes.service.js';
import { resetPdfProvider, setPdfProvider } from '../../src/modules/shared/pdf/pdf-provider.js';
import {
  createFornecedorFixture,
  createSolicitacaoAprovadaComItemFixture
} from '../cotacoes/helpers/test-utils.js';
import { cleanupCompraFixtures } from '../compras/helpers/test-utils.js';

export default async function testFluxoCompletoV1() {
  const solicitacao = await createSolicitacaoAprovadaComItemFixture();
  const fornecedor = await createFornecedorFixture({
    razao_social: 'Fornecedor Fluxo V1',
    email: 'fornecedor-fluxo-v1@teste.com'
  });

  setPdfProvider({
    name: 'test-pdf',
    async renderPdf() {
      return Buffer.from('%PDF-fluxo-v1');
    }
  });

  try {
    const cotacao = await cotacoesService.create({
      solicitacao_id: solicitacao.id,
      criado_por: solicitacao.usuarioFixture.id,
      observacoes: 'Fluxo ficticio para validacao da V1.0'
    });
    const fornecedorCotacao = await fornecedoresCotacaoService.add(cotacao.id, {
      fornecedor_id: fornecedor.id,
      usuario_id: solicitacao.usuarioFixture.id
    });
    const pdfCotacao = await cotacoesPdfService.gerarSolicitacaoOrcamentoPdf(
      cotacao.id,
      fornecedorCotacao.id
    );
    const foto = await anexosCotacaoService.adicionar(cotacao.id, fornecedorCotacao.id, {
      nome_arquivo: 'motor-bomba-orcamento.jpg',
      caminho_arquivo: 'uploads/testes/motor-bomba-orcamento.jpg',
      tipo_arquivo: 'image/jpeg'
    });

    await fornecedoresCotacaoService.marcarEnvio(cotacao.id, fornecedorCotacao.id, {
      usuario_id: solicitacao.usuarioFixture.id
    });
    await respostasCotacaoService.registrar(cotacao.id, fornecedorCotacao.id, {
      usuario_id: solicitacao.usuarioFixture.id,
      prazo_entrega: '5 dias',
      forma_pagamento: 'Boleto 28 dias',
      observacoes: 'Orcamento ficticio recebido para V1.0',
      itens: [
        {
          solicitacao_item_id: solicitacao.itemSolicitacaoFixture.id,
          quantidade: 10,
          valor_unitario: 25.5
        }
      ]
    });
    await cotacoesService.updateStatus(cotacao.id, {
      status: 'EM_ANALISE',
      usuario_id: solicitacao.usuarioFixture.id
    });
    await cotacoesService.updateStatus(cotacao.id, {
      status: 'APROVADA',
      usuario_id: solicitacao.usuarioFixture.id
    });

    const compra = await comprasService.create({
      cotacao_id: cotacao.id,
      criado_por: solicitacao.usuarioFixture.id
    });
    const compraFornecedor = await comprasService.addFornecedor(compra.id, {
      fornecedor_id: fornecedor.id,
      usuario_id: solicitacao.usuarioFixture.id,
      justificativas: ['MENOR_PRECO']
    });
    await comprasService.addItem(compra.id, compraFornecedor.id, {
      solicitacao_item_id: solicitacao.itemSolicitacaoFixture.id,
      quantidade_pedida: 10,
      usuario_id: solicitacao.usuarioFixture.id
    });
    await comprasService.enviarAprovacao(compra.id, {
      usuario_id: solicitacao.usuarioFixture.id
    });
    await comprasService.aprovar(compra.id, {
      aprovador_id: solicitacao.usuarioFixture.id
    });

    const ordem = await ordensCompraService.create({
      compra_fornecedor_id: compraFornecedor.id,
      usuario_id: solicitacao.usuarioFixture.id,
      observacoes: 'OC ficticia do fluxo V1.0'
    });
    const contato = await contatosService.create(fornecedor.id, {
      nome: 'Contato Fluxo V1',
      email: 'contato-fluxo-v1@fornecedor.test'
    });
    const envio = await ordensCompraService.enviar(ordem.id, {
      usuario_id: solicitacao.usuarioFixture.id,
      contato_id: contato.id
    });

    const solicitacaoFinal = await solicitacoesService.findOne(solicitacao.id);
    const detalhesCotacao = await cotacoesService.findOne(cotacao.id);
    const ordemFinal = await ordensCompraService.findOne(ordem.id);

    assert.equal(pdfCotacao.buffer.toString(), '%PDF-fluxo-v1');
    assert.equal(foto.nome_arquivo, 'motor-bomba-orcamento.jpg');
    assert.equal(detalhesCotacao.status, 'APROVADA');
    assert.equal(detalhesCotacao.fornecedores[0].anexos.length, 1);
    assert.equal(envio.status, 'ENVIADO');
    assert.equal(ordemFinal.envios.length, 1);
    assert.equal(solicitacaoFinal.status, 'OC_ENVIADA');
  } finally {
    resetPdfProvider();
    ordensCompraService.resetEnvioAdapter();
    await cleanupCompraFixtures({ solicitacao, fornecedores: [fornecedor] });
  }
}
