
import React from 'react';
import { SummaryData, SimulationState } from '../types';
import { DollarSign, Sprout, Briefcase, TrendingUp } from 'lucide-react';

interface Props {
  data: SummaryData;
  config: SimulationState;
}

const CostSummary: React.FC<Props> = ({ data, config }) => {
  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(amount);
  };

  const cards = [
    { title: 'Inversión Total', val: formatMoney(data.totalInvestment), sub: `Para ${config.hectares} Ha`, icon: <DollarSign />, color: 'emerald' },
    { title: 'Empleo Rural', val: `${Math.ceil(data.totalLaborDays)} Jornales`, sub: 'Proyección anual', icon: <Briefcase />, color: 'blue' },
    { title: 'Costos Insumos', val: formatMoney(data.costPerCategory.INSUMOS || 0), sub: 'Fertilización + Plántulas', icon: <Sprout />, color: 'amber' },
    { title: 'Inversión / Ha', val: formatMoney(data.totalInvestment / config.hectares), sub: 'Promedio proyectado', icon: <TrendingUp />, color: 'rose' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((c, i) => (
        <div key={i} className="bg-white p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-50 transition-transform hover:-translate-y-1">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-${c.color}-100 bg-${c.color}-600 text-white`}>
            {React.cloneElement(c.icon as React.ReactElement, { size: 28 })}
          </div>
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{c.title}</p>
          <h3 className="text-2xl font-black text-slate-900 tracking-tighter mb-1">{c.val}</h3>
          <p className="text-xs text-slate-500 font-bold">{c.sub}</p>
        </div>
      ))}
    </div>
  );
};

export default CostSummary;
