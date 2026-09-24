import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X } from 'lucide-react';
import { Game } from '../types.ts';
import { fmt } from '../hooks/useI18n.ts';
import { useDialogA11y } from '../hooks/useDialogA11y.ts';

export default function ResultModal({ game, onSave, onClose, t }: { game: Game, onSave: (res: any) => void, onClose: () => void, t: (key: string) => string }) {
  const { dialogProps } = useDialogA11y(onClose);
  const [sets, setSets] = useState([{ team1: 0, team2: 0 }, { team1: 0, team2: 0 }]);

  const handleSave = () => {
    const score = sets.map(s => `${s.team1}-${s.team2}`).join(', ');
    onSave({ score, sets });
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onClose} className="absolute inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" />
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        {...dialogProps}
        aria-labelledby="result-title"
        className="outline-none max-h-[90vh] overflow-y-auto relative bg-white w-full max-w-sm rounded-2xl sm:rounded-[32px] p-4 sm:p-8 shadow-2xl overflow-hidden"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 id="result-title" className="text-2xl font-black uppercase tracking-tight italic">{t('result.title')}</h3>
          <button onClick={onClose} aria-label={t('a11y.close')} className="p-2.5 hover:bg-[#141414]/5 rounded-full"><X className="w-5 h-5" aria-hidden="true" /></button>
        </div>

        <div className="space-y-6">
          {sets.map((set, idx) => (
            <div key={idx} className="bg-[#141414]/5 p-4 rounded-3xl">
              <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-3 text-center">{fmt(t('result.set'), { n: idx + 1 })}</p>
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 flex flex-col items-center gap-2">
                  <label htmlFor={`set-${idx}-t1`} className="text-[10px] font-bold text-[#141414]/60">{t('result.team1')}</label>
                  <input
                    type="number"
                    id={`set-${idx}-t1`}
                    min={0} max={99} inputMode="numeric"
                    value={set.team1}
                    onChange={e => {
                      const newSets = [...sets];
                      newSets[idx].team1 = parseInt(e.target.value) || 0;
                      setSets(newSets);
                    }}
                    className="w-16 h-16 bg-white rounded-2xl text-center text-2xl font-black focus:ring-2 focus:ring-[#E2FF3B] outline-none"
                  />
                </div>
                <div className="font-black opacity-20 text-2xl">:</div>
                <div className="flex-1 flex flex-col items-center gap-2">
                  <label htmlFor={`set-${idx}-t2`} className="text-[10px] font-bold text-[#141414]/60">{t('result.team2')}</label>
                  <input
                    type="number"
                    id={`set-${idx}-t2`}
                    min={0} max={99} inputMode="numeric"
                    value={set.team2}
                    onChange={e => {
                      const newSets = [...sets];
                      newSets[idx].team2 = parseInt(e.target.value) || 0;
                      setSets(newSets);
                    }}
                    className="w-16 h-16 bg-white rounded-2xl text-center text-2xl font-black focus:ring-2 focus:ring-[#E2FF3B] outline-none"
                  />
                </div>
              </div>
            </div>
          ))}

          <button
            onClick={() => setSets([...sets, { team1: 0, team2: 0 }])}
            className="w-full py-3 border-2 border-dashed border-[#141414]/15 rounded-2xl text-[10px] font-black uppercase tracking-widest text-[#141414]/60 hover:text-[#141414] hover:border-[#E2FF3B] transition-all"
          >
            {t('result.addSet')}
          </button>
        </div>

        <button
          onClick={handleSave}
          className="w-full bg-[#E2FF3B] text-[#141414] py-4 rounded-2xl mt-8 font-black uppercase tracking-widest shadow-lg shadow-[#E2FF3B]/20 hover:scale-[1.02] active:scale-95 transition-all"
        >
          {t('result.save')}
        </button>
      </motion.div>
    </div>
  );
}
