import assert from 'node:assert/strict';
import itensService from '../../../src/modules/itens/itens.service.js';
import { cleanupItemByCodigo, createItemPayload, setupDatabase } from '../helpers/test-utils.js';

export default async function testValidarGrupoInexistente() {
  await setupDatabase();

  const payload = createItemPayload({ grupo_id: 99999999 });
  await cleanupItemByCodigo(payload.codigo);

  await assert.rejects(
    () => itensService.create(payload),
    (error) => error.statusCode === 404 && error.message.includes('Grupo')
  );
}
