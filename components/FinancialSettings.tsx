import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Upload, Settings, RotateCcw } from "lucide-react";
import { toast } from "sonner@2.0.3";
import type { FinancialSettings as FinancialSettingsType } from "./hooks/useDataManager";

interface FinancialSettingsProps {
  settings: FinancialSettingsType;
  onUpdateSettings: (settings: Partial<FinancialSettingsType>) => void;
  onImportCSV: (file: File) => void;
  onReset: () => void;
  isImporting: boolean;
}

export function FinancialSettings({ 
  settings, 
  onUpdateSettings, 
  onImportCSV, 
  onReset,
  isImporting 
}: FinancialSettingsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [localSettings, setLocalSettings] = useState(settings);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
        toast.error('Por favor, selecione um arquivo CSV válido');
        return;
      }
      onImportCSV(file);
      event.target.value = ''; // Reset input
    }
  };

  const handleSaveSettings = () => {
    // Validar valores
    if (localSettings.dollarRate <= 0) {
      toast.error('Cotação do dólar deve ser maior que zero');
      return;
    }
    if (localSettings.iofRate < 0 || localSettings.iofRate > 100) {
      toast.error('Taxa de IOF deve estar entre 0% e 100%');
      return;
    }
    if (localSettings.nfRate < 0 || localSettings.nfRate > 100) {
      toast.error('Taxa de NF deve estar entre 0% e 100%');
      return;
    }
    if (localSettings.baseCostUSD <= 0) {
      toast.error('Custo base deve ser maior que zero');
      return;
    }

    onUpdateSettings(localSettings);
    setIsOpen(false);
    toast.success('Configurações atualizadas com sucesso!');
  };

  const handleInputChange = (field: keyof FinancialSettingsType, value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      setLocalSettings(prev => ({ ...prev, [field]: numValue }));
    }
  };

  // Atualizar configurações locais quando as configurações globais mudarem
  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configurações e Importação</CardTitle>
        <CardDescription>
          Gerencie dados e parâmetros financeiros do relatório
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-3">
          {/* Botão de Importar CSV */}
          <div className="relative">
            <Button 
              variant="outline" 
              disabled={isImporting}
              className="relative overflow-hidden"
            >
              <Upload className="w-4 h-4 mr-2" />
              {isImporting ? 'Importando...' : 'Importar CSV'}
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={isImporting}
              />
            </Button>
          </div>

          {/* Botão de Configurações */}
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                Configurações Financeiras
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Configurações Financeiras</DialogTitle>
                <DialogDescription>
                  Ajuste os parâmetros para cálculo dos custos
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dollarRate">Cotação do Dólar (R$)</Label>
                    <Input
                      id="dollarRate"
                      type="number"
                      step="0.01"
                      value={localSettings.dollarRate}
                      onChange={(e) => handleInputChange('dollarRate', e.target.value)}
                      placeholder="5.56"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="baseCost">Custo Base (USD)</Label>
                    <Input
                      id="baseCost"
                      type="number"
                      step="0.001"
                      value={localSettings.baseCostUSD}
                      onChange={(e) => handleInputChange('baseCostUSD', e.target.value)}
                      placeholder="0.01"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="iofRate">Taxa IOF (%)</Label>
                    <Input
                      id="iofRate"
                      type="number"
                      step="0.1"
                      value={localSettings.iofRate}
                      onChange={(e) => handleInputChange('iofRate', e.target.value)}
                      placeholder="3.5"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="nfRate">Taxa NF (%)</Label>
                    <Input
                      id="nfRate"
                      type="number"
                      step="0.1"
                      value={localSettings.nfRate}
                      onChange={(e) => handleInputChange('nfRate', e.target.value)}
                      placeholder="16"
                    />
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={() => setIsOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSaveSettings}>
                    Salvar Configurações
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Botão de Reset */}
          <Button variant="outline" onClick={onReset}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Resetar Dados
          </Button>
        </div>

        {/* Informações sobre o formato do CSV */}
        <div className="mt-4 p-3 bg-muted rounded-lg">
          <p className="text-sm font-medium mb-2">Formato esperado do CSV:</p>
          <code className="text-xs block bg-background p-2 rounded border">
            Data,Metrica,Contagem<br />
            2025-07-21,Mensagens lidas,4<br />
            2025-07-20,Mensagens entregues,2<br />
            ...
          </code>
          <p className="text-xs text-muted-foreground mt-2">
            * Aceita formato de data: YYYY-MM-DD ou DD/MM/YYYY<br />
            * Cabeçalhos podem variar (Data/Date, Métrica/Metric, Contagem/Count)
          </p>
        </div>
      </CardContent>
    </Card>
  );
}