import type {
  Order, OrderListResponse, Estoque, Movimento, Product,
} from '../types';

// ========================================
// Mock do Order Service (Grupo 8)
// Baseado no schema Order do openapi.yaml
// ========================================

const mockOrders: Order[] = [
  {
    id: 'ord-001', type: 'SALE', status: 'COMPLETED',
    items: [
      { id: 'item-001', productVariantId: 'var-vestido-marinho-48', quantity: 2 },
      { id: 'item-002', productVariantId: 'var-blusa-floral-52', quantity: 1 },
    ],
    createdBy: 'vendedor@plus.com', notes: 'Venda balcão',
    createdAt: '2026-06-01T10:00:00Z', updatedAt: '2026-06-01T10:30:00Z',
    confirmedAt: '2026-06-01T10:15:00Z', completedAt: '2026-06-01T10:30:00Z',
  },
  {
    id: 'ord-002', type: 'SALE', status: 'COMPLETED',
    items: [
      { id: 'item-003', productVariantId: 'var-calca-jeans-gg', quantity: 1 },
      { id: 'item-004', productVariantId: 'var-cinto-preto-unico', quantity: 1 },
    ],
    createdBy: 'admin@plus.com', notes: null,
    createdAt: '2026-06-02T14:00:00Z', updatedAt: '2026-06-02T15:00:00Z',
    confirmedAt: '2026-06-02T14:30:00Z', completedAt: '2026-06-02T15:00:00Z',
  },
  {
    id: 'ord-003', type: 'SALE', status: 'COMPLETED',
    items: [
      { id: 'item-005', productVariantId: 'var-vestido-marinho-52', quantity: 3 },
    ],
    createdBy: 'vendedor@plus.com', notes: 'Cliente VIP',
    createdAt: '2026-06-10T09:00:00Z', updatedAt: '2026-06-10T09:45:00Z',
    confirmedAt: '2026-06-10T09:20:00Z', completedAt: '2026-06-10T09:45:00Z',
  },
  {
    id: 'ord-004', type: 'PURCHASE', status: 'COMPLETED',
    items: [
      { id: 'item-006', productVariantId: 'var-blusa-floral-48', quantity: 20 },
    ],
    createdBy: 'admin@plus.com', supplierRef: 'fornecedor-xyz', notes: 'Reposição mensal',
    createdAt: '2026-06-05T08:00:00Z', updatedAt: '2026-06-05T10:00:00Z',
    confirmedAt: '2026-06-05T09:00:00Z', completedAt: '2026-06-05T10:00:00Z',
  },
];

export function getMockOrders(params: {
  type?: string; status?: string; from?: string; to?: string;
}): OrderListResponse {
  let filtered = [...mockOrders];
  if (params.type) filtered = filtered.filter(o => o.type === params.type);
  if (params.status) filtered = filtered.filter(o => o.status === params.status);
  if (params.from) filtered = filtered.filter(o => o.createdAt >= params.from!);
  if (params.to) filtered = filtered.filter(o => o.createdAt <= params.to!);
  return { data: filtered, page: 1, pageSize: 100, total: filtered.length };
}

// ========================================
// Mock do Stock Service (Grupo 16)
// Baseado em src/types/estoque.ts
// ========================================

const mockEstoque: Estoque[] = [
  { roupaId: 'var-vestido-marinho-48', produtoId: 'prod-vestido', tamanho: '48', cor: 'Marinho', saldo: 15, atualizadoEm: '2026-06-15T10:00:00Z' },
  { roupaId: 'var-vestido-marinho-52', produtoId: 'prod-vestido', tamanho: '52', cor: 'Marinho', saldo: 8, atualizadoEm: '2026-06-15T10:00:00Z' },
  { roupaId: 'var-blusa-floral-48', produtoId: 'prod-blusa', tamanho: '48', cor: 'Floral', saldo: 25, atualizadoEm: '2026-06-15T10:00:00Z' },
  { roupaId: 'var-blusa-floral-52', produtoId: 'prod-blusa', tamanho: '52', cor: 'Floral', saldo: 12, atualizadoEm: '2026-06-15T10:00:00Z' },
  { roupaId: 'var-calca-jeans-gg', produtoId: 'prod-calca', tamanho: 'GG', cor: 'Azul', saldo: 5, atualizadoEm: '2026-06-15T10:00:00Z' },
  { roupaId: 'var-cinto-preto-unico', produtoId: 'prod-cinto', tamanho: 'Único', cor: 'Preto', saldo: 30, atualizadoEm: '2026-06-15T10:00:00Z' },
];

