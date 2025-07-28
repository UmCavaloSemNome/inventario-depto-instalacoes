import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { CatalogManagementPage } from './pages/CatalogManagementPage'; // Importa a CatalogManagementPage
import { useAuth } from './contexts/AuthContext';

// Componente placeholder para a tela do técnico (será substituído)
function TechnicianPage() {
  const { user, logout } = useAuth();

  if (!user || user.role !== 'technician') {
    return <p>Acesso negado.</p>;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold text-gray-800">Bem-vindo, Técnico {user.name}!</h1>
      <p className="text-gray-600">Seu veículo: {user.vehicle_id}</p>
      <button
        onClick={logout}
        className="mt-4 py-2 px-4 bg-red-500 text-white rounded-md hover:bg-red-600"
      >
        Sair
      </button>
    </div>
  );
}

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
          path="/technician"
          element={user && user.role === 'technician' ? <TechnicianPage /> : <Navigate to="/login" replace />}
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
