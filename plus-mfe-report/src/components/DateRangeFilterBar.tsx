import { Box, TextField, Button, Stack } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import type { DateRangeFilter } from "../types/report";

interface Props {
  filters: DateRangeFilter;
  onChange: (filters: DateRangeFilter) => void;
  onRefresh: () => void;
  loading: boolean;
}

export default function DateRangeFilterBar({ filters, onChange, onRefresh, loading }: Props) {
  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        gap: 2,
        alignItems: "center",
        mb: 3,
      }}
    >
      <TextField
        label="Data inicial"
        type="date"
        size="small"
        value={filters.startDate ?? ""}
        onChange={(e) => onChange({ ...filters, startDate: e.target.value || null })}
        InputLabelProps={{ shrink: true }}
      />
      <TextField
        label="Data final"
        type="date"
        size="small"
        value={filters.endDate ?? ""}
        onChange={(e) => onChange({ ...filters, endDate: e.target.value || null })}
        InputLabelProps={{ shrink: true }}
      />
      <Stack direction="row" spacing={1}>
        <Button
          variant="outlined"
          size="small"
          startIcon={<RefreshIcon />}
          onClick={onRefresh}
          disabled={loading}
        >
          Atualizar
        </Button>
      </Stack>
    </Box>
  );
}
