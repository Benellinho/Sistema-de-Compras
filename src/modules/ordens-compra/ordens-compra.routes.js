import { Router } from 'express';
import {
  cancelarOrdemCompra,
  createOrdemCompra,
  gerarOrdemCompraSubstituta,
  getOrdemCompra,
  listOrdensCompra
} from './ordens-compra.controller.js';

const router = Router();

router.post('/', createOrdemCompra);
router.get('/', listOrdensCompra);
router.get('/:id', getOrdemCompra);
router.patch('/:id/cancelamento', cancelarOrdemCompra);
router.post('/:id/substituta', gerarOrdemCompraSubstituta);

export default router;
