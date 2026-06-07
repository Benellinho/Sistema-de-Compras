import assert from 'node:assert/strict';
import { createLocalwebSmtpAdapter } from '../../../src/modules/ordens-compra/ordens-compra/ordens-compra-envio.adapter.js';

export default async function testEnviarOrdemLocalwebSmtpProvider() {
  let transportConfig;
  let mailOptions;
  const adapter = createLocalwebSmtpAdapter({
    config: {
      host: 'smtp.localweb.test',
      port: 587,
      secure: false,
      auth: {
        user: 'compras@empresa.test',
        pass: 'senha-teste'
      },
      from: 'compras@empresa.test'
    },
    createTransport(config) {
      transportConfig = config;

      return {
        async sendMail(options) {
          mailOptions = options;
          return { messageId: 'smtp-localweb-123' };
        }
      };
    }
  });

  const result = await adapter.enviarOrdemCompra({
    ordem: {
      id: 1,
      numero_oc: 'OC-2026-000001'
    },
    contato: {
      id: 2,
      email: 'fornecedor@empresa.test'
    },
    envio: {
      email_destino: 'destino@fornecedor.test'
    },
    pdfHtml: '<strong>Pedido de Compra</strong>',
    pdfBuffer: Buffer.from('%PDF-ordem'),
    pdfFilename: 'OC-2026-000001.pdf'
  });

  assert.equal(adapter.provider, 'localweb-smtp');
  assert.deepEqual(transportConfig, {
    host: 'smtp.localweb.test',
    port: 587,
    secure: false,
    auth: {
      user: 'compras@empresa.test',
      pass: 'senha-teste'
    }
  });
  assert.equal(mailOptions.from, 'compras@empresa.test');
  assert.equal(mailOptions.to, 'destino@fornecedor.test');
  assert.equal(mailOptions.subject, 'Pedido de Compra OC-2026-000001');
  assert.equal(mailOptions.attachments[0].filename, 'OC-2026-000001.pdf');
  assert.equal(mailOptions.attachments[0].contentType, 'application/pdf');
  assert.equal(result.provider, 'localweb-smtp');
  assert.equal(result.message_id, 'smtp-localweb-123');
}
