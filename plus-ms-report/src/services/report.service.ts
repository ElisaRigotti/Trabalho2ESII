import { fetchAllCompletedSales } from '../clients/order-client';
import { fetchEstoque, fetchMovimentos } from '../clients/stock-client';
import { fetchProducts } from '../clients/product-client';
import { mockCategoryNames } from '../clients/mock-data';
import type {
  SalesByCategoryItem, SalesBySizeItem, StockMovementSummary,
  ReportFilters, Order, Product,
} from '../types';

/**
 * Relatório de vendas agrupado por categoria.
 * 
 * Fluxo: 
 * 1. Busca vendas COMPLETED no Order Service (Grupo 8)
 * 2. Para cada item vendido, resolve o productVariantId → produto → categoriaId
 * 3. Agrupa por categoria e soma quantidades e receita
 */
export async function salesByCategory(
  filters: ReportFilters,
  token?: string,
): Promise<SalesByCategoryItem[]> {
  const from = filters.startDate ?? '2026-01-01T00:00:00Z';
  const to = filters.endDate ?? new Date().toISOString();

  const [orders, products] = await Promise.all([
    fetchAllCompletedSales(from, to, token),
    fetchProducts(),
  ]);

  // Mapear variantes → produto → categoria
  const variantToProduct = buildVariantProductMap(products);

  const categoryMap = new Map<string, SalesByCategoryItem>();

  for (const order of orders) {
    if (order.type !== 'SALE') continue;

    for (const item of order.items) {
      const product = variantToProduct.get(item.productVariantId);
      const catId = product?.categoriaId ?? 'sem-categoria';
      const catName = mockCategoryNames[catId] ?? catId;

      const existing = categoryMap.get(catId) ?? {
        categoryId: catId,
        categoryName: catName,
        totalOrders: 0,
        totalItems: 0,
        totalRevenue: 0,
      };

      existing.totalItems += item.quantity;
      existing.totalRevenue += (product?.preco ?? 0) * item.quantity;

      categoryMap.set(catId, existing);
    }
  }

  // Contar pedidos únicos por categoria
  const orderCategories = new Map<string, Set<string>>();
  for (const order of orders) {
    if (order.type !== 'SALE') continue;
    for (const item of order.items) {
      const product = variantToProduct.get(item.productVariantId);
      const catId = product?.categoriaId ?? 'sem-categoria';
      if (!orderCategories.has(catId)) orderCategories.set(catId, new Set());
      orderCategories.get(catId)!.add(order.id);
    }
  }

  for (const [catId, orderIds] of orderCategories) {
    const cat = categoryMap.get(catId);
    if (cat) cat.totalOrders = orderIds.size;
  }

  return Array.from(categoryMap.values()).sort((a, b) => b.totalRevenue - a.totalRevenue);
}

/**
 * Relatório de vendas agrupado por faixa de tamanho.
 * 
 * Fluxo:
 * 1. Busca vendas COMPLETED
 * 2. Resolve productVariantId → variante → tamanho (nome: P, M, G, GG, etc.)
 * 3. Agrupa por tamanho
 */
export async function salesBySize(
  filters: ReportFilters,
  token?: string,
): Promise<SalesBySizeItem[]> {
  const from = filters.startDate ?? '2026-01-01T00:00:00Z';
  const to = filters.endDate ?? new Date().toISOString();

  const [orders, products] = await Promise.all([
    fetchAllCompletedSales(from, to, token),
    fetchProducts(),
  ]);

  const variantMap = buildVariantDetailMap(products);
  const sizeMap = new Map<string, SalesBySizeItem>();

  for (const order of orders) {
    if (order.type !== 'SALE') continue;

    for (const item of order.items) {
      const variant = variantMap.get(item.productVariantId);
      const sizeName = variant?.sizeName ?? 'Não informado';
      const product = variant?.product;

      const existing = sizeMap.get(sizeName) ?? {
        size: sizeName,
        totalOrders: 0,
        totalItems: 0,
        totalRevenue: 0,
      };

      existing.totalItems += item.quantity;
      existing.totalRevenue += (product?.preco ?? 0) * item.quantity;

      sizeMap.set(sizeName, existing);
    }
  }

  // Contar pedidos por tamanho
  const orderSizes = new Map<string, Set<string>>();
  for (const order of orders) {
    if (order.type !== 'SALE') continue;
    for (const item of order.items) {
      const variant = variantMap.get(item.productVariantId);
      const sizeName = variant?.sizeName ?? 'Não informado';
      if (!orderSizes.has(sizeName)) orderSizes.set(sizeName, new Set());
      orderSizes.get(sizeName)!.add(order.id);
    }
  }

  for (const [size, orderIds] of orderSizes) {
    const s = sizeMap.get(size);
    if (s) s.totalOrders = orderIds.size;
  }

  return Array.from(sizeMap.values()).sort((a, b) => b.totalItems - a.totalItems);
}

/**
 * Visão consolidada de movimentações de estoque por período.
 * 
 * Fluxo:
 * 1. Busca todos os estoques no Stock Service (Grupo 16)
 * 2. Busca movimentos de cada roupa
 * 3. Filtra por período e agrupa por produto
 */
export async function stockMovements(
  filters: ReportFilters,
): Promise<StockMovementSummary[]> {
  const from = filters.startDate ?? '2026-01-01T00:00:00Z';
  const to = filters.endDate ?? new Date().toISOString();

  const [estoques, products] = await Promise.all([
    fetchEstoque(filters.productId),
    fetchProducts(),
  ]);

  const productNames = new Map(products.map(p => [p.id, p.nome]));
  const productMap = new Map<string, StockMovementSummary>();

  for (const est of estoques) {
    const movimentos = await fetchMovimentos(est.roupaId);

    const filteredMovs = movimentos.filter(m => m.criadoEm >= from && m.criadoEm <= to);

    const existing = productMap.get(est.produtoId) ?? {
      productId: est.produtoId,
      productName: productNames.get(est.produtoId) ?? est.produtoId,
      totalEntradas: 0,
      totalSaidas: 0,
      totalAjustes: 0,
      saldoAtual: 0,
    };

    for (const mov of filteredMovs) {
      if (mov.tipo === 'entrada') existing.totalEntradas += mov.quantidade;
      else if (mov.tipo === 'saida') existing.totalSaidas += Math.abs(mov.quantidade);
      else if (mov.tipo === 'ajuste') existing.totalAjustes += Math.abs(mov.quantidade);
    }

    existing.saldoAtual += est.saldo;

    productMap.set(est.produtoId, existing);
  }

  return Array.from(productMap.values());
}

// ========================================
// Helpers
// ========================================

function buildVariantProductMap(products: Product[]): Map<string, Product> {
  const map = new Map<string, Product>();
  for (const product of products) {
    if (product.variantes) {
      for (const variant of product.variantes) {
        map.set(variant.id, product);
      }
    }
  }
  return map;
}

interface VariantDetail {
  sizeName: string;
  product?: Product;
}

function buildVariantDetailMap(products: Product[]): Map<string, VariantDetail> {
  const map = new Map<string, VariantDetail>();
  for (const product of products) {
    if (product.variantes) {
      for (const variant of product.variantes) {
        map.set(variant.id, {
          sizeName: variant.tamanho?.nome ?? 'N/A',
          product,
        });
      }
    }
  }
  return map;
}
