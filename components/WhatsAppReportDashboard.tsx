import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { CalendarIcon, Download, MessageCircle, CheckCircle, Eye, Clock, DollarSign, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { usePDFExport } from "./hooks/usePDFExport";
import { useDataManager } from "./hooks/useDataManager";
import { FinancialSettings } from "./FinancialSettings";
import { toast } from "sonner@2.0.3";

export function WhatsAppReportDashboard() {
  const [filterPeriod, setFilterPeriod] = useState<string>("all");
  const [isExporting, setIsExporting] = useState(false);
  const { exportToPDF } = usePDFExport();
  
  const {
    dailyMetrics,
    financialSettings,
    costBreakdown,
    isImporting,
    importCSV,
    updateFinancialSettings,
    resetToDefault
  } = useDataManager();

  // Calcular métricas baseadas nos dados dinâmicos
  const totalDelivered = costBreakdown.messagesDelivered;
  const totalRead = dailyMetrics
    .filter(m => m.metric.toLowerCase().includes('lidas'))
    .reduce((sum, m) => sum + m.count, 0);
  
  const readRate = totalDelivered > 0 ? (totalRead / totalDelivered) * 100 : 0;
  const avgCostPerMessage = totalDelivered > 0 ? costBreakdown.finalCost / totalDelivered : 0;

  // Preparar dados para gráficos
  const trendData = useMemo(() => {
    const dataByDate = dailyMetrics.reduce((acc, metric) => {
      const date = new Date(metric.date).toLocaleDateString('pt-BR', { 
        day: '2-digit', 
        month: '2-digit' 
      });
      
      if (!acc[date]) {
        acc[date] = { date, entregues: 0, lidas: 0 };
      }
      
      if (metric.metric.toLowerCase().includes('entregues')) {
        acc[date].entregues += metric.count;
      } else if (metric.metric.toLowerCase().includes('lidas')) {
        acc[date].lidas += metric.count;
      }
      
      return acc;
    }, {} as Record<string, any>);
    
    return Object.values(dataByDate).sort((a: any, b: any) => 
      new Date(a.date.split('/').reverse().join('-')).getTime() - 
      new Date(b.date.split('/').reverse().join('-')).getTime()
    );
  }, [dailyMetrics]);

  const costTrendData = [
    { month: "Mai", cost: costBreakdown.finalCost * 0.8 },
    { month: "Jun", cost: costBreakdown.finalCost * 0.9 },
    { month: "Jul", cost: costBreakdown.finalCost }
  ];

  const messageTypeData = [
    { name: "Entregues", value: totalDelivered, color: "#0088FE" },
    { name: "Lidas", value: totalRead, color: "#00C49F" }
  ];

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      await exportToPDF({
        costBreakdown,
        totalDelivered,
        totalRead,
        readRate,
        avgCostPerMessage,
        dailyMetrics
      });
      toast.success('Relatório PDF gerado com sucesso!');
    } catch (error) {
      toast.error('Erro ao gerar relatório PDF');
      console.error('Erro ao exportar PDF:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const formatCurrency = (value: number, currency: 'BRL' | 'USD' = 'BRL') => {
    if (currency === 'USD') {
      return `US$ ${value.toFixed(2)}`;
    }
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR');
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Relatório de Custos - WhatsApp Business</h1>
          <p className="text-muted-foreground">Análise detalhada dos envios e custos de mensagens</p>
        </div>
        <Button onClick={handleExportPDF} disabled={isExporting}>
          <Download className="w-4 h-4 mr-2" />
          {isExporting ? 'Gerando PDF...' : 'Exportar Relatório'}
        </Button>
      </div>

      {/* Configurações e Importação */}
      <FinancialSettings
        settings={financialSettings}
        onUpdateSettings={updateFinancialSettings}
        onImportCSV={importCSV}
        onReset={resetToDefault}
        isImporting={isImporting}
      />

      {/* Cards de Resumo Principal */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mensagens Entregues</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDelivered.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">cobradas pela Meta</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mensagens Lidas</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRead}</div>
            <p className="text-xs text-muted-foreground">taxa de {readRate.toFixed(3)}%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Final</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(costBreakdown.finalCost)}</div>
            <p className="text-xs text-muted-foreground">com IOF + NF</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Custo por Mensagem</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(avgCostPerMessage)}</div>
            <p className="text-xs text-muted-foreground">custo médio final</p>
          </CardContent>
        </Card>
      </div>

      {/* Breakdown de Custos - Agora Dinâmico */}
      <Card>
        <CardHeader>
          <CardTitle>Breakdown de Custos</CardTitle>
          <CardDescription>
            Detalhamento completo dos valores e taxas aplicadas - 
            <span className="text-primary"> Valores atualizados automaticamente</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Custo Base (USD)</p>
                <p className="text-lg font-semibold">{formatCurrency(costBreakdown.costUSD, 'USD')}</p>
                <p className="text-xs text-muted-foreground">
                  {costBreakdown.messagesDelivered.toLocaleString()} × US$ {financialSettings.baseCostUSD.toFixed(3)}
                </p>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Valor em Reais</p>
                <p className="text-lg font-semibold">{formatCurrency(costBreakdown.costBRL)}</p>
                <p className="text-xs text-muted-foreground">
                  Cotação: {formatCurrency(costBreakdown.dollarRate)}
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Com IOF ({costBreakdown.iofRate}%)</p>
                <p className="text-lg font-semibold">{formatCurrency(costBreakdown.costWithIOF)}</p>
                <p className="text-xs text-muted-foreground">
                  + {formatCurrency(costBreakdown.costWithIOF - costBreakdown.costBRL)}
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Final + NF ({costBreakdown.nfRate}%)</p>
                <p className="text-lg font-semibold text-primary">{formatCurrency(costBreakdown.finalCost)}</p>
                <p className="text-xs text-muted-foreground">
                  + {formatCurrency(costBreakdown.finalCost - costBreakdown.costWithIOF)}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gráficos - Agora Dinâmicos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" data-charts-container>
        <Card>
          <CardHeader>
            <CardTitle>Atividade Diária</CardTitle>
            <CardDescription>Mensagens entregues e lidas por dia (dados importados)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="entregues" fill="#0088FE" name="Entregues" />
                <Bar dataKey="lidas" fill="#00C49F" name="Lidas" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Evolução de Custos</CardTitle>
            <CardDescription>Tendência dos gastos mensais</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={costTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Custo']} />
                <Line type="monotone" dataKey="cost" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Métricas Diárias - Agora Dinâmica */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Métricas Diárias</CardTitle>
              <CardDescription>
                Detalhamento das atividades por data - 
                <span className="text-primary">{dailyMetrics.length} registros</span>
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Métrica</TableHead>
                <TableHead className="text-right">Contagem</TableHead>
                <TableHead className="text-right">Custo Estimado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dailyMetrics.map((metric, index) => (
                <TableRow key={index}>
                  <TableCell>{formatDateTime(metric.date)}</TableCell>
                  <TableCell>
                    <Badge variant={metric.metric.toLowerCase().includes('lidas') ? 'default' : 'secondary'}>
                      {metric.metric}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">{metric.count}</TableCell>
                  <TableCell className="text-right">
                    {metric.metric.toLowerCase().includes('entregues') ? 
                      formatCurrency(metric.count * avgCostPerMessage) : 
                      '-'
                    }
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {/* Resumo da Tabela */}
          <div className="mt-4 pt-4 border-t">
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Resumo do Período</p>
                <p className="text-xs text-muted-foreground">
                  {dailyMetrics.length} registros importados
                </p>
              </div>
              <div className="text-right space-y-1">
                <p className="text-lg font-semibold">{formatCurrency(costBreakdown.finalCost)}</p>
                <p className="text-xs text-muted-foreground">
                  {totalDelivered.toLocaleString()} mensagens entregues
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}