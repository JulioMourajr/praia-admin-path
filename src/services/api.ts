import { Praia } from '@/types/praia';

const API_BASE_URL = '/api/praias';

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