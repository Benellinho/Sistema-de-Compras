import assert from 'node:assert/strict';
import itensService from '../../../src/modules/itens/itens.service.js';
import { cleanupGrupoByNome, createItemFixture, setupDatabase } from '../helpers/test-utils.js';

export default async function testRemoverItem() {
  await setupDatabase();

  const item = await createItemFixture();

  await itensService.remove(item.id);

  await assert.rejects(
    () => itensService.findOne(item.id),
    (error) => error.statusCode === 404 && error.message.includes('Item')
  );

  await cleanupGrupoByNome(item.grupoFixture.nome);
}
