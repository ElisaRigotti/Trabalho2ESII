// ========================================
// Tipos do MS7 — Order Service (Grupo 8)
// Baseado em: openapi/openapi.yaml do plus-ms-ped
// ========================================

export type OrderType = 'PURCHASE' | 'SALE';
export type OrderStatus = 'DRAFT' | 'RESERVED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';

export interface OrderItem {
  id: string;
  productVariantId: string; // Referência à variante (cor+tamanho) do MS1
  quantity: number;
}

export interface Order {
  id: string;
  type: OrderType;
  status: OrderStatus;
  items: OrderItem[];
  supplierRef?: string | null;
  notes?: string | null;
  createdBy: string;        // Email do criador (claim sub do JWT)
  reservedAt?: string | null;
  confirmedAt?: string | null;
  completedAt?: string | null;
  cancelledAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OrderListResponse {
  data: Order[];
  page: number;
  pageSize: number;
  total: number;
}

// ========================================
// Tipos do MS4 — Stock Service (Grupo 16)
// Baseado em: src/types/estoque.ts do plus_ms_estoque
// ========================================

export type TipoMovimento = 'entrada' | 'saida' | 'ajuste';

export interface Estoque {
  roupaId: string;
  produtoId: string;
  tamanho?: string;
  cor?: string;
  saldo: number;
  atualizadoEm: string;
}

export interface Movimento {
  id: string;
  roupaId: string;
  produtoId: string;
  tipo: TipoMovimento;
  quantidade: number;
  saldoAnterior: number;
  saldoPosterior: number;
  observacao?: string;
  criadoEm: string;
}

// ========================================
// Tipos do MS1 — Product Service (Grupo 7)
// Baseado em: swagger.yaml do Es2
// ========================================

export interface Product {
  id: string;
  nome: string;
  descricao?: string;
  marca?: string;
  preco: number;
  ativo: boolean;
  categoriaId?: string | null;
  fornecedorId?: string | null;
  criadoEm: string;
  atualizadoEm: string;
  variantes?: Variant[];
}

export interface Variant {
  id: string;
  produtoId: string;
  tamanhoId: string;
  tamanho?: Size;
  cor: string;
  sku: string;
  ativo: boolean;
}

export interface Size {
  id: string;
  nome: string;       // P, M, G, GG, XGG
  descricao?: string;
  ativo: boolean;
}

export interface PaginatedProductResponse {
  items: Product[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

// ========================================
// Tipos internos do Report Service
// ========================================

export interface SalesByCategoryItem {
  categoryId: string;
  categoryName: string;
  totalOrders: number;
  totalItems: number;
  totalRevenue: number;
}

export interface SalesBySizeItem {
  size: string;
  totalOrders: number;
  totalItems: number;
  totalRevenue: number;
}

export interface StockMovementSummary {
  productId: string;
  productName: string;
  totalEntradas: number;
  totalSaidas: number;
  totalAjustes: number;
  saldoAtual: number;
}

export interface ReportFilters {
  startDate?: string;
  endDate?: string;
  categoryId?: string;
  productId?: string;
}

export type ExportFormat = 'csv' | 'json' | 'pdf';
export type ReportType = 'sales-by-category' | 'sales-by-size' | 'stock-movements';
