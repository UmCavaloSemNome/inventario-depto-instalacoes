import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBoxesStacked } from '@fortawesome/free-solid-svg-icons';

export function LoginPage() {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading, error, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      if (user.role === 'manager') {
        navigate('/dashboard', { replace: true });
      } else if (user.role === 'technician') {
        navigate('/technician', { replace: true });
      }
    }
  }, [user, navigate]);

  const handleLogin = async () => {
    await login(name, password);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <FontAwesomeIcon icon={faBoxesStacked} className="text-5xl text-blue-500 mb-4" />
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Inventário de Campo</h1>
      <p className="text-gray-600 mb-6">Digite seu nome e senha para entrar</p>
      <div className="w-full max-w-sm bg-white p-6 rounded-lg shadow-md">
        <div className="space-y-4">
          <div>
            <label htmlFor="login-name" className="block text-sm font-medium text-gray-700">Seu Nome</label>
            <input
              type="text"
              id="login-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Ex: Sérgio"
              disabled={loading}
            />
          </div>
          <div>
            <label htmlFor="login-password" className="block text-sm font-medium text-gray-700">Senha</label>
            <input
              type="password"
              id="login-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyUp={(e) => e.key === 'Enter' && handleLogin()}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              disabled={loading}
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </div>
      </div>
    </div>
  );
}