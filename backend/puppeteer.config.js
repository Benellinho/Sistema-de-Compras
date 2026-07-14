import { join } from 'node:path';

export default {
  // Mantém o Chrome no artefato da aplicação para que ele continue disponível
  // entre as etapas de build e execução do Render.
  cacheDirectory: join(import.meta.dirname, '.cache', 'puppeteer')
};
