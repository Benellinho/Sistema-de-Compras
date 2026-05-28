import { Router } from 'express';
import { createFornecedor, listFornecedores } from './fornecedores.controller.js';

// Routes recebem as requisições HTTP e direcionam para o controller correto.
const router = Router();

router.get('/', listFornecedores);
router.post('/', createFornecedor);

export default router;
