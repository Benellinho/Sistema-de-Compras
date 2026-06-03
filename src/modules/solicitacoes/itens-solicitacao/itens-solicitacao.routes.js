import { Router } from 'express';
import { createItemSolicitacao, deleteItemSolicitacao } from './itens-solicitacao.controller.js';

// Routes recebem as requisições HTTP e direcionam para o controller correto.
const router = Router({ mergeParams: true });

router.post('/', createItemSolicitacao);
router.delete('/:itemSolicitacaoId', deleteItemSolicitacao);

export default router;
