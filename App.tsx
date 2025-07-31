import { WhatsAppReportDashboard } from "./components/WhatsAppReportDashboard";
import { Toaster } from "./components/ui/sonner";

export default function App() {
  return (
    <div className="min-h-screen bg-background">
      <WhatsAppReportDashboard />
      <Toaster />
    </div>
  );
}