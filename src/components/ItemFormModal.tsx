import { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Item } from '../types/Item';
import { supabase } from '../services/supabase';

interface ItemFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemToEdit?: Item | null;
  onSave: () => void;
}

export function ItemFormModal({ isOpen, onClose, itemToEdit, onSave }: ItemFormModalProps) {
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState<'Equipamento' | 'Consumo' | 'Ferramenta'>('Equipamento');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (itemToEdit) {
      setName(itemToEdit.name);
      setSku(itemToEdit.sku);
      setCategory(itemToEdit.category);
    } else {
      setName('');
      setSku('');
      setCategory('Equipamento');
    }
    setError(null);
  }, [itemToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!name || !sku || !category) {
      setError('Todos os campos são obrigatórios.');
      setLoading(false);
      return;
    }

    const newItem = { name, sku, category };
    let result;

    if (itemToEdit) {
      result = await supabase.from('items').update(newItem).eq('id', itemToEdit.id);
    } else {
      result = await supabase.from('items').insert(newItem);
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
    <Modal isOpen={isOpen} onClose={onClose} title={itemToEdit ? 'Editar Item' : 'Adicionar Novo Item'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nome do Item</label>
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
          <label htmlFor="sku" className="block text-sm font-medium text-gray-700">SKU</label>
          <input
            type="text"
            id="sku"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            disabled={loading}
          />
        </div>
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">Categoria</label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value as 'Equipamento' | 'Consumo' | 'Ferramenta')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            disabled={loading}
          >
            <option value="Equipamento">Equipamento</option>
            <option value="Consumo">Consumo</option>
            <option value="Ferramenta">Ferramenta</option>
          </select>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400"
        >
          {loading ? 'Salvando...' : 'Salvar Item'}
        </button>
      </form>
    </Modal>
  );
}
