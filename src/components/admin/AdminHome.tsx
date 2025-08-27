import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Waves, MapPin, TrendingUp, Users, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { PraiaService } from "@/services/api";
import { Praia } from "@/types/praia";

export const AdminHome = () => {
  const [praias, setPraias] = useState<Praia[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const carregarDados = async () => {
      try {
        setIsLoading(true);
        const data = await PraiaService.listarPraias();
        setPraias(data);
        setError(null);
      } catch (err) {
        console.error("Erro ao carregar dados:", err);
        setError("Não foi possível carregar os dados das praias");
      } finally {
        setIsLoading(false);
      }
    };

    carregarDados();
  }, []);

  // Contagem de praias próprias e impróprias
  const totalPraias = praias.length;
  const praiasPropriaCount = praias.filter(praia => {
    const status = praia.status.toLowerCase();
    return status.startsWith('propr') || status === 'proprio' || status === 'propria';
  }).length;
  const praiasImpropriaCount = totalPraias - praiasPropriaCount;
  
  // Calcular percentuais
  const percentualProprias = totalPraias > 0 ? Math.round((praiasPropriaCount / totalPraias) * 100) : 0;
  const percentualImproprias = totalPraias > 0 ? Math.round((praiasImpropriaCount / totalPraias) * 100) : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Gerencie as praias e monitore a balneabilidade
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-ocean text-primary-foreground shadow-ocean">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Praias</CardTitle>
            <Waves className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Carregando...</span>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{totalPraias}</div>
                <p className="text-xs opacity-90">Praias monitoradas</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Praias Próprias</CardTitle>
            <MapPin className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Carregando...</span>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold" style={{ color: '#4CAF50' }}>{praiasPropriaCount}</div>
                <p className="text-xs text-muted-foreground">{percentualProprias}% do total</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Impróprias</CardTitle>
            <TrendingUp className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Carregando...</span>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold" style={{ color: '#f44336' }}>{praiasImpropriaCount}</div>
                <p className="text-xs text-muted-foreground">{percentualImproprias}% do total</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Atualizações</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Date().toLocaleDateString('pt-BR')}
            </div>
            <p className="text-xs text-muted-foreground">Última atualização</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link to="/admin/mapa">
              <Button className="w-full h-20 flex flex-col gap-2 bg-gradient-ocean hover:opacity-90 transition-all duration-300">
                <MapPin className="h-6 w-6" />
                <span>Abrir Mapa</span>
              </Button>
            </Link>
            <Link to="/admin/mapa">
              <Button 
                variant="outline" 
                className="w-full h-20 flex flex-col gap-2 border-primary/20 hover:bg-accent/50 transition-all duration-300"
              >
                <Waves className="h-6 w-6" />
                <span>Cadastrar Praia</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Praias Recentes */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Praias Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="text-center py-8 text-destructive">{error}</div>
          ) : (
            <div className="space-y-4">
              {praias.slice(0, 5).map((praia, i) => {
                const isPropria = praia.status.toLowerCase().includes('propr');
                return (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: isPropria ? '#4CAF50' : '#f44336' }}
                      ></div>
                      <div>
                        <p className="font-medium">{praia.nome}</p>
                        <p className="text-sm text-muted-foreground">
                          {isPropria ? 'Própria' : 'Imprópria'} para banho
                        </p>
                      </div>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {praia.ultimaAtualizacao 
                        ? new Date(praia.ultimaAtualizacao).toLocaleDateString('pt-BR') 
                        : 'Data não disponível'}
                    </span>
                  </div>
                );
              })}
              {praias.length === 0 && (
                <div className="text-center py-4 text-muted-foreground">
                  Nenhuma praia cadastrada
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};