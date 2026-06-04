import { Router } from 'express';
import { getComparativoCotacao } from '../comparativo/comparativo-cotacao.controller.js';
import {
  addFornecedorCotacao,
  marcarEnvioFornecedorCotacao,
  updateFornecedorCotacaoStatus
} from '../fornecedores/fornecedores-cotacao.controller.js';
import { registrarRespostaCotacao } from '../respostas/respostas-cotacao.controller.js';
import { createCotacao, getCotacao, updateCotacaoStatus } from './cotacoes.controller.js';

const router = Router();

router.post('/', createCotacao);
router.get('/:id', getCotacao);
router.patch('/:id/status', updateCotacaoStatus);
router.get('/:id/comparativo', getComparativoCotacao);
router.post('/:id/fornecedores', addFornecedorCotacao);
router.patch('/:id/fornecedores/:cotacaoFornecedorId/envio', marcarEnvioFornecedorCotacao);
router.patch('/:id/fornecedores/:cotacaoFornecedorId/status', updateFornecedorCotacaoStatus);
router.post('/:id/fornecedores/:cotacaoFornecedorId/respostas', registrarRespostaCotacao);

export default router;
