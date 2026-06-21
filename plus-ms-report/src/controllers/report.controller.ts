import { Response } from 'express';
import type { AuthenticatedRequest } from '../middleware/auth.middleware';
import * as reportService from '../services/report.service';
import { streamReportAsPDF } from '../services/pdf-export';
import type { ReportFilters, ExportFormat, ReportType } from '../types';

export async function getSalesByCategory(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const filters: ReportFilters = {
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
    };
    const token = req.headers.authorization?.replace('Bearer ', '');
    const report = await reportService.salesByCategory(filters, token);
    res.status(200).json(report);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao gerar relatório de vendas por categoria', details: (err as Error).message });
  }
}

export async function getSalesBySize(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const filters: ReportFilters = {
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
    };
    const token = req.headers.authorization?.replace('Bearer ', '');
    const report = await reportService.salesBySize(filters, token);
    res.status(200).json(report);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao gerar relatório de vendas por tamanho', details: (err as Error).message });
  }
}

export async function getStockMovements(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const filters: ReportFilters = {
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
      productId: req.query.productId as string,
    };
    const report = await reportService.stockMovements(filters);
    res.status(200).json(report);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao gerar relatório de movimentações', details: (err as Error).message });
  }
}

export async function exportReport(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const reportType = req.query.type as ReportType;
    const format = (req.query.format as ExportFormat) ?? 'json';
    const filters: ReportFilters = {
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
      productId: req.query.productId as string,
    };
    const token = req.headers.authorization?.replace('Bearer ', '');

    let data: unknown[];
    switch (reportType) {
      case 'sales-by-category':
        data = await reportService.salesByCategory(filters, token);
        break;
      case 'sales-by-size':
        data = await reportService.salesBySize(filters, token);
        break;
      case 'stock-movements':
        data = await reportService.stockMovements(filters);
        break;
      default:
        res.status(400).json({ error: 'Tipo de relatório inválido. Use: sales-by-category, sales-by-size, stock-movements' });
        return;
    }

    if (format === 'csv') {
      const csv = convertToCSV(data as Record<string, unknown>[]);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${reportType}-${new Date().toISOString().slice(0, 10)}.csv"`);
      res.status(200).send(csv);
    } else if (format === 'pdf') {
      streamReportAsPDF(res, reportType, data as Record<string, unknown>[], filters);
    } else {
      res.status(200).json(data);
    }
  } catch (err) {
    res.status(500).json({ error: 'Erro ao exportar relatório', details: (err as Error).message });
  }
}

function convertToCSV(data: Record<string, unknown>[]): string {
  if (data.length === 0) return '';
  const headers = Object.keys(data[0]!);
  const rows = data.map(row => headers.map(h => {
    const val = row[h];
    const str = String(val ?? '');
    return str.includes(',') || str.includes('"') ? `"${str.replace(/"/g, '""')}"` : str;
  }).join(','));
  return [headers.join(','), ...rows].join('\n');
}
