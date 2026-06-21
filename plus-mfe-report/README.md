# chave-mfe-report

Microfrontend de **Relatórios de vendas e analytics** (MS9 — Grupo 23), construído em React + TypeScript + MUI, exposto via Module Federation (Vite) para integração com o `chave-shell`.

---

## Rodando isoladamente (modo dev)

```bash
npm install
npm run dev
```

Abre em `http://localhost:4009`, consumindo o MS Report em `http://localhost:3009` (padrão) ou na URL definida em `VITE_REPORT_SERVICE_URL`.

> Em modo standalone, o componente usa um fallback de autenticação simulada (`x-user-email`/`x-user-role`) quando não encontra um token JWT salvo em `localStorage` — o mesmo padrão de fallback aceito pelo MS Report quando `JWT_SECRET` não está configurado.

## Integrando ao Shell App

O componente principal é exposto como `mfe_report/ReportDashboard`. No `chave-shell`, seguindo o mesmo padrão já usado para `mfe_auth`:

**1. Adicionar o remote no `vite.config.js` do shell:**

```js
federation({
  name: "shell",
  remotes: {
    mfe_auth: MFE_AUTH_URL,
    mfe_report: MFE_REPORT_URL, // nova linha
  },
  shared: ["react", "react-dom"],
}),
```

**2. Consumir via lazy import, dentro de uma rota privada, no `App.jsx`:**

```jsx
const ReportDashboard = lazy(() => import("mfe_report/ReportDashboard"));

// ...
<Route
  path="/relatorios"
  element={
    <PrivateRoute>
      <ReportDashboard />
    </PrivateRoute>
  }
/>
```

## Build de produção

```bash
npm run build
```

Gera `dist/assets/remoteEntry.js`, que o Shell consome remotamente. Servido via Nginx no Docker (ver `Dockerfile`), na porta `4009`.

## Variáveis de ambiente

| Variável | Padrão | Descrição |
|---|---|---|
| `VITE_REPORT_SERVICE_URL` | `http://localhost:3009` | URL base do MS Report (definida em build-time, igual ao padrão `VITE_MS_AUTH_URL` do `chave-mfe-auth`) |

## Estrutura

```
src/
├── ReportDashboard.tsx       # componente raiz exposto via Module Federation
├── App.tsx                   # wrapper só para rodar standalone (npm run dev)
├── main.tsx                  # entry point standalone
├── components/
│   ├── DateRangeFilterBar.tsx
│   ├── ExportMenu.tsx
│   ├── SalesByCategoryTable.tsx
│   ├── SalesBySizeTable.tsx
│   └── StockMovementsTable.tsx
├── services/
│   └── report-api.ts         # client HTTP para o MS Report
└── types/
    └── report.ts
```
