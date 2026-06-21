import express from 'express';
import cors from 'cors';
import { config } from './config';
import reportRoutes from './routes/report.routes';

const app = express();

app.use(express.json());
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:4001',
    'http://localhost:4009',
    'http://127.0.0.1:3000',
  ],
  credentials: true,
}));

// Health check (sem auth, conforme padrão da turma)
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', service: 'plus-ms-report' });
});

// Rotas de relatório
app.use('/reports', reportRoutes);

// Swagger UI
// TODO: adicionar swagger-ui-express com o openapi.yaml

// Rota raiz redireciona para docs
app.get('/', (_req, res) => {
  res.json({
    service: 'plus-ms-report',
    version: '1.0.0',
    endpoints: [
      'GET /health',
      'GET /reports/sales/by-category',
      'GET /reports/sales/by-size',
      'GET /reports/stock/movements',
      'GET /reports/export',
    ],
  });
});

app.listen(config.port, () => {
  console.log(`MS Report running at http://localhost:${config.port}`);
  console.log(`Mode: ${config.useMocks ? 'MOCK' : 'LIVE'}`);
});

export { app };
