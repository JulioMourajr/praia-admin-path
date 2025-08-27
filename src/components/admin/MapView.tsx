import React, { useEffect, useRef, useState } from 'react';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import OSM from 'ol/source/OSM';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { Style, Fill, Stroke, Circle } from 'ol/style';
import { fromLonLat, toLonLat } from 'ol/proj';
import { Praia } from '@/types/praia';
import { PraiaService } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MapPin, X } from 'lucide-react';

export const MapView = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const vectorSourceRef = useRef<VectorSource>(new VectorSource());
  const [praias, setPraias] = useState<Praia[]>([]);
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

  useEffect(() => {
    loadPraias();
    initializeMap();
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
    if (!mapContainer.current) return;

    // Estilos para pontos próprios e impróprios
    const styles = {
      propria: new Style({
        image: new Circle({
          fill: new Fill({ color: '#4CAF50' }), // Verde do Material Design
          stroke: new Stroke({ color: '#388E3C', width: 2 }), // Verde mais escuro para a borda
          radius: 8
        })
      }),
      impropria: new Style({
        image: new Circle({
          fill: new Fill({ color: '#f44336' }), // Vermelho do Material Design
          stroke: new Stroke({ color: '#d32f2f', width: 2 }), // Vermelho mais escuro para a borda
          radius: 8
        })
      }),
      temp: new Style({
        image: new Circle({
          fill: new Fill({ color: '#22d3ee' }),
          stroke: new Stroke({ color: '#0891b2', width: 2 }),
          radius: 10
        })
      })
    };

    // Layer para os pontos de praia
    const vectorLayer = new VectorLayer({
      source: vectorSourceRef.current,
      style: function(feature) {
        const status = feature.get('status');
        // Normaliza o status para lidar com as diferentes variações (proprio, propria, improprio, impropria, imroprio)
        if (typeof status === 'string') {
          // Versão simplificada que apenas verifica se contém "propr" no início
          const statusLowerCase = status.toLowerCase();
          if (statusLowerCase.startsWith('propr') || statusLowerCase === 'proprio' || statusLowerCase === 'propria') {
            return styles.propria;
          } else if (statusLowerCase.startsWith('impr') || statusLowerCase.startsWith('imr') || 
                    statusLowerCase === 'improprio' || statusLowerCase === 'impropria') {
            return styles.impropria;
          }
        }
        return styles.temp;
      }
    });

    // Criar o mapa
    mapRef.current = new Map({
      target: mapContainer.current,
      layers: [
        new TileLayer({
          source: new OSM()
        }),
        vectorLayer
      ],
      view: new View({
        center: fromLonLat([-35.7350, -9.6659]), // Coordenadas de Maceió
        zoom: 12
      })
    });

    // Adicionar evento para mostrar informações ao clicar nos marcadores
    mapRef.current.on('click', function(evt) {
      const feature = mapRef.current?.forEachFeatureAtPixel(evt.pixel, function(feature) {
        return feature;
      });
      
      if (feature && !feature.get('isTemp') && feature.get('nome')) {
        const nome = feature.get('nome');
        const status = feature.get('status');
        
        // Normaliza o status para exibição
        let statusText = "PRÓPRIA";
        let variant = "success";
        
        if (typeof status === 'string') {
          const statusLowerCase = status.toLowerCase();
          if (statusLowerCase.includes('impr') || statusLowerCase.includes('imr')) {
            statusText = "IMPRÓPRIA";
            variant = "destructive";
          }
        }
        
        toast({
          title: nome,
          description: `Status: ${statusText} para banho`,
          variant: variant as any,
          style: {
            backgroundColor: statusText === "PRÓPRIA" ? '#e8f5e9' : '#ffebee',
            borderColor: statusText === "PRÓPRIA" ? '#4CAF50' : '#f44336',
            color: statusText === "PRÓPRIA" ? '#2e7d32' : '#c62828',
          }
        });
      }
    });

    // Evento de clique no mapa para criar nova praia
    mapRef.current.on('singleclick', (evt) => {
      if (isCreatingPraia) return;
      
      const coordinate = evt.coordinate;
      const [lng, lat] = toLonLat(coordinate);
      
      setSelectedLocation({ lng, lat });
      setIsCreatingPraia(true);
      
      // Remover feature temporário anterior
      const features = vectorSourceRef.current.getFeatures();
      const tempFeatures = features.filter(f => f.get('isTemp'));
      tempFeatures.forEach(f => vectorSourceRef.current.removeFeature(f));
      
      // Adicionar marcador temporário
      const tempFeature = new Feature({
        geometry: new Point(coordinate),
        status: 'temp',
        isTemp: true
      });
      tempFeature.setStyle(styles.temp);
      vectorSourceRef.current.addFeature(tempFeature);
      
      // Definir localização simples
      setFormData(prev => ({
        ...prev,
        localizacao: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
      }));
    });
  };

  const addPraiaMarkers = () => {
    if (!mapRef.current) return;

    // Limpar features existentes (exceto temporários)
    const features = vectorSourceRef.current.getFeatures();
    const nonTempFeatures = features.filter(f => !f.get('isTemp'));
    nonTempFeatures.forEach(f => vectorSourceRef.current.removeFeature(f));

    // Adicionar marcadores para cada praia
    praias.forEach(praia => {
      if (praia.coordenadas) {
        let coordinate;
        if (Array.isArray(praia.coordenadas)) {
          // Se for array [longitude, latitude]
          coordinate = fromLonLat([praia.coordenadas[0], praia.coordenadas[1]]);
        } else {
          // Se for objeto {latitude, longitude}
          coordinate = fromLonLat([praia.coordenadas.longitude, praia.coordenadas.latitude]);
        }
        
        const feature = new Feature({
          geometry: new Point(coordinate),
          status: praia.status, // Usamos o status original da API
          nome: praia.nome,
          praia: praia,
          isTemp: false
        });
        
        vectorSourceRef.current.addFeature(feature);
      }
    });
  };

  useEffect(() => {
    if (mapRef.current && praias.length >= 0) {
      addPraiaMarkers();
    }
  }, [praias]);

  const handleSubmitPraia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLocation) return;

    try {
      const newPraia = {
        ...formData,
        coordenadas: [selectedLocation.lng, selectedLocation.lat], // Envia como array [longitude, latitude]
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
      const features = vectorSourceRef.current.getFeatures();
      const tempFeatures = features.filter(f => f.get('isTemp'));
      tempFeatures.forEach(f => vectorSourceRef.current.removeFeature(f));

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
    
    // Remover marcador temporário
    const features = vectorSourceRef.current.getFeatures();
    const tempFeatures = features.filter(f => f.get('isTemp'));
    tempFeatures.forEach(f => vectorSourceRef.current.removeFeature(f));
  };


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
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#4CAF50' }}></div>
            <span>Própria</span>
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#f44336' }}></div>
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
                      placeholder="Ex: Praia de Jatiúca"
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