import { Router } from 'express';
import aprovacoesRoutes from '../aprovacoes/aprovacoes.routes.js';
import historicoRoutes from '../historico/historico.routes.js';
import itensSolicitacaoRoutes from '../itens-solicitacao/itens-solicitacao.routes.js';
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
router.use('/:id/aprovacao', aprovacoesRoutes);
router.use('/:id/historico', historicoRoutes);
router.get('/:id', getSolicitacao);
router.put('/:id/status', updateSolicitacaoStatus);

export default router;
