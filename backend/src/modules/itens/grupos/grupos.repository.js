import { getDatabase } from '../../../db/connection.js';

const grupoFields = 'id, nome, codigo, ativo, created_at, updated_at';

// Repositories são a única camada que executa SQL puro.
async function findAll() {
  const database = await getDatabase();

  return database.all(`SELECT ${grupoFields} FROM GRUPOS_ITENS ORDER BY nome ASC`);
}

async function findById(id) {
  const database = await getDatabase();

  return database.get(`SELECT ${grupoFields} FROM GRUPOS_ITENS WHERE id = ?`, id);
}

async function findByNome(nome) {
  const database = await getDatabase();

  return database.get(`SELECT ${grupoFields} FROM GRUPOS_ITENS WHERE nome = ?`, nome);
}

async function findByCodigo(codigo) {
  const database = await getDatabase();

  return database.get(`SELECT ${grupoFields} FROM GRUPOS_ITENS WHERE codigo = ?`, codigo);
}

async function create({ nome, codigo, ativo = 1 }) {
  const database = await getDatabase();
  const result = await database.run(
    `INSERT INTO GRUPOS_ITENS (nome, codigo, ativo, created_at, updated_at)
     VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
    [nome, codigo, ativo]
  );

  return findById(result.lastID);
}

async function update(id, { nome, codigo, ativo }) {
  const database = await getDatabase();
  await database.run(
    `WITH grupo_atualizado AS (
       UPDATE GRUPOS_ITENS
       SET nome = COALESCE(?, nome),
           codigo = COALESCE(?, codigo),
           ativo = COALESCE(?, ativo),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?
       RETURNING id, codigo
     )
     UPDATE ITENS_COMPRA i
     SET codigo = g.codigo || ' - ' || LPAD(i.sequencial::TEXT, 3, '0'),
         updated_at = CURRENT_TIMESTAMP
     FROM grupo_atualizado g
     WHERE i.grupo_id = g.id`,
    [nome, codigo, ativo, id]
  );

  return findById(id);
}

async function countItensByGrupoId(id) {
  const database = await getDatabase();
  const result = await database.get('SELECT COUNT(*) AS total FROM ITENS_COMPRA WHERE grupo_id = ?', id);

  return result.total;
}

async function remove(id) {
  const database = await getDatabase();

  await database.run('DELETE FROM GRUPOS_ITENS WHERE id = ?', id);
}

export default {
  findAll,
  findById,
  findByNome,
  findByCodigo,
  create,
  update,
  countItensByGrupoId,
  remove
};
