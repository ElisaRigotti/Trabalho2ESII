# Plus Size — Grupo 23 — Report Service (MS9)

**Disciplina:** Engenharia de Software II — 98802-02 — PUCRS Turma 30 — 2026/1
**Professor:** José Pedro Schardosim Simão

## Integrantes

| Nome | |
|---|---|
| Pedro Augusto Wagner | PA |
| Elisa Ely de Oliveira Rigott | EE |
| Eduardo Ferreira Alves | — |
| Augusto Fisch | AF |
| Bernardo Garcia Fensterseifer | — |

## Domínio

**MS9 — Relatórios de vendas e analytics.** Serviço de leitura e agregação que consome dados do Order Service (Grupo 8), Stock Service (Grupo 16) e Product Service (Grupo 7) para gerar relatórios gerenciais.

Funcionalidades:
- Relatório de vendas por categoria (moda praia, casual, festa)
- Relatório de desempenho por faixa de tamanho
- Visão consolidada de movimentações de estoque por período
- Exportação em CSV e PDF

## Estrutura do repositório

```
├── docs/                   ADR do domínio
├── plus-infra/             Docker Compose + Terraform (Ministack)
├── plus-ms-auth/           MS Auth eleito (Grupo 7 — Python/FastAPI)
├── plus-mfe-auth/          MFE Auth eleito (Grupo 7 — React)
├── plus-ms-report/         MS9 — Report Service (Node/Express/TypeScript)
├── plus-mfe-report/        MFE9 — Microfrontend de Relatórios (React/MUI)
└── plus-shell/             Shell App (React + Module Federation)
```

## Como rodar

### Pré-requisitos

- Docker e Docker Compose instalados
- Portas livres: 3000, 3001, 3009, 4001, 4009, 4566

### Subir tudo com Docker Compose

```bash
# 1. Copiar variáveis de ambiente
cp plus-infra/.env.example plus-infra/.env

# 2. Subir todos os serviços
cd plus-infra
docker compose up --build
```

### Acessar

| Serviço | URL |
|---|---|
| Shell App (frontend) | http://localhost:3000 |
| Report Service API | http://localhost:3009 |
| Swagger (docs da API) | http://localhost:3009/docs |
| MS Auth API | http://localhost:3001 |
| Health check | http://localhost:3009/health |

### Usuário padrão

Após o primeiro boot, o MS Auth cria um usuário admin via seed:

```
Email: admindev@admin.com
Senha: Senha123
```

### Rodar só o MS Report (dev local)

```bash
cd plus-ms-report
npm install
USE_MOCKS=true npm run dev
# API disponível em http://localhost:3009
```

### Rodar testes

```bash
cd plus-ms-report
npm install
npm test              # testes unitários
npm run coverage      # cobertura
npm run test:functional  # testes funcionais (requer Docker)
```

## Stack técnica

| Componente | Tecnologia |
|---|---|
| MS Report (backend) | Node.js 24, Express 5, TypeScript |
| MFE Report (frontend) | React 18, TypeScript, MUI 5, Vite |
| MS Auth | Python, FastAPI, PostgreSQL |
| Infraestrutura | Docker, Ministack, Terraform |
| CI/CD | GitHub Actions (test, build, release) |
| Module Federation | @originjs/vite-plugin-federation |

## Documentação

- **ADR:** [`docs/ADR-report-service.md`](docs/ADR-report-service.md)
- **Swagger/OpenAPI:** [`plus-ms-report/openapi/openapi.yaml`](plus-ms-report/openapi/openapi.yaml)
- **Manual de UI:** [`plus-mfe-report/MANUAL-UI.md`](plus-mfe-report/MANUAL-UI.md)

## Dependências entre serviços

O Report Service (MS9) depende de:
- **MS Auth (Grupo 7)** — autenticação JWT (obrigatório)
- **MS7 — Order Service (Grupo 8)** — dados de vendas/pedidos
- **MS4 — Stock Service (Grupo 16)** — movimentações de estoque
- **MS1 — Product Service (Grupo 7)** — nomes de produtos e categorias

Quando os serviços dependentes não estão disponíveis, o Report Service opera com dados mockados (`USE_MOCKS=true`).
