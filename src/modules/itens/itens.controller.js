import itensService from './itens.service.js';

// Controllers traduzem HTTP em chamadas de negócio e formatam as respostas da API.
export async function listItens(req, res, next) {
  try {
    const itens = await itensService.list();
    res.json(itens);
  } catch (error) {
    next(error);
  }
}

export async function createItem(req, res, next) {
  try {
    const item = await itensService.create(req.body);
    res.status(201).json(item);
  } catch (error) {
    next(error);
  }
}
