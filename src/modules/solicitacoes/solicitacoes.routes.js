import { Router } from 'express';
import itensSolicitacaoRoutes from './itens/itens-solicitacao.routes.js';
import {
  createSolicitacao,
  getSolicitacao,
  listSolicitacoes,
  updateSolicitacaoStatus
} from './solicitacoes.controller.js';

// Routes recebem as requisições HTTP e direcionam para o controller correto.
const router = Router();

router.get('/', listSolicitacoes);
router.post('/', createSolicitacao);
router.use('/:id/itens', itensSolicitacaoRoutes);
router.get('/:id', getSolicitacao);
router.put('/:id/status', updateSolicitacaoStatus);

export default router;
