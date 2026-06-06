import { Router } from 'express';
import {
  cancelarOrdemCompra,
  createOrdemCompra,
  enviarOrdemCompra,
  gerarOrdemCompraSubstituta,
  getOrdemCompra,
  getOrdemCompraPdf,
  listOrdensCompra
} from './ordens-compra.controller.js';

const router = Router();

router.post('/', createOrdemCompra);
router.get('/', listOrdensCompra);
router.get('/:id/pdf', getOrdemCompraPdf);
router.post('/:id/envios', enviarOrdemCompra);
router.get('/:id', getOrdemCompra);
router.patch('/:id/cancelamento', cancelarOrdemCompra);
router.post('/:id/substituta', gerarOrdemCompraSubstituta);

export default router;
