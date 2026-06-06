async function enviarOrdemCompra({ ordem, contato }) {
  return {
    provider: 'local-fake',
    message_id: `local-${ordem.id}-${contato.id}-${Date.now()}`
  };
}

export default {
  enviarOrdemCompra
};
