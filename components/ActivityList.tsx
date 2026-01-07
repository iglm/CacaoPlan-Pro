import React from 'react';
import { Activity, SimulationState } from '../types';
import { STAGE_LABELS, CATEGORY_LABELS } from '../constants';

interface Props {
  activities: Activity[];
  config: SimulationState;
}

const ActivityList: React.FC<Props> = ({ activities, config }) => {
  
  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(amount);
  };

  const calculateRowTotal = (activity: Activity) => {
    const quantity = activity.quantityPerHa * config.hectares;
    const price = activity.category === 'MANO_DE_OBRA' ? config.laborCost : activity.basePricePerUnit;
    return quantity * price;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
        <h3 className="font-semibold text-slate-800">Plan de Labores Detallado</h3>
        <span className="text-xs bg-slate-200 text-slate-600 px-2 py-1 rounded-full font-medium">
          {activities.length} Actividades Identificadas
        </span>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
            <tr>
              <th className="px-6 py-4">Actividad / Labor</th>
              <th className="px-6 py-4">Etapa</th>
              <th className="px-6 py-4">Unidad</th>
              <th className="px-6 py-4 text-right">Cant. Total</th>
              <th className="px-6 py-4 text-right">Valor Unit.</th>
              <th className="px-6 py-4 text-right">Total Estimado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {activities.map((activity) => (
              <tr key={activity.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div>
                    <p className="font-semibold text-slate-700">{activity.name}</p>
                    <p className="text-xs text-slate-500 mt-1 max-w-xs">{activity.description}</p>
                    {activity.technicalNote && (
                      <p className="text-xs text-amber-600 mt-1 italic">Nota: {activity.technicalNote}</p>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`
                    inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                    ${activity.stage === 'PREPARACION' ? 'bg-gray-100 text-gray-800' : ''}
                    ${activity.stage === 'SIEMBRA' ? 'bg-blue-100 text-blue-800' : ''}
                    ${activity.stage === 'CRECIMIENTO' ? 'bg-green-100 text-green-800' : ''}
                    ${activity.stage === 'PRODUCCION' ? 'bg-orange-100 text-orange-800' : ''}
                  `}>
                    {STAGE_LABELS[activity.stage].split(' ')[1]}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-600">
                  {activity.unit}
                  <span className="block text-xs text-slate-400">{activity.frequency}</span>
                </td>
                <td className="px-6 py-4 text-right font-medium text-slate-700">
                  {(activity.quantityPerHa * config.hectares).toLocaleString()}
                </td>
                <td className="px-6 py-4 text-right text-slate-600">
                  {formatMoney(activity.category === 'MANO_DE_OBRA' ? config.laborCost : activity.basePricePerUnit)}
                </td>
                <td className="px-6 py-4 text-right font-bold text-emerald-700">
                  {formatMoney(calculateRowTotal(activity))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {activities.length === 0 && (
        <div className="p-12 text-center text-slate-400">
          No hay labores registradas para este filtro.
        </div>
      )}
    </div>
  );
};

export default ActivityList;