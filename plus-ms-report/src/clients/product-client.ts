import { config } from '../config';
import type { Product, Variant } from '../types';
import { getMockProducts } from './mock-data';

/**
 * Client para o MS1 — Product Service (Grupo 7)
 * 
 * Contrato real (swagger.yaml):
 *   GET /products                       → lista produtos paginada
 *   GET /products/:id                   → produto com variantes
 *   GET /products/search?categoriaId=x  → busca com filtros
 *   GET /products/:productId/variants   → variantes de um produto
 *   GET /variants/:id                   → variante específica
 *   GET /sizes                          → tamanhos disponíveis
 * 
 * Porta: 3002 (conforme servidor do Grupo 7)
 */
export async function fetchProducts(page = 1, pageSize = 100): Promise<Product[]> {
  if (config.useMocks) {
    return getMockProducts();
  }

  const url = `${config.productServiceUrl}/products?page=${page}&pageSize=${pageSize}`;

  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`Product Service respondeu com status ${response.status}`);
  }

  const result = await response.json() as { items: Product[] };
  return result.items;
}

export async function fetchProductById(id: string): Promise<Product | null> {
  if (config.useMocks) {
    const products = getMockProducts();
    return products.find(p => p.id === id) ?? null;
  }

  const url = `${config.productServiceUrl}/products/${id}`;

  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
  });

  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error(`Product Service respondeu com status ${response.status}`);
  }

  return response.json() as Promise<Product>;
}

export async function fetchVariantById(id: string): Promise<Variant | null> {
  if (config.useMocks) {
    return null;
  }

  const url = `${config.productServiceUrl}/variants/${id}`;

  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
  });

  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error(`Product Service respondeu com status ${response.status}`);
  }

  return response.json() as Promise<Variant>;
}
