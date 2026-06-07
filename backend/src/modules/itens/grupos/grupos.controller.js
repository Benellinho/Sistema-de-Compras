import gruposService from './grupos.service.js';

function sendError(res, error) {
  res.status(error.statusCode || 500).json({
    error: error.message || 'Erro interno do servidor.'
  });
}

// Controllers traduzem HTTP em chamadas de negócio e formatam as respostas da API.
export async function listGrupos(req, res, next) {
  try {
    const grupos = await gruposService.list();
    res.json(grupos);
  } catch (error) {
    sendError(res, error);
  }
}

export async function getGrupo(req, res, next) {
  try {
    const grupo = await gruposService.findOne(req.params.grupoId);
    res.json(grupo);
  } catch (error) {
    sendError(res, error);
  }
}

export async function createGrupo(req, res, next) {
  try {
    const grupo = await gruposService.create(req.body);
    res.status(201).json(grupo);
  } catch (error) {
    sendError(res, error);
  }
}

export async function updateGrupo(req, res, next) {
  try {
    const grupo = await gruposService.update(req.params.grupoId, req.body);
    res.json(grupo);
  } catch (error) {
    sendError(res, error);
  }
}

export async function updateGrupoStatus(req, res, next) {
  try {
    const grupo = await gruposService.updateStatus(req.params.grupoId, req.body);
    res.json(grupo);
  } catch (error) {
    sendError(res, error);
  }
}

export async function deleteGrupo(req, res, next) {
  try {
    await gruposService.remove(req.params.grupoId);
    res.status(204).send();
  } catch (error) {
    sendError(res, error);
  }
}
