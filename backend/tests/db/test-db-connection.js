import { initializeDatabase, getDatabase } from '../../src/db/connection.js';

async function main() {
  await initializeDatabase();

  const database = await getDatabase();
  const version = await database.get('SELECT sqlite_version() AS version');
  const foreignKeys = await database.get('PRAGMA foreign_keys');
  const fornecedorColumns = await database.all('PRAGMA table_info(FORNECEDORES)');
  const fornecedorContatoColumns = await database.all('PRAGMA table_info(FORNECEDOR_CONTATOS)');
  const tables = await database.all(`
    SELECT name
    FROM sqlite_master
    WHERE type = 'table'
      AND name NOT LIKE 'sqlite_%'
    ORDER BY name
  `);
  const expectedFornecedorColumns = ['id', 'cnpj', 'status', 'razao_social', 'nome_fantasia', 'telefone', 'email'];
  const expectedFornecedorContatoColumns = ['id', 'fornecedor_id', 'nome', 'cargo', 'telefone', 'email'];
  const fornecedorColumnNames = fornecedorColumns.map((column) => column.name);
  const fornecedorContatoColumnNames = fornecedorContatoColumns.map((column) => column.name);
  const missingFornecedorColumns = expectedFornecedorColumns.filter(
    (columnName) => !fornecedorColumnNames.includes(columnName)
  );
  const missingFornecedorContatoColumns = expectedFornecedorContatoColumns.filter(
    (columnName) => !fornecedorContatoColumnNames.includes(columnName)
  );

  if (missingFornecedorColumns.length > 0) {
    throw new Error(`Colunas ausentes em FORNECEDORES: ${missingFornecedorColumns.join(', ')}`);
  }

  if (missingFornecedorContatoColumns.length > 0) {
    throw new Error(`Colunas ausentes em FORNECEDOR_CONTATOS: ${missingFornecedorContatoColumns.join(', ')}`);
  }

  console.log('Conexao com SQLite OK');
  console.log(`Versao SQLite: ${version.version}`);
  console.log(`Foreign keys: ${foreignKeys.foreign_keys === 1 ? 'ON' : 'OFF'}`);
  console.log(`Tabelas encontradas: ${tables.map((table) => table.name).join(', ')}`);
  console.log(`Colunas FORNECEDORES: ${fornecedorColumnNames.join(', ')}`);
  console.log(`Colunas FORNECEDOR_CONTATOS: ${fornecedorContatoColumnNames.join(', ')}`);

  await database.close();
}

main().catch((error) => {
  console.error('Falha ao validar conexao com SQLite');
  console.error(error);
  process.exitCode = 1;
});
