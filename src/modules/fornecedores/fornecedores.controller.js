import fornecedoresService from './fornecedores.service.js';

// Controllers traduzem HTTP em chamadas de negócio e formatam as respostas da API.
export async function listFornecedores(req, res, next) {
  try {
    const fornecedores = await fornecedoresService.list();
    res.json(fornecedores);
  } catch (error) {
    next(error);
  }
}

export async function createFornecedor(req, res, next) {
  try {
    const fornecedor = await fornecedoresService.create(req.body);
    res.status(201).json(fornecedor);
  } catch (error) {
    next(error);
  }
}
