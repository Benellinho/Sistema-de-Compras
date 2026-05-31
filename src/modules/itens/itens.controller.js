import itensService from './itens.service.js';

function sendError(res, error) {
  res.status(error.statusCode || 500).json({
    error: error.message || 'Erro interno do servidor.'
  });
}

// Controllers traduzem HTTP em chamadas de negócio e formatam as respostas da API.
export async function listItens(req, res, next) {
  try {
    const itens = await itensService.list();
    res.json(itens);
  } catch (error) {
    sendError(res, error);
  }
}

export async function getItem(req, res, next) {
  try {
    const item = await itensService.findOne(req.params.id);
    res.json(item);
  } catch (error) {
    sendError(res, error);
  }
}

export async function createItem(req, res, next) {
  try {
    const item = await itensService.create(req.body);
    res.status(201).json(item);
  } catch (error) {
    sendError(res, error);
  }
}

export async function updateItem(req, res, next) {
  try {
    const item = await itensService.update(req.params.id, req.body);
    res.json(item);
  } catch (error) {
    sendError(res, error);
  }
}

export async function updateItemStatus(req, res, next) {
  try {
    const item = await itensService.updateStatus(req.params.id, req.body);
    res.json(item);
  } catch (error) {
    sendError(res, error);
  }
}

export async function deleteItem(req, res, next) {
  try {
    await itensService.remove(req.params.id);
    res.status(204).send();
  } catch (error) {
    sendError(res, error);
  }
}
