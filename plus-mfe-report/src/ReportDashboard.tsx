import { useState, useEffect, useCallback, SyntheticEvent } from "react";
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Paper,
  Stack,
  Divider,
} from "@mui/material";
import BarChartIcon from "@mui/icons-material/BarChart";
import StraightenIcon from "@mui/icons-material/Straighten";
import Inventory2Icon from "@mui/icons-material/Inventory2";

import DateRangeFilterBar from "./components/DateRangeFilterBar";
import ExportMenu from "./components/ExportMenu";
import SalesByCategoryTable from "./components/SalesByCategoryTable";
import SalesBySizeTable from "./components/SalesBySizeTable";
import StockMovementsTable from "./components/StockMovementsTable";

import {
  fetchSalesByCategory,
  fetchSalesBySize,
  fetchStockMovements,
} from "./services/report-api";

import type {
  DateRangeFilter,
  SalesByCategoryItem,
  SalesBySizeItem,
  StockMovementSummary,
  ReportType,
} from "./types/report";

const TABS: { type: ReportType; label: string; icon: JSX.Element }[] = [
  { type: "sales-by-category", label: "Vendas por categoria", icon: <BarChartIcon fontSize="small" /> },
  { type: "sales-by-size", label: "Vendas por tamanho", icon: <StraightenIcon fontSize="small" /> },
  { type: "stock-movements", label: "Movimentações de estoque", icon: <Inventory2Icon fontSize="small" /> },
];

/**
 * Componente raiz exposto via Module Federation como `mfe_report/ReportDashboard`.
 *
 * Não depende de roteamento próprio — é montado pelo Shell App dentro de
 * uma rota privada já autenticada, seguindo o mesmo padrão usado para
 * o mfe_auth (ver chave-shell/src/App.jsx).
 */
export default function ReportDashboard() {
  const [tabIndex, setTabIndex] = useState(0);
  const [filters, setFilters] = useState<DateRangeFilter>({ startDate: null, endDate: null });

  const [categoryData, setCategoryData] = useState<SalesByCategoryItem[] | null>(null);
  const [sizeData, setSizeData] = useState<SalesBySizeItem[] | null>(null);
  const [stockData, setStockData] = useState<StockMovementSummary[] | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeType = TABS[tabIndex]!.type;

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [category, size, stock] = await Promise.all([
        fetchSalesByCategory(filters),
        fetchSalesBySize(filters),
        fetchStockMovements(filters),
      ]);
      setCategoryData(category);
      setSizeData(size);
      setStockData(stock);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleTabChange(_event: SyntheticEvent, newValue: number) {
    setTabIndex(newValue);
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1100, mx: "auto" }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1 }}>
        <Box>
          <Typography variant="h5" fontWeight={600}>
            Relatórios de vendas e estoque
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Visão consolidada de vendas, desempenho por tamanho e movimentações de estoque.
          </Typography>
        </Box>
        <ExportMenu reportType={activeType} filters={filters} />
      </Stack>

      <Divider sx={{ my: 2 }} />

      <DateRangeFilterBar
        filters={filters}
        onChange={setFilters}
        onRefresh={loadData}
        loading={loading}
      />

      <Paper variant="outlined" sx={{ mb: 2 }}>
        <Tabs
          value={tabIndex}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          {TABS.map((tab) => (
            <Tab key={tab.type} icon={tab.icon} iconPosition="start" label={tab.label} />
          ))}
        </Tabs>
      </Paper>

      <Box>
        {activeType === "sales-by-category" && (
          <SalesByCategoryTable data={categoryData} loading={loading} error={error} />
        )}
        {activeType === "sales-by-size" && (
          <SalesBySizeTable data={sizeData} loading={loading} error={error} />
        )}
        {activeType === "stock-movements" && (
          <StockMovementsTable data={stockData} loading={loading} error={error} />
        )}
      </Box>
    </Box>
  );
}
