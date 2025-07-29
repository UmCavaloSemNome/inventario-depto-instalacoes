import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBox, faClipboardList, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';

const TechnicianDashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return <p>Acesso negado.</p>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm sticky top-0 z-20 p-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Painel do Técnico</h1>
          <p className="text-gray-600">Bem-vindo, {user.name}!</p>
        </div>
        <button
          onClick={logout}
          className="py-2 px-4 bg-red-500 text-white rounded-md hover:bg-red-600"
        >
          <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" />
          Sair
        </button>
      </header>
      <main className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={() => navigate('/request-material')}
          className="bg-blue-500 text-white rounded-lg p-6 flex flex-col items-center justify-center shadow-lg hover:bg-blue-600"
        >
          <FontAwesomeIcon icon={faBox} className="text-4xl mb-2" />
          <span className="text-lg font-semibold">Solicitar Material</span>
        </button>
        <button
          onClick={() => navigate('/inventory-check')}
          className="bg-green-500 text-white rounded-lg p-6 flex flex-col items-center justify-center shadow-lg hover:bg-green-600"
        >
          <FontAwesomeIcon icon={faClipboardList} className="text-4xl mb-2" />
          <span className="text-lg font-semibold">Realizar Inventário</span>
        </button>
      </main>
    </div>
  );
};

export default TechnicianDashboardPage;