import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import federation from "@originjs/vite-plugin-federation";

const MFE_AUTH_URL =
  process.env.MFE_AUTH_URL || "http://localhost:4001/assets/remoteEntry.js";
const MFE_REPORT_URL =
  process.env.MFE_REPORT_URL || "http://localhost:4009/assets/remoteEntry.js";

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: "shell",
      remotes: {
        // O Shell consome o remoteEntry exposto pelo chave-mfe-auth
        mfe_auth: MFE_AUTH_URL,
        // O Shell consome o remoteEntry exposto pelo plus-mfe-report (Grupo 23)
        mfe_report: MFE_REPORT_URL,
      },
      shared: ["react", "react-dom"],
    }),
  ],
  build: {
    target: "esnext",
    minify: false,
  },
  server: {
    port: 3000,
    host: true,
  },
  preview: {
    port: 3000,
    host: true,
  },
});
