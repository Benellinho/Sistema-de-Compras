import { Router } from 'express';
import { createGrupo, deleteGrupo, getGrupo, listGrupos, updateGrupo, updateGrupoStatus } from './grupos.controller.js';

// Routes recebem as requisições HTTP e direcionam para o controller correto.
const router = Router();

router.get('/', listGrupos);
router.post('/', createGrupo);
router.get('/:grupoId', getGrupo);
router.put('/:grupoId', updateGrupo);
router.patch('/:grupoId/status', updateGrupoStatus);
router.delete('/:grupoId', deleteGrupo);

export default router;
