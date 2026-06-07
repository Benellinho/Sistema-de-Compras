import respostasCotacaoService from './respostas-cotacao.service.js';

function sendError(res, error) {
  res.status(error.statusCode || 500).json({
    error: error.message || 'Erro interno do servidor.'
  });
}

export async function registrarRespostaCotacao(req, res) {
  try {
    const resposta = await respostasCotacaoService.registrar(
      req.params.id,
      req.params.cotacaoFornecedorId,
      req.body
    );
    res.json(resposta);
  } catch (error) {
    sendError(res, error);
  }
}
