import PDFDocument from 'pdfkit';
import type { Response } from 'express';
import type { ReportType } from '../types';

const REPORT_TITLES: Record<ReportType, string> = {
  'sales-by-category': 'Relatório de Vendas por Categoria',
  'sales-by-size': 'Relatório de Vendas por Tamanho',
  'stock-movements': 'Relatório de Movimentações de Estoque',
};

/**
 * Gera um PDF simples (tabela) a partir dos dados do relatório e
 * envia direto na resposta HTTP via stream.
 */
export function streamReportAsPDF(
  res: Response,
  reportType: ReportType,
  data: Record<string, unknown>[],
  filters: { startDate?: string; endDate?: string },
): void {
  const doc = new PDFDocument({ margin: 40, size: 'A4' });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="${reportType}-${new Date().toISOString().slice(0, 10)}.pdf"`,
  );

  doc.pipe(res);

  // Cabeçalho
  doc.fontSize(18).text(REPORT_TITLES[reportType] ?? 'Relatório', { align: 'center' });
  doc.moveDown(0.5);
  doc.fontSize(10).fillColor('#555555').text(
    `Período: ${filters.startDate ?? 'início'} até ${filters.endDate ?? 'hoje'}`,
    { align: 'center' },
  );
  doc.fillColor('#000000');
  doc.moveDown(1.5);

  if (data.length === 0) {
    doc.fontSize(12).text('Nenhum dado encontrado para o período selecionado.');
    doc.end();
    return;
  }

  const headers = Object.keys(data[0]!);
  const colWidth = (doc.page.width - 80) / headers.length;
  const startX = doc.x;
  let y = doc.y;

  // Cabeçalho da tabela
  doc.fontSize(9).font('Helvetica-Bold');
  headers.forEach((header, i) => {
    doc.text(formatHeader(header), startX + i * colWidth, y, { width: colWidth, ellipsis: true });
  });
  y += 18;
  doc.moveTo(startX, y).lineTo(startX + colWidth * headers.length, y).stroke();
  y += 6;

  // Linhas da tabela
  doc.font('Helvetica');
  for (const row of data) {
    if (y > doc.page.height - 60) {
      doc.addPage();
      y = 40;
    }
    headers.forEach((header, i) => {
      const value = row[header];
      doc.text(formatValue(value), startX + i * colWidth, y, { width: colWidth, ellipsis: true });
    });
    y += 16;
  }

  doc.end();
}

function formatHeader(key: string): string {
  return key.replace(/([A-Z])/g, ' $1').replace(/^./, c => c.toUpperCase());
}

function formatValue(val: unknown): string {
  if (typeof val === 'number') {
    return Number.isInteger(val) ? String(val) : val.toFixed(2);
  }
  return String(val ?? '');
}
