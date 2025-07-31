import { useCallback } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface DailyMetric {
  date: string;
  metric: string;
  count: number;
}

interface CostBreakdown {
  messagesDelivered: number;
  costUSD: number;
  dollarRate: number;
  costBRL: number;
  iofRate: number;
  costWithIOF: number;
  nfRate: number;
  finalCost: number;
}

interface ReportData {
  costBreakdown: CostBreakdown;
  totalDelivered: number;
  totalRead: number;
  readRate: number;
  avgCostPerMessage: number;
  dailyMetrics: DailyMetric[];
}

export function usePDFExport() {
  const exportToPDF = useCallback(async (data: ReportData) => {
    try {
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let yPosition = 20;

      const formatCurrency = (
        value: number,
        currency: "BRL" | "USD" = "BRL",
      ) => {
        if (currency === "USD") {
          return `US$ ${value.toFixed(2)}`;
        }
        return value.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        });
      };

      // Título do relatório
      pdf.setFontSize(20);
      pdf.setFont("helvetica", "bold");
      pdf.text(
        "Relatório de Custos - WhatsApp Business",
        pageWidth / 2,
        yPosition,
        { align: "center" },
      );

      yPosition += 10;
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "normal");
      pdf.text(
        `Gerado em: ${new Date().toLocaleString("pt-BR")}`,
        pageWidth / 2,
        yPosition,
        { align: "center" },
      );

      yPosition += 20;

      // Resumo Executivo
      pdf.setFontSize(16);
      pdf.setFont("helvetica", "bold");
      pdf.text("Resumo Executivo", 20, yPosition);
      yPosition += 15;

      // Métricas principais em caixas
      const metricsData = [
        {
          label: "Mensagens Entregues",
          value: data.totalDelivered.toLocaleString(),
        },
        {
          label: "Mensagens Lidas",
          value: data.totalRead.toString(),
        },
        {
          label: "Taxa de Leitura",
          value: `${data.readRate.toFixed(3)}%`,
        },
        {
          label: "Valor Final",
          value: formatCurrency(data.costBreakdown.finalCost),
        },
        {
          label: "Custo por Mensagem",
          value: formatCurrency(data.avgCostPerMessage),
        },
      ];

      // Desenhar caixas de métricas (2 por linha)
      const boxWidth = (pageWidth - 60) / 2;
      const boxHeight = 25;
      let boxX = 20;
      let boxY = yPosition;

      metricsData.forEach((metric, index) => {
        if (index > 0 && index % 2 === 0) {
          boxY += boxHeight + 10;
          boxX = 20;
        } else if (index % 2 === 1) {
          boxX = 20 + boxWidth + 20;
        }

        // Desenhar caixa
        pdf.setDrawColor(200, 200, 200);
        pdf.setFillColor(250, 250, 250);
        pdf.roundedRect(
          boxX,
          boxY,
          boxWidth,
          boxHeight,
          2,
          2,
          "FD",
        );

        // Texto da métrica
        pdf.setFontSize(10);
        pdf.setFont("helvetica", "normal");
        pdf.text(metric.label, boxX + 5, boxY + 8);

        pdf.setFontSize(14);
        pdf.setFont("helvetica", "bold");
        pdf.text(metric.value, boxX + 5, boxY + 18);

        if (index % 2 === 0) boxX = 20;
      });

      yPosition = boxY + boxHeight + 25;

      // Breakdown de Custos
      pdf.setFontSize(16);
      pdf.setFont("helvetica", "bold");
      pdf.text("Breakdown de Custos", 20, yPosition);
      yPosition += 15;

      const costData = [
        {
          label: "Custo Base (USD)",
          value: formatCurrency(
            data.costBreakdown.costUSD,
            "USD",
          ),
          detail: `${data.costBreakdown.messagesDelivered.toLocaleString()} × US$ 0,01`,
        },
        {
          label: "Valor em Reais",
          value: formatCurrency(data.costBreakdown.costBRL),
          detail: `Cotação: ${formatCurrency(data.costBreakdown.dollarRate)}`,
        },
        {
          label: `Com IOF (${data.costBreakdown.iofRate}%)`,
          value: formatCurrency(data.costBreakdown.costWithIOF),
          detail: `+ ${formatCurrency(data.costBreakdown.costWithIOF - data.costBreakdown.costBRL)}`,
        },
        {
          label: `Final + NF (${data.costBreakdown.nfRate}%)`,
          value: formatCurrency(data.costBreakdown.finalCost),
          detail: `+ ${formatCurrency(data.costBreakdown.finalCost - data.costBreakdown.costWithIOF)}`,
        },
      ];

      costData.forEach((cost, index) => {
        const costBoxY = yPosition + index * 20;

        pdf.setFontSize(11);
        pdf.setFont("helvetica", "normal");
        pdf.text(cost.label, 25, costBoxY);

        pdf.setFont("helvetica", "bold");
        pdf.text(cost.value, 100, costBoxY);

        pdf.setFontSize(9);
        pdf.setFont("helvetica", "normal");
        pdf.text(cost.detail, 25, costBoxY + 5);
      });

      yPosition += costData.length * 20 + 15;

      // Capturar gráficos
      try {
        const chartsContainer = document.querySelector(
          "[data-charts-container]",
        ) as HTMLElement;
        if (chartsContainer) {
          const canvas = await html2canvas(chartsContainer, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: "#ffffff",
          });

          const imgData = canvas.toDataURL("image/png");
          const imgWidth = pageWidth - 40;
          const imgHeight =
            (canvas.height * imgWidth) / canvas.width;

          // Verificar se precisa de nova página
          if (yPosition + imgHeight > pageHeight - 20) {
            pdf.addPage();
            yPosition = 20;
          }

          pdf.addImage(
            imgData,
            "PNG",
            20,
            yPosition,
            imgWidth,
            imgHeight,
          );
          yPosition += imgHeight + 20;
        }
      } catch (error) {
        console.warn("Erro ao capturar gráficos:", error);
      }

      // Nova página para tabela de métricas diárias
      pdf.addPage();
      yPosition = 20;

      // Título da tabela
      pdf.setFontSize(16);
      pdf.setFont("helvetica", "bold");
      pdf.text("Métricas Diárias", 20, yPosition);
      yPosition += 15;

      // Cabeçalho da tabela
      const tableHeaders = [
        "Data",
        "Métrica",
        "Contagem",
        "Custo Est.",
      ];
      const colWidths = [40, 60, 30, 35];
      let currentX = 20;

      pdf.setFillColor(240, 240, 240);
      pdf.rect(20, yPosition, pageWidth - 40, 8, "F");

      pdf.setFontSize(10);
      pdf.setFont("helvetica", "bold");
      tableHeaders.forEach((header, index) => {
        pdf.text(header, currentX + 2, yPosition + 6);
        currentX += colWidths[index];
      });

      yPosition += 12;

      // Dados da tabela
      pdf.setFont("helvetica", "normal");
      data.dailyMetrics.forEach((metric, index) => {
        if (yPosition > pageHeight - 20) {
          pdf.addPage();
          yPosition = 20;
        }

        currentX = 20;
        const rowData = [
          new Date(metric.date).toLocaleDateString("pt-BR"),
          metric.metric,
          metric.count.toString(),
          metric.metric.includes("entregues")
            ? formatCurrency(
                metric.count * data.avgCostPerMessage,
              )
            : "-",
        ];

        // Alternar cor de fundo das linhas
        if (index % 2 === 0) {
          pdf.setFillColor(250, 250, 250);
          pdf.rect(20, yPosition - 2, pageWidth - 40, 8, "F");
        }

        rowData.forEach((dataText, colIndex) => {
          const maxWidth = colWidths[colIndex] - 4;
          const truncatedText =
            pdf.getTextDimensions(dataText).w > maxWidth
              ? dataText.substring(
                  0,
                  Math.floor(
                    (dataText.length * maxWidth) /
                      pdf.getTextDimensions(dataText).w,
                  ),
                ) + "..."
              : dataText;

          pdf.text(truncatedText, currentX + 2, yPosition + 4);
          currentX += colWidths[colIndex];
        });

        yPosition += 8;
      });

      // Resumo final
      yPosition += 15;
      pdf.setFillColor(240, 240, 240);
      pdf.rect(20, yPosition, pageWidth - 40, 25, "F");

      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.text("Resumo Final", 25, yPosition + 8);

      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      pdf.text(
        `Total de mensagens entregues: ${data.totalDelivered.toLocaleString()}`,
        25,
        yPosition + 15,
      );
      pdf.text(
        `Valor final: ${formatCurrency(data.costBreakdown.finalCost)}`,
        25,
        yPosition + 20,
      );

      // Rodapé
      const totalPages = pdf.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setFont("helvetica", "normal");
        pdf.text(
          `Página ${i} de ${totalPages} - WhatsApp Business Report`,
          pageWidth / 2,
          pageHeight - 10,
          { align: "center" },
        );
      }

      // Download do PDF
      const fileName = `relatorio-whatsapp-${new Date().toISOString().split("T")[0]}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      throw new Error("Erro ao gerar relatório em PDF");
    }
  }, []);

  return { exportToPDF };
}