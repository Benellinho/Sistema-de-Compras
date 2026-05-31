import { Router } from 'express';
import { createItem, getItem, listItens, updateItem, updateItemStatus } from './itens.controller.js';

// Routes recebem as requisições HTTP e direcionam para o controller correto.
const router = Router();

router.get('/', listItens);
router.post('/', createItem);
router.get('/:id', getItem);
router.put('/:id', updateItem);
router.patch('/:id/status', updateItemStatus);

export default router;
