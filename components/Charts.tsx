import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, Legend } from 'recharts';
import { SummaryData } from '../types';
import { CATEGORY_LABELS, STAGE_LABELS } from '../constants';

interface Props {
  data: SummaryData;
}

const Charts: React.FC<Props> = ({ data }) => {
  
  // Prepare data for Category Pie Chart
  const categoryData = Object.keys(data.costPerCategory).map(key => ({
    name: CATEGORY_LABELS[key as keyof typeof CATEGORY_LABELS],
    value: data.costPerCategory[key as keyof typeof CATEGORY_LABELS]
  })).filter(item => item.value > 0);

  // Prepare data for Stage Bar Chart
  const stageData = Object.keys(data.costPerStage).map(key => ({
    name: STAGE_LABELS[key as keyof typeof STAGE_LABELS].split('.')[1].trim().split(' ')[0], // Short name
    value: data.costPerStage[key as keyof typeof STAGE_LABELS]
  }));

  const COLORS = ['#10b981', '#f59e0b', '#3b82f6', '#8b5cf6'];

  const formatMoneyShort = (value: number) => {
    return `$${(value / 1000000).toFixed(1)}M`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Cost Distribution Chart */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="font-semibold text-slate-800 mb-6">Distribución de Costos por Rubro</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(value)} 
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Stage Cost Chart */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="font-semibold text-slate-800 mb-6">Inversión por Etapa Fenológica</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stageData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{fontSize: 12}} />
              <YAxis tickFormatter={formatMoneyShort} tick={{fontSize: 12}} width={40}/>
              <Tooltip 
                formatter={(value: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(value)}
                cursor={{fill: '#f8fafc'}}
              />
              <Bar dataKey="value" fill="#3b4252" radius={[4, 4, 0, 0]}>
                {stageData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Charts;