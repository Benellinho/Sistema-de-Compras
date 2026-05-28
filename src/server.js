import app from './app.js';
import { initializeDatabase } from './db/connection.js';

const PORT = process.env.PORT || 3000;

async function startServer() {
  await initializeDatabase();

  app.listen(PORT, () => {
    console.log(`Servidor iniciado na porta ${PORT}`);
  });
}

startServer().catch((error) => {
  console.error('Erro ao iniciar o servidor:', error);
  process.exit(1);
});
