import { Router } from 'express';
import {
  addAnexoFornecedorCotacao,
  listAnexosFornecedorCotacao
} from '../anexos/anexos-cotacao.controller.js';
import { getComparativoCotacao } from '../comparativo/comparativo-cotacao.controller.js';
import {
  addFornecedorCotacao,
  marcarEnvioFornecedorCotacao,
  updateFornecedorCotacaoStatus
} from '../fornecedores/fornecedores-cotacao.controller.js';
import { getSolicitacaoOrcamentoPdf } from '../pdf/cotacoes-pdf.controller.js';
import { registrarRespostaCotacao } from '../respostas/respostas-cotacao.controller.js';
import {
  aprovarCotacaoPorItens,
  createCotacao,
  getCotacao,
  listCotacoes,
  updateCotacaoStatus
} from './cotacoes.controller.js';

const router = Router();

router.post('/', createCotacao);
router.get('/', listCotacoes);
router.get('/:id', getCotacao);
router.patch('/:id/status', updateCotacaoStatus);
router.post('/:id/aprovacao-itens', aprovarCotacaoPorItens);
router.get('/:id/comparativo', getComparativoCotacao);
router.post('/:id/fornecedores', addFornecedorCotacao);
router.get('/:id/fornecedores/:cotacaoFornecedorId/pdf', getSolicitacaoOrcamentoPdf);
router.patch('/:id/fornecedores/:cotacaoFornecedorId/envio', marcarEnvioFornecedorCotacao);
router.patch('/:id/fornecedores/:cotacaoFornecedorId/status', updateFornecedorCotacaoStatus);
router.get('/:id/fornecedores/:cotacaoFornecedorId/anexos', listAnexosFornecedorCotacao);
router.post('/:id/fornecedores/:cotacaoFornecedorId/anexos', addAnexoFornecedorCotacao);
router.post('/:id/fornecedores/:cotacaoFornecedorId/respostas', registrarRespostaCotacao);

export default router;
