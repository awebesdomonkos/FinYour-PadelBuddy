import React from 'react';
import { motion } from 'motion/react';
import { X, Award } from 'lucide-react';
import { SkillLevel } from '../types.ts';

export default function LevelTutorial({ onClose, t }: { onClose: () => void, t: (key: string) => string }) {
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-[#141414]/90 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white w-full max-w-md rounded-[32px] overflow-hidden shadow-2xl relative"
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 bg-[#141414]/5 rounded-xl hover:bg-[#141414]/10 transition-colors z-20"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-[#E2FF3B] rounded-2xl flex items-center justify-center">
              <Award className="w-6 h-6 text-[#141414]" />
            </div>
            <div>
              <h2 className="text-2xl font-black uppercase italic tracking-tighter">{t('profile.levelTutorialTitle')}</h2>
              <p className="text-xs opacity-50 font-bold uppercase tracking-widest">{t('profile.levelTutorialSub')}</p>
            </div>
          </div>

          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 scrollbar-none">
            {Object.values(SkillLevel).map(lvl => (
              <div key={lvl} className="p-4 bg-[#141414]/5 rounded-2xl border border-transparent hover:border-[#E2FF3B]/50 transition-all group">
                <div className="flex justify-between items-center mb-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                    lvl === SkillLevel.Bronze ? 'bg-orange-100 text-orange-700' :
                    lvl === SkillLevel.Silver ? 'bg-slate-100 text-slate-700' :
                    lvl === SkillLevel.Gold ? 'bg-yellow-100 text-yellow-700' :
                    'bg-[#E2FF3B] text-[#141414]'
                  }`}>
                    {t(`profile.levels.${lvl}`)}
                  </span>
                </div>
                <p className="text-xs leading-relaxed opacity-70 group-hover:opacity-100 transition-opacity">
                  {t(`profile.levelDescriptions.${lvl}`)}
                </p>
              </div>
            ))}
          </div>

          <button
            onClick={onClose}
            className="w-full mt-8 bg-[#141414] text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-[#252525] transition-colors"
          >
            {t('common.gotIt')}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