const mockMovimentos: Movimento[] = [
  { id: 'mov-1', roupaId: 'var-vestido-marinho-48', produtoId: 'prod-vestido', tipo: 'entrada', quantidade: 20, saldoAnterior: 0, saldoPosterior: 20, criadoEm: '2026-06-01T08:00:00Z' },
  { id: 'mov-2', roupaId: 'var-vestido-marinho-48', produtoId: 'prod-vestido', tipo: 'saida', quantidade: 2, saldoAnterior: 20, saldoPosterior: 18, criadoEm: '2026-06-01T10:30:00Z' },
  { id: 'mov-3', roupaId: 'var-vestido-marinho-48', produtoId: 'prod-vestido', tipo: 'saida', quantidade: 3, saldoAnterior: 18, saldoPosterior: 15, criadoEm: '2026-06-10T09:45:00Z' },
  { id: 'mov-4', roupaId: 'var-blusa-floral-48', produtoId: 'prod-blusa', tipo: 'entrada', quantidade: 20, saldoAnterior: 5, saldoPosterior: 25, criadoEm: '2026-06-05T10:00:00Z' },
  { id: 'mov-5', roupaId: 'var-blusa-floral-52', produtoId: 'prod-blusa', tipo: 'saida', quantidade: 1, saldoAnterior: 13, saldoPosterior: 12, criadoEm: '2026-06-01T10:30:00Z' },
  { id: 'mov-6', roupaId: 'var-calca-jeans-gg', produtoId: 'prod-calca', tipo: 'saida', quantidade: 1, saldoAnterior: 6, saldoPosterior: 5, criadoEm: '2026-06-02T15:00:00Z' },
];

export function getMockEstoque(produtoId?: string): Estoque[] {
  if (produtoId) return mockEstoque.filter(e => e.produtoId === produtoId);
  return mockEstoque;
}

export function getMockMovimentos(roupaId: string): Movimento[] {
  return mockMovimentos.filter(m => m.roupaId === roupaId);
}

// ========================================
// Mock do Product Service (Grupo 7)
// Baseado em swagger.yaml — ProductDetailResponse
// ========================================

const mockProducts: Product[] = [
  {
    id: 'prod-vestido', nome: 'Vestido Midi Plus', descricao: 'Vestido midi elegante', marca: 'PlusWear',
    preco: 249.90, ativo: true, categoriaId: 'cat-festa',
    criadoEm: '2026-01-15T10:00:00Z', atualizadoEm: '2026-01-15T10:00:00Z',
    variantes: [
      { id: 'var-vestido-marinho-48', produtoId: 'prod-vestido', tamanhoId: 'tam-48', cor: 'Marinho', sku: 'VM-MAR-48', ativo: true, tamanho: { id: 'tam-48', nome: '48', ativo: true } },
      { id: 'var-vestido-marinho-52', produtoId: 'prod-vestido', tamanhoId: 'tam-52', cor: 'Marinho', sku: 'VM-MAR-52', ativo: true, tamanho: { id: 'tam-52', nome: '52', ativo: true } },
    ],
  },
  {
    id: 'prod-blusa', nome: 'Blusa Floral Plus', descricao: 'Blusa estampada confortável', marca: 'ModaPlus',
    preco: 129.90, ativo: true, categoriaId: 'cat-casual',
    criadoEm: '2026-02-01T10:00:00Z', atualizadoEm: '2026-02-01T10:00:00Z',
    variantes: [
      { id: 'var-blusa-floral-48', produtoId: 'prod-blusa', tamanhoId: 'tam-48', cor: 'Floral', sku: 'BF-FLO-48', ativo: true, tamanho: { id: 'tam-48', nome: '48', ativo: true } },
      { id: 'var-blusa-floral-52', produtoId: 'prod-blusa', tamanhoId: 'tam-52', cor: 'Floral', sku: 'BF-FLO-52', ativo: true, tamanho: { id: 'tam-52', nome: '52', ativo: true } },
    ],
  },
  {
    id: 'prod-calca', nome: 'Calça Jeans Skinny Plus', descricao: 'Calça jeans com elastano', marca: 'PlusWear',
    preco: 189.90, ativo: true, categoriaId: 'cat-casual',
    criadoEm: '2026-02-10T10:00:00Z', atualizadoEm: '2026-02-10T10:00:00Z',
    variantes: [
      { id: 'var-calca-jeans-gg', produtoId: 'prod-calca', tamanhoId: 'tam-gg', cor: 'Azul', sku: 'CJ-AZL-GG', ativo: true, tamanho: { id: 'tam-gg', nome: 'GG', ativo: true } },
    ],
  },
  {
    id: 'prod-cinto', nome: 'Cinto Couro Plus', descricao: 'Cinto de couro tamanho único', marca: 'AcessPlus',
    preco: 79.90, ativo: true, categoriaId: 'cat-acessorios',
    criadoEm: '2026-03-01T10:00:00Z', atualizadoEm: '2026-03-01T10:00:00Z',
    variantes: [
      { id: 'var-cinto-preto-unico', produtoId: 'prod-cinto', tamanhoId: 'tam-un', cor: 'Preto', sku: 'CC-PRT-UN', ativo: true, tamanho: { id: 'tam-un', nome: 'Único', ativo: true } },
    ],
  },
];

export function getMockProducts(): Product[] {
  return mockProducts;
}

// Mapa categoria → nome (mock para quando MS Categorias não está disponível)
export const mockCategoryNames: Record<string, string> = {
  'cat-festa': 'Moda Festa',
  'cat-casual': 'Casual',
  'cat-praia': 'Moda Praia',
  'cat-acessorios': 'Acessórios',
};
