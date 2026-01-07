
import React, { useState, useMemo, useRef } from 'react';
import { CACAO_ACTIVITIES } from './constants';
import { SimulationState, StageType, SummaryData, Activity, CostCategory } from './types';
import CostSummary from './components/CostSummary';
import ActivityList from './components/ActivityList';
import StageTimeline from './components/StageTimeline';
import Charts from './components/Charts';
import { Sprout, Settings2, Loader2, ShieldCheck, X, FileText, Info } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

// --- Icono Temático: Fruto de Cacao ---
const CacaoIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8 0-4.41 3.59-8 8-8s8 3.59 8 8-8 8zm-1-13h2v10h-2zm-4 1h2v8H7zm8 0h2v8h-2z" />
  </svg>
);

// --- Componente: PrivacyModal ---
interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PrivacyModal: React.FC<PrivacyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 overflow-y-auto">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl p-8 animate-in fade-in zoom-in duration-300">
        <button onClick={onClose} className="absolute right-6 top-6 text-slate-400 hover:text-slate-600 transition-colors">
          <X size={24} />
        </button>
        
        <div className="flex items-center gap-3 mb-6 text-emerald-800">
          <ShieldCheck size={32} />
          <h2 className="text-2xl font-bold">Información Legal y Créditos</h2>
        </div>

        <div className="space-y-6 text-slate-700 leading-relaxed">
          <section>
            <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-2">
              <span className="w-1.5 h-6 bg-emerald-500 rounded-full" /> Privacidad
            </h3>
            <p>Esta aplicación funciona 100% localmente. No recopilamos, almacenamos ni transmitimos datos personales a ningún servidor externo. Sus proyecciones financieras permanecen en su dispositivo.</p>
          </section>

          <section>
            <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-2">
              <span className="w-1.5 h-6 bg-blue-500 rounded-full" /> Fuentes Técnicas (Atribución Ética)
            </h3>
            <p>Los parámetros agronómicos y coeficientes técnicos utilizados como base para este simulador han sido adaptados de manuales técnicos públicos de <strong>Fedecacao</strong> y <strong>Agrosavia</strong>. Se citan con fines educativos y de referencia técnica, reconociendo su autoría intelectual sobre las metodologías de cultivo. Esta app no tiene vinculación oficial con dichas entidades.</p>
          </section>

          <section className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <h3 className="font-bold text-slate-900 mb-1">Disclaimer</h3>
            <p className="text-sm">Los costos son estimados y deben validarse con proveedores locales. Esta es una herramienta de apoyo y no constituye asesoría financiera vinculante.</p>
          </section>

          <section className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <p className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-1">Desarrolladores</p>
              <p className="font-bold text-emerald-900">Juan Carlos Velasquez Franco</p>
              <p className="font-bold text-emerald-900">Lucas Mateo Tabares Franco</p>
            </div>
            <button onClick={onClose} className="bg-emerald-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200">
              Entendido
            </button>
          </section>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  // --- State ---
  const [config, setConfig] = useState<SimulationState>({
    hectares: 1,
    laborCost: 60000, 
    currency: 'COP'
  });

  const [selectedStage, setSelectedStage] = useState<StageType | 'ALL'>('ALL');
  const [isDownloading, setIsDownloading] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // --- Logic / Calculation Engine ---
  const summaryData: SummaryData = useMemo(() => {
    let totalInvestment = 0;
    let totalLaborDays = 0;
    const costPerStage: Record<StageType, number> = {
      PREPARACION: 0,
      SIEMBRA: 0,
      CRECIMIENTO: 0,
      PRODUCCION: 0
    };
    const costPerCategory: Record<CostCategory, number> = {
      MANO_DE_OBRA: 0,
      INSUMOS: 0,
      HERRAMIENTAS: 0,
      ADMINISTRATIVO: 0
    };

    CACAO_ACTIVITIES.forEach(activity => {
      const quantityTotal = activity.quantityPerHa * config.hectares;
      const priceUnit = activity.category === 'MANO_DE_OBRA' ? config.laborCost : activity.basePricePerUnit;
      const activityTotalCost = quantityTotal * priceUnit;

      totalInvestment += activityTotalCost;
      costPerStage[activity.stage] += activityTotalCost;
      costPerCategory[activity.category] += activityTotalCost;

      if (activity.category === 'MANO_DE_OBRA') {
        totalLaborDays += quantityTotal;
      }
    });

    return { totalInvestment, totalLaborDays, costPerStage, costPerCategory };
  }, [config]);

  const filteredActivities = useMemo(() => {
    if (selectedStage === 'ALL') return CACAO_ACTIVITIES;
    return CACAO_ACTIVITIES.filter(a => a.stage === selectedStage);
  }, [selectedStage]);

  // --- PDF Generation Logic (WYSIWYG con Paginación) ---
  const handleDownloadPDF = async () => {
    if (!contentRef.current) return;
    setIsDownloading(true);
    
    try {
      const element = contentRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = 0;

      // Primera página
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      // Paginación automática
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      pdf.save(`Plan-Cacao-Reporte-${config.hectares}Ha.pdf`);
    } catch (error) {
      console.error('PDF Error:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-12">
      <PrivacyModal isOpen={isPrivacyOpen} onClose={() => setIsPrivacyOpen(false)} />

      {/* Header */}
      <header className="bg-emerald-900 text-white shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center gap-3 mb-4 md:mb-0">
            <div className="bg-emerald-700 p-2 rounded-lg border border-emerald-600">
              <Sprout size={28} className="text-emerald-100" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">CacaoPlan Pro</h1>
              <p className="text-emerald-200 text-sm font-medium">Planificación Técnica de Cultivos</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             <button
              onClick={handleDownloadPDF}
              disabled={isDownloading}
              className={`
                flex items-center gap-2 px-6 py-2.5 rounded-2xl font-bold transition-all shadow-xl
                ${isDownloading 
                  ? 'bg-slate-700 cursor-not-allowed opacity-80' 
                  : 'bg-[#7a1b1b] hover:bg-[#912020] active:scale-95 text-white border-b-4 border-[#5d1c1c]'}
              `}
            >
              {isDownloading ? <Loader2 size={18} className="animate-spin" /> : <CacaoIcon className="w-5 h-5" />}
              {isDownloading ? 'Generando PDF...' : 'Descargar Plan'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        
        {/* Parámetros */}
        <section className="mb-8 bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 mb-6 text-emerald-900 border-b pb-4 border-slate-50">
            <Settings2 size={24} />
            <h2 className="font-bold text-lg uppercase tracking-wider">Parámetros del Proyecto</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div>
              <label className="block text-sm font-bold text-slate-900 mb-2 uppercase">Área (Hectáreas)</label>
              <div className="relative">
                <input type="number" value={config.hectares} onChange={(e) => setConfig({...config, hectares: parseFloat(e.target.value) || 0})} className="w-full bg-white px-4 py-3 border-2 border-slate-200 rounded-2xl focus:border-emerald-500 outline-none font-bold text-lg" />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">HA</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-900 mb-2 uppercase">Costo Jornal (Regional)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                <input type="number" value={config.laborCost} onChange={(e) => setConfig({...config, laborCost: parseFloat(e.target.value) || 0})} className="w-full bg-white pl-10 pr-4 py-3 border-2 border-slate-200 rounded-2xl focus:border-emerald-500 outline-none font-bold text-lg" />
              </div>
            </div>
            <div className="flex items-center gap-4 bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100">
              <Info className="text-emerald-600 shrink-0" />
              <p className="text-xs text-emerald-900 font-medium">Los cálculos se basan en una densidad estándar de 1,100 árboles por hectárea con sombrío.</p>
            </div>
          </div>
        </section>

        {/* Dashboard Imprimible */}
        <div ref={contentRef} className="bg-white rounded-3xl p-8 lg:p-12 shadow-sm space-y-10">
          {/* Cabecera del Reporte (Solo visible en PDF o Captura) */}
          <div className="hidden print:block border-b-2 border-emerald-900 pb-8 mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-4xl font-black text-emerald-900 uppercase">Reporte CacaoPlan Pro</h1>
                <p className="text-slate-500 font-bold mt-1">Plan técnico para {config.hectares} Hectáreas | Jornal: ${config.laborCost.toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400 font-bold uppercase">Emisión</p>
                <p className="font-bold text-slate-800">{new Date().toLocaleDateString('es-CO')}</p>
              </div>
            </div>
          </div>

          <CostSummary data={summaryData} config={config} />
          <Charts data={summaryData} />
          
          <div className="space-y-6">
            <div className="flex items-center gap-2 border-l-4 border-emerald-500 pl-4 py-1">
              <FileText className="text-emerald-600" />
              <h2 className="text-xl font-bold text-slate-800 uppercase tracking-tight">Cronograma de Actividades</h2>
            </div>
            <StageTimeline selectedStage={selectedStage} onSelectStage={setSelectedStage} />
            <ActivityList activities={filteredActivities} config={config} />
          </div>

          <div className="pt-8 border-t border-slate-100 flex flex-col items-center gap-4 text-center">
            <div className="flex gap-8 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
              <span>Fedecacao Adaptación</span>
              <span>Agrosavia Base Técnica</span>
              <span>CacaoPlan Pro v1.0</span>
            </div>
            <p className="text-[9px] text-slate-400 max-w-2xl leading-tight italic">
              Este documento es una proyección técnica y financiera basada en promedios nacionales. No sustituye la visita técnica de un agrónomo calificado.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 py-12 border-t border-slate-200 text-center">
        <div className="container mx-auto px-4 space-y-6">
          <div className="flex flex-col md:flex-row justify-center items-center gap-6">
            <p className="text-slate-500 text-sm font-medium">© 2024 CacaoPlan Pro - Gestión Inteligente del Campo</p>
            <button 
              onClick={() => setIsPrivacyOpen(true)}
              className="flex items-center gap-2 text-emerald-700 font-bold text-sm hover:underline"
            >
              <ShieldCheck size={16} />
              🔒 Política de Privacidad, Fuentes y Créditos
            </button>
          </div>
          <div className="flex justify-center gap-4 grayscale opacity-50">
            {/* Logos representativos */}
            <div className="bg-slate-200 px-3 py-1 rounded-lg text-[10px] font-black text-slate-600">FC</div>
            <div className="bg-slate-200 px-3 py-1 rounded-lg text-[10px] font-black text-slate-600">AS</div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
