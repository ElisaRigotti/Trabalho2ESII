import { Router } from 'express';
import { authMiddleware, requireRole } from '../middleware/auth.middleware';
import * as ctrl from '../controllers/report.controller';

const router = Router();

// Todos os endpoints de relatório exigem autenticação
// Acessíveis por admin e gestor
router.use(authMiddleware);
router.use(requireRole('admin', 'gestor', 'vendedor'));

// GET /reports/sales/by-category?startDate=...&endDate=...
router.get('/sales/by-category', ctrl.getSalesByCategory);

// GET /reports/sales/by-size?startDate=...&endDate=...
router.get('/sales/by-size', ctrl.getSalesBySize);

// GET /reports/stock/movements?startDate=...&endDate=...&productId=...
router.get('/stock/movements', ctrl.getStockMovements);

// GET /reports/export?type=sales-by-category&format=csv&startDate=...&endDate=...
router.get('/export', ctrl.exportReport);

export default router;
