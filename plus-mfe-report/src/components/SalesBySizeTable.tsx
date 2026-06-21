import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Skeleton,
  Alert,
  Box,
  LinearProgress,
} from "@mui/material";
import type { SalesBySizeItem } from "../types/report";

interface Props {
  data: SalesBySizeItem[] | null;
  loading: boolean;
  error: string | null;
}

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export default function SalesBySizeTable({ data, loading, error }: Props) {
  if (error) return <Alert severity="error">{error}</Alert>;

  if (loading) {
    return (
      <Box>
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} height={48} sx={{ my: 0.5 }} />
        ))}
      </Box>
    );
  }

  if (!data || data.length === 0) {
    return <Alert severity="info">Nenhuma venda encontrada para o período selecionado.</Alert>;
  }

  const maxItems = Math.max(...data.map((d) => d.totalItems));

  return (
    <TableContainer component={Paper} variant="outlined">
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Tamanho</TableCell>
            <TableCell align="right">Pedidos</TableCell>
            <TableCell>Itens vendidos</TableCell>
            <TableCell align="right">Receita</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row) => (
            <TableRow key={row.size} hover>
              <TableCell>
                <Chip label={row.size} size="small" color="primary" variant="outlined" />
              </TableCell>
              <TableCell align="right">{row.totalOrders}</TableCell>
              <TableCell sx={{ minWidth: 160 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box sx={{ width: "100%" }}>
                    <LinearProgress
                      variant="determinate"
                      value={(row.totalItems / maxItems) * 100}
                      sx={{ height: 6, borderRadius: 1 }}
                    />
                  </Box>
                  <Box sx={{ minWidth: 28, fontSize: 13 }}>{row.totalItems}</Box>
                </Box>
              </TableCell>
              <TableCell align="right">{currency.format(row.totalRevenue)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
