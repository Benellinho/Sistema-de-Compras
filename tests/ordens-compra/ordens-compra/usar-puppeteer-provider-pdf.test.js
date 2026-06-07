import assert from 'node:assert/strict';
import { createPuppeteerPdfProvider } from '../../../src/modules/shared/pdf/pdf-provider.js';

export default async function testUsarPuppeteerProviderPdf() {
  const calls = [];
  const fakeBrowser = {
    async newPage() {
      return {
        async setContent(html, options) {
          calls.push({ action: 'setContent', html, options });
        },
        async pdf(options) {
          calls.push({ action: 'pdf', options });
          return Buffer.from('%PDF-puppeteer-test');
        }
      };
    },
    async close() {
      calls.push({ action: 'close' });
    }
  };
  const provider = createPuppeteerPdfProvider({
    puppeteer: {
      async launch(options) {
        calls.push({ action: 'launch', options });
        return fakeBrowser;
      }
    }
  });

  const buffer = await provider.renderPdf({
    html: '<html><body><h1>Pedido de Compra</h1></body></html>'
  });

  assert.equal(provider.name, 'puppeteer');
  assert.equal(buffer.toString(), '%PDF-puppeteer-test');
  assert.equal(calls[0].action, 'launch');
  assert.equal(calls[1].action, 'setContent');
  assert.equal(calls[1].html.includes('Pedido de Compra'), true);
  assert.equal(calls[2].action, 'pdf');
  assert.equal(calls[2].options.format, 'A4');
  assert.equal(calls[2].options.printBackground, true);
  assert.equal(calls[3].action, 'close');
}
