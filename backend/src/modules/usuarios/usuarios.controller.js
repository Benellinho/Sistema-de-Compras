import usuariosService from './usuarios.service.js';

function sendError(res, error) {
  res.status(error.statusCode || 500).json({
    error: error.message || 'Erro interno do servidor.'
  });
}

// Controllers traduzem HTTP em chamadas de negócio e formatam as respostas da API.
export async function listUsuarios(req, res, next) {
  try {
    const usuarios = await usuariosService.list();
    res.json(usuarios);
  } catch (error) {
    sendError(res, error);
  }
}

export async function getUsuario(req, res, next) {
  try {
    const usuario = await usuariosService.findOne(req.params.id);
    res.json(usuario);
  } catch (error) {
    sendError(res, error);
  }
}

export async function createUsuario(req, res, next) {
  try {
    const usuario = await usuariosService.create(req.body);
    res.status(201).json(usuario);
  } catch (error) {
    sendError(res, error);
  }
}

export async function updateUsuario(req, res, next) {
  try {
    const usuario = await usuariosService.update(req.params.id, req.body);
    res.json(usuario);
  } catch (error) {
    sendError(res, error);
  }
}

export async function deleteUsuario(req, res, next) {
  try {
    await usuariosService.remove(req.params.id);
    res.status(204).send();
  } catch (error) {
    sendError(res, error);
  }
}
