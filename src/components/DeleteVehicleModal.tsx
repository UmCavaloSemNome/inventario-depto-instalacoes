import { useState } from 'react';
import { Modal } from './Modal';
import { supabase } from '../services/supabase';

interface DeleteVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicleId: string | null;
  vehicleName: string | null;
  onDelete: () => void;
}

export function DeleteVehicleModal({ isOpen, onClose, vehicleId, vehicleName, onDelete }: DeleteVehicleModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!vehicleId) return;

    setLoading(true);
    setError(null);

    const { error } = await supabase.from('vehicles').delete().eq('id', vehicleId);

    if (error) {
      setError(error.message);
    } else {
      onDelete();
      onClose();
    }
    setLoading(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Confirmar Exclusão de Almoxarifado">
      <p className="text-gray-700 mb-4">
        Tem certeza que deseja excluir o almoxarifado <span className="font-semibold">{vehicleName}</span>?
        Esta ação não pode ser desfeita e removerá todos os itens associados a ele.
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
