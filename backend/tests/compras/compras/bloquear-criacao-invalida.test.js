import assert from 'node:assert/strict';
import comprasService from '../../../src/modules/compras/compras/compras.service.js';

export default async function testBloquearCriacaoInvalida() {
  await assert.rejects(
    () => comprasService.create({}),
    /Cotacao e obrigatoria para criar compra./
  );

  await assert.rejects(
    () => comprasService.create({ cotacao_id: 999999999 }),
    /Cotacao nao encontrada./
  );
}
