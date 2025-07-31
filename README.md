# WhatsApp Business - Relatório de Custos

Dashboard profissional para análise de custos e métricas do WhatsApp Business com funcionalidades dinâmicas de importação de dados e configuração financeira.

## 🚀 Funcionalidades

### ✅ **Dashboard Dinâmico**
- Métricas em tempo real (mensagens entregues, lidas, custos)
- Breakdown completo de custos (USD → BRL → IOF → NF)
- Gráficos interativos de tendências e distribuição
- Filtros e análises personalizáveis

### ✅ **Importação de Dados**
- **Upload de CSV** com dados das mensagens
- Formato flexível (aceita diferentes formatos de data)
- Validação automática de dados
- Feedback visual durante importação

### ✅ **Configurações Financeiras**
- **Cotação do Dólar**: Configurável
- **Taxa IOF**: Editável (padrão 3,5%)
- **Taxa Nota Fiscal**: Editável (padrão 16%)
- **Custo base**: Por mensagem em USD
- Recálculo automático em tempo real

### ✅ **Exportação PDF**
- Relatório profissional completo
- Captura automática de gráficos
- Breakdown detalhado de custos
- Métricas e tabelas formatadas

### ✅ **Interface Moderna**
- Design responsivo (mobile + desktop)
- Componentes shadcn/ui
- Feedback visual com toast notifications
- Layout limpo e profissional

## 📊 Formato CSV Esperado

```csv
Data,Metrica,Contagem
2025-07-21,Mensagens lidas,4
2025-07-20,Mensagens entregues,2
2025-07-20,Mensagens lidas,13
2025-07-19,Mensagens entregues,1
```

**Formatos aceitos:**
- Data: `YYYY-MM-DD` ou `DD/MM/YYYY`
- Colunas: Data/Date, Métrica/Metric, Contagem/Count (flexível)

## 🛠️ Tecnologias Utilizadas

- **React 18** + TypeScript
- **Tailwind CSS v4** + shadcn/ui
- **Recharts** para gráficos
- **jsPDF + html2canvas** para exportação
- **Sonner** para notificações
- **Lucide React** para ícones

## 📁 Estrutura do Projeto

```
├── App.tsx                              # Componente principal
├── components/
│   ├── WhatsAppReportDashboard.tsx      # Dashboard principal
│   ├── FinancialSettings.tsx            # Configurações financeiras
│   ├── hooks/
│   │   ├── useDataManager.tsx           # Gerenciamento de dados
│   │   └── usePDFExport.tsx            # Exportação PDF
│   └── ui/                             # Componentes shadcn/ui
├── styles/
│   └── globals.css                     # Estilos globais Tailwind v4
└── README.md
```

## 🔧 Como Usar

### 1. **Importar Dados**
- Clique em "Importar CSV"
- Selecione arquivo com formato esperado
- Dados serão validados e importados automaticamente

### 2. **Configurar Parâmetros**
- Clique em "Configurações Financeiras"
- Ajuste cotação do dólar, IOF e NF
- Valores são recalculados automaticamente

### 3. **Gerar Relatório**
- Clique em "Exportar Relatório"
- PDF será gerado com todas as métricas
- Inclui gráficos e breakdown de custos

### 4. **Resetar Dados**
- Use "Resetar Dados" para voltar aos valores padrão
- Útil para testes ou nova análise

## 💰 Cálculo de Custos

O sistema calcula os custos seguindo esta sequência:

1. **Custo Base**: Mensagens entregues × Custo por mensagem (USD)
2. **Conversão**: Custo USD × Cotação do dólar
3. **IOF**: Valor em reais × (1 + Taxa IOF/100)
4. **Valor Final**: Valor com IOF × (1 + Taxa NF/100)

## 🎯 Próximos Passos Sugeridos

- [ ] **Integração com API**: Conectar direto com WhatsApp Business API
- [ ] **Banco de Dados**: Histórico de dados com Supabase
- [ ] **Filtros Avançados**: Por período, tipo de mensagem, campanhas
- [ ] **Alertas**: Notificações para variações de custo
- [ ] **Múltiplas Contas**: Suporte a várias contas WhatsApp Business

## 📄 Licença

Este projeto é open source e está disponível sob a licença MIT.

---

**Desenvolvido com ❤️ usando Figma Make**