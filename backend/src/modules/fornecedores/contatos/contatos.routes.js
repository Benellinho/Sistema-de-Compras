import { Router } from 'express';
import {
  createContato,
  deleteContato,
  getContato,
  listContatos,
  updateContato
} from './contatos.controller.js';

// Routes recebem as requisições HTTP e direcionam para o controller correto.
const router = Router({ mergeParams: true });

router.get('/', listContatos);
router.post('/', createContato);
router.get('/:contatoId', getContato);
router.put('/:contatoId', updateContato);
router.delete('/:contatoId', deleteContato);

export default router;
