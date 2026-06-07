import anexosCotacaoService from './anexos-cotacao.service.js';

function sendError(res, error) {
  res.status(error.statusCode || 500).json({
    error: error.message || 'Erro interno do servidor.'
  });
}

export async function addAnexoFornecedorCotacao(req, res) {
  try {
    const anexo = await anexosCotacaoService.adicionar(
      req.params.id,
      req.params.cotacaoFornecedorId,
      req.body
    );
    res.status(201).json(anexo);
  } catch (error) {
    sendError(res, error);
  }
}

export async function listAnexosFornecedorCotacao(req, res) {
  try {
    const anexos = await anexosCotacaoService.listar(
      req.params.id,
      req.params.cotacaoFornecedorId
    );
    res.json(anexos);
  } catch (error) {
    sendError(res, error);
  }
}
