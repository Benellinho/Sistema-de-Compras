import fornecedoresService from './fornecedores.service.js';

function sendError(res, error) {
  res.status(error.statusCode || 500).json({
    error: error.message || 'Erro interno do servidor.'
  });
}

// Controllers traduzem HTTP em chamadas de negócio e formatam as respostas da API.
export async function listFornecedores(req, res, next) {
  try {
    const fornecedores = await fornecedoresService.list();
    res.json(fornecedores);
  } catch (error) {
    sendError(res, error);
  }
}

export async function createFornecedor(req, res, next) {
  try {
    const fornecedor = await fornecedoresService.create(req.body);
    res.status(201).json(fornecedor);
  } catch (error) {
    sendError(res, error);
  }
}

export async function updateFornecedor(req, res, next) {
  try {
    const fornecedor = await fornecedoresService.update(req.params.id, req.body);
    res.json(fornecedor);
  } catch (error) {
    sendError(res, error);
  }
}
