
import React, { useState, useMemo, useRef } from 'react';
import { CACAO_ACTIVITIES } from './constants';
import { SimulationState, StageType, SummaryData, Activity, CostCategory } from './types';
import CostSummary from './components/CostSummary';
import ActivityList from './components/ActivityList';
import StageTimeline from './components/StageTimeline';
import Charts from './components/Charts';
import { Sprout, Settings2, Loader2, ShieldCheck, X, FileText, Info, Leaf } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

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
            <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Legal & Créditos</h2>
            <p className="text-emerald-600 font-bold text-sm uppercase tracking-widest">Compromiso Ético</p>
          </div>
        </div>
        <div className="space-y-6 text-slate-600 leading-relaxed overflow-y-auto max-h-[60vh] pr-2 custom-scrollbar">
          <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
            <h3 className="font-black text-slate-900 mb-2 uppercase text-xs tracking-widest">🔒 Privacidad Total</h3>
            <p>Tus datos no salen de aquí. Todo el procesamiento es local, garantizando que tu plan de negocio sea solo tuyo.</p>
          </div>
          <div>
            <h3 className="font-black text-slate-900 mb-2 uppercase text-xs tracking-widest">📚 Fuentes Científicas</h3>
            <p>Basado en metodologías de <strong>Fedecacao</strong> y <strong>Agrosavia</strong>. Esta herramienta es un simulador independiente para apoyo al productor.</p>
          </div>
          <div className="pt-6 border-t border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Autores del Proyecto</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-emerald-900 text-white p-4 rounded-2xl font-bold text-center">Juan C. Velásquez F.</div>
              <div className="bg-emerald-900 text-white p-4 rounded-2xl font-bold text-center">Lucas M. Tabares F.</div>
            </div>
          </div>
        </div>
        <button onClick={onClose} className="w-full mt-8 bg-emerald-600 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-emerald-200 hover:bg-emerald-700 transition-all active:scale-95">
          Entendido
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
    let totalInvestment = 0, totalLaborDays = 0;
    const costPerStage: any = { PREPARACION: 0, SIEMBRA: 0, CRECIMIENTO: 0, PRODUCCION: 0 };
    const costPerCategory: any = { MANO_DE_OBRA: 0, INSUMOS: 0, HERRAMIENTAS: 0, ADMINISTRATIVO: 0 };
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
    setIsDownloading(true);
    try {
      const canvas = await html2canvas(contentRef.current, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
      const img = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const w = pdf.internal.pageSize.getWidth();
      const h = pdf.internal.pageSize.getHeight();
      const imgH = (canvas.height * w) / canvas.width;
      let left = imgH, pos = 0;
      pdf.addImage(img, 'PNG', 0, pos, w, imgH);
      left -= h;
      while (left >= 0) {
        pos = left - imgH;
        pdf.addPage();
        pdf.addImage(img, 'PNG', 0, pos, w, imgH);
        left -= h;
      }
      pdf.save('Reporte-CacaoPlan-Pro.pdf');
    } catch (e) { console.error(e); } finally { setIsDownloading(false); }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <PrivacyModal isOpen={isPrivacyOpen} onClose={() => setIsPrivacyOpen(false)} />

      {/* Header Premium */}
      <header className="bg-emerald-950 text-white sticky top-0 z-50 shadow-2xl border-b border-emerald-900/50">
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
          
          <button onClick={handleDownloadPDF} disabled={isDownloading} className="group relative overflow-hidden bg-rose-900 px-8 py-3 rounded-2xl font-black text-sm uppercase tracking-widest transition-all hover:bg-rose-950 active:scale-95 shadow-xl shadow-rose-900/20 flex items-center gap-3">
            {isDownloading ? <Loader2 size={18} className="animate-spin" /> : <CacaoIcon className="w-5 h-5" />}
            {isDownloading ? 'Generando...' : 'Descargar Plan'}
          </button>
        </div>
      </header>

      <main className="container mx-auto px-6 py-10">
        {/* Parámetros Configuración - Estilo Card Soft */}
        <section className="bg-white p-8 md:p-10 rounded-[3rem] shadow-xl border border-slate-100 mb-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
            <Leaf size={200} className="text-emerald-900 rotate-45" />
          </div>
          <div className="flex items-center gap-3 mb-10">
            <Settings2 size={24} className="text-emerald-700" />
            <h2 className="text-xl font-black uppercase tracking-tighter text-slate-800">Parámetros del Proyecto</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            <div className="space-y-3">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Área (Hectáreas)</label>
              <div className="relative">
                <input type="number" value={config.hectares} onChange={e => setConfig({...config, hectares: parseFloat(e.target.value) || 0})} className="w-full bg-slate-50 border-2 border-slate-100 px-6 py-4 rounded-2xl font-black text-xl outline-none focus:border-emerald-500 focus:bg-white transition-all" />
                <span className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 font-black">HA</span>
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Costo Jornal</label>
              <div className="relative">
                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 font-black">$</span>
                <input type="number" value={config.laborCost} onChange={e => setConfig({...config, laborCost: parseFloat(e.target.value) || 0})} className="w-full bg-slate-50 border-2 border-slate-100 pl-12 pr-6 py-4 rounded-2xl font-black text-xl outline-none focus:border-emerald-500 focus:bg-white transition-all" />
              </div>
            </div>
            <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100 flex items-center gap-4">
              <div className="bg-white p-2.5 rounded-xl shadow-sm"><Info className="text-emerald-600" /></div>
              <p className="text-xs text-emerald-900 font-bold leading-snug">Cálculo basado en modelo de alta densidad y fertilización balanceada.</p>
            </div>
          </div>
        </section>

        {/* Contenedor Reporte (PDF) */}
        <div ref={contentRef} className="bg-white rounded-[3.5rem] p-8 md:p-16 shadow-2xl border border-slate-100 space-y-16">
          <div className="hidden print:block border-b-4 border-emerald-900 pb-10 mb-10">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-5xl font-black text-emerald-950 uppercase tracking-tighter">Reporte Técnico</h1>
                <p className="text-lg text-slate-500 font-bold mt-2">CacaoPlan Pro v1.5 | Planificación Integral de Cultivo</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-slate-900">{new Date().toLocaleDateString()}</p>
                <p className="text-xs text-slate-400 font-black uppercase tracking-widest">Fecha de Proyección</p>
              </div>
            </div>
          </div>

          <CostSummary data={summaryData} config={config} />
          
          <div className="space-y-12">
            <Charts data={summaryData} />
            
            <div className="space-y-8">
              <div className="flex items-center gap-4 border-l-8 border-rose-700 pl-6">
                <FileText size={28} className="text-rose-900" />
                <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Cronograma & Labores</h2>
              </div>
              <StageTimeline selectedStage={selectedStage} onSelectStage={setSelectedStage} />
              <ActivityList activities={CACAO_ACTIVITIES.filter(a => selectedStage === 'ALL' || a.stage === selectedStage)} config={config} />
            </div>
          </div>

          <div className="hidden print:block pt-12 border-t border-slate-100 text-center">
             <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.5em]">Fedecacao • Agrosavia • Proyección Agrícola Independiente</p>
          </div>
        </div>
      </main>

      <footer className="mt-20 py-20 bg-emerald-950 text-white text-center">
        <div className="container mx-auto px-6 flex flex-col items-center gap-8">
          <div className="flex items-center gap-4 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-700">
             <div className="bg-white/10 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">Modelo Fedecacao</div>
             <div className="bg-white/10 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">Algoritmo Agrosavia</div>
          </div>
          <div className="flex flex-col md:flex-row gap-8 items-center text-sm font-bold text-emerald-400/60">
            <p>© 2024 CacaoPlan Pro - Juan Carlos & Lucas Mateo Velásquez F.</p>
            <button onClick={() => setIsPrivacyOpen(true)} className="flex items-center gap-2 hover:text-emerald-300 transition-colors bg-white/5 px-6 py-2 rounded-full border border-white/10">
              <ShieldCheck size={16} /> Ver Créditos & Ética de Datos
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
