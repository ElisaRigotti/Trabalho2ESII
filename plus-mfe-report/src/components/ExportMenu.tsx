import { useState } from "react";
import { Button, Menu, MenuItem, ListItemIcon, ListItemText, CircularProgress } from "@mui/material";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import TableChartIcon from "@mui/icons-material/TableChart";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import type { ReportType, ExportFormat, DateRangeFilter } from "../types/report";
import { downloadReportExport } from "../services/report-api";

interface Props {
  reportType: ReportType;
  filters: DateRangeFilter;
}

export default function ExportMenu({ reportType, filters }: Props) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [exporting, setExporting] = useState<ExportFormat | null>(null);
  const [error, setError] = useState<string | null>(null);
  const open = Boolean(anchorEl);

  async function handleExport(format: ExportFormat) {
    setAnchorEl(null);
    setExporting(format);
    setError(null);
    try {
      await downloadReportExport(reportType, format, filters);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setExporting(null);
    }
  }

  return (
    <>
      <Button
        variant="contained"
        size="small"
        startIcon={exporting ? <CircularProgress size={16} color="inherit" /> : <FileDownloadIcon />}
        onClick={(e) => setAnchorEl(e.currentTarget)}
        disabled={exporting !== null}
      >
        Exportar
      </Button>
      <Menu anchorEl={anchorEl} open={open} onClose={() => setAnchorEl(null)}>
        <MenuItem onClick={() => handleExport("csv")}>
          <ListItemIcon>
            <TableChartIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>CSV</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleExport("pdf")}>
          <ListItemIcon>
            <PictureAsPdfIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>PDF</ListItemText>
        </MenuItem>
      </Menu>
      {error && (
        <span style={{ color: "#d32f2f", fontSize: 12, marginLeft: 8 }}>{error}</span>
      )}
    </>
  );
}
