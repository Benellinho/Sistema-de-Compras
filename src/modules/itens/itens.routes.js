import { Router } from 'express';
import { createItem, listItens } from './itens.controller.js';

// Routes recebem as requisições HTTP e direcionam para o controller correto.
const router = Router();

router.get('/', listItens);
router.post('/', createItem);

export default router;
