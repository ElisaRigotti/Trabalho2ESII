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
} from "@mui/material";
import type { SalesByCategoryItem } from "../types/report";

interface Props {
  data: SalesByCategoryItem[] | null;
  loading: boolean;
  error: string | null;
}

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export default function SalesByCategoryTable({ data, loading, error }: Props) {
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

  return (
    <TableContainer component={Paper} variant="outlined">
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Categoria</TableCell>
            <TableCell align="right">Pedidos</TableCell>
            <TableCell align="right">Itens vendidos</TableCell>
            <TableCell align="right">Receita</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row) => (
            <TableRow key={row.categoryId} hover>
              <TableCell>
                <Chip label={row.categoryName} size="small" variant="outlined" />
              </TableCell>
              <TableCell align="right">{row.totalOrders}</TableCell>
              <TableCell align="right">{row.totalItems}</TableCell>
              <TableCell align="right">{currency.format(row.totalRevenue)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
