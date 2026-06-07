import assert from 'node:assert/strict';
import anexosCotacaoService from '../../../src/modules/cotacoes/anexos/anexos-cotacao.service.js';
import cotacoesService from '../../../src/modules/cotacoes/cotacoes/cotacoes.service.js';
import fornecedoresCotacaoService from '../../../src/modules/cotacoes/fornecedores/fornecedores-cotacao.service.js';
import {
  cleanupCotacaoFixtures,
  createFornecedorFixture,
  createSolicitacaoAprovadaComItemFixture
} from '../helpers/test-utils.js';

export default async function testAdicionarFotoOrcamento() {
  const solicitacao = await createSolicitacaoAprovadaComItemFixture();
  const fornecedor = await createFornecedorFixture();

  try {
    const cotacao = await cotacoesService.create({
      solicitacao_id: solicitacao.id,
      criado_por: solicitacao.usuarioFixture.id
    });
    const fornecedorCotacao = await fornecedoresCotacaoService.add(cotacao.id, {
      fornecedor_id: fornecedor.id,
      usuario_id: solicitacao.usuarioFixture.id
    });
    const anexo = await anexosCotacaoService.adicionar(cotacao.id, fornecedorCotacao.id, {
      nome_arquivo: 'foto-orcamento.jpg',
      caminho_arquivo: 'uploads/testes/foto-orcamento.jpg',
      tipo_arquivo: 'image/jpeg'
    });

    assert.equal(anexo.cotacao_fornecedor_id, fornecedorCotacao.id);
    assert.equal(anexo.nome_arquivo, 'foto-orcamento.jpg');
    assert.equal(anexo.tipo_arquivo, 'image/jpeg');

    const anexos = await anexosCotacaoService.listar(cotacao.id, fornecedorCotacao.id);
    assert.equal(anexos.length, 1);
    assert.equal(anexos[0].caminho_arquivo, 'uploads/testes/foto-orcamento.jpg');

    const detalhes = await cotacoesService.findOne(cotacao.id);
    assert.equal(detalhes.fornecedores[0].anexos.length, 1);

    await assert.rejects(
      () => anexosCotacaoService.adicionar(cotacao.id, fornecedorCotacao.id, {
        nome_arquivo: 'orcamento.pdf',
        caminho_arquivo: 'uploads/testes/orcamento.pdf',
        tipo_arquivo: 'application/pdf'
      }),
      /deve ser uma imagem/
    );
  } finally {
    await cleanupCotacaoFixtures({ solicitacao, fornecedores: [fornecedor] });
  }
}
