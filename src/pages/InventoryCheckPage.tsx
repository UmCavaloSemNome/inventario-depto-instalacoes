import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faSave } from '@fortawesome/free-solid-svg-icons';

const InventoryCheckPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user && user.vehicle_id) {
      fetchInventory(user.vehicle_id);
    } else if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

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
        current_quantity: inventoryItem.quantity,
        new_quantity: inventoryItem.quantity, // Initialize new_quantity with current_quantity
      }));
      setInventory(inventoryData);
    }
    setLoading(false);
  };

  const handleQuantityChange = (itemId: string, value: string) => {
    setInventory((prevInventory) =>
      prevInventory.map((item) =>
        item.id === itemId ? { ...item, new_quantity: Number(value) } : item
      )
    );
  };

  const handleSubmitInventory = async () => {
    if (!user || !user.id || !user.vehicle_id) {
      setError('Usuário ou veículo não identificado.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      // Create a new submission record
      const { data: submissionData, error: submissionError } = await supabase
        .from('submissions')
        .insert({
          user_id: user.id,
          vehicle_id: user.vehicle_id,
          status: 'pending', // pending, approved, rejected
          submission_date: new Date().toISOString(),
        })
        .select();

      if (submissionError) throw submissionError;

      const submissionId = submissionData[0].id;

      // Prepare submission items
      const submissionItems = inventory.map((item) => ({
        submission_id: submissionId,
        item_id: item.id,
        reported_quantity: item.new_quantity,
        previous_quantity: item.current_quantity,
      }));

      // Insert submission items
      const { error: submissionItemsError } = await supabase
        .from('submission_items')
        .insert(submissionItems);

      if (submissionItemsError) throw submissionItemsError;

      alert('Inventário enviado para aprovação com sucesso!');
      navigate('/technician'); // Go back to dashboard
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="text-center text-gray-500">Carregando inventário...</p>;
  }

  if (error) {
    return <p className="text-center text-red-600">Erro: {error}</p>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm sticky top-0 z-20 p-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Realizar Inventário</h1>
          <p className="text-gray-600">Veículo: {user?.vehicle_id}</p>
        </div>
        <button onClick={() => navigate('/technician')} className="back-to-dashboard-btn text-gray-500 hover:text-blue-500">
          <FontAwesomeIcon icon={faArrowLeft} className="text-2xl" />
        </button>
      </header>
      <main className="p-4 pb-24">
        {inventory.length === 0 ? (
          <div className="text-center py-10 px-4 bg-white rounded-lg shadow-sm">
            <p className="text-gray-500">Nenhum item encontrado para inventário.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {inventory.map((item) => (
              <li key={item.id} className="bg-white rounded-lg shadow-sm p-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-800">{item.name}</p>
                  <p className="text-sm text-gray-500">Atual: {item.current_quantity}</p>
                </div>
                <input
                  type="number"
                  value={item.new_quantity}
                  onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                  className="w-24 p-2 border border-gray-300 rounded-md text-center"
                  min="0"
                />
              </li>
            ))}
          </ul>
        )}
      </main>
      <div className="fixed bottom-4 right-4">
        <button
          onClick={handleSubmitInventory}
          disabled={saving}
          className="bg-green-500 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:bg-green-600 disabled:bg-green-400"
          title="Enviar Inventário"
        >
          {saving ? (
            <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-solid rounded-full border-r-transparent"></span>
          ) : (
            <FontAwesomeIcon icon={faSave} className="text-2xl" />
          )}
        </button>
      </div>
    </div>
  );
};

export default InventoryCheckPage;
