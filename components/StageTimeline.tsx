
import React from 'react';
import { StageType } from '../types';
import { STAGE_LABELS, CACAO_ACTIVITIES } from '../constants';
import { CheckCircle2, Circle } from 'lucide-react';

interface Props {
  selectedStage: StageType | 'ALL';
  onSelectStage: (stage: StageType | 'ALL') => void;
}

const StageTimeline: React.FC<Props> = ({ selectedStage, onSelectStage }) => {
  const stages: StageType[] = ['PREPARACION', 'SIEMBRA', 'CRECIMIENTO', 'PRODUCCION'];

  return (
    <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-200/60 no-print">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stages.map((stage) => {
          const isActive = selectedStage === 'ALL' || selectedStage === stage;
          const count = CACAO_ACTIVITIES.filter(a => a.stage === stage).length;
          
          return (
            <button
              key={stage}
              onClick={() => onSelectStage(stage === selectedStage ? 'ALL' : stage)}
              className={`
                flex items-center gap-4 p-5 rounded-2xl border-2 transition-all text-left
                ${isActive 
                  ? 'bg-emerald-900 border-emerald-900 text-white shadow-xl shadow-emerald-900/20' 
                  : 'bg-white border-slate-100 text-slate-500 hover:border-emerald-200'}
              `}
            >
              <div className={`p-2 rounded-xl ${isActive ? 'bg-emerald-700' : 'bg-slate-100'}`}>
                {isActive ? <CheckCircle2 size={24} /> : <Circle size={24} className="text-slate-300" />}
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Fase {stages.indexOf(stage) + 1}</p>
                <p className="font-black text-sm">{STAGE_LABELS[stage].split(' ')[1]}</p>
                <p className={`text-[10px] font-bold ${isActive ? 'text-emerald-300' : 'text-slate-400'}`}>{count} Labores proyectadas</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default StageTimeline;
