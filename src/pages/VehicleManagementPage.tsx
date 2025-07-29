import { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import type { Vehicle } from '../types/Vehicle';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faPlus, faPencilAlt, faTrashAlt, faTruck, faWarehouse } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import { Modal } from '../components/Modal';
import { DeleteVehicleModal } from '../components/DeleteVehicleModal';

interface VehicleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicleToEdit?: Vehicle | null;
  onSave: () => void;
}

function VehicleFormModal({ isOpen, onClose, vehicleToEdit, onSave }: VehicleFormModalProps) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (vehicleToEdit) {
      setName(vehicleToEdit.name);
    } else {
      setName('');
    }
    setError(null);
  }, [vehicleToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!name) {
      setError('O nome do almoxarifado é obrigatório.');
      setLoading(false);
      return;
    }

    const newVehicle = { name };
    let result;

    if (vehicleToEdit) {
      result = await supabase.from('vehicles').update(newVehicle).eq('id', vehicleToEdit.id);
    } else {
      result = await supabase.from('vehicles').insert(newVehicle);
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
    <Modal isOpen={isOpen} onClose={onClose} title={vehicleToEdit ? 'Editar Almoxarifado' : 'Adicionar Novo Almoxarifado'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nome do Almoxarifado</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            disabled={loading}
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400"
        >
          {loading ? 'Salvando...' : 'Salvar Almoxarifado'}
        </button>
      </form>
    </Modal>
  );
}

export function VehicleManagementPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [vehicleToEdit, setVehicleToEdit] = useState<Vehicle | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [vehicleIdToDelete, setVehicleIdToDelete] = useState<string | null>(null);
  const [vehicleNameToDelete, setVehicleNameToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchVehicles();
    const channel = supabase
      .channel('vehicles_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'vehicles' },
        () => fetchVehicles()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchVehicles = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('vehicles').select('*');
    if (error) {
      setError(error.message);
      setVehicles([]);
    } else {
      setVehicles(data || []);
    }
    setLoading(false);
  };

  const handleAddVehicle = () => {
    setVehicleToEdit(null);
    setIsFormModalOpen(true);
  };

  const handleEditVehicle = (vehicle: Vehicle) => {
    setVehicleToEdit(vehicle);
    setIsFormModalOpen(true);
  };

  const handleDeleteVehicle = (vehicleId: string, vehicleName: string) => {
    setVehicleIdToDelete(vehicleId);
    setVehicleNameToDelete(vehicleName);
    setIsDeleteModalOpen(true);
  };

  const handleModalClose = () => {
    setIsFormModalOpen(false);
    setVehicleToEdit(null);
    setIsDeleteModalOpen(false);
    setVehicleIdToDelete(null);
    setVehicleNameToDelete(null);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm sticky top-0 z-20 p-4 flex justify-between items-center">
        <div>
          <p className="font-bold text-lg text-gray-800">Gerenciar Almoxarifados</p>
        </div>
        <button onClick={() => navigate('/dashboard')} className="back-to-hub-btn text-gray-500 hover:text-blue-500">
          <FontAwesomeIcon icon={faArrowLeft} className="text-2xl" />
        </button>
      </header>
      <main className="p-4 space-y-3 pb-24">
        {loading && <p className="text-center text-gray-500">Carregando almoxarifados...</p>}
        {error && <p className="text-center text-red-600">Erro: {error}</p>}
        {!loading && vehicles.length === 0 && (
          <div className="text-center py-10 px-4 bg-white rounded-lg shadow-sm">
            <FontAwesomeIcon icon={faWarehouse} className="text-4xl text-gray-300 mb-4" />
            <p className="text-gray-500">Nenhum almoxarifado cadastrado.</p>
          </div>
        )}
        {!loading && vehicles.length > 0 && (
          vehicles.sort((a, b) => a.name.localeCompare(b.name)).map((vehicle) => (
            <div key={vehicle.id} className="bg-white rounded-lg shadow-sm p-2 flex items-center justify-between">
              <button
                onClick={() => { /* TODO: Navegar para o inventário do veículo */ alert(`Ver inventário de ${vehicle.name}`); }}
                className="flex-grow flex items-center space-x-4 text-left p-2 rounded-lg hover:bg-gray-50"
              >
                <FontAwesomeIcon icon={faTruck} className="text-2xl text-blue-500" />
                <div>
                  <p className="font-semibold text-gray-800">{vehicle.name}</p>
                </div>
              </button>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEditVehicle(vehicle)}
                  className="edit-vehicle-btn p-2 text-gray-400 hover:text-blue-600 rounded-full flex-shrink-0"
                  title="Editar Nome"
                >
                  <FontAwesomeIcon icon={faPencilAlt} />
                </button>
                <button
                  onClick={() => handleDeleteVehicle(vehicle.id, vehicle.name)}
                  className="delete-vehicle-btn p-2 text-gray-400 hover:text-red-600 rounded-full flex-shrink-0"
                  title="Excluir Almoxarifado"
                >
                  <FontAwesomeIcon icon={faTrashAlt} />
                </button>
              </div>
            </div>
          ))
        )}
      </main>
      <div className="fixed bottom-4 right-4">
        <button
          onClick={handleAddVehicle}
          className="bg-blue-500 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:bg-blue-600"
          title="Adicionar Novo Almoxarifado"
        >
          <FontAwesomeIcon icon={faPlus} className="text-2xl" />
        </button>
      </div>

      <VehicleFormModal
        isOpen={isFormModalOpen}
        onClose={handleModalClose}
        vehicleToEdit={vehicleToEdit}
        onSave={fetchVehicles}
      />

      <DeleteVehicleModal
        isOpen={isDeleteModalOpen}
        onClose={handleModalClose}
        vehicleId={vehicleIdToDelete}
        vehicleName={vehicleNameToDelete}
        onDelete={fetchVehicles}
      />
    </div>
  );
}