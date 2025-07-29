import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';

const InventoryPage: React.FC = () => {
  const { user, logout } = useAuth();
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user && user.vehicle_id) {
      fetchInventory(user.vehicle_id);
    }
  }, [user]);

  const fetchInventory = async (vehicleId: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from('inventory')
      .select('quantity, items:item_id(*)')
      .eq('vehicle_id', vehicleId);

    if (error) {
      setError(error.message);
      setInventory([]);
    } else {
      const inventoryData = data.map((inventoryItem: any) => ({
        ...inventoryItem.items,
        quantity: inventoryItem.quantity,
      }));
      setInventory(inventoryData);
    }
    setLoading(false);
  };

  if (!user) {
    return <p>Acesso negado.</p>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm sticky top-0 z-20 p-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Inventário do Veículo</h1>
          <p className="text-gray-600">Veículo: {user.vehicle_id}</p>
        </div>
        <button
          onClick={logout}
          className="py-2 px-4 bg-red-500 text-white rounded-md hover:bg-red-600"
        >
          Sair
        </button>
      </header>
      <main className="p-4">
        {loading && <p>Carregando inventário...</p>}
        {error && <p className="text-red-500">Erro: {error}</p>}
        {!loading && inventory.length === 0 && <p>Nenhum item no inventário.</p>}
        {!loading && inventory.length > 0 && (
          <ul>
            {inventory.map((item) => (
              <li key={item.id} className="bg-white p-4 rounded-lg shadow mb-2">
                <p className="font-bold">{item.name}</p>
                <p>Quantidade: {item.quantity}</p> 
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
};

export default InventoryPage;
