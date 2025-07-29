import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { CatalogManagementPage } from './pages/CatalogManagementPage';
import { VehicleManagementPage } from './pages/VehicleManagementPage';
import { UserManagementPage } from './pages/UserManagementPage';
import { SubmissionManagementPage } from './pages/SubmissionManagementPage';
import { RequestManagementPage } from './pages/RequestManagementPage';
import { InventoryPage } from './pages/InventoryPage';
import { useAuth } from './contexts/AuthContext';

function App() {
  const { user } = useAuth();

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/dashboard"
          element={user && user.role === 'manager' ? <DashboardPage /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/catalog"
          element={user && user.role === 'manager' ? <CatalogManagementPage /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/vehicles"
          element={user && user.role === 'manager' ? <VehicleManagementPage /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/users"
          element={user && user.role === 'manager' ? <UserManagementPage /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/submissions"
          element={user && user.role === 'manager' ? <SubmissionManagementPage /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/requests"
          element={user && user.role === 'manager' ? <RequestManagementPage /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/technician"
          element={user && user.role === 'technician' ? <InventoryPage /> : <Navigate to="/login" replace />}
        />
        {/* Redireciona a rota raiz com base no papel do usuário */}
        <Route
          path="/"
          element={
            user
              ? user.role === 'manager'
                ? <Navigate to="/dashboard" replace />
                : <Navigate to="/technician" replace />
              : <Navigate to="/login" replace />
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
