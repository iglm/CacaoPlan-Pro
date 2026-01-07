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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* Total Investment Card */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-emerald-100 text-emerald-700 rounded-lg">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Inversión Estimada</p>
            <h3 className="text-2xl font-bold text-slate-800">{formatMoney(data.totalInvestment)}</h3>
            <p className="text-xs text-slate-400 mt-1">Para {config.hectares} Hectáreas</p>
          </div>
        </div>
      </div>

      {/* Labor Days Card */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-100 text-blue-700 rounded-lg">
            <Briefcase size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Mano de Obra</p>
            <h3 className="text-2xl font-bold text-slate-800">{Math.ceil(data.totalLaborDays)} <span className="text-sm font-normal text-slate-500">Jornales</span></h3>
            <p className="text-xs text-slate-400 mt-1">Generación de empleo rural</p>
          </div>
        </div>
      </div>

      {/* Input Costs Card */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-amber-100 text-amber-700 rounded-lg">
            <Sprout size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Costos Insumos</p>
            <h3 className="text-2xl font-bold text-slate-800">{formatMoney(data.costPerCategory.INSUMOS || 0)}</h3>
            <p className="text-xs text-slate-400 mt-1">Material vegetal + Fertilizantes</p>
          </div>
        </div>
      </div>

       {/* Production Cost Card */}
       <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-purple-100 text-purple-700 rounded-lg">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Inversión / Ha</p>
            <h3 className="text-2xl font-bold text-slate-800">{formatMoney(data.totalInvestment / config.hectares)}</h3>
            <p className="text-xs text-slate-400 mt-1">Promedio ponderado</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CostSummary;