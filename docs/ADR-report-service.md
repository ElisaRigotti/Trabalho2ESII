# ADR — MS9 Report Service (Grupo 23)

**Status:** Aceito
**Data:** 21/06/2026
**Autores:** Pedro Augusto Wagner, Elisa Ely de Oliveira Rigott, Eduardo Ferreira Alves, Augusto Fisch, Bernardo Garcia Fensterseifer
**Domínio:** MS9 — Relatórios de vendas e analytics
**Disciplina:** Engenharia de Software II — PUCRS Turma 30 — 2026/1

---

## 1. Contexto

O sistema Plus Size é uma plataforma de gestão de estoque para uma loja de roupas plus size, construída como um conjunto de microsserviços independentes com microfrontends correspondentes, integrados via Module Federation a um Shell App e expostos através de um API Gateway com autenticação JWT centralizada (MS Auth).

O Grupo 23 é responsável pelo **MS9 — Report Service**, um serviço de **leitura e agregação**: ele não possui dados próprios nem entidades de negócio que cria ou altera. Sua única responsabilidade é consumir dados de outros microsserviços do domínio (Pedidos, Estoque, Produto) e apresentá-los de forma agregada e analítica para usuários com permissão de visualização gerencial.

Essa natureza — serviço agregador, sem fonte de verdade própria — é a decisão arquitetural mais importante do domínio e influencia todas as demais decisões deste documento.

---

## 2. Decisão

### 2.1 O Report Service não possui banco de dados próprio

**Decisão:** ao contrário dos outros oito microsserviços de domínio do sistema (que possuem RDS PostgreSQL dedicado), o MS9 não provisiona banco de dados.

**Justificativa:** os dados de vendas, estoque e produto já existem nos serviços de origem (MS7, MS4, MS1). Persistir uma cópia desses dados no Report Service introduziria um problema de consistência eventual (quando a cópia ficaria desatualizada?) sem benefício correspondente, dado o volume de dados esperado em um projeto acadêmico de curta duração. Optamos por consultar os serviços de origem sob demanda, a cada requisição de relatório.

**Trade-off aceito:** os relatórios ficam diretamente dependentes da disponibilidade dos serviços de origem em tempo de consulta. Se o MS7 (Pedidos) estiver fora do ar, o relatório de vendas por categoria também falha. Avaliamos esse acoplamento como aceitável para o escopo do projeto, e mitigamos com a estratégia de mocks descrita na seção 2.3.

### 2.2 Agregação em memória no momento da consulta

**Decisão:** toda a lógica de agregação (somatórios, agrupamentos por categoria/tamanho, contagem de pedidos únicos) é feita em JavaScript, em memória, depois que os dados brutos são buscados dos serviços de origem — não há cache, fila de processamento ou pipeline de ETL.

**Justificativa:** dado o volume de dados de um ambiente de demonstração acadêmica (dezenas a centenas de pedidos, não milhões), processamento em memória é suficiente e elimina a complexidade de manter um pipeline de dados separado. Essa decisão prioriza simplicidade e velocidade de entrega sobre escalabilidade — escolha consciente e proporcional ao contexto do projeto.

**Trade-off aceito:** essa abordagem não escalaria para um cenário de produção com grande volume de pedidos. Em um contexto real, optaríamos por um data warehouse ou ao menos uma camada de cache (Redis) com invalidação por evento.

### 2.3 Contratos definidos + dados mockados como estratégia de integração

**Decisão:** para cada serviço dependente (Order, Stock, Product), definimos um contrato de tipos TypeScript espelhando o schema real documentado pelos grupos responsáveis, e implementamos um client HTTP que alterna entre chamada real e dados mockados via variável de ambiente (`USE_MOCKS=true`).

**Justificativa:** a entrega final ocorre 4 dias após o início do desenvolvimento do domínio, em paralelo aos demais 9 grupos. Não há garantia de que os serviços dependentes (Pedidos, Estoque, Produto) estarão disponíveis e estáveis durante todo o período de desenvolvimento do Report Service. Adotar mocks com contratos bem definidos desde o início nos permitiu desenvolver e testar a lógica de agregação de forma independente, substituindo os mocks pelas chamadas reais assim que os serviços de origem ficaram disponíveis.

**Trade-off aceito:** os contratos foram definidos com base na documentação/código publicado pelos outros grupos em um momento específico do desenvolvimento deles; mudanças posteriores nesses contratos exigem atualização manual dos tipos no Report Service.

### 2.4 Autenticação via JWT validado localmente, com fallback de desenvolvimento

