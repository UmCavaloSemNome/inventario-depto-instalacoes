export type User = {
  id: string;
  name: string;
  role: 'technician' | 'manager';
  vehicle_id: string | null;
  password?: string; // Senha não deve ser exposta, mas pode estar presente na resposta inicial do login
};
