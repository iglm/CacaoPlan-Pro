import React from 'react';
import { StageType, Activity } from '../types';
import { STAGE_LABELS, CACAO_ACTIVITIES } from '../constants';
import { CheckCircle2, Circle } from 'lucide-react';

interface Props {
  selectedStage: StageType | 'ALL';
  onSelectStage: (stage: StageType | 'ALL') => void;
}

const StageTimeline: React.FC<Props> = ({ selectedStage, onSelectStage }) => {
  const stages: StageType[] = ['PREPARACION', 'SIEMBRA', 'CRECIMIENTO', 'PRODUCCION'];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-6">
      <div className="p-4 border-b border-slate-100 bg-slate-50">
        <h3 className="font-semibold text-slate-800">Fases Fenológicas del Cultivo</h3>
        <p className="text-sm text-slate-500">Seleccione una etapa para filtrar las labores recomendadas</p>
      </div>
      
      <div className="p-6">
        <div className="flex flex-col md:flex-row justify-between relative">
          {/* Connecting Line (Desktop) */}
          <div className="hidden md:block absolute top-1/2 left-0 w-full h-1 bg-slate-200 -z-0 transform -translate-y-1/2"></div>

          {stages.map((stage, index) => {
            const isActive = selectedStage === 'ALL' || selectedStage === stage;
            const activitiesCount = CACAO_ACTIVITIES.filter(a => a.stage === stage).length;
            
            return (
              <button
                key={stage}
                onClick={() => onSelectStage(stage)}
                className={`relative z-10 flex flex-col items-center group focus:outline-none transition-all duration-300 ${
                  selectedStage === stage ? 'scale-105' : 'hover:scale-105'
                }`}
              >
                <div className={`
                  w-12 h-12 rounded-full flex items-center justify-center border-4 transition-colors duration-300
                  ${isActive 
                    ? 'bg-emerald-600 border-emerald-100 text-white shadow-lg' 
                    : 'bg-white border-slate-200 text-slate-400 hover:border-emerald-200'}
                `}>
                  {isActive ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                </div>
                
                <div className="mt-4 text-center">
                  <span className={`text-sm font-bold block ${isActive ? 'text-emerald-800' : 'text-slate-500'}`}>
                    {STAGE_LABELS[stage].split(' ')[1]}
                  </span>
                  <span className="text-xs text-slate-400 block mt-1">
                    {activitiesCount} Labores
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StageTimeline;