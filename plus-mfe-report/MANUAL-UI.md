# Manual de UI — Microfrontend de Relatórios (Grupo 23)

**Domínio:** MS9 — Relatórios de vendas e analytics
**Acesso:** Requer login no sistema com papel `admin`, `gestor` ou `vendedor`

---

## Visão geral

A tela de Relatórios apresenta três visões analíticas do negócio, organizadas em abas, com um filtro de período compartilhado e exportação de dados em CSV ou PDF.

---

## 1. Filtro de período

No topo da tela, dois campos de data definem o período do relatório:

- **Data inicial** — início do intervalo de análise
- **Data final** — fim do intervalo de análise

Se nenhuma data for selecionada, o relatório considera todo o histórico disponível. Após alterar as datas, clique em **Atualizar** para recarregar os dados — o sistema não atualiza automaticamente a cada tecla digitada, para evitar consultas desnecessárias aos demais microsserviços.

---

## 2. Abas de relatório

### Vendas por categoria
Mostra, para cada categoria de produto (ex: Moda Praia, Casual, Festa), o número de pedidos, a quantidade total de itens vendidos e a receita total no período. As linhas vêm ordenadas da categoria com maior receita para a de menor.

### Vendas por tamanho
Mostra o desempenho de vendas agrupado por tamanho (P, M, G, GG, ou numeração 38–56, dependendo do produto). Inclui uma barra de proporção visual que compara a quantidade vendida de cada tamanho com o tamanho mais vendido do período — útil para identificar rapidamente quais grades têm mais saída.

### Movimentações de estoque
Mostra, por produto, o total de entradas (reposições), saídas (vendas/baixas) e ajustes manuais de estoque no período, além do saldo atual em estoque. As setas verdes indicam entrada, as vermelhas indicam saída.

---

## 3. Exportação

O botão **Exportar**, no canto superior direito, abre um menu com dois formatos:

- **CSV** — para abrir em Excel/Planilhas Google, ideal para análises adicionais
- **PDF** — para impressão ou compartilhamento em formato fixo

A exportação sempre se refere à aba ativa no momento do clique e respeita o período selecionado no filtro.

---

## 4. Estados da tela

- **Carregando:** linhas cinza animadas (skeleton) aparecem enquanto os dados são buscados nos microsserviços de Pedidos, Estoque e Produto.
- **Sem dados:** uma mensagem informativa aparece quando não há vendas ou movimentações no período selecionado — não é um erro, apenas ausência de dados.
- **Erro:** se algum microsserviço dependente estiver indisponível, uma mensagem de erro vermelha aparece no lugar da tabela, descrevendo o problema.

---

## 5. Permissões

O acesso aos relatórios é restrito a usuários autenticados com papel `admin`, `gestor` ou `vendedor`. Usuários sem um desses papéis, ou não autenticados, recebem erro de acesso negado ao tentar abrir a tela.
