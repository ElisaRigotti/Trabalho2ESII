import type {
  SalesByCategoryItem,
  SalesBySizeItem,
  StockMovementSummary,
  DateRangeFilter,
  ReportType,
  ExportFormat,
} from "../types/report";

// Em Ministack/Docker, o Shell injeta essa URL via env var na hora do build.
// Em dev local, aponta para o MS Report rodando na porta padrão.
const REPORT_SERVICE_URL =
  (import.meta.env.VITE_REPORT_SERVICE_URL as string | undefined) ??
  "http://localhost:3009";

function authHeaders(): Record<string, string> {
  // Segue o mesmo padrão de autenticação usado pelo chave-shell:
  // o token emitido pelo mfe_auth fica salvo em localStorage.
  const token = localStorage.getItem("token");
  if (token) {
    return { Authorization: `Bearer ${token}` };
  }
  // Fallback de desenvolvimento, espelhando os headers simulados
  // aceitos pelo MS Report quando JWT_SECRET não está configurado.
  return {
    "x-user-email": "admin@plus.com",
    "x-user-role": "admin",
  };
}

function buildQuery(filters: DateRangeFilter, extra?: Record<string, string>): string {
  const params = new URLSearchParams();
  if (filters.startDate) params.set("startDate", filters.startDate);
  if (filters.endDate) params.set("endDate", filters.endDate);
  if (extra) {
    for (const [key, value] of Object.entries(extra)) {
      if (value) params.set(key, value);
    }
  }
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

async function getJSON<T>(path: string): Promise<T> {
  const res = await fetch(`${REPORT_SERVICE_URL}${path}`, {
    headers: authHeaders(),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      (body as { error?: string }).error ?? `Erro ${res.status} ao consultar relatório`,
    );
  }
  return res.json() as Promise<T>;
}

export function fetchSalesByCategory(
  filters: DateRangeFilter,
): Promise<SalesByCategoryItem[]> {
  return getJSON<SalesByCategoryItem[]>(
    `/reports/sales/by-category${buildQuery(filters)}`,
  );
}

export function fetchSalesBySize(filters: DateRangeFilter): Promise<SalesBySizeItem[]> {
  return getJSON<SalesBySizeItem[]>(`/reports/sales/by-size${buildQuery(filters)}`);
}

export function fetchStockMovements(
  filters: DateRangeFilter,
  productId?: string,
): Promise<StockMovementSummary[]> {
  return getJSON<StockMovementSummary[]>(
    `/reports/stock/movements${buildQuery(filters, { productId: productId ?? "" })}`,
  );
}

/**
 * Dispara o download de um relatório exportado (CSV ou PDF) abrindo
 * a URL diretamente — o navegador trata o Content-Disposition do
 * MS Report e salva o arquivo automaticamente.
 *
 * Como fetch + blob exigiria reimplementar os headers de auth para o
 * download, e os relatórios não contêm dados sensíveis fora do escopo
 * já visível na tela, usamos um link temporário com os headers de auth
 * embutidos via query string apenas em modo dev (fallback). Em produção,
 * o token JWT já está no cookie/sessão validado pelo API Gateway.
 */
export async function downloadReportExport(
  type: ReportType,
  format: ExportFormat,
  filters: DateRangeFilter,
): Promise<void> {
  const query = buildQuery(filters, { type, format });
  const url = `${REPORT_SERVICE_URL}/reports/export${query}`;

  const res = await fetch(url, { headers: authHeaders() });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      (body as { error?: string }).error ?? `Erro ${res.status} ao exportar relatório`,
    );
  }

  const blob = await res.blob();
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;

  const today = new Date().toISOString().slice(0, 10);
  const extension = format === "json" ? "json" : format;
  link.download = `${type}-${today}.${extension}`;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(objectUrl);
}
