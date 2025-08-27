import { Praia } from '@/types/praia';

// Função para detectar a URL da API baseada no ambiente
function getApiUrl() {
  const hostname = window.location.hostname;
  
  if (hostname.includes('amazonaws') || hostname.includes('elb') || 
      (!hostname.includes('localhost') && !hostname.includes('127.0.0.1'))) {
    console.log('🚀 Modo produção: usando AWS');
    return 'http://balneabilidade-alb-1128086229.us-east-1.elb.amazonaws.com/api/praias';
  } else {
    console.log('🔧 Modo desenvolvimento: usando localhost');
    return 'http://localhost:8080/api/praias';
  }
}

const API_BASE_URL = getApiUrl();

export class PraiaService {
  static async listarPraias(): Promise<Praia[]> {
    try {
      const response = await fetch(API_BASE_URL);
      if (!response.ok) {
        throw new Error(`Erro ao carregar praias: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Erro ao carregar praias da API:', error);
      throw error;
    }
  }

  static async criarPraia(praia: Omit<Praia, 'id'>): Promise<Praia> {
    try {
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(praia),
      });
      
      if (!response.ok) {
        throw new Error(`Erro ao criar praia: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Erro ao criar praia:', error);
      throw error;
    }
  }

  static async atualizarPraia(id: string, praia: Partial<Praia>): Promise<Praia> {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(praia),
      });
      
      if (!response.ok) {
        throw new Error(`Erro ao atualizar praia: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Erro ao atualizar praia:', error);
      throw error;
    }
  }

  static async deletarPraia(id: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'DELETE',
      });
      
      return response.ok;
    } catch (error) {
      console.error('Erro ao deletar praia:', error);
      return false;
    }
  }
}