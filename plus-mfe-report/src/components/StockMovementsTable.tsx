import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Skeleton,
  Alert,
  Box,
  Stack,
} from "@mui/material";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import TuneIcon from "@mui/icons-material/Tune";
import type { StockMovementSummary } from "../types/report";

interface Props {
  data: StockMovementSummary[] | null;
  loading: boolean;
  error: string | null;
}

export default function StockMovementsTable({ data, loading, error }: Props) {
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
    return <Alert severity="info">Nenhuma movimentação encontrada para o período selecionado.</Alert>;
  }

  return (
    <TableContainer component={Paper} variant="outlined">
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Produto</TableCell>
            <TableCell align="right">Entradas</TableCell>
            <TableCell align="right">Saídas</TableCell>
            <TableCell align="right">Ajustes</TableCell>
            <TableCell align="right">Saldo atual</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row) => (
            <TableRow key={row.productId} hover>
              <TableCell>{row.productName}</TableCell>
              <TableCell align="right">
                <Stack direction="row" spacing={0.5} justifyContent="flex-end" alignItems="center">
                  <ArrowUpwardIcon fontSize="inherit" color="success" />
                  <span>{row.totalEntradas}</span>
                </Stack>
              </TableCell>
              <TableCell align="right">
                <Stack direction="row" spacing={0.5} justifyContent="flex-end" alignItems="center">
                  <ArrowDownwardIcon fontSize="inherit" color="error" />
                  <span>{row.totalSaidas}</span>
                </Stack>
              </TableCell>
              <TableCell align="right">
                <Stack direction="row" spacing={0.5} justifyContent="flex-end" alignItems="center">
                  <TuneIcon fontSize="inherit" color="disabled" />
                  <span>{row.totalAjustes}</span>
                </Stack>
              </TableCell>
              <TableCell align="right">
                <strong>{row.saldoAtual}</strong>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