**Decisão:** o middleware de autenticação tenta validar um JWT real (assinado pelo MS Auth, Grupo 7) usando uma chave secreta compartilhada (`JWT_SECRET`). Quando essa variável não está configurada — cenário de desenvolvimento local sem o MS Auth rodando — o middleware aceita headers HTTP simulados (`x-user-email`, `x-user-role`).

**Justificativa:** isso desacopla o desenvolvimento do Report Service da disponibilidade do MS Auth, sem abrir mão de uma validação de token real e funcional para o ambiente integrado (Ministack). Em produção/demo integrada, o `JWT_SECRET` é configurado e o fallback de dev fica automaticamente desabilitado.

**Trade-off aceito:** se o `JWT_SECRET` for esquecido em um ambiente que deveria ser seguro, o serviço aceita autenticação simulada. Mitigamos isso documentando claramente a variável como obrigatória em produção/Ministack.

### 2.5 RBAC simples por papel (role), sem granularidade por relatório

**Decisão:** todos os quatro endpoints de relatório exigem um papel dentre `admin`, `gestor` ou `vendedor`. Não há controle de acesso por tipo de relatório individual.

**Justificativa:** o domínio de negócio não exige, no escopo do projeto, que um vendedor veja apenas relatórios de vendas e não de estoque, por exemplo. Um controle único e simples reduz a superfície de erro e é suficiente para o caso de uso.

**Trade-off aceito:** se o negócio evoluir para exigir granularidade por relatório (ex: vendedor vê vendas mas não estoque), o middleware `requireRole` precisaria ser estendido para aceitar regras por rota.

### 2.6 Exportação de relatórios em três formatos (JSON, CSV, PDF)

**Decisão:** o endpoint `/reports/export` aceita os formatos `json` (padrão), `csv` (gerado manualmente, sem dependência externa) e `pdf` (gerado com a biblioteca `pdfkit`, em formato tabular simples).

**Justificativa:** o requisito do domínio (vide documentação do projeto) pede exportação em CSV ou PDF. Optamos por `pdfkit` em vez de alternativas baseadas em headless browser (como Puppeteer) por ser uma dependência leve, sem necessidade de Chromium embutido na imagem Docker — relevante para manter o tempo de build e o tamanho da imagem controlados em um microsserviço.

**Trade-off aceito:** o PDF gerado é uma tabela simples, sem gráficos ou formatação visual sofisticada. Para o escopo acadêmico, essa limitação é aceitável.

### 2.7 Stack técnica alinhada ao exemplo do professor

**Decisão:** Express 5 + TypeScript, Jest para testes (unitários e funcionais), ESLint com typescript-eslint, Docker multi-stage build, documentação via OpenAPI 3.0.

**Justificativa:** seguir o padrão do exemplo fornecido pelo professor reduz risco de incompatibilidade com o restante do ecossistema (Shell App, API Gateway, pipelines de CI/CD esperadas) e com os critérios de avaliação documentados.

---

## 3. Integração com outros microsserviços

| Serviço | Tipo de dependência | Dados consumidos | Protocolo |
|---|---|---|---|
| MS Auth (Grupo 7) | Obrigatória | Claims JWT (`sub`, `role`) | HTTP, validação local de JWT |
| MS7 — Order Service (Grupo 8) | Crítica | Pedidos confirmados (`type=SALE`, `status=COMPLETED`) | REST, paginado |
| MS4 — Stock Service (Grupo 16) | Crítica | Saldos e movimentações de estoque por variante | REST |
| MS1 — Product Service (Grupo 7) | Secundária (enriquecimento) | Nome, preço, categoria e variantes (cor/tamanho) do produto | REST |

A resolução de `productVariantId` → produto → categoria/tamanho é feita inteiramente no Report Service, construindo mapas em memória a partir da resposta do Product Service a cada consulta.

---

## 4. Consequências

**Positivas:**
- Desenvolvimento do domínio pôde avançar de forma independente dos demais grupos, graças aos mocks com contratos bem definidos.
- Ausência de banco de dados próprio simplifica o deploy e elimina uma fonte adicional de inconsistência.
- A estratégia de fallback de autenticação permite testar o serviço isoladamente sem depender do MS Auth estar no ar.

**Negativas / riscos aceitos:**
- Acoplamento forte e síncrono com os serviços de origem em tempo de consulta — sem cache, qualquer indisponibilidade de Order, Stock ou Product Service propaga erro para os relatórios.
- Performance de agregação em memória não escala para grandes volumes de pedidos (aceitável no escopo acadêmico).
- Contratos de tipos podem ficar desatualizados se os serviços de origem mudarem seus schemas sem comunicação prévia ao Grupo 23.

