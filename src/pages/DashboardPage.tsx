import { useAuth } from '../contexts/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSignOutAlt,
  faBook,
  faClipboardCheck,
  faInbox,
  faTruck,
  faUsersCog,
} from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';

export function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user || user.role !== 'manager') {
    // Isso deve ser tratado pelo roteamento, mas é uma segurança extra
    return <p>Acesso negado.</p>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm sticky top-0 z-20 p-4 flex justify-between items-center">
        <div>
          <p className="font-bold text-lg text-gray-800">{user.name}</p>
          <p className="text-sm text-gray-500">Painel do Gestor</p>
        </div>
        <button onClick={logout} className="logout-btn text-gray-500 hover:text-red-500 transition-colors">
          <FontAwesomeIcon icon={faSignOutAlt} className="text-2xl" />
        </button>
      </header>
      <main className="p-4 space-y-4">
        <button
          id="manage-catalog-btn"
          onClick={() => navigate('/catalog')}
          className="w-full text-left p-4 bg-white hover:bg-blue-50 rounded-lg shadow-sm flex items-center space-x-4"
        >
          <FontAwesomeIcon icon={faBook} className="text-2xl text-purple-500" />
          <div>
            <p className="font-semibold">Gerenciar Catálogo</p>
            <p className="text-sm text-gray-500">Adicionar, editar ou excluir itens</p>
          </div>
        </button>
        <button
          id="view-submissions-btn"
          className="w-full text-left p-4 bg-white hover:bg-blue-50 rounded-lg shadow-sm flex items-center space-x-4"
        >
          <FontAwesomeIcon icon={faClipboardCheck} className="text-2xl text-cyan-500" />
          <div>
            <p className="font-semibold">Conferir Inventários</p>
            <p className="text-sm text-gray-500">Aprovar contagens dos técnicos</p>
          </div>
        </button>
        <button
          id="view-requests-btn"
          className="w-full text-left p-4 bg-white hover:bg-blue-50 rounded-lg shadow-sm flex items-center space-x-4"
        >
          <FontAwesomeIcon icon={faInbox} className="text-2xl text-yellow-500" />
          <div>
            <p className="font-semibold">Ver Solicitações</p>
            <p className="text-sm text-gray-500">Aprovar ou rejeitar pedidos</p>
          </div>
        </button>
        <button
          id="manage-vehicles-btn"
          onClick={() => navigate('/vehicles')}
          className="w-full text-left p-4 bg-white hover:bg-blue-50 rounded-lg shadow-sm flex items-center space-x-4"
        >
          <FontAwesomeIcon icon={faTruck} className="text-2xl text-blue-500" />
          <div>
            <p className="font-semibold">Gerenciar Almoxarifados</p>
            <p className="text-sm text-gray-500">Adicionar ou editar veículos</p>
          </div>
        </button>
        <button
          id="manage-users-btn"
          className="w-full text-left p-4 bg-white hover:bg-blue-50 rounded-lg shadow-sm flex items-center space-x-4"
        >
          <FontAwesomeIcon icon={faUsersCog} className="text-2xl text-gray-500" />
          <div>
            <p className="font-semibold">Gerenciar Usuários</p>
            <p className="text-sm text-gray-500">Adicionar ou editar técnicos</p>
          </div>
        </button>
      </main>
    </div>
  );
}
