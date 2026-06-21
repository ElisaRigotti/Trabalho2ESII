import { config } from '../config';
import type { Estoque, Movimento } from '../types';
import { getMockEstoque, getMockMovimentos } from './mock-data';

/**
 * Client para o MS4 — Stock Service (Grupo 16)
 * 
 * Contrato real (src/routes/estoque.ts):
 *   GET /estoque                        → lista saldos
 *   GET /estoque?produtoId=xxx          → filtra por produto
 *   GET /estoque/produto/:produtoId     → lista por produto com filtro tamanho/cor
 *   GET /estoque/:roupaId               → saldo de uma roupa
 *   GET /estoque/:roupaId/movimentos    → histórico de movimentos
 * 
 * Porta: 3000 (padrão do Grupo 16), configurável via STOCK_SERVICE_URL
 */
export async function fetchEstoque(produtoId?: string): Promise<Estoque[]> {
  if (config.useMocks) {
    return getMockEstoque(produtoId);
  }

  const query = produtoId ? `?produtoId=${produtoId}` : '';
  const url = `${config.stockServiceUrl}/estoque${query}`;

  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`Stock Service respondeu com status ${response.status}`);
  }

  return response.json() as Promise<Estoque[]>;
}

export async function fetchMovimentos(roupaId: string): Promise<Movimento[]> {
  if (config.useMocks) {
    return getMockMovimentos(roupaId);
  }

  const url = `${config.stockServiceUrl}/estoque/${roupaId}/movimentos`;

  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`Stock Service respondeu com status ${response.status}`);
  }

  return response.json() as Promise<Movimento[]>;
}

/**
 * Busca todos os estoques e seus movimentos para o relatório consolidado.
 */
export async function fetchAllStockWithMovements(): Promise<{
  estoques: Estoque[];
  movimentos: Map<string, Movimento[]>;
}> {
  const estoques = await fetchEstoque();
  const movimentos = new Map<string, Movimento[]>();

  for (const est of estoques) {
    const movs = await fetchMovimentos(est.roupaId);
    movimentos.set(est.roupaId, movs);
  }

  return { estoques, movimentos };
}
