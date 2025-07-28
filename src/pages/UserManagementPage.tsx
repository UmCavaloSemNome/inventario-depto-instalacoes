import { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import type { User } from '../types/User';
import type { Vehicle } from '../types/Vehicle';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faPencilAlt, faTrashAlt, faUsers, faUserPlus } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import { Modal } from '../components/Modal';

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  userToEdit?: User | null;
  onSave: () => void;
  vehicles: Vehicle[];
}

function UserFormModal({ isOpen, onClose, userToEdit, onSave, vehicles }: UserFormModalProps) {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'technician' | 'manager'>('technician');
  const [vehicleId, setVehicleId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userToEdit) {
      setName(userToEdit.name);
      setPassword(userToEdit.password || ''); // Senha não é retornada pelo Supabase por padrão, mas pode ser definida
      setRole(userToEdit.role);
      setVehicleId(userToEdit.vehicle_id);
    } else {
      setName('');
      setPassword('');
      setRole('technician');
      setVehicleId(null);
    }
    setError(null);
  }, [userToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!name || !password || !role) {
      setError('Nome, senha e papel são obrigatórios.');
      setLoading(false);
      return;
    }

    const newUser = { name, password, role, vehicle_id: role === 'technician' ? vehicleId : null };
    let result;

    if (userToEdit) {
      result = await supabase.from('users').update(newUser).eq('id', userToEdit.id);
    } else {
      result = await supabase.from('users').insert(newUser);
    }

    if (result.error) {
      setError(result.error.message);
    } else {
      onSave();
      onClose();
    }
    setLoading(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={userToEdit ? 'Editar Usuário' : 'Adicionar Novo Usuário'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nome</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            disabled={loading}
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">Senha</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            disabled={loading}
          />
        </div>
        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-700">Papel</label>
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value as 'technician' | 'manager')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            disabled={loading}
          >
            <option value="technician">Técnico</option>
            <option value="manager">Gestor</option>
          </select>
        </div>
        {role === 'technician' && (
          <div>
            <label htmlFor="vehicle" className="block text-sm font-medium text-gray-700">Almoxarifado Associado</label>
            <select
              id="vehicle"
              value={vehicleId || ''}
              onChange={(e) => setVehicleId(e.target.value || null)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              disabled={loading}
            >
              <option value="">Nenhum</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>{v.name}</option>
              ))}
            </select>
          </div>
        )}
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400"
        >
          {loading ? 'Salvando...' : 'Salvar Usuário'}
        </button>
      </form>
    </Modal>
  );
}

interface DeleteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string | null;
  userName: string | null;
  onDelete: () => void;
}

function DeleteUserModal({ isOpen, onClose, userId, userName, onDelete }: DeleteUserModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    const { error } = await supabase.from('users').delete().eq('id', userId);

    if (error) {
      setError(error.message);
    } else {
      onDelete();
      onClose();
    }
    setLoading(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Confirmar Exclusão de Usuário">
      <p className="text-gray-700 mb-4">
        Tem certeza que deseja excluir o usuário <span className="font-semibold">{userName}</span>?
        Esta ação não pode ser desfeita.
      </p>
      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
      <div className="flex justify-end space-x-2">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
          disabled={loading}
        >
          Cancelar
        </button>
        <button
          onClick={handleDelete}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          disabled={loading}
        >
          {loading ? 'Excluindo...' : 'Excluir'}
        </button>
      </div>
    </Modal>
  );
}

export function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userIdToDelete, setUserIdToDelete] = useState<string | null>(null);
  const [userNameToDelete, setUserNameToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
    const usersChannel = supabase
      .channel('users_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'users' },
        () => fetchData()
      )
      .subscribe();
    const vehiclesChannel = supabase
      .channel('vehicles_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'vehicles' },
        () => fetchData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(usersChannel);
      supabase.removeChannel(vehiclesChannel);
    };
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data: usersData, error: usersError } = await supabase.from('users').select('*');
    const { data: vehiclesData, error: vehiclesError } = await supabase.from('vehicles').select('*');

    if (usersError) {
      setError(usersError.message);
      setUsers([]);
    } else {
      setUsers(usersData || []);
    }

    if (vehiclesError) {
      setError(vehiclesError.message);
      setVehicles([]);
    } else {
      setVehicles(vehiclesData || []);
    }
    setLoading(false);
  };

  const handleAddUser = () => {
    setUserToEdit(null);
    setIsFormModalOpen(true);
  };

  const handleEditUser = (user: User) => {
    setUserToEdit(user);
    setIsFormModalOpen(true);
  };

  const handleDeleteUser = (userId: string, userName: string) => {
    setUserIdToDelete(userId);
    setUserNameToDelete(userName);
    setIsDeleteModalOpen(true);
  };

  const handleModalClose = () => {
    setIsFormModalOpen(false);
    setUserToEdit(null);
    setIsDeleteModalOpen(false);
    setUserIdToDelete(null);
    setUserNameToDelete(null);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm sticky top-0 z-20 p-4 flex justify-between items-center">
        <div>
          <p className="font-bold text-lg text-gray-800">Gerenciar Usuários</p>
        </div>
        <button onClick={() => navigate('/dashboard')} className="back-to-hub-btn text-gray-500 hover:text-blue-500">
          <FontAwesomeIcon icon={faArrowLeft} className="text-2xl" />
        </button>
      </header>
      <main className="p-4 space-y-3 pb-24">
        {loading && <p className="text-center text-gray-500">Carregando usuários...</p>}
        {error && <p className="text-center text-red-600">Erro: {error}</p>}
        {!loading && users.filter(u => u.role === 'technician').length === 0 && (
          <div className="text-center py-10 px-4 bg-white rounded-lg shadow-sm">
            <FontAwesomeIcon icon={faUsers} className="text-4xl text-gray-300 mb-4" />
            <p className="text-gray-500">Nenhum técnico cadastrado.</p>
          </div>
        )}
        {!loading && users.filter(u => u.role === 'technician').length > 0 && (
          users.filter(u => u.role === 'technician').sort((a, b) => a.name.localeCompare(b.name)).map((user) => {
            const vehicleName = vehicles.find(v => v.id === user.vehicle_id)?.name || 'Nenhum';
            return (
              <div key={user.id} className="bg-white rounded-lg shadow-sm p-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-800">{user.name}</p>
                  <p className="text-sm text-gray-500">Almoxarifado: {vehicleName}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditUser(user)}
                    className="edit-user-btn p-2 text-gray-400 hover:text-blue-600 rounded-full"
                    title="Editar Usuário"
                  >
                    <FontAwesomeIcon icon={faPencilAlt} />
                  </button>
                  <button
                    onClick={() => handleDeleteUser(user.id, user.name)}
                    className="delete-user-btn p-2 text-gray-400 hover:text-red-600 rounded-full"
                    title="Excluir Usuário"
                  >
                    <FontAwesomeIcon icon={faTrashAlt} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </main>
      <div className="fixed bottom-4 right-4">
        <button
          onClick={handleAddUser}
          className="bg-blue-500 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:bg-blue-600"
          title="Adicionar Novo Técnico"
        >
          <FontAwesomeIcon icon={faUserPlus} className="text-2xl" />
        </button>
      </div>

      <UserFormModal
        isOpen={isFormModalOpen}
        onClose={handleModalClose}
        userToEdit={userToEdit}
        onSave={fetchData}
        vehicles={vehicles}
      />

      <DeleteUserModal
        isOpen={isDeleteModalOpen}
        onClose={handleModalClose}
        userId={userIdToDelete}
        userName={userNameToDelete}
        onDelete={fetchData}
      />
    </div>
  );
}
