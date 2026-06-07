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

const defaultAllowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173'
];

function getAllowedOrigins() {
  const origins = process.env.CORS_ORIGIN || process.env.FRONTEND_ORIGIN || '';

  return origins
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function corsMiddleware(req, res, next) {
  const requestOrigin = req.headers.origin;
  const allowedOrigins = getAllowedOrigins();
  const origins = allowedOrigins.length > 0 ? allowedOrigins : defaultAllowedOrigins;
  const allowAnyOrigin = origins.includes('*');

  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');

  if (requestOrigin && (allowAnyOrigin || origins.includes(requestOrigin))) {
    res.setHeader('Access-Control-Allow-Origin', allowAnyOrigin ? '*' : requestOrigin);
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