---

## 5. Alternativas consideradas e descartadas

| Alternativa | Por que foi descartada |
|---|---|
| Banco de dados próprio com replicação via eventos (SQS/SNS) | Maior complexidade de implementação e operação, desproporcional ao prazo de 4 dias e ao volume de dados do projeto |
| Cache com Redis para os dados agregados | Adicionaria uma peça de infraestrutura extra (e um SPOF) sem benefício de performance perceptível na escala do projeto |
| Geração de PDF via Puppeteer (headless Chrome) | Aumentaria significativamente o tamanho da imagem Docker e o tempo de build, sem necessidade de layout visual complexo |
| RBAC granular por relatório | Complexidade desnecessária frente ao requisito real do domínio |
## Adendo — Limitação observada no Ministack durante integração

**Data:** 21/06/2026
**Status:** Documentado, contornado para fins de demonstração

### Contexto

Durante a integração completa via `make setup` no `plus-infra`, identificamos uma limitação do Ministack (build community do LocalStack) que afeta o **MS Auth (Grupo 7)**, não o domínio do Grupo 23.

### Problema observado

O `infra-provisioner` provisiona com sucesso, via Terraform, os recursos simulados de API Gateway e S3 no Ministack. No entanto, o recurso `aws_db_instance` (RDS) é aceito pela API do LocalStack (`CreateDBInstance` retorna sucesso), mas **não inicia um motor PostgreSQL real e acessível** na porta esperada. Ao tentar conectar, o `plus-ms-auth` (que depende de um banco PostgreSQL real para autenticação) recebe:

```
sqlalchemy.exc.OperationalError: connection to server at "ministack" (172.18.0.2), port 5432 failed: Connection refused
```

Isso é uma limitação conhecida do LocalStack/Ministack na sua edição community: a feature de RDS completo com motor de banco real embutido é, em algumas versões, restrita à edição Pro, ou depende de configuração adicional (`SERVICES=rds` com suporte a motor real) não coberta pelo `docker-compose.yml` padrão do exemplo do professor.

### Diagnóstico realizado

1. Confirmamos que o erro inicial (`could not translate host name "ministack-rds-plus-auth-db"`) era de configuração — corrigido apontando `DB_HOST` para o hostname real do container (`ministack`).
2. Após a correção, o erro mudou para `Connection refused` na porta 5432 — confirmando que o problema não é de configuração, mas de ausência de um servidor PostgreSQL real escutando naquela porta dentro do Ministack.
3. Validamos que os demais serviços (`plus-mfe-auth`, `plus-ms-report`, `plus-mfe-report`, `plus-shell`) sobem e operam normalmente, pois não dependem de RDS.

### Impacto no domínio do Grupo 23

**Nenhum.** O MS Report (`plus-ms-report`) não possui banco de dados próprio (decisão arquitetural documentada na seção 2.1 deste ADR) e não depende do RDS do MS Auth para funcionar — apenas da validação de assinatura do JWT via `JWT_SECRET` compartilhado, que independe de o `plus-ms-auth` estar com seu banco operacional.

### Contorno usado para demonstração

Para validar a integração completa (Shell → MFE Auth → MFE Report → MS Report) sem depender do login real (bloqueado pela limitação acima), geramos um JWT válido manualmente, assinado com o mesmo `JWT_SECRET` configurado no ambiente, e o inserimos via `localStorage` no navegador. Isso permitiu confirmar, com evidência visual:

- O Shell App carrega corretamente o `mfe_auth` (tela de login) via Module Federation;
- A rota privada `/relatorios` carrega corretamente o `mfe_report` via Module Federation;
- O MS Report valida o JWT de verdade (rejeitando tokens inválidos com `401 Token JWT inválido ou expirado`, e aceitando o token assinado corretamente);
- Os dados retornados pelo MS Report são exibidos corretamente no MFE, dentro do Shell, com todos os containers rodando em Docker via Ministack.

### Recomendação para a equipe

Se a integração completa com login real (`plus-ms-auth`) for necessária para a demonstração em sala, recomendamos ao Grupo 7 investigar:
- Se a versão do Ministack em uso (`ministackorg/ministack`) suporta `RDS_DATA_PATH` ou configuração equivalente para emular um motor Postgres real;
- Como alternativa, rodar um container PostgreSQL real separado (fora do Ministack) e apontar `DB_HOST` para ele, já que o restante da stack (API Gateway, S3) funciona corretamente via Ministack.
