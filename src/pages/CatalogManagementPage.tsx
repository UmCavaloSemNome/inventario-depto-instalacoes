import { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import type { Item } from '../types/Item';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faPlus, faPencilAlt, faTrashAlt, faBookOpen, faCogs, faBox, faWrench, faQuestion } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import { ItemFormModal } from '../components/ItemFormModal';
import { DeleteItemModal } from '../components/DeleteItemModal';

export function CatalogManagementPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<Item | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemIdToDelete, setItemIdToDelete] = useState<string | null>(null);
  const [itemNameToDelete, setItemNameToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchItems();
    const channel = supabase
      .channel('items_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'items' },
        () => fetchItems()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('items').select('*');
    if (error) {
      setError(error.message);
      setItems([]);
    } else {
      setItems(data || []);
    }
    setLoading(false);
  };

  const getIconForCategory = (category: string) => {
    switch (category) {
      case 'Equipamento':
        return faCogs;
      case 'Consumo':
        return faBox;
      case 'Ferramenta':
        return faWrench;
      default:
        return faQuestion;
    }
  };

  const handleAddItem = () => {
    setItemToEdit(null);
    setIsFormModalOpen(true);
  };

  const handleEditItem = (item: Item) => {
    setItemToEdit(item);
    setIsFormModalOpen(true);
  };

  const handleDeleteItem = (itemId: string, itemName: string) => {
    setItemIdToDelete(itemId);
    setItemNameToDelete(itemName);
    setIsDeleteModalOpen(true);
  };

  const handleModalClose = () => {
    setIsFormModalOpen(false);
    setIsDeleteModalOpen(false);
    setItemToEdit(null);
    setItemIdToDelete(null);
    setItemNameToDelete(null);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm sticky top-0 z-20 p-4 flex justify-between items-center">
        <div>
          <p className="font-bold text-lg text-gray-800">Gerenciar Catálogo</p>
        </div>
        <button onClick={() => navigate('/dashboard')} className="back-to-hub-btn text-gray-500 hover:text-blue-500">
          <FontAwesomeIcon icon={faArrowLeft} className="text-2xl" />
        </button>
      </header>
      <main className="p-4 space-y-3 pb-24">
        {loading && <p className="text-center text-gray-500">Carregando itens...</p>}
        {error && <p className="text-center text-red-600">Erro: {error}</p>}
        {!loading && items.length === 0 && (
          <div className="text-center py-10 px-4 bg-white rounded-lg shadow-sm">
            <FontAwesomeIcon icon={faBookOpen} className="text-4xl text-gray-300 mb-4" />
            <p className="text-gray-500">Nenhum item no catálogo.</p>
          </div>
        )}
        {!loading && items.length > 0 && (
          items.sort((a, b) => a.name.localeCompare(b.name)).map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow-sm p-4 flex items-center justify-between">
              <div className="flex-shrink-0 h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <FontAwesomeIcon icon={getIconForCategory(item.category)} className="text-xl text-blue-500" />
              </div>
              <div className="flex-grow ml-4">
                <p className="font-semibold text-gray-800">{item.name}</p>
                <p className="text-sm text-gray-500">SKU: {item.sku} | Categoria: {item.category}</p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEditItem(item)}
                  className="edit-item-btn p-2 text-gray-400 hover:text-blue-600 rounded-full"
                  title="Editar Item"
                >
                  <FontAwesomeIcon icon={faPencilAlt} />
                </button>
                <button
                  onClick={() => handleDeleteItem(item.id, item.name)}
                  className="delete-item-btn p-2 text-gray-400 hover:text-red-600 rounded-full"
                  title="Excluir Item"
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
          onClick={handleAddItem}
          className="bg-blue-500 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:bg-blue-600"
          title="Adicionar Novo Item"
        >
          <FontAwesomeIcon icon={faPlus} className="text-2xl" />
        </button>
      </div>

      <ItemFormModal
        isOpen={isFormModalOpen}
        onClose={handleModalClose}
        itemToEdit={itemToEdit}
        onSave={fetchItems}
      />

      <DeleteItemModal
        isOpen={isDeleteModalOpen}
        onClose={handleModalClose}
        itemId={itemIdToDelete}
        itemName={itemNameToDelete}
        onDelete={fetchItems}
      />
    </div>
  );
}