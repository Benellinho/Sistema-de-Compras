import { initializeDatabase, getDatabase } from '../../src/db/connection.js';

async function main() {
  await initializeDatabase();

  const database = await getDatabase();
  const version = await database.get('SELECT version() AS version');
  const fornecedorColumns = await database.all(`
    SELECT column_name AS name
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'fornecedores'
    ORDER BY ordinal_position
  `);
  const fornecedorContatoColumns = await database.all(`
    SELECT column_name AS name
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'fornecedor_contatos'
    ORDER BY ordinal_position
  `);
  const tables = await database.all(`
    SELECT table_name AS name
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
    ORDER BY table_name
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

  console.log('Conexao com PostgreSQL OK');
  console.log(`Versao PostgreSQL: ${version.version}`);
  console.log(`Tabelas encontradas: ${tables.map((table) => table.name).join(', ')}`);
  console.log(`Colunas FORNECEDORES: ${fornecedorColumnNames.join(', ')}`);
  console.log(`Colunas FORNECEDOR_CONTATOS: ${fornecedorContatoColumnNames.join(', ')}`);

  await database.close();
}

main().catch((error) => {
  console.error('Falha ao validar conexao com PostgreSQL');
  console.error(error);
  process.exitCode = 1;
});
