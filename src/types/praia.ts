export interface Praia {
  id: string;
  nome: string;
  localizacao: string;
  status: 'propria' | 'impropria';
  ultimaAtualizacao: string;
  coordenadas?: {
    latitude: number;
    longitude: number;
  };
  observacoes?: string;
}