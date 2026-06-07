import assert from 'node:assert/strict';
import gruposService from '../../../src/modules/itens/grupos/grupos.service.js';
import {
  cleanupGrupoByNome,
  cleanupItemByCodigo,
  createGrupoFixture,
  createItemFixture,
  setupDatabase
} from '../helpers/test-utils.js';

export default async function testBloquearRemocaoGrupoComItens() {
  await setupDatabase();

  const grupo = await createGrupoFixture();
  const item = await createItemFixture({ grupo_id: grupo.id });

  await assert.rejects(
    () => gruposService.remove(grupo.id),
    (error) => error.statusCode === 409 && error.message.includes('itens vinculados')
  );

  await cleanupItemByCodigo(item.codigo);
  await cleanupGrupoByNome(grupo.nome);
}
