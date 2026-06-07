import express from 'express';
import comprasRoutes from './modules/compras/compras/compras.routes.js';
import cotacoesRoutes from './modules/cotacoes/cotacoes/cotacoes.routes.js';
import fornecedoresRoutes from './modules/fornecedores/fornecedores/fornecedores.routes.js';
import gruposRoutes from './modules/itens/grupos/grupos.routes.js';
import itensRoutes from './modules/itens/itens/itens.routes.js';
import ordensCompraRoutes from './modules/ordens-compra/ordens-compra/ordens-compra.routes.js';
import solicitacoesRoutes from './modules/solicitacoes/solicitacoes/solicitacoes.routes.js';
import usuariosRoutes from './modules/usuarios/usuarios.routes.js';

const app = express();

function corsMiddleware(req, res, next) {
  const requestOrigin = req.headers.origin;

  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');

  if (requestOrigin) {
    res.setHeader('Access-Control-Allow-Origin', requestOrigin);
  }

  if (req.method === 'OPTIONS') {
    res.status(204).send();
    return;
  }

  next();
}

app.set('trust proxy', 1);
app.use(corsMiddleware);
app.use(express.json());

app.get('/', (req, res) => {
  res
    .type('text/plain')
    .send('API do Sistema de Compras funcionando. Use /health para verificar o status.');
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/cotacoes', cotacoesRoutes);
app.use('/compras', comprasRoutes);
app.use('/fornecedores', fornecedoresRoutes);
app.use('/grupos', gruposRoutes);
app.use('/itens', itensRoutes);
app.use('/ordens-compra', ordensCompraRoutes);
app.use('/solicitacoes', solicitacoesRoutes);
app.use('/usuarios', usuariosRoutes);

export default app;
