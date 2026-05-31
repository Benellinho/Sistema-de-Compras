import express from 'express';
import fornecedoresRoutes from './modules/fornecedores/fornecedores/fornecedores.routes.js';
import itensRoutes from './modules/itens/itens.routes.js';
import solicitacoesRoutes from './modules/solicitacoes/solicitacoes.routes.js';

const app = express();

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/fornecedores', fornecedoresRoutes);
app.use('/itens', itensRoutes);
app.use('/solicitacoes', solicitacoesRoutes);

export default app;
