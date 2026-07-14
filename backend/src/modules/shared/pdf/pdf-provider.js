import { fileURLToPath } from 'node:url';

const defaultPdfOptions = {
  format: 'A4',
  printBackground: true
};

const localPuppeteerCacheDirectory = fileURLToPath(
  new URL('../../../../.cache/puppeteer/', import.meta.url)
);

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

function extractTextFromHtml(html) {
  return String(html ?? '')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function createFallbackPdfBuffer(html) {
  const words = extractTextFromHtml(html).split(' ').filter(Boolean);
  const lines = [];
  let currentLine = '';

  for (const word of words) {
    if ((currentLine + word).length > 82) {
      lines.push(currentLine.trim());
      currentLine = '';
    }

    currentLine += `${word} `;
  }

  if (currentLine.trim()) {
    lines.push(currentLine.trim());
  }

  const printableLines = lines.length > 0 ? lines.slice(0, 42) : ['Documento gerado pelo Sistema de Compras.'];
  const content = [
    'BT',
    '/F1 11 Tf',
    ...printableLines.map((line, index) => `1 0 0 1 50 ${790 - index * 16} Tm (${escapePdfText(line)}) Tj`),
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

async function loadPuppeteer(puppeteer) {
  if (puppeteer) {
    return puppeteer;
  }

  process.env.PUPPETEER_CACHE_DIR ||= localPuppeteerCacheDirectory;

  const module = await import('puppeteer');
  return module.default || module;
}

function createPuppeteerPdfProvider({ puppeteer = null, launchOptions = {}, pdfOptions = {} } = {}) {
  let browserPromise = null;

  async function getBrowser() {
    if (!browserPromise) {
      browserPromise = loadPuppeteer(puppeteer)
        .then((puppeteerModule) => puppeteerModule.launch({
          headless: process.env.PUPPETEER_HEADLESS || 'new',
          executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
          args: process.env.PUPPETEER_NO_SANDBOX === '0'
            ? ['--disable-dev-shm-usage']
            : ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
          dumpio: process.env.PUPPETEER_DUMPIO === '1',
          ...launchOptions
        }))
        .then((browser) => {
          browser.on?.('disconnected', () => {
            browserPromise = null;
          });

          return browser;
        })
        .catch((error) => {
          browserPromise = null;
          throw error;
        });
    }

    return browserPromise;
  }

  return {
    name: 'puppeteer',
    async renderPdf({ html, options = {} }) {
      const browser = await getBrowser();
      const page = await browser.newPage();

      try {
        await page.setContent(html, {
          waitUntil: 'domcontentloaded',
          timeout: Number(process.env.PDF_CONTENT_TIMEOUT_MS || 10000)
        });
        const buffer = await page.pdf({
          ...defaultPdfOptions,
          ...pdfOptions,
          ...options
        });

        return Buffer.from(buffer);
      } finally {
        await page.close();
      }
    }
  };
}

function createFallbackPdfProvider() {
  return {
    name: 'fallback',
    async renderPdf({ html }) {
      return createFallbackPdfBuffer(html);
    }
  };
}

let pdfProvider = createPuppeteerPdfProvider();

async function renderPdfFromHtml(html, options = {}) {
  try {
    return await pdfProvider.renderPdf({ html, options });
  } catch (error) {
    console.error('[PDF] Falha ao renderizar documento com o Puppeteer.', error);

    const fallbackHabilitado = process.env.PDF_PROVIDER_FALLBACK === '1';

    if (pdfProvider.name !== 'puppeteer' || !fallbackHabilitado) {
      throw error;
    }

    console.warn('[PDF] Usando gerador textual de emergencia.');
    return createFallbackPdfBuffer(html);
  }
}

function setPdfProvider(provider) {
  pdfProvider = provider || createPuppeteerPdfProvider();
}

function resetPdfProvider() {
  pdfProvider = createPuppeteerPdfProvider();
}

export {
  createFallbackPdfProvider,
  createPuppeteerPdfProvider,
  renderPdfFromHtml,
  resetPdfProvider,
  setPdfProvider
};
