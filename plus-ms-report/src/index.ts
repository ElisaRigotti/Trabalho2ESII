import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { readFileSync } from 'fs';
import { join } from 'path';
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

// Swagger UI — documentação interativa da API
try {
  const openapiPath = join(__dirname, '..', 'openapi', 'openapi.yaml');
  const openapiContent = readFileSync(openapiPath, 'utf-8');

  // Parse YAML manualmente (sem dependência extra) — swagger-ui-express
  // aceita string YAML diretamente via setup option
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(undefined, {
    swaggerOptions: {
      url: '/openapi.yaml',
    },
  }));

  // Servir o arquivo YAML bruto para o Swagger UI consumir
  app.get('/openapi.yaml', (_req, res) => {
    res.setHeader('Content-Type', 'text/yaml');
    res.send(openapiContent);
  });
} catch {
  console.warn('Swagger: openapi.yaml não encontrado, /docs desabilitado');
}

// Rota raiz redireciona para docs
app.get('/', (_req, res) => {
  res.redirect('/docs');
});

app.listen(config.port, () => {
  console.log(`MS Report running at http://localhost:${config.port}`);
  console.log(`Swagger UI: http://localhost:${config.port}/docs`);
  console.log(`Mode: ${config.useMocks ? 'MOCK' : 'LIVE'}`);
});

export { app };
