import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Waves, Settings, BarChart3, MapPin } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/20 to-primary-glow/10">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="mb-16">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-gradient-ocean rounded-full shadow-ocean">
                <Waves className="h-16 w-16 text-primary-foreground" />
              </div>
            </div>
            <h1 className="text-5xl font-bold text-foreground mb-6">
              Sistema de Balneabilidade
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Cadastre e monitore praias diretamente no mapa interativo. 
              Sistema completo de geolocalização para gestão de balneabilidade.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/admin">
                <Button 
                  size="lg" 
                  className="bg-gradient-ocean hover:opacity-90 transition-all duration-300 text-lg px-8 py-6 shadow-ocean"
                >
                  <Settings className="mr-2 h-5 w-5" />
                  Painel Administrativo
                </Button>
              </Link>
              <Button 
                variant="outline" 
                size="lg" 
                className="text-lg px-8 py-6 border-primary/20 hover:bg-accent/50 transition-all duration-300"
              >
                <BarChart3 className="mr-2 h-5 w-5" />
                Ver Relatórios
              </Button>
            </div>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <div className="p-6 bg-card rounded-xl shadow-card border border-border">
              <div className="p-3 bg-primary/10 rounded-full w-fit mx-auto mb-4">
                <MapPin className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Mapa Interativo</h3>
              <p className="text-muted-foreground">
                Cadastre praias clicando diretamente no mapa. Visualize todas as praias com marcadores coloridos.
              </p>
            </div>

            <div className="p-6 bg-card rounded-xl shadow-card border border-border">
              <div className="p-3 bg-primary/10 rounded-full w-fit mx-auto mb-4">
                <Waves className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Geolocalização</h3>
              <p className="text-muted-foreground">
                Coordenadas precisas capturadas automaticamente ao clicar no mapa. Geocodificação reversa incluída.
              </p>
            </div>

            <div className="p-6 bg-card rounded-xl shadow-card border border-border">
              <div className="p-3 bg-primary/10 rounded-full w-fit mx-auto mb-4">
                <BarChart3 className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Status Visual</h3>
              <p className="text-muted-foreground">
                Praias próprias em verde, impróprias em vermelho. Popups informativos em cada marcador.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
