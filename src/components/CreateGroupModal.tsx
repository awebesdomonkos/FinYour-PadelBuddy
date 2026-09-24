import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X } from 'lucide-react';
import { Group, User, SkillLevel } from '../types.ts';
import { useI18n } from '../hooks/useI18n.ts';
import { useDialogA11y } from '../hooks/useDialogA11y.ts';

export default function CreateGroupModal({
  currentUser,
  onClose,
  onSave
}: {
  currentUser: User,
  onClose: () => void,
  onSave: (data: Partial<Group>) => Promise<void> | void
}) {
  const { t, lang } = useI18n(currentUser.languagePreference || 'hu');
  const [formData, setFormData] = useState<Partial<Group>>({
    name: '',
    description: '',
    city: currentUser.location?.city || '',
    recommendedLevel: SkillLevel.Bronze,
    visibility: 'private'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { dialogProps } = useDialogA11y(onClose);

  const handleSave = async () => {
    if (!formData.name?.trim() || isSubmitting) return;
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await onSave({ ...formData, name: formData.name.trim() });
      onClose();
    } catch {
      setSubmitError(t('common.saveError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} aria-hidden="true" className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
        {...dialogProps}
        aria-labelledby="create-group-title"
        className="relative w-full max-w-md max-h-[90vh] overflow-y-auto bg-[#F5F5F0] rounded-2xl sm:rounded-[40px] p-4 sm:p-8 shadow-2xl outline-none"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 id="create-group-title" className="text-2xl font-black uppercase italic tracking-tighter">{t('groups.createGroup')}</h2>
          <button onClick={onClose} aria-label={t('a11y.close')} className="p-2.5 hover:bg-[#141414]/5 rounded-xl"><X className="w-5 h-5" aria-hidden="true" /></button>
        </div>

        <div className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="cg-name" className="text-[10px] font-bold uppercase tracking-widest opacity-60">{t('groups.name')}</label>
            <input
              id="cg-name"
              data-autofocus
              maxLength={80}
              type="text"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-[#141414]/5 border-none rounded-xl py-3 px-4 text-sm font-bold focus:ring-1 focus:ring-[#E2FF3B] outline-none"
              placeholder={t('groups.namePlaceholder')}
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="cg-desc" className="text-[10px] font-bold uppercase tracking-widest opacity-60">{t('groups.description')}</label>
            <textarea
              id="cg-desc"
              maxLength={500}
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-[#141414]/5 border-none rounded-xl py-3 px-4 text-sm focus:ring-1 focus:ring-[#E2FF3B] outline-none min-h-[80px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label htmlFor="cg-city" className="text-[10px] font-bold uppercase tracking-widest opacity-60">{t('groups.location')}</label>
              <input
                id="cg-city"
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
              <label htmlFor="cg-level" className="text-[10px] font-bold uppercase tracking-widest opacity-60">{t('groups.recommendedLevel')}</label>
              <select
                id="cg-level"
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
                  type="button"
                  aria-pressed={formData.visibility === v}
                  onClick={() => setFormData({ ...formData, visibility: v })}
                  className={`flex-1 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                    formData.visibility === v ? 'bg-[#141414] text-[#E2FF3B]' : 'bg-[#141414]/5 text-[#141414]/60'
                  }`}
                >
                  {v === 'public' ? t('groups.public') : t('groups.private')}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            disabled={!formData.name?.trim() || isSubmitting}
            onClick={handleSave}
            className="w-full py-4 bg-[#141414] text-[#E2FF3B] rounded-2xl font-black uppercase tracking-widest text-sm hover:shadow-xl transition-all mt-4 disabled:opacity-30 flex items-center justify-center gap-2"
          >
            {isSubmitting
              ? <><div className="w-4 h-4 border-2 border-[#E2FF3B]/30 border-t-[#E2FF3B] rounded-full animate-spin" aria-hidden="true" />{t('common.saving')}</>
              : t('groups.createGroup')}
          </button>
          {submitError && <p role="alert" className="text-xs font-bold text-red-600 text-center">{submitError}</p>}
        </div>
      </motion.div>
    </div>
  );
}
