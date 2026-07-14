const { join } = require('node:path');

module.exports = {
  // O build e a aplicação usam exatamente o mesmo cache no Render.
  cacheDirectory: join(__dirname, '.cache', 'puppeteer')
};
