import { config } from '../config';
import type { Order, OrderListResponse } from '../types';
import { getMockOrders } from './mock-data';

/**
 * Client para o MS7 — Order Service (Grupo 8)
 * 
 * Contrato real (openapi.yaml):
 *   GET /orders?type=SALE&status=COMPLETED&from=...&to=...&page=1&pageSize=100
 *   Retorna: { data: Order[], page, pageSize, total }
 * 
 * Porta: 3007 (conforme server do Grupo 8)
 */
export async function fetchOrders(params: {
  type?: string;
  status?: string;
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
  token?: string;
}): Promise<OrderListResponse> {
  if (config.useMocks) {
    return getMockOrders(params);
  }

  const query = new URLSearchParams();
  if (params.type) query.set('type', params.type);
  if (params.status) query.set('status', params.status);
  if (params.from) query.set('from', params.from);
  if (params.to) query.set('to', params.to);
  if (params.page) query.set('page', String(params.page));
  if (params.pageSize) query.set('pageSize', String(params.pageSize));

  const url = `${config.orderServiceUrl}/orders?${query.toString()}`;

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (params.token) headers['Authorization'] = `Bearer ${params.token}`;

  const response = await fetch(url, { headers });

  if (!response.ok) {
    throw new Error(`Order Service respondeu com status ${response.status}`);
  }

  return response.json() as Promise<OrderListResponse>;
}

/**
 * Busca TODAS as vendas completadas num período, paginando automaticamente.
 */
export async function fetchAllCompletedSales(
  from: string,
  to: string,
  token?: string
): Promise<Order[]> {
  const allOrders: Order[] = [];
  let page = 1;
  const pageSize = 100;
  let hasMore = true;

  while (hasMore) {
    const result = await fetchOrders({
      type: 'SALE',
      status: 'COMPLETED',
      from,
      to,
      page,
      pageSize,
      token,
    });

    allOrders.push(...result.data);
    hasMore = result.data.length === pageSize && allOrders.length < result.total;
    page++;
  }

  return allOrders;
}
