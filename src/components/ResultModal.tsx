import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X } from 'lucide-react';
import { Game } from '../types.ts';

export default function ResultModal({ game, onSave, onClose }: { game: Game, onSave: (res: any) => void, onClose: () => void }) {
  const [sets, setSets] = useState([{ team1: 0, team2: 0 }, { team1: 0, team2: 0 }]);

  const handleSave = () => {
    const score = sets.map(s => `${s.team1}-${s.team2}`).join(', ');
    onSave({ score, sets });
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onClose} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative bg-[#1A2233] w-full max-w-sm rounded-[32px] p-8 shadow-2xl overflow-hidden"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-black uppercase tracking-tight italic">Record Result</h3>
          <button onClick={onClose} className="p-2 hover:bg-[#FFFFFF]/5 rounded-full"><X className="w-5 h-5"/></button>
        </div>

        <div className="space-y-6">
          {sets.map((set, idx) => (
            <div key={idx} className="bg-[#FFFFFF]/5 p-4 rounded-3xl">
              <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-3 text-center">Set {idx + 1}</p>
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 flex flex-col items-center gap-2">
                  <span className="text-[10px] font-bold opacity-30">Team 1</span>
                  <input
                    type="number"
                    value={set.team1}
                    onChange={e => {
                      const newSets = [...sets];
                      newSets[idx].team1 = parseInt(e.target.value) || 0;
                      setSets(newSets);
                    }}
                    className="w-16 h-16 bg-[#1A2233] rounded-2xl text-center text-2xl font-black focus:ring-2 focus:ring-[#00E676] outline-none"
                  />
                </div>
                <div className="font-black opacity-20 text-2xl">:</div>
                <div className="flex-1 flex flex-col items-center gap-2">
                  <span className="text-[10px] font-bold opacity-30">Team 2</span>
                  <input
                    type="number"
                    value={set.team2}
                    onChange={e => {
                      const newSets = [...sets];
                      newSets[idx].team2 = parseInt(e.target.value) || 0;
                      setSets(newSets);
                    }}
                    className="w-16 h-16 bg-[#1A2233] rounded-2xl text-center text-2xl font-black focus:ring-2 focus:ring-[#00E676] outline-none"
                  />
                </div>
              </div>
            </div>
          ))}

          <button
            onClick={() => setSets([...sets, { team1: 0, team2: 0 }])}
            className="w-full py-3 border-2 border-dashed border-[#FFFFFF]/8 rounded-2xl text-[10px] font-black uppercase tracking-widest opacity-40 hover:opacity-100 hover:border-[#00E676]/40 transition-all"
          >
            + Add Set
          </button>
        </div>

        <button
          onClick={handleSave}
          className="w-full bg-[#00E676] text-[#141414] py-4 rounded-2xl mt-8 font-black uppercase tracking-widest shadow-lg shadow-[#00E676]/20 hover:scale-[1.02] active:scale-95 transition-all"
        >
          Save Result
        </button>
      </motion.div>
    </div>
  );
}
