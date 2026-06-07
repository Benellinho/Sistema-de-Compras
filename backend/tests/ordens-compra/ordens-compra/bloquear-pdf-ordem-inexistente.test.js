import assert from 'node:assert/strict';
import ordensCompraService from '../../../src/modules/ordens-compra/ordens-compra/ordens-compra.service.js';
import { setupDatabase } from '../helpers/test-utils.js';

export default async function testBloquearPdfOrdemInexistente() {
  await setupDatabase();

  await assert.rejects(
    () => ordensCompraService.gerarPdf(999999999),
    /Ordem de compra nao encontrada/
  );
}
