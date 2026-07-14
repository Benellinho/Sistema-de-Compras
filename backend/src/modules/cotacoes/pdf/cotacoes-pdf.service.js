import { readFile } from 'node:fs/promises';
import cotacoesRepository from '../cotacoes/cotacoes.repository.js';
import { validateCotacaoExiste } from '../cotacoes/cotacoes.service.js';
import { validateFornecedorDaCotacao } from '../fornecedores/fornecedores-cotacao.service.js';
import { renderPdfFromHtml } from '../../shared/pdf/pdf-provider.js';

const templateUrl = new URL('../../../templates/cotacoes/solicitacao-orcamento.html', import.meta.url);

const empresaGenerica = {
  nome: 'Empresa Compradora'
};

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function formatDate(value) {
  if (!value) {
    return '';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return escapeHtml(value);
  }

  return new Intl.DateTimeFormat('pt-BR').format(date);
}

function formatNumber(value) {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(Number(value ?? 0));
}

function replaceTokens(template, data) {
  return Object.entries(data).reduce(
    (html, [key, value]) => html.replaceAll(`{{${key}}}`, value),
    template
  );
}

function renderItens(itens = []) {
  if (itens.length === 0) {
    return `
            <tr>
              <td colspan="5" class="text-center">Nenhum item vinculado a esta cotação.</td>
            </tr>`;
  }

  return itens
    .map((item, index) => `
            <tr>
              <td class="text-center">${index + 1}</td>
              <td>${escapeHtml(item.item_codigo)}</td>
              <td>${escapeHtml(item.item_descricao || item.descricao_necessidade)}</td>
              <td class="text-center">${escapeHtml(item.unidade_snapshot)}</td>
              <td class="text-right">${formatNumber(item.quantidade)}</td>
            </tr>`)
    .join('');
}

async function renderSolicitacaoOrcamentoHtml(cotacaoId, cotacaoFornecedorId) {
  const dados = await getDadosSolicitacaoOrcamento(cotacaoId, cotacaoFornecedorId);
  const template = await readFile(templateUrl, 'utf8');

  return {
    filename: getFilename(dados.cotacao, dados.fornecedor).replace(/\.pdf$/i, '.html'),
    html: replaceTokens(template, {
      empresa_nome: escapeHtml(empresaGenerica.nome),
      cotacao_numero: escapeHtml(`Rodada ${dados.cotacao.numero_rodada}`),
      data_abertura: formatDate(dados.cotacao.data_abertura),
      observacoes: escapeHtml(dados.cotacao.observacoes || 'Solicitamos o envio dos valores para os itens abaixo.'),
      fornecedor_razao_social: escapeHtml(dados.fornecedor.fornecedor_razao_social),
      fornecedor_cnpj: escapeHtml(dados.fornecedor.fornecedor_cnpj),
      fornecedor_email: escapeHtml(dados.fornecedor.fornecedor_email || ''),
      itens_linhas: renderItens(dados.itens)
    })
  };
}

async function gerarSolicitacaoOrcamentoPdf(cotacaoId, cotacaoFornecedorId) {
  const dados = await getDadosSolicitacaoOrcamento(cotacaoId, cotacaoFornecedorId);
  const htmlResult = await renderSolicitacaoOrcamentoHtml(cotacaoId, cotacaoFornecedorId);
  const buffer = await renderPdfFromHtml(htmlResult.html);

  return {
    filename: getFilename(dados.cotacao, dados.fornecedor),
    buffer,
    html: htmlResult.html
  };
}

async function getDadosSolicitacaoOrcamento(cotacaoId, cotacaoFornecedorId) {
  const cotacao = await validateCotacaoExiste(cotacaoId);
  const fornecedor = await validateFornecedorDaCotacao(cotacaoId, cotacaoFornecedorId);
  const itens = await cotacoesRepository.findSolicitacaoItensByCotacaoId(cotacaoId);

  return {
    cotacao,
    fornecedor,
    itens
  };
}

function getFilename(cotacao, fornecedor) {
  return `cotacao-${cotacao.id}-fornecedor-${fornecedor.fornecedor_id}-solicitacao-orcamento.pdf`;
}

export default {
  gerarSolicitacaoOrcamentoPdf,
  renderSolicitacaoOrcamentoHtml
};
