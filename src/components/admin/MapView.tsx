import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Praia } from '@/types/praia';
import { PraiaService } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MapPin, Settings, X } from 'lucide-react';

interface MapboxToken {
  token: string;
}

export const MapView = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [praias, setPraias] = useState<Praia[]>([]);
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const [showTokenInput, setShowTokenInput] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState<{
    lng: number;
    lat: number;
  } | null>(null);
  const [isCreatingPraia, setIsCreatingPraia] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    localizacao: '',
    status: 'propria' as const,
    observacoes: '',
  });
  const { toast } = useToast();
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const tempMarkerRef = useRef<mapboxgl.Marker | null>(null);

  useEffect(() => {
    loadPraias();
  }, []);

  const loadPraias = async () => {
    try {
      const data = await PraiaService.listarPraias();
      setPraias(data);
    } catch (error) {
      console.error('Erro ao carregar praias:', error);
    }
  };

  const initializeMap = () => {
    if (!mapContainer.current || !mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [-38.5267, -3.7319], // Coordenadas de Fortaleza
      zoom: 10,
    });

    // Adicionar controles de navegação
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Evento de clique no mapa
    map.current.on('click', (e) => {
      if (isCreatingPraia) return;
      
      const { lng, lat } = e.lngLat;
      setSelectedLocation({ lng, lat });
      setIsCreatingPraia(true);
      
      // Remover marcador temporário anterior
      if (tempMarkerRef.current) {
        tempMarkerRef.current.remove();
      }
      
      // Adicionar marcador temporário
      tempMarkerRef.current = new mapboxgl.Marker({ color: '#22d3ee' })
        .setLngLat([lng, lat])
        .addTo(map.current!);
      
      // Reverter geocodificação simples para obter nome da localização
      fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxToken}`)
        .then(response => response.json())
        .then(data => {
          const place = data.features[0];
          if (place) {
            setFormData(prev => ({
              ...prev,
              localizacao: place.place_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
            }));
          }
        })
        .catch(() => {
          setFormData(prev => ({
            ...prev,
            localizacao: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
          }));
        });
    });

    setShowTokenInput(false);
  };

  const addPraiaMarkers = () => {
    if (!map.current) return;

    // Limpar marcadores existentes
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Adicionar marcadores para cada praia
    praias.forEach(praia => {
      if (praia.coordenadas) {
        const markerColor = praia.status === 'propria' ? '#10b981' : '#ef4444';
        
        const marker = new mapboxgl.Marker({ color: markerColor })
          .setLngLat([praia.coordenadas.longitude, praia.coordenadas.latitude])
          .setPopup(
            new mapboxgl.Popup({ offset: 25 }).setHTML(`
              <div class="p-2">
                <h3 class="font-semibold">${praia.nome}</h3>
                <p class="text-sm text-gray-600">${praia.localizacao}</p>
                <p class="text-sm">
                  <span class="inline-block w-2 h-2 rounded-full mr-1" style="background-color: ${markerColor}"></span>
                  ${praia.status === 'propria' ? 'Própria' : 'Imprópria'}
                </p>
              </div>
            `)
          )
          .addTo(map.current!);
        
        markersRef.current.push(marker);
      }
    });
  };

  useEffect(() => {
    if (map.current && praias.length > 0) {
      addPraiaMarkers();
    }
  }, [praias]);

  const handleSubmitPraia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLocation) return;

    try {
      const newPraia = {
        ...formData,
        coordenadas: {
          latitude: selectedLocation.lat,
          longitude: selectedLocation.lng,
        },
        ultimaAtualizacao: new Date().toISOString(),
      };

      const created = await PraiaService.criarPraia(newPraia);
      setPraias([created, ...praias]);
      
      // Resetar form
      setFormData({
        nome: '',
        localizacao: '',
        status: 'propria',
        observacoes: '',
      });
      setSelectedLocation(null);
      setIsCreatingPraia(false);
      
      // Remover marcador temporário
      if (tempMarkerRef.current) {
        tempMarkerRef.current.remove();
        tempMarkerRef.current = null;
      }

      toast({
        title: "Praia cadastrada!",
        description: "A nova praia foi adicionada ao mapa.",
      });
    } catch (error) {
      toast({
        title: "Erro ao cadastrar praia",
        description: "Não foi possível salvar a praia.",
        variant: "destructive",
      });
    }
  };

  const cancelCreation = () => {
    setIsCreatingPraia(false);
    setSelectedLocation(null);
    setFormData({
      nome: '',
      localizacao: '',
      status: 'propria',
      observacoes: '',
    });
    
    if (tempMarkerRef.current) {
      tempMarkerRef.current.remove();
      tempMarkerRef.current = null;
    }
  };

  if (showTokenInput) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center mb-6">
              <MapPin className="h-12 w-12 text-primary mx-auto mb-2" />
              <h2 className="text-xl font-semibold">Configure o Mapbox</h2>
              <p className="text-sm text-muted-foreground mt-2">
                Para usar o mapa, você precisa de um token público do Mapbox.
                <br />
                <a 
                  href="https://mapbox.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Obtenha seu token aqui
                </a>
              </p>
            </div>
            <div className="space-y-4">
              <Input
                type="password"
                placeholder="Cole seu token público do Mapbox"
                value={mapboxToken}
                onChange={(e) => setMapboxToken(e.target.value)}
              />
              <Button 
                onClick={initializeMap}
                disabled={!mapboxToken.trim()}
                className="w-full"
              >
                Inicializar Mapa
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Mapa de Praias</h1>
            <p className="text-muted-foreground">
              Clique no mapa para cadastrar novas praias - Verde: Própria | Vermelho: Imprópria
            </p>
          </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 bg-success rounded-full"></div>
            <span>Própria</span>
            <div className="w-3 h-3 bg-destructive rounded-full"></div>
            <span>Imprópria</span>
          </div>
          <Badge variant="outline">
            {praias.length} praias cadastradas
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Mapa */}
        <div className="lg:col-span-3">
          <Card className="shadow-ocean">
            <CardContent className="p-0">
              <div 
                ref={mapContainer} 
                className="w-full h-[600px] rounded-lg"
                style={{ minHeight: '600px' }}
              />
            </CardContent>
          </Card>
        </div>

        {/* Formulário de cadastro */}
        <div className="lg:col-span-1">
          {isCreatingPraia && selectedLocation ? (
            <Card className="shadow-card">
              <CardContent className="pt-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold">Nova Praia</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={cancelCreation}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                <form onSubmit={handleSubmitPraia} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Nome da Praia</label>
                    <Input
                      value={formData.nome}
                      onChange={(e) => setFormData({...formData, nome: e.target.value})}
                      placeholder="Ex: Praia de Iracema"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Localização</label>
                    <Input
                      value={formData.localizacao}
                      onChange={(e) => setFormData({...formData, localizacao: e.target.value})}
                      placeholder="Localização detectada"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                      className="w-full p-2 border border-border rounded-md bg-background"
                    >
                      <option value="propria">Própria</option>
                      <option value="impropria">Imprópria</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Observações</label>
                    <textarea
                      value={formData.observacoes}
                      onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
                      placeholder="Observações opcionais"
                      className="w-full p-2 border border-border rounded-md bg-background resize-none"
                      rows={3}
                    />
                  </div>
                  
                  <div className="text-xs text-muted-foreground">
                    <strong>Coordenadas:</strong><br />
                    Lat: {selectedLocation.lat.toFixed(6)}<br />
                    Lng: {selectedLocation.lng.toFixed(6)}
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-ocean hover:opacity-90"
                  >
                    Cadastrar Praia
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : (
            <Card className="shadow-card">
              <CardContent className="pt-6">
                <div className="text-center">
                  <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Cadastrar Nova Praia</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Clique em qualquer ponto do mapa para cadastrar uma nova praia
                  </p>
                  <div className="space-y-2 text-xs text-muted-foreground">
                    <p>• Praias próprias: marcador verde</p>
                    <p>• Praias impróprias: marcador vermelho</p>
                    <p>• Clique nos marcadores para ver detalhes</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};