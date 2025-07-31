import { useState, useCallback } from 'react';
import { toast } from "sonner@2.0.3";

export interface DailyMetric {
  date: string;
  metric: string;
  count: number;
}

export interface FinancialSettings {
  dollarRate: number;
  iofRate: number;
  nfRate: number;
  baseCostUSD: number; // custo por mensagem em USD
}

export interface CostBreakdown {
  messagesDelivered: number;
  costUSD: number;
  dollarRate: number;
  costBRL: number;
  iofRate: number;
  costWithIOF: number;
  nfRate: number;
  finalCost: number;
}

const defaultSettings: FinancialSettings = {
  dollarRate: 5.56,
  iofRate: 3.5,
  nfRate: 16,
  baseCostUSD: 0.01
};

const defaultMetrics: DailyMetric[] = [
  { date: "2025-07-21", metric: "Mensagens lidas", count: 4 },
  { date: "2025-07-20", metric: "Mensagens entregues", count: 2 },
  { date: "2025-07-20", metric: "Mensagens lidas", count: 13 },
  { date: "2025-07-19", metric: "Mensagens entregues", count: 1 }
];

export function useDataManager() {
  const [dailyMetrics, setDailyMetrics] = useState<DailyMetric[]>(defaultMetrics);
  const [financialSettings, setFinancialSettings] = useState<FinancialSettings>(defaultSettings);
  const [isImporting, setIsImporting] = useState(false);

  // Calcular breakdown de custos baseado nas configurações atuais
  const calculateCostBreakdown = useCallback((): CostBreakdown => {
    const messagesDelivered = dailyMetrics
      .filter(m => m.metric === "Mensagens entregues")
      .reduce((sum, m) => sum + m.count, 0);

    const costUSD = messagesDelivered * financialSettings.baseCostUSD;
    const costBRL = costUSD * financialSettings.dollarRate;
    const costWithIOF = costBRL * (1 + financialSettings.iofRate / 100);
    const finalCost = costWithIOF * (1 + financialSettings.nfRate / 100);

    return {
      messagesDelivered,
      costUSD,
      dollarRate: financialSettings.dollarRate,
      costBRL,
      iofRate: financialSettings.iofRate,
      costWithIOF,
      nfRate: financialSettings.nfRate,
      finalCost
    };
  }, [dailyMetrics, financialSettings]);

  // Importar CSV
  const importCSV = useCallback(async (file: File) => {
    setIsImporting(true);
    
    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        throw new Error('CSV deve conter pelo menos cabeçalho e uma linha de dados');
      }

      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      
      // Verificar se as colunas necessárias existem
      const requiredColumns = ['data', 'metrica', 'contagem'];
      const missingColumns = requiredColumns.filter(col => 
        !headers.some(h => h.includes(col))
      );

      if (missingColumns.length > 0) {
        throw new Error(`Colunas obrigatórias não encontradas: ${missingColumns.join(', ')}`);
      }

      // Encontrar índices das colunas
      const dateIndex = headers.findIndex(h => h.includes('data'));
      const metricIndex = headers.findIndex(h => h.includes('metrica') || h.includes('métrica'));
      const countIndex = headers.findIndex(h => h.includes('contagem'));

      // Processar dados
      const newMetrics: DailyMetric[] = [];
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        
        if (values.length >= 3) {
          const date = values[dateIndex];
          const metric = values[metricIndex];
          const count = parseInt(values[countIndex]);

          if (date && metric && !isNaN(count)) {
            // Normalizar formato da data
            let normalizedDate = date;
            if (date.includes('/')) {
              const [day, month, year] = date.split('/');
              normalizedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
            }

            newMetrics.push({
              date: normalizedDate,
              metric: metric,
              count: count
            });
          }
        }
      }

      if (newMetrics.length === 0) {
        throw new Error('Nenhum dado válido encontrado no CSV');
      }

      setDailyMetrics(newMetrics);
      toast.success(`${newMetrics.length} registros importados com sucesso!`);
      
    } catch (error) {
      console.error('Erro ao importar CSV:', error);
      toast.error(`Erro ao importar CSV: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setIsImporting(false);
    }
  }, []);

  // Atualizar configurações financeiras
  const updateFinancialSettings = useCallback((newSettings: Partial<FinancialSettings>) => {
    setFinancialSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  // Resetar dados para padrão
  const resetToDefault = useCallback(() => {
    setDailyMetrics(defaultMetrics);
    setFinancialSettings(defaultSettings);
    toast.success('Dados resetados para valores padrão');
  }, []);

  return {
    dailyMetrics,
    financialSettings,
    costBreakdown: calculateCostBreakdown(),
    isImporting,
    importCSV,
    updateFinancialSettings,
    resetToDefault
  };
}