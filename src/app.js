import express from 'express';
import comprasRoutes from './modules/compras/compras/compras.routes.js';
import cotacoesRoutes from './modules/cotacoes/cotacoes/cotacoes.routes.js';
import fornecedoresRoutes from './modules/fornecedores/fornecedores/fornecedores.routes.js';
import gruposRoutes from './modules/itens/grupos/grupos.routes.js';
import itensRoutes from './modules/itens/itens/itens.routes.js';
import solicitacoesRoutes from './modules/solicitacoes/solicitacoes/solicitacoes.routes.js';
import usuariosRoutes from './modules/usuarios/usuarios.routes.js';

const app = express();

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/cotacoes', cotacoesRoutes);
app.use('/compras', comprasRoutes);
app.use('/fornecedores', fornecedoresRoutes);
app.use('/grupos', gruposRoutes);
app.use('/itens', itensRoutes);
app.use('/solicitacoes', solicitacoesRoutes);
app.use('/usuarios', usuariosRoutes);

export default app;
