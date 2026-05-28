import { Router } from 'express';
import { createSolicitacao, listSolicitacoes } from './solicitacoes.controller.js';

// Routes recebem as requisições HTTP e direcionam para o controller correto.
const router = Router();

router.get('/', listSolicitacoes);
router.post('/', createSolicitacao);

export default router;
