import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Layout from "./components/Layout";
import BuildAgent from "./pages/shared/BuildAgent";
import ImproveAgent from "./pages/shared/ImproveAgent";
import DemoAgent from "./pages/shared/DemoAgent";
import LaunchAgent from "./pages/shared/LaunchAgent";
import ApiKey from "./pages/shared/ApiKey";
import Support from "./pages/shared/Support";
import NotFound from "./pages/shared/NotFound";
import Auth from "./pages/shared/Auth";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./pages/dashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <LanguageProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <Routes>
                <Route path="/auth" element={<Auth />} />
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/" element={
                  <ProtectedRoute>
                    <Layout>
                      <Outlet />
                    </Layout>
                  </ProtectedRoute>
                }>
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="build" element={<BuildAgent />} />
                  <Route path="improve" element={<ImproveAgent />} />
                  <Route path="demo" element={<DemoAgent />} />
                  <Route path="launch" element={<LaunchAgent />} />
                  <Route path="api-key" element={<ApiKey />} />
                  <Route path="support" element={<Support />} />
                  <Route path="*" element={<NotFound />} />
                </Route>
              </Routes>
            </TooltipProvider>
          </LanguageProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
