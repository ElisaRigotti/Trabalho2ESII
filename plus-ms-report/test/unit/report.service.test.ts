// Forçar modo mock antes de importar qualquer módulo
process.env.USE_MOCKS = 'true';

import * as reportService from '../../src/services/report.service';

describe('Report Service', () => {

  describe('salesByCategory', () => {
    it('should return sales grouped by category', async () => {
      const result = await reportService.salesByCategory({
        startDate: '2026-01-01T00:00:00Z',
        endDate: '2026-12-31T23:59:59Z',
      });

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);

      for (const item of result) {
        expect(item).toHaveProperty('categoryId');
        expect(item).toHaveProperty('categoryName');
        expect(item).toHaveProperty('totalItems');
        expect(item).toHaveProperty('totalRevenue');
        expect(typeof item.totalRevenue).toBe('number');
        expect(item.totalRevenue).toBeGreaterThanOrEqual(0);
      }
    });

    it('should return results sorted by revenue descending', async () => {
      const result = await reportService.salesByCategory({});

      for (let i = 1; i < result.length; i++) {
        expect(result[i - 1]!.totalRevenue).toBeGreaterThanOrEqual(result[i]!.totalRevenue);
      }
    });

    it('should filter by date range', async () => {
      const result = await reportService.salesByCategory({
        startDate: '2026-06-10T00:00:00Z',
        endDate: '2026-06-10T23:59:59Z',
      });

      // Com os mocks, só o pedido ord-003 é de 10/06
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('salesBySize', () => {
    it('should return sales grouped by size', async () => {
      const result = await reportService.salesBySize({
        startDate: '2026-01-01T00:00:00Z',
        endDate: '2026-12-31T23:59:59Z',
      });

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);

      for (const item of result) {
        expect(item).toHaveProperty('size');
        expect(item).toHaveProperty('totalItems');
        expect(typeof item.size).toBe('string');
      }
    });

    it('should return results sorted by totalItems descending', async () => {
      const result = await reportService.salesBySize({});

      for (let i = 1; i < result.length; i++) {
        expect(result[i - 1]!.totalItems).toBeGreaterThanOrEqual(result[i]!.totalItems);
      }
    });
  });

  describe('stockMovements', () => {
    it('should return stock movement summary per product', async () => {
      const result = await reportService.stockMovements({
        startDate: '2026-01-01T00:00:00Z',
        endDate: '2026-12-31T23:59:59Z',
      });

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);

      for (const item of result) {
        expect(item).toHaveProperty('productId');
        expect(item).toHaveProperty('productName');
        expect(item).toHaveProperty('totalEntradas');
        expect(item).toHaveProperty('totalSaidas');
        expect(item).toHaveProperty('saldoAtual');
        expect(typeof item.totalEntradas).toBe('number');
      }
    });

    it('should filter by productId', async () => {
      const result = await reportService.stockMovements({
        productId: 'prod-vestido',
      });

      expect(result.length).toBe(1);
      expect(result[0]!.productId).toBe('prod-vestido');
    });
  });
});
