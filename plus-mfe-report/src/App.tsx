import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import ReportDashboard from "./ReportDashboard";

// Tema mínimo só para rodar o MFE isolado em modo dev (npm run dev).
// Quando montado dentro do Shell App, o tema real do shell prevalece.
const theme = createTheme({
  palette: {
    primary: { main: "#7c3aed" },
  },
  shape: { borderRadius: 8 },
});

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ReportDashboard />
    </ThemeProvider>
  );
}
