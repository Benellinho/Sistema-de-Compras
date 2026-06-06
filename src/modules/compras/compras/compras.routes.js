import { Router } from 'express';
import {
  addFornecedorCompra,
  addItemCompra,
  aprovarCompra,
  cancelarCompra,
  createCompra,
  enviarCompraAprovacao,
  getCompra,
  listCompras
} from './compras.controller.js';

const router = Router();

router.post('/', createCompra);
router.get('/', listCompras);
router.get('/:id', getCompra);
router.post('/:id/fornecedores', addFornecedorCompra);
router.post('/:id/fornecedores/:compraFornecedorId/itens', addItemCompra);
router.post('/:id/enviar-aprovacao', enviarCompraAprovacao);
router.post('/:id/aprovacao', aprovarCompra);
router.patch('/:id/cancelamento', cancelarCompra);

export default router;
