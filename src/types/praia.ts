export interface Praia {
  id: string;
  nome: string;
  localizacao: string;
  status: 'proprio' | 'improprio';
  ultimaAtualizacao: string;
  coordenadas: number[] | { // Aceita tanto formato de array quanto objeto
    latitude: number;
    longitude: number;
  };
  observacoes?: string;
}