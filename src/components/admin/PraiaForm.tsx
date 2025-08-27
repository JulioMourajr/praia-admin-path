import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Praia } from "@/types/praia";

interface PraiaFormProps {
  initialData?: Praia | null;
  onSubmit: (data: Omit<Praia, 'id'>) => void;
  onCancel: () => void;
}

export const PraiaForm = ({ initialData, onSubmit, onCancel }: PraiaFormProps) => {
  const [formData, setFormData] = useState({
    nome: initialData?.nome || "",
    localizacao: initialData?.localizacao || "",
    status: initialData?.status || "propria" as const,
    observacoes: initialData?.observacoes || "",
    coordenadas: {
      latitude: initialData?.coordenadas?.latitude || 0,
      longitude: initialData?.coordenadas?.longitude || 0,
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const dataToSubmit = {
      ...formData,
      ultimaAtualizacao: new Date().toISOString(),
      coordenadas: formData.coordenadas.latitude && formData.coordenadas.longitude 
        ? formData.coordenadas 
        : undefined,
    };
    
    onSubmit(dataToSubmit);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCoordinateChange = (field: 'latitude' | 'longitude', value: string) => {
    const numValue = parseFloat(value) || 0;
    setFormData(prev => ({
      ...prev,
      coordenadas: {
        ...prev.coordenadas,
        [field]: numValue,
      },
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="nome">Nome da Praia *</Label>
        <Input
          id="nome"
          value={formData.nome}
          onChange={(e) => handleInputChange("nome", e.target.value)}
          placeholder="Ex: Praia de Iracema"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="localizacao">Localização *</Label>
        <Input
          id="localizacao"
          value={formData.localizacao}
          onChange={(e) => handleInputChange("localizacao", e.target.value)}
          placeholder="Ex: Fortaleza, CE"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Status da Balneabilidade *</Label>
        <Select
          value={formData.status}
          onValueChange={(value) => handleInputChange("status", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione o status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="propria">Própria</SelectItem>
            <SelectItem value="impropria">Imprópria</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="latitude">Latitude</Label>
          <Input
            id="latitude"
            type="number"
            step="any"
            value={formData.coordenadas.latitude || ""}
            onChange={(e) => handleCoordinateChange("latitude", e.target.value)}
            placeholder="-3.7319"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="longitude">Longitude</Label>
          <Input
            id="longitude"
            type="number"
            step="any"
            value={formData.coordenadas.longitude || ""}
            onChange={(e) => handleCoordinateChange("longitude", e.target.value)}
            placeholder="-38.5267"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="observacoes">Observações</Label>
        <Textarea
          id="observacoes"
          value={formData.observacoes}
          onChange={(e) => handleInputChange("observacoes", e.target.value)}
          placeholder="Observações adicionais sobre a praia..."
          rows={3}
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button 
          type="submit" 
          className="bg-gradient-ocean hover:opacity-90 transition-all duration-300"
        >
          {initialData ? "Atualizar" : "Criar"} Praia
        </Button>
      </div>
    </form>
  );
};