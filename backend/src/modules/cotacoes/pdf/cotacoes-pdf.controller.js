import cotacoesPdfService from './cotacoes-pdf.service.js';

function sendError(res, error) {
  res.status(error.statusCode || 500).json({
    error: error.message || 'Erro interno do servidor.'
  });
}

export async function getSolicitacaoOrcamentoPdf(req, res) {
  try {
    const pdf = await cotacoesPdfService.gerarSolicitacaoOrcamentoPdf(
      req.params.id,
      req.params.cotacaoFornecedorId
    );

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${pdf.filename}"`);
    res.send(pdf.buffer);
  } catch (error) {
    sendError(res, error);
  }
}
