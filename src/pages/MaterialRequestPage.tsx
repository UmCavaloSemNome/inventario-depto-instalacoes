import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faPaperPlane } from '@fortawesome/free-solid-svg-icons';

const MaterialRequestPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [catalogItems, setCatalogItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requesting, setRequesting] = useState(false);
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchCatalogItems();
  }, [user, navigate]);

  const fetchCatalogItems = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('items').select('*');

    if (error) {
      setError(error.message);
      setCatalogItems([]);
    } else {
      setCatalogItems(data || []);
      const initialQuantities: { [key: string]: number } = {};
      data?.forEach(item => {
        initialQuantities[item.id] = 0;
      });
      setQuantities(initialQuantities);
    }
    setLoading(false);
  };

  const handleQuantityChange = (itemId: string, value: string) => {
    setQuantities(prevQuantities => ({
      ...prevQuantities,
      [itemId]: Number(value),
    }));
  };

  const handleSubmitRequest = async () => {
    if (!user || !user.id) {
      setError('Usuário não identificado.');
      return;
    }

    const itemsToRequest = Object.keys(quantities)
      .filter(itemId => quantities[itemId] > 0)
      .map(itemId => ({
        item_id: itemId,
        requested_quantity: quantities[itemId],
      }));

    if (itemsToRequest.length === 0) {
      setError('Selecione pelo menos um item para solicitar.');
      return;
    }

    setRequesting(true);
    setError(null);

    try {
      // Create a new request record
      const { data: requestData, error: requestError } = await supabase
        .from('requests')
        .insert({
          user_id: user.id,
          request_date: new Date().toISOString(),
          status: 'pending', // pending, approved, rejected
        })
        .select();

      if (requestError) throw requestError;

      const requestId = requestData[0].id;

      // Prepare request items
      const requestItems = itemsToRequest.map(item => ({
        request_id: requestId,
        item_id: item.item_id,
        requested_quantity: item.requested_quantity,
      }));

      // Insert request items
      const { error: requestItemsError } = await supabase
        .from('request_items')
        .insert(requestItems);

      if (requestItemsError) throw requestItemsError;

      alert('Solicitação de material enviada com sucesso!');
      navigate('/technician'); // Go back to dashboard
    } catch (err: any) {
      setError(err.message);
    } finally {
      setRequesting(false);
    }
  };

  if (loading) {
    return <p className="text-center text-gray-500">Carregando catálogo...</p>;
  }

  if (error) {
    return <p className="text-center text-red-600">Erro: {error}</p>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm sticky top-0 z-20 p-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Solicitar Material</h1>
        </div>
        <button onClick={() => navigate('/technician')} className="back-to-dashboard-btn text-gray-500 hover:text-blue-500">
          <FontAwesomeIcon icon={faArrowLeft} className="text-2xl" />
        </button>
      </header>
      <main className="p-4 pb-24">
        {catalogItems.length === 0 ? (
          <div className="text-center py-10 px-4 bg-white rounded-lg shadow-sm">
            <p className="text-gray-500">Nenhum item disponível no catálogo.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {catalogItems.map((item) => (
              <li key={item.id} className="bg-white rounded-lg shadow-sm p-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-800">{item.name}</p>
                  <p className="text-sm text-gray-500">Estoque: {item.quantity}</p>
                </div>
                <input
                  type="number"
                  value={quantities[item.id] || 0}
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
          onClick={handleSubmitRequest}
          disabled={requesting}
          className="bg-blue-500 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:bg-blue-600 disabled:bg-blue-400"
          title="Enviar Solicitação"
        >
          {requesting ? (
            <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-solid rounded-full border-r-transparent"></span>
          ) : (
            <FontAwesomeIcon icon={faPaperPlane} className="text-2xl" />
          )}
        </button>
      </div>
    </div>
  );
};

export default MaterialRequestPage;
