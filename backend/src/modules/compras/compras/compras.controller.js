import comprasService from './compras.service.js';

function sendError(res, error) {
  res.status(error.statusCode || 500).json({
    error: error.message || 'Erro interno do servidor.'
  });
}

export async function createCompra(req, res) {
  try {
    const compra = await comprasService.create(req.body);
    res.status(201).json(compra);
  } catch (error) {
    sendError(res, error);
  }
}

export async function listCompras(req, res) {
  try {
    const compras = await comprasService.list(req.query);
    res.json(compras);
  } catch (error) {
    sendError(res, error);
  }
}

export async function getCompra(req, res) {
  try {
    const compra = await comprasService.findOne(req.params.id);
    res.json(compra);
  } catch (error) {
    sendError(res, error);
  }
}

export async function addFornecedorCompra(req, res) {
  try {
    const fornecedor = await comprasService.addFornecedor(req.params.id, req.body);
    res.status(201).json(fornecedor);
  } catch (error) {
    sendError(res, error);
  }
}

export async function addItemCompra(req, res) {
  try {
    const item = await comprasService.addItem(req.params.id, req.params.compraFornecedorId, req.body);
    res.status(201).json(item);
  } catch (error) {
    sendError(res, error);
  }
}

export async function enviarCompraAprovacao(req, res) {
  try {
    const compra = await comprasService.enviarAprovacao(req.params.id, req.body);
    res.json(compra);
  } catch (error) {
    sendError(res, error);
  }
}

export async function aprovarCompra(req, res) {
  try {
    const compra = await comprasService.aprovar(req.params.id, req.body);
    res.json(compra);
  } catch (error) {
    sendError(res, error);
  }
}

export async function cancelarCompra(req, res) {
  try {
    const compra = await comprasService.cancelar(req.params.id, req.body);
    res.json(compra);
  } catch (error) {
    sendError(res, error);
  }
}
