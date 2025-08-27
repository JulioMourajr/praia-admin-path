import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { PraiaService } from "@/services/api";
import { Praia } from "@/types/praia";
import { PraiaForm } from "./PraiaForm";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  MapPin,
  Calendar,
  Filter,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const PraiasManagement = () => {
  const [praias, setPraias] = useState<Praia[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPraia, setEditingPraia] = useState<Praia | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadPraias();
  }, []);

  const loadPraias = async () => {
    try {
      setLoading(true);
      const data = await PraiaService.listarPraias();
      setPraias(data);
    } catch (error) {
      toast({
        title: "Erro ao carregar praias",
        description: "Não foi possível carregar a lista de praias.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const success = await PraiaService.deletarPraia(id);
      if (success) {
        setPraias(praias.filter((praia) => praia.id !== id));
        toast({
          title: "Praia deletada",
          description: "A praia foi removida com sucesso.",
        });
      } else {
        throw new Error("Falha ao deletar");
      }
    } catch (error) {
      toast({
        title: "Erro ao deletar praia",
        description: "Não foi possível deletar a praia.",
        variant: "destructive",
      });
    }
  };

  const handleFormSubmit = async (data: Omit<Praia, 'id'>) => {
    try {
      if (editingPraia) {
        const updated = await PraiaService.atualizarPraia(editingPraia.id, data);
        setPraias(praias.map((p) => (p.id === editingPraia.id ? updated : p)));
        toast({
          title: "Praia atualizada",
          description: "Os dados da praia foram atualizados com sucesso.",
        });
      } else {
        const created = await PraiaService.criarPraia(data);
        setPraias([created, ...praias]);
        toast({
          title: "Praia criada",
          description: "A nova praia foi adicionada com sucesso.",
        });
      }
      setIsFormOpen(false);
      setEditingPraia(null);
    } catch (error) {
      toast({
        title: "Erro ao salvar praia",
        description: "Não foi possível salvar os dados da praia.",
        variant: "destructive",
      });
    }
  };

  const filteredPraias = praias.filter((praia) => {
    const matchesSearch = praia.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         praia.localizacao.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || praia.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeVariant = (status: string) => {
    return status === "propria" ? "default" : "destructive";
  };

  const getStatusLabel = (status: string) => {
    return status === "propria" ? "Própria" : "Imprópria";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gerenciar Praias</h1>
          <p className="text-muted-foreground mt-1">
            Adicione, edite e monitore as praias cadastradas
          </p>
        </div>
        
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-ocean hover:opacity-90 transition-all duration-300">
              <Plus className="mr-2 h-4 w-4" />
              Nova Praia
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingPraia ? "Editar Praia" : "Nova Praia"}
              </DialogTitle>
            </DialogHeader>
            <PraiaForm
              initialData={editingPraia}
              onSubmit={handleFormSubmit}
              onCancel={() => {
                setIsFormOpen(false);
                setEditingPraia(null);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card className="shadow-card">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar praias..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="propria">Própria</SelectItem>
                <SelectItem value="impropria">Imprópria</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Praias List */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Praias Cadastradas ({filteredPraias.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredPraias.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== "all" 
                  ? "Nenhuma praia encontrada com os filtros aplicados." 
                  : "Nenhuma praia cadastrada ainda."}
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredPraias.map((praia) => (
                <div
                  key={praia.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{praia.nome}</h3>
                      <Badge variant={getStatusBadgeVariant(praia.status)}>
                        {getStatusLabel(praia.status)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {praia.localizacao}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(praia.ultimaAtualizacao).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingPraia(praia);
                        setIsFormOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja deletar a praia "{praia.nome}"?
                            Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(praia.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Deletar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};