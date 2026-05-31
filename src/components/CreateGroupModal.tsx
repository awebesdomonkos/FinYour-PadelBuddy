import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X } from 'lucide-react';
import { Group, User, SkillLevel } from '../types.ts';
import { useI18n } from '../hooks/useI18n.ts';

export default function CreateGroupModal({
  currentUser,
  onClose,
  onSave
}: {
  currentUser: User,
  onClose: () => void,
  onSave: (data: Partial<Group>) => void
}) {
  const { t } = useI18n(currentUser.languagePreference || 'hu');
  const [formData, setFormData] = useState<Partial<Group>>({
    name: '',
    description: '',
    city: currentUser.location?.city || '',
    recommendedLevel: SkillLevel.Bronze,
    visibility: 'public'
  });

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
        className="relative w-full max-w-md bg-[#F5F5F0] rounded-[40px] p-8 shadow-2xl overflow-hidden"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black uppercase italic tracking-tighter">{t('groups.createGroup')}</h2>
          <button onClick={onClose} className="p-2 hover:bg-[#141414]/5 rounded-xl"><X className="w-5 h-5" /></button>
        </div>

        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-widest opacity-40">{t('groups.name')}</label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-[#141414]/5 border-none rounded-xl py-3 px-4 text-sm font-bold focus:ring-1 focus:ring-[#E2FF3B] outline-none"
              placeholder={t('groups.namePlaceholder')}
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-widest opacity-40">{t('groups.description')}</label>
            <textarea
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-[#141414]/5 border-none rounded-xl py-3 px-4 text-sm focus:ring-1 focus:ring-[#E2FF3B] outline-none min-h-[80px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest opacity-40">{t('groups.location')}</label>
              <input
                type="text"
                list="hu-cities-group"
                value={formData.city}
                onChange={e => setFormData({ ...formData, city: e.target.value })}
                placeholder={t('profile.locationPlaceholder')}
                className="w-full bg-[#141414]/5 border-none rounded-xl py-3 px-4 text-sm font-bold focus:ring-1 focus:ring-[#E2FF3B] outline-none"
              />
              <datalist id="hu-cities-group">
                {["Budapest","Debrecen","Miskolc","Pécs","Győr","Nyíregyháza","Kecskemét","Székesfehérvár","Szombathely","Szolnok","Tatabánya","Kaposvár","Érd","Veszprém","Zalaegerszeg","Sopron","Eger","Szeged","Dunakeszi","Nagykanizsa","Békéscsaba","Dunaújváros","Gyula","Mosonmagyaróvár","Esztergom","Vác","Siófok","Paks"].map(c => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest opacity-40">{t('groups.recommendedLevel')}</label>
              <select
                value={formData.recommendedLevel}
                onChange={e => setFormData({ ...formData, recommendedLevel: e.target.value as SkillLevel })}
                className="w-full bg-[#141414]/5 border-none rounded-xl py-3 px-4 text-xs font-bold focus:ring-1 focus:ring-[#E2FF3B] outline-none appearance-none"
              >
                {Object.values(SkillLevel).map(lvl => <option key={lvl} value={lvl}>{t(`profile.levels.${lvl}`)}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-widest opacity-40">{t('groups.visibility')}</label>
            <div className="flex gap-2">
              {(['public', 'private'] as const).map(v => (
                <button
                  key={v}
                  onClick={() => setFormData({ ...formData, visibility: v })}
                  className={`flex-1 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                    formData.visibility === v ? 'bg-[#141414] text-[#E2FF3B]' : 'bg-[#141414]/5 text-[#141414]/30'
                  }`}
                >
                  {v === 'public' ? t('games.public') : t('profile.privacy')}
                </button>
              ))}
            </div>
          </div>

          <button
            disabled={!formData.name}
            onClick={() => {
              onSave(formData);
              onClose();
            }}
            className="w-full py-4 bg-[#141414] text-[#E2FF3B] rounded-2xl font-black uppercase tracking-widest text-sm hover:shadow-xl transition-all mt-4 disabled:opacity-30"
          >
            {t('groups.createGroup')}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
