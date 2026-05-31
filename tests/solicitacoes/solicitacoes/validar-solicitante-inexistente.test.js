import assert from 'node:assert/strict';
import solicitacoesService from '../../../src/modules/solicitacoes/solicitacoes.service.js';
import { setupDatabase } from '../helpers/test-utils.js';

export default async function testValidarSolicitanteInexistente() {
  await setupDatabase();

  await assert.rejects(
    () => solicitacoesService.create({ solicitante_id: 99999999 }),
    (error) => error.statusCode === 404 && error.message.includes('Solicitante')
  );
}
