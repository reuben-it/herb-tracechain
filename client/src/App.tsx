import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import NotFound from "@/pages/NotFound";
import Login from "@/pages/Login";
import CollectorDashboard from "@/pages/CollectorDashboard";
import ProcessorDashboard from "@/pages/ProcessorDashboard";
import AdminDashboard from "@/pages/AdminDashboard";
import VerifyPage from "@/pages/VerifyPage";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/verify/:herbId">
        {(params) => <VerifyPage herbId={params.herbId} />}
      </Route>
      <Route path="/collector">
        <ProtectedRoute requiredRole="collector">
          <CollectorDashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/processor">
        <ProtectedRoute requiredRole="processor">
          <ProcessorDashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/admin">
        <ProtectedRoute requiredRole="admin">
          <AdminDashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
