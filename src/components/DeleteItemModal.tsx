import { useState } from 'react';
import { Modal } from './Modal';
import { supabase } from '../services/supabase';

interface DeleteItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemId: string | null;
  itemName: string | null;
  onDelete: () => void;
}

export function DeleteItemModal({ isOpen, onClose, itemId, itemName, onDelete }: DeleteItemModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!itemId) return;

    setLoading(true);
    setError(null);

    const { error } = await supabase.from('items').delete().eq('id', itemId);

    if (error) {
      setError(error.message);
    } else {
      onDelete();
      onClose();
    }
    setLoading(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Confirmar Exclusão">
      <p className="text-gray-700 mb-4">
        Tem certeza que deseja excluir o item <span className="font-semibold">{itemName}</span>?
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
