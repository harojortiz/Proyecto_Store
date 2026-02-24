import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useEffect, lazy, Suspense } from "react";
import { useVentasStore } from "@/store/useVentasStore";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Layout from "./components/Layout";
import LoadingFallback from "./components/LoadingFallback";
import { ErrorBoundary } from "./components/ErrorBoundary";

// Lazy load pages for better performance
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Ventas = lazy(() => import("./pages/Ventas"));
const Productos = lazy(() => import("./pages/Productos"));
const Clientes = lazy(() => import("./pages/Clientes"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Profile = lazy(() => import("./pages/Profile"));
const UsersPage = lazy(() => import("./pages/Users"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

const AppRoutes = () => {
  const { obtenerClientes, obtenerModelos, obtenerVentas } = useVentasStore();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      console.log("🔄 Cargando datos iniciales...");
      obtenerClientes();
      obtenerModelos();
      obtenerVentas();
    }
  }, [obtenerClientes, obtenerModelos, obtenerVentas, isAuthenticated]);

  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Rutas protegidas */}
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/ventas" element={<Ventas />} />
        <Route path="/productos" element={<Productos />} />
        <Route path="/clientes" element={<Clientes />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/usuarios" element={<UsersPage />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ErrorBoundary>
            <AuthProvider>
              <Suspense fallback={<LoadingFallback />}>
                <AppRoutes />
              </Suspense>
            </AuthProvider>
          </ErrorBoundary>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
