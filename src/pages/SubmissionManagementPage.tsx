import { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import type { Submission } from '../types/Submission';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faClipboardCheck, faBoxOpen } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';

export function SubmissionManagementPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSubmissions();
    const channel = supabase
      .channel('submissions_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'submissions' },
        () => fetchSubmissions()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchSubmissions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('submissions')
      .select('*, users(name), vehicles(name)')
      .order('created_at', { ascending: false });

    if (error) {
      setError(error.message);
      setSubmissions([]);
    } else {
      setSubmissions(data || []);
    }
    setLoading(false);
  };

  const updateSubmissionStatus = async (id: string, status: 'approved' | 'rejected') => {
    setLoading(true);
    const { error } = await supabase
      .from('submissions')
      .update({ status: status })
      .eq('id', id);

    if (error) {
      setError(error.message);
    } else {
      fetchSubmissions(); // Recarrega as submissões após a atualização
    }
    setLoading(false);
  };

  const getStatusBadgeClass = (status: 'pending' | 'approved' | 'rejected') => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm sticky top-0 z-20 p-4 flex justify-between items-center">
        <div>
          <p className="font-bold text-lg text-gray-800">Conferir Inventários</p>
        </div>
        <button onClick={() => navigate('/dashboard')} className="back-to-hub-btn text-gray-500 hover:text-blue-500">
          <FontAwesomeIcon icon={faArrowLeft} className="text-2xl" />
        </button>
      </header>
      <main className="p-4 space-y-3">
        {loading && <p className="text-center text-gray-500">Carregando submissões...</p>}
        {error && <p className="text-center text-red-600">Erro: {error}</p>}
        {!loading && submissions.length === 0 && (
          <div className="text-center py-10 px-4 bg-white rounded-lg shadow-sm">
            <FontAwesomeIcon icon={faBoxOpen} className="text-4xl text-gray-300 mb-4" />
            <p className="text-gray-500">Nenhuma submissão de inventário encontrada.</p>
          </div>
        )}
        {!loading && submissions.length > 0 && (
          submissions.map((submission) => (
            <div key={submission.id} className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-semibold text-gray-800">{submission.users.name}</p>
                  <p className="text-sm text-gray-500">{submission.vehicles.name}</p>
                  <p className="text-xs text-gray-400">{new Date(submission.created_at).toLocaleString('pt-BR')}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClass(submission.status)}`}>
                  {submission.status === 'pending' ? 'Pendente' : submission.status === 'approved' ? 'Aprovado' : 'Rejeitado'}
                </span>
              </div>
              <ul className="mt-3 list-disc list-inside text-sm text-gray-700">
                {submission.submission_items.map((item, index) => (
                  <li key={index}>{item.quantity}x {item.item_name}</li>
                ))}
              </ul>
              {submission.notes && (
                <p className="mt-2 text-sm bg-gray-50 p-2 rounded-md"><b>Obs:</b> {submission.notes}</p>
              )}
              {submission.status === 'pending' && (
                <div className="flex justify-end space-x-2 mt-4">
                  <button
                    onClick={() => updateSubmissionStatus(submission.id, 'rejected')}
                    className="px-3 py-1 bg-red-500 text-white text-sm rounded-md hover:bg-red-600"
                  >
                    Rejeitar
                  </button>
                  <button
                    onClick={() => updateSubmissionStatus(submission.id, 'approved')}
                    className="px-3 py-1 bg-green-500 text-white text-sm rounded-md hover:bg-green-600"
                  >
                    Aprovar
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </main>
    </div>
  );
}
