import contatosService from './contatos.service.js';

function sendError(res, error) {
  res.status(error.statusCode || 500).json({
    error: error.message || 'Erro interno do servidor.'
  });
}

// Controllers traduzem HTTP em chamadas de negócio e formatam as respostas da API.
export async function listContatos(req, res, next) {
  try {
    const contatos = await contatosService.list(req.params.id);
    res.json(contatos);
  } catch (error) {
    sendError(res, error);
  }
}

export async function getContato(req, res, next) {
  try {
    const contato = await contatosService.findOne(req.params.id, req.params.contatoId);
    res.json(contato);
  } catch (error) {
    sendError(res, error);
  }
}

export async function createContato(req, res, next) {
  try {
    const contato = await contatosService.create(req.params.id, req.body);
    res.status(201).json(contato);
  } catch (error) {
    sendError(res, error);
  }
}

export async function updateContato(req, res, next) {
  try {
    const contato = await contatosService.update(req.params.id, req.params.contatoId, req.body);
    res.json(contato);
  } catch (error) {
    sendError(res, error);
  }
}

export async function deleteContato(req, res, next) {
  try {
    await contatosService.remove(req.params.id, req.params.contatoId);
    res.status(204).send();
  } catch (error) {
    sendError(res, error);
  }
}
