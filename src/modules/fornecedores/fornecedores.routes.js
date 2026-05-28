import { Router } from 'express';
import contatosRoutes from './contatos/contatos.routes.js';
import {
  createFornecedor,
  listFornecedores,
  updateFornecedor
} from './fornecedores.controller.js';

// Routes recebem as requisições HTTP e direcionam para o controller correto.
const router = Router();

router.get('/', listFornecedores);
router.post('/', createFornecedor);
router.put('/:id', updateFornecedor);
router.use('/:id/contatos', contatosRoutes);

export default router;
