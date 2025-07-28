export type Item = {
  id: string;
  name: string;
  sku: string;
  category: 'Equipamento' | 'Consumo' | 'Ferramenta';
  created_at: string;
};
