import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import federation from "@originjs/vite-plugin-federation";

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: "mfe_report",
      filename: "remoteEntry.js",
      exposes: {
        // O Shell consome este componente via:
        // const ReportDashboard = lazy(() => import("mfe_report/ReportDashboard"));
        "./ReportDashboard": "./src/ReportDashboard.tsx",
      },
      shared: ["react", "react-dom"],
    }),
  ],
  build: {
    target: "esnext",
    minify: false,
    cssCodeSplit: false,
  },
  server: {
    port: 4009,
    host: true,
    cors: true,
  },
  preview: {
    port: 4009,
    host: true,
    cors: true,
  },
});
