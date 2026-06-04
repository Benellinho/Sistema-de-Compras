import fornecedoresCotacaoService from './fornecedores-cotacao.service.js';

function sendError(res, error) {
  res.status(error.statusCode || 500).json({
    error: error.message || 'Erro interno do servidor.'
  });
}

export async function addFornecedorCotacao(req, res) {
  try {
    const fornecedor = await fornecedoresCotacaoService.add(req.params.id, req.body);
    res.status(201).json(fornecedor);
  } catch (error) {
    sendError(res, error);
  }
}

export async function marcarEnvioFornecedorCotacao(req, res) {
  try {
    const fornecedor = await fornecedoresCotacaoService.marcarEnvio(
      req.params.id,
      req.params.cotacaoFornecedorId,
      req.body
    );
    res.json(fornecedor);
  } catch (error) {
    sendError(res, error);
  }
}

export async function updateFornecedorCotacaoStatus(req, res) {
  try {
    const fornecedor = await fornecedoresCotacaoService.updateStatus(
      req.params.id,
      req.params.cotacaoFornecedorId,
      req.body
    );
    res.json(fornecedor);
  } catch (error) {
    sendError(res, error);
  }
}
