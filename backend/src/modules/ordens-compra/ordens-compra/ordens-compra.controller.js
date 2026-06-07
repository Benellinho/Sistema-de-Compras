import ordensCompraService from './ordens-compra.service.js';

function sendError(res, error) {
  res.status(error.statusCode || 500).json({
    error: error.message || 'Erro interno do servidor.'
  });
}

export async function createOrdemCompra(req, res) {
  try {
    const ordem = await ordensCompraService.create(req.body);
    res.status(201).json(ordem);
  } catch (error) {
    sendError(res, error);
  }
}

export async function listOrdensCompra(req, res) {
  try {
    const ordens = await ordensCompraService.list(req.query);
    res.json(ordens);
  } catch (error) {
    sendError(res, error);
  }
}

export async function getOrdemCompra(req, res) {
  try {
    const ordem = await ordensCompraService.findOne(req.params.id);
    res.json(ordem);
  } catch (error) {
    sendError(res, error);
  }
}

export async function cancelarOrdemCompra(req, res) {
  try {
    const ordem = await ordensCompraService.cancelar(req.params.id, req.body);
    res.json(ordem);
  } catch (error) {
    sendError(res, error);
  }
}

export async function gerarOrdemCompraSubstituta(req, res) {
  try {
    const ordem = await ordensCompraService.gerarSubstituta(req.params.id, req.body);
    res.status(201).json(ordem);
  } catch (error) {
    sendError(res, error);
  }
}

export async function getResumoOrdensCompra(req, res) {
  try {
    const resumo = await ordensCompraService.getResumoByCompraId(req.params.id);
    res.json(resumo);
  } catch (error) {
    sendError(res, error);
  }
}

export async function getOrdemCompraPdf(req, res) {
  try {
    const pdf = await ordensCompraService.gerarPdf(req.params.id);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${pdf.filename}"`);
    res.send(pdf.buffer);
  } catch (error) {
    sendError(res, error);
  }
}

export async function enviarOrdemCompra(req, res) {
  try {
    const envio = await ordensCompraService.enviar(req.params.id, req.body);
    res.status(201).json(envio);
  } catch (error) {
    sendError(res, error);
  }
}
