import type { RequestItem } from './RequestItem';

export type Request = {
  id: string;
  created_at: string;
  user_id: string;
  status: 'pending' | 'approved' | 'rejected';
  request_items: RequestItem[];
  notes?: string;
  users: { name: string }; // Para incluir o nome do usuário que fez a solicitação
};
