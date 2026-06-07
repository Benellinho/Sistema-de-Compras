import { Router } from 'express';
import { createUsuario, deleteUsuario, getUsuario, listUsuarios, updateUsuario } from './usuarios.controller.js';

// Routes recebem as requisições HTTP e direcionam para o controller correto.
const router = Router();

router.get('/', listUsuarios);
router.post('/', createUsuario);
router.get('/:id', getUsuario);
router.put('/:id', updateUsuario);
router.delete('/:id', deleteUsuario);

export default router;
