import type { SubmissionItem } from './SubmissionItem';

export type Submission = {
  id: string;
  created_at: string;
  user_id: string;
  vehicle_id: string;
  status: 'pending' | 'approved' | 'rejected';
  submission_items: SubmissionItem[];
  notes?: string;
  users: { name: string }; // Para incluir o nome do usuário que fez a submissão
  vehicles: { name: string }; // Para incluir o nome do veículo
};
