export const config = {
  port: parseInt(process.env.PORT ?? '3009', 10),

  // URLs dos microsserviços dependentes
  // Em Ministack/Docker, usar nomes dos containers
  // Em dev local, usar localhost com as portas certas
  orderServiceUrl: process.env.ORDER_SERVICE_URL ?? 'http://localhost:3007',
  stockServiceUrl: process.env.STOCK_SERVICE_URL ?? 'http://localhost:3000',
  productServiceUrl: process.env.PRODUCT_SERVICE_URL ?? 'http://localhost:3002',

  // Modo mock: usa dados fake quando os serviços não estão disponíveis
  useMocks: process.env.USE_MOCKS === 'true',

  // Chave secreta compartilhada para validar JWT emitido pelo MS Auth (Grupo 7).
  // Quando não configurada, o middleware aceita headers simulados (x-user-email etc)
  // — útil para desenvolvimento local sem o MS Auth rodando.
  jwtSecret: process.env.JWT_SECRET ?? '',
};
