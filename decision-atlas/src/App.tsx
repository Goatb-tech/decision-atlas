import { Navigate, Route, Routes } from "react-router-dom";
import { AmbientBackdrop } from "./components/AmbientBackdrop";
import { TopNav } from "./components/TopNav";
import { useAuth } from "./context/AuthContext";
import { DashboardPage } from "./pages/DashboardPage";
import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import { NewScenarioPage } from "./pages/NewScenarioPage";
import { RegisterPage } from "./pages/RegisterPage";
import { ScenarioPage } from "./pages/ScenarioPage";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  return user ? <Navigate to="/dashboard" replace /> : children;
}

export default function App() {
  return (
    <div className="relative min-h-[100dvh] overflow-hidden">
      <AmbientBackdrop />
      <div className="relative z-10 min-h-[100dvh]">
        <TopNav />
        <Routes>
          <Route
            path="/"
            element={
              <PublicOnlyRoute>
                <LandingPage />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/login"
            element={
              <PublicOnlyRoute>
                <LoginPage />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicOnlyRoute>
                <RegisterPage />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/scenarios/new"
            element={
              <ProtectedRoute>
                <NewScenarioPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/scenarios/:scenarioId"
            element={
              <ProtectedRoute>
                <ScenarioPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </div>
  );
}
