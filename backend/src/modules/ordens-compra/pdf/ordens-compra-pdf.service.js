import { readFile } from 'node:fs/promises';
import { renderPdfFromHtml } from '../../shared/pdf/pdf-provider.js';

const templateUrl = new URL('../../../templates/ordens-compra/modelo-generico.html', import.meta.url);

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

function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(Number(value ?? 0));
}

function normalizePdfText(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\x20-\x7E]/g, '');
}

function escapePdfText(value) {
  return normalizePdfText(value)
    .replaceAll('\\', '\\\\')
    .replaceAll('(', '\\(')
    .replaceAll(')', '\\)');
}

function truncateText(value, maxLength) {
  const text = normalizePdfText(value);

  return text.length > maxLength ? `${text.slice(0, maxLength - 3)}...` : text;
}

function renderItens(itens = []) {
  if (itens.length === 0) {
    return `
            <tr>
              <td colspan="7" class="text-center">Nenhum item vinculado a esta ordem de compra.</td>
            </tr>`;
  }

  return itens
    .map((item, index) => `
            <tr>
              <td class="text-center">${index + 1}</td>
              <td>${escapeHtml(item.item_codigo)}</td>
              <td>${escapeHtml(item.item_descricao || item.descricao_necessidade)}</td>
              <td class="text-center">${escapeHtml(item.unidade_snapshot)}</td>
              <td class="text-right">${formatNumber(item.quantidade_pedida)}</td>
              <td class="text-right">${formatCurrency(item.valor_unitario)}</td>
              <td class="text-right">${formatCurrency(item.valor_total)}</td>
            </tr>`)
    .join('');
}

function buildPdfLines(ordem) {
  const totalGeral = ordem.itens.reduce(
    (total, item) => total + Number(item.valor_total ?? 0),
    0
  );
  const lines = [
    { text: 'PEDIDO DE COMPRA', x: 50, y: 790, size: 18 },
    { text: ordem.numero_oc, x: 430, y: 790, size: 14 },
    { text: empresaGenerica.nome, x: 50, y: 760, size: 12 },
    { text: `Data do pedido: ${formatDate(ordem.data_emissao)}`, x: 430, y: 760, size: 10 },
    { text: `Fornecedor: ${ordem.fornecedor_razao_social}`, x: 50, y: 725, size: 11 },
    { text: 'Itens', x: 50, y: 690, size: 12 },
    { text: 'Item', x: 50, y: 668, size: 9 },
    { text: 'Codigo', x: 82, y: 668, size: 9 },
    { text: 'Descricao', x: 145, y: 668, size: 9 },
    { text: 'Un.', x: 350, y: 668, size: 9 },
    { text: 'Qtd.', x: 390, y: 668, size: 9 },
    { text: 'Valor Unit.', x: 435, y: 668, size: 9 },
    { text: 'Total', x: 510, y: 668, size: 9 }
  ];

  let y = 646;

  if (ordem.itens.length === 0) {
    lines.push({ text: 'Nenhum item vinculado a esta ordem de compra.', x: 50, y, size: 9 });
  }

  ordem.itens.forEach((item, index) => {
    lines.push(
      { text: String(index + 1), x: 50, y, size: 9 },
      { text: truncateText(item.item_codigo, 12), x: 82, y, size: 9 },
      { text: truncateText(item.item_descricao || item.descricao_necessidade, 36), x: 145, y, size: 9 },
      { text: truncateText(item.unidade_snapshot, 6), x: 350, y, size: 9 },
      { text: formatNumber(item.quantidade_pedida), x: 390, y, size: 9 },
      { text: formatCurrency(item.valor_unitario), x: 435, y, size: 9 },
      { text: formatCurrency(item.valor_total), x: 510, y, size: 9 }
    );
    y -= 18;
  });

  lines.push(
    { text: `Total geral: ${formatCurrency(totalGeral)}`, x: 390, y: Math.max(y - 10, 110), size: 12 },
    { text: 'Observacoes', x: 50, y: Math.max(y - 50, 80), size: 11 },
    { text: truncateText(ordem.observacoes || 'Sem observacoes.', 95), x: 50, y: Math.max(y - 68, 62), size: 9 },
    { text: 'Documento gerado pelo Sistema de Compras.', x: 50, y: 36, size: 8 }
  );

  return lines;
}

function createPdfBuffer(lines) {
  const content = [
    'BT',
    ...lines.map((line) => `/F1 ${line.size} Tf 1 0 0 1 ${line.x} ${line.y} Tm (${escapePdfText(line.text)}) Tj`),
    'ET'
  ].join('\n');
  const objects = [
    '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n',
    '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n',
    '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n',
    '4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n',
    `5 0 obj\n<< /Length ${Buffer.byteLength(content, 'latin1')} >>\nstream\n${content}\nendstream\nendobj\n`
  ];
  let pdf = '%PDF-1.4\n';
  const offsets = [0];

  for (const object of objects) {
    offsets.push(Buffer.byteLength(pdf, 'latin1'));
    pdf += object;
  }

  const xrefOffset = Buffer.byteLength(pdf, 'latin1');
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += '0000000000 65535 f \n';
  for (const offset of offsets.slice(1)) {
    pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\n`;
  pdf += `startxref\n${xrefOffset}\n%%EOF\n`;

  return Buffer.from(pdf, 'latin1');
}

function replaceTokens(template, data) {
  return Object.entries(data).reduce(
    (html, [key, value]) => html.replaceAll(`{{${key}}}`, value),
    template
  );
}

async function renderHtml(ordem) {
  const template = await readFile(templateUrl, 'utf8');
  const totalGeral = ordem.itens.reduce(
    (total, item) => total + Number(item.valor_total ?? 0),
    0
  );

  return replaceTokens(template, {
    numero_oc: escapeHtml(ordem.numero_oc),
    empresa_nome: escapeHtml(empresaGenerica.nome),
    data_emissao: formatDate(ordem.data_emissao),
    fornecedor_razao_social: escapeHtml(ordem.fornecedor_razao_social),
    itens_linhas: renderItens(ordem.itens),
    total_geral: formatCurrency(totalGeral),
    observacoes: escapeHtml(ordem.observacoes || 'Sem observacoes.')
  });
}

async function renderPdfBuffer(ordem, html = null) {
  html ??= await renderHtml(ordem);
  return renderPdfFromHtml(html);
}

export default {
  renderHtml,
  renderPdfBuffer
};
