import { readFile } from 'node:fs/promises';
import cotacoesRepository from '../cotacoes/cotacoes.repository.js';
import solicitacoesRepository from '../../solicitacoes/solicitacoes/solicitacoes.repository.js';
import { validateCotacaoExiste } from '../cotacoes/cotacoes.service.js';
import { validateFornecedorDaCotacao } from '../fornecedores/fornecedores-cotacao.service.js';
import { renderPdfFromHtml } from '../../shared/pdf/pdf-provider.js';

const templateUrl = new URL('../../../templates/cotacoes/solicitacao-orcamento.html', import.meta.url);
const logoUrl = new URL('../../../templates/marozal/elementos/LogotipoMzl.jpeg', import.meta.url);

const empresaGenerica = {
  nome: 'Sistema de Compras'
};

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function formatDate(value = new Date()) {
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return escapeHtml(value);
  }

  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo'
  }).format(date);
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
              <td colspan="4" class="text-center">Nenhum item vinculado a esta cotação.</td>
            </tr>`;
  }

  return itens
    .map((item, index) => `
            <tr>
              <td class="item-index text-center">${index + 1}</td>
              <td class="item-description">${escapeHtml(item.item_descricao || item.descricao_necessidade)}</td>
              <td class="text-center">${formatNumber(item.quantidade)}</td>
              <td class="text-center">${escapeHtml(item.unidade_snapshot)}</td>
            </tr>`)
    .join('');
}

async function renderSolicitacaoOrcamentoHtml(cotacaoId, cotacaoFornecedorId) {
  const dados = await getDadosSolicitacaoOrcamento(cotacaoId, cotacaoFornecedorId);
  const template = await readFile(templateUrl, 'utf8');
  const logo = await readFile(logoUrl);
  const dataDocumento = dados.fornecedor.data_envio || new Date();

  return {
    filename: getFilename(dados.cotacao, dados.fornecedor).replace(/\.pdf$/i, '.html'),
    html: replaceTokens(template, {
      empresa_nome: escapeHtml(empresaGenerica.nome),
      logo_mzl: `data:image/jpeg;base64,${logo.toString('base64')}`,
      documento_codigo: escapeHtml(
        `SOL-${dados.solicitacao.id} / COT-${dados.cotacao.id} / R${dados.cotacao.numero_rodada}`
      ),
      data_envio: formatDate(dataDocumento),
      solicitante_nome: escapeHtml(dados.solicitacao.solicitante_nome),
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
  const solicitacao = await solicitacoesRepository.findById(cotacao.solicitacao_id);
  const itens = await cotacoesRepository.findSolicitacaoItensByCotacaoId(cotacaoId);

  return {
    cotacao,
    fornecedor,
    solicitacao,
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
