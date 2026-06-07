import { Router } from 'express';
import { decideSolicitacao } from './aprovacoes.controller.js';

const router = Router({ mergeParams: true });

router.post('/', decideSolicitacao);

export default router;
