function getEmailProvider() {
  return process.env.ORDEM_COMPRA_EMAIL_PROVIDER || process.env.EMAIL_PROVIDER || 'local-fake';
}

function getLocalwebConfig(overrides = {}) {
  return {
    host: process.env.LOCALWEB_SMTP_HOST || process.env.SMTP_HOST || 'smtp.localweb.com.br',
    port: Number(process.env.LOCALWEB_SMTP_PORT || process.env.SMTP_PORT || 587),
    secure: String(process.env.LOCALWEB_SMTP_SECURE || process.env.SMTP_SECURE || 'false') === 'true',
    auth: {
      user: process.env.LOCALWEB_SMTP_USER || process.env.SMTP_USER,
      pass: process.env.LOCALWEB_SMTP_PASS || process.env.SMTP_PASS
    },
    from: process.env.LOCALWEB_SMTP_FROM || process.env.SMTP_FROM || process.env.LOCALWEB_SMTP_USER || process.env.SMTP_USER,
    ...overrides
  };
}

async function loadCreateTransport(createTransport) {
  if (createTransport) {
    return createTransport;
  }

  const module = await import('nodemailer');
  const nodemailer = module.default || module;
  return nodemailer.createTransport;
}

function validateSmtpConfig(config) {
  if (!config.auth?.user || !config.auth?.pass) {
    throw new Error('Credenciais SMTP da Localweb nao configuradas.');
  }

  if (!config.from) {
    throw new Error('Remetente SMTP da Localweb nao configurado.');
  }
}

function createLocalFakeAdapter() {
  return {
    provider: 'local-fake',
    async enviarOrdemCompra({ ordem, contato }) {
      return {
        provider: 'local-fake',
        message_id: `local-${ordem.id}-${contato.id}-${Date.now()}`
      };
    }
  };
}

function createLocalwebSmtpAdapter({ createTransport = null, config = {} } = {}) {
  const smtpConfig = getLocalwebConfig(config);

  return {
    provider: 'localweb-smtp',
    async enviarOrdemCompra({ ordem, contato, envio, pdfHtml, pdfBuffer, pdfFilename }) {
      validateSmtpConfig(smtpConfig);

      const createTransportFn = await loadCreateTransport(createTransport);
      const transporter = createTransportFn({
        host: smtpConfig.host,
        port: smtpConfig.port,
        secure: smtpConfig.secure,
        auth: smtpConfig.auth
      });
      const info = await transporter.sendMail({
        from: smtpConfig.from,
        to: envio?.email_destino || contato.email,
        subject: `Pedido de Compra ${ordem.numero_oc}`,
        html: pdfHtml,
        attachments: [
          {
            filename: pdfFilename,
            content: pdfBuffer,
            contentType: 'application/pdf'
          }
        ]
      });

      return {
        provider: 'localweb-smtp',
        message_id: info?.messageId || info?.message_id || null
      };
    }
  };
}

function createDefaultEnvioAdapter() {
  const provider = getEmailProvider().toLowerCase();

  if (['localweb', 'localweb-smtp', 'smtp', 'nodemailer'].includes(provider)) {
    return createLocalwebSmtpAdapter();
  }

  return createLocalFakeAdapter();
}

export {
  createDefaultEnvioAdapter,
  createLocalFakeAdapter,
  createLocalwebSmtpAdapter
};

export default createDefaultEnvioAdapter();
