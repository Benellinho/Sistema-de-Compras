import { Router } from 'express';
import { listSolicitacaoHistorico } from './historico.controller.js';

const router = Router({ mergeParams: true });

router.get('/', listSolicitacaoHistorico);

export default router;
