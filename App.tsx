
import React, { useState, useMemo, useRef } from 'react';
import { CACAO_ACTIVITIES } from './constants';
import { SimulationState, StageType, SummaryData, Activity, CostCategory } from './types';
import CostSummary from './components/CostSummary';
import ActivityList from './components/ActivityList';
import StageTimeline from './components/StageTimeline';
import Charts from './components/Charts';
import { Sprout, Settings2, Loader2, ShieldCheck, X, FileText, Info, Leaf, Scale, AlertCircle } from 'lucide-react';
import { generateCacaoReport } from './utils/pdfGenerator';

// --- Icono Temático ---
const CacaoIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8 0-4.41 3.59-8 8-8s8 3.59 8 8-8 8zm-1-13h2v10h-2zm-4 1h2v8H7zm8 0h2v8h-2z" />
  </svg>
);

// --- Privacy Modal Refinado ---
const PrivacyModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity" onClick={onClose} />
      <div className="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl p-8 md:p-12 animate-in fade-in zoom-in duration-300 border border-white/20">
        <button onClick={onClose} className="absolute right-8 top-8 text-slate-400 hover:text-rose-600 transition-colors bg-slate-100 p-2 rounded-full">
          <X size={20} />
        </button>
        <div className="flex items-center gap-4 mb-8">
          <div className="bg-emerald-600 p-3 rounded-2xl text-white shadow-lg shadow-emerald-200">
            <ShieldCheck size={32} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Política de Privacidad</h2>
            <p className="text-emerald-600 font-bold text-sm uppercase tracking-widest leading-none">Habeas Data & Protección de Datos</p>
          </div>
        </div>
        
        <div className="space-y-6 text-slate-600 leading-relaxed overflow-y-auto max-h-[60vh] pr-4 custom-scrollbar">
          <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
            <h3 className="font-black text-slate-900 mb-2 uppercase text-xs tracking-widest flex items-center gap-2">
              <Scale size={14} className="text-emerald-600" /> Responsables del Tratamiento
            </h3>
            <p className="text-sm">Los responsables del tratamiento de la información técnica generada son <strong>JUAN CARLOS VELASQUEZ FRANCO</strong>, <strong>LUCAS MATEO TABARES FRANCO</strong> y <strong>ALFREDO GARCIA LLANO</strong>.</p>
          </div>

          <div>
            <h3 className="font-black text-slate-900 mb-2 uppercase text-xs tracking-widest">1. Naturaleza de los Datos</h3>
            <p className="text-sm">CacaoPlan Pro es una herramienta de <strong>procesamiento local</strong>. Esta aplicación NO recolecta, almacena, ni transmite datos personales, biométricos o de geolocalización a servidores externos.</p>
          </div>

          <div>
            <h3 className="font-black text-slate-900 mb-2 uppercase text-xs tracking-widest">2. Derechos Habeas Data</h3>
            <p className="text-sm">En cumplimiento de la Ley 1581 de 2012, sus derechos se ejercen mediante el control total de la aplicación. Al no haber servidores, borrar la caché de su navegador elimina permanentemente cualquier dato ingresado.</p>
          </div>

          <div className="pt-6 border-t border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 text-center">Equipo de Desarrollo</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-center">
              <div className="bg-emerald-900 text-white p-4 rounded-2xl font-bold text-[11px]">JUAN CARLOS VELASQUEZ FRANCO</div>
              <div className="bg-emerald-900 text-white p-4 rounded-2xl font-bold text-[11px]">LUCAS MATEO TABARES FRANCO</div>
              <div className="bg-emerald-900 text-white p-4 rounded-2xl font-bold text-[11px]">ALFREDO GARCIA LLANO</div>
            </div>
          </div>
        </div>
        
        <button onClick={onClose} className="w-full mt-8 bg-emerald-600 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-emerald-200 hover:bg-emerald-700 transition-all active:scale-95">
          Aceptar y Continuar
        </button>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [config, setConfig] = useState<SimulationState>({ hectares: 1, laborCost: 65000, currency: 'COP' });
  const [selectedStage, setSelectedStage] = useState<StageType | 'ALL'>('ALL');
  const [isDownloading, setIsDownloading] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const summaryData: SummaryData = useMemo(() => {
    let totalInvestment = 0;
    let totalLaborDays = 0;
    
    // Tipado estricto para evitar errores de compilación
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

    CACAO_ACTIVITIES.forEach(a => {
      const q = a.quantityPerHa * config.hectares;
      const p = a.category === 'MANO_DE_OBRA' ? config.laborCost : a.basePricePerUnit;
      const total = q * p;
      totalInvestment += total;
      costPerStage[a.stage] += total;
      costPerCategory[a.category] += total;
      if (a.category === 'MANO_DE_OBRA') totalLaborDays += q;
    });

    return { totalInvestment, totalLaborDays, costPerStage, costPerCategory };
  }, [config]);

  const handleDownloadPDF = async () => {
    if (!contentRef.current) return;
    const filename = `Plan-Cacao-${config.hectares}HA-${new Date().getFullYear()}.pdf`;
    await generateCacaoReport(contentRef.current, filename, setIsDownloading);
  };

  const updateHectares = (val: string) => {
    // Si val es vacío, se asume 0 para cumplir con el requerimiento de no dejarlo como NaN
    const num = Math.max(0, parseFloat(val) || 0);
    setConfig({ ...config, hectares: num });
  };

  const updateLaborCost = (val: string) => {
    const num = Math.max(0, parseFloat(val) || 0);
    setConfig({ ...config, laborCost: num });
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <PrivacyModal isOpen={isPrivacyOpen} onClose={() => setIsPrivacyOpen(false)} />

      <header className="bg-emerald-950 text-white sticky top-0 z-50 shadow-2xl border-b border-emerald-900/50 no-print">
        <div className="container mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 p-2.5 rounded-2xl shadow-lg shadow-emerald-950/50">
              <Sprout size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tighter leading-none">CacaoPlan Pro</h1>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400">Inteligencia Agrícola</span>
            </div>
          </div>
          
          <button 
            onClick={handleDownloadPDF} 
            disabled={isDownloading || config.hectares <= 0} 
            className="group relative overflow-hidden bg-rose-900 px-8 py-3 rounded-2xl font-black text-sm uppercase tracking-widest transition-all hover:bg-rose-950 disabled:bg-slate-800 disabled:opacity-50 active:scale-95 shadow-xl shadow-rose-900/20 flex items-center gap-3"
          >
            {isDownloading ? <Loader2 size={18} className="animate-spin" /> : <CacaoIcon className="w-5 h-5" />}
            {isDownloading ? 'Generando...' : 'Descargar Plan'}
          </button>
        </div>
      </header>

      <main className="container mx-auto px-6 py-10">
        <section className="bg-white p-8 md:p-10 rounded-[3rem] shadow-xl border border-slate-100 mb-12 relative overflow-hidden no-print">
          <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
            <Leaf size={200} className="text-emerald-900 rotate-45" />
          </div>
          <div className="flex items-center gap-3 mb-10">
            <Settings2 size={24} className="text-emerald-700" />
            <h2 className="text-xl font-black uppercase tracking-tighter text-slate-800">Parámetros del Proyecto</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            <div className="space-y-3">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex justify-between">
                <span>Área (Hectáreas)</span>
                {config.hectares <= 0 && <span className="text-rose-600 flex items-center gap-1"><AlertCircle size={10}/> Requerido</span>}
              </label>
              <div className="relative">
                <input 
                  type="number" 
                  min="0"
                  step="0.5"
                  // Usamos el valor directamente para que muestre 0 si el estado es 0
                  value={config.hectares} 
                  onChange={e => updateHectares(e.target.value)} 
                  className={`w-full bg-slate-100/50 border-2 ${config.hectares <= 0 ? 'border-rose-200' : 'border-slate-200'} px-6 py-4 rounded-2xl font-black text-xl text-slate-900 outline-none focus:border-emerald-500 focus:bg-white transition-all`} 
                />
                <span className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500 font-black">HA</span>
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Costo Jornal (COP)</label>
              <div className="relative">
                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 font-black">$</span>
                <input 
                  type="number" 
                  min="0"
                  step="1000"
                  // Usamos el valor directamente para que muestre 0 si el estado es 0
                  value={config.laborCost} 
                  onChange={e => updateLaborCost(e.target.value)} 
                  className="w-full bg-slate-100/50 border-2 border-slate-200 pl-12 pr-6 py-4 rounded-2xl font-black text-xl text-slate-900 outline-none focus:border-emerald-500 focus:bg-white transition-all" 
                />
              </div>
            </div>
            <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100 flex items-center gap-4">
              <div className="bg-white p-2.5 rounded-xl shadow-sm"><Info className="text-emerald-600" /></div>
              <p className="text-xs text-emerald-900 font-bold leading-snug">
                {config.hectares > 0 
                  ? "Cálculos actualizados automáticamente según el área y costo de mano de obra."
                  : "Ingrese el área del cultivo (mínimo 1) para proyectar las labores y costos de inversión."}
              </p>
            </div>
          </div>
        </section>

        <div id="report-content" ref={contentRef} className="bg-white rounded-[3.5rem] p-8 md:p-16 shadow-2xl border border-slate-100 space-y-16">
          <div className="hidden print:block border-b-4 border-emerald-900 pb-10 mb-10">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-5xl font-black text-emerald-950 uppercase tracking-tighter">Plan Maestro Cacao</h1>
                <p className="text-lg text-slate-500 font-bold mt-2">CacaoPlan Pro v1.6 | Gestión Inteligente del Campo</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-slate-900">{new Date().toLocaleDateString()}</p>
                <p className="text-xs text-slate-400 font-black uppercase tracking-widest">Fecha de Generación</p>
              </div>
            </div>
          </div>

          <CostSummary data={summaryData} config={config} />
          
          <div className="space-y-12">
            <Charts data={summaryData} />
            
            <div className="space-y-8">
              <div className="flex items-center gap-4 border-l-8 border-rose-700 pl-6 no-print">
                <FileText size={28} className="text-rose-900" />
                <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Cronograma & Labores</h2>
              </div>
              <StageTimeline selectedStage={selectedStage} onSelectStage={setSelectedStage} />
              <ActivityList activities={CACAO_ACTIVITIES.filter(a => selectedStage === 'ALL' || a.stage === selectedStage)} config={config} />
            </div>
          </div>

          <div className="hidden print:block pt-12 border-t border-slate-100 text-center">
             <div className="flex justify-center flex-wrap gap-x-10 gap-y-2 mb-4 text-[10px] font-black text-slate-900">
                <span>JUAN CARLOS VELASQUEZ FRANCO</span>
                <span>LUCAS MATEO TABARES FRANCO</span>
                <span>ALFREDO GARCIA LLANO</span>
             </div>
             <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.5em]">Planificación Técnica Agroindustrial • Gestión de Datos Local</p>
          </div>
        </div>
      </main>

      <footer className="mt-20 py-20 bg-emerald-950 text-white text-center no-print">
        <div className="container mx-auto px-6 flex flex-col items-center gap-8">
          <div className="flex flex-col md:flex-row gap-8 items-center text-sm font-bold text-emerald-400/60">
            <div className="flex flex-col gap-1 items-center md:items-start">
               <p>© {new Date().getFullYear()} CacaoPlan Pro - Gestión Inteligente del Campo</p>
               <div className="flex flex-col md:flex-row gap-x-4 text-[10px] uppercase tracking-wider text-white/40">
                  <span>JUAN CARLOS VELASQUEZ FRANCO</span>
                  <span className="hidden md:inline">•</span>
                  <span>LUCAS MATEO TABARES FRANCO</span>
                  <span className="hidden md:inline">•</span>
                  <span>ALFREDO GARCIA LLANO</span>
               </div>
            </div>
            <button onClick={() => setIsPrivacyOpen(true)} className="flex items-center gap-2 hover:text-emerald-300 transition-colors bg-white/5 px-6 py-3 rounded-2xl border border-white/10">
              <ShieldCheck size={16} /> Política de Privacidad & Habeas Data
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
