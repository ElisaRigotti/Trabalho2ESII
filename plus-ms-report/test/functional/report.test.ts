const BASE_URL = process.env.FUNC_TEST_BASE_URL ?? 'http://localhost:3009';

describe('Report Service - Functional Tests', () => {
  it('GET /health should return ok', async () => {
    const res = await fetch(`${BASE_URL}/health`);
    expect(res.status).toBe(200);
    const data = await res.json() as { status: string; service: string };
    expect(data.status).toBe('ok');
    expect(data.service).toBe('plus-ms-report');
  });

  it('GET /reports/sales/by-category should return report', async () => {
    const res = await fetch(`${BASE_URL}/reports/sales/by-category`, {
      headers: { 'x-user-email': 'admin@plus.com', 'x-user-role': 'admin' },
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
  });

  it('GET /reports/export?type=sales-by-category&format=csv should return CSV', async () => {
    const res = await fetch(`${BASE_URL}/reports/export?type=sales-by-category&format=csv`, {
      headers: { 'x-user-email': 'admin@plus.com', 'x-user-role': 'admin' },
    });
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('text/csv');
  });

  it('GET /reports/export?type=sales-by-category&format=pdf should return a PDF file', async () => {
    const res = await fetch(`${BASE_URL}/reports/export?type=sales-by-category&format=pdf`, {
      headers: { 'x-user-email': 'admin@plus.com', 'x-user-role': 'admin' },
    });
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('application/pdf');
    const buffer = await res.arrayBuffer();
    const header = Buffer.from(buffer.slice(0, 5)).toString('utf-8');
    expect(header).toBe('%PDF-');
  });

  it('should return 401 without auth headers', async () => {
    const res = await fetch(`${BASE_URL}/reports/sales/by-category`);
    expect(res.status).toBe(401);
  });
});
