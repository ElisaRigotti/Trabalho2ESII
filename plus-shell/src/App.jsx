import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate, Link } from "react-router-dom";

// Import lazy dos microfrontends remotos
const LoginPage = lazy(() => import("mfe_auth/LoginPage"));
const ReportDashboard = lazy(() => import("mfe_report/ReportDashboard"));

function PrivateRoute({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" replace />;
}

function Dashboard() {
  return (
    <div style={{ padding: 32, fontFamily: "sans-serif" }}>
      <h1>Chave — Dashboard</h1>
      <p>Bem-vindo ao sistema de gestão de estoque.</p>
      <nav style={{ marginBottom: 24 }}>
        <Link to="/relatorios">Ver relatórios</Link>
      </nav>
      <button
        onClick={() => {
          localStorage.clear();
          window.location.href = "/login";
        }}
      >
        Sair
      </button>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<p>Carregando...</p>}>
        <Routes>
          <Route
            path="/login"
            element={
              <LoginPage
                onLogin={() => (window.location.href = "/")}
              />
            }
          />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/relatorios"
            element={
              <PrivateRoute>
                <ReportDashboard />
              </PrivateRoute>
            }
          />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
