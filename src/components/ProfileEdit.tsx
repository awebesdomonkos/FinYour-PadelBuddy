import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  X, MapPin, Award, Image as ImageIcon, Upload, Target, Heart,
  AlertCircle, Shield, Instagram, Facebook, Smartphone, Plus, Loader2
} from 'lucide-react';
import { User, SkillLevel, LFGStatus, PlayTime, PadelExperience, Language } from '../types.ts';
import { useI18n } from '../hooks/useI18n.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { supabase } from '../lib/supabase.ts';

export default function ProfileEdit({ user, onSave, onCancel, onShowTutorial }: { user: User, onSave: (data: Partial<User>) => void, onCancel: () => void, onShowTutorial?: () => void }) {
  const { t, lang } = useI18n(user?.languagePreference || 'hu');
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    skillLevel: user?.skillLevel || 'Bronze',
    city: user?.location?.city || '',
    bio: user?.bio || '',
    avatarUrl: user?.avatarUrl || '',
    interests: [...(user?.interests || [])],
    favoriteClubs: [...(user?.favoriteClubs || [])],
    lfgStatus: user?.lfgStatus || LFGStatus.None,
    playStyle: user?.playStyle || 'Casual',
    playTime: [...(user?.playTime || [])],
    experience: user?.experience || PadelExperience.Less6Months,
    languages: [...(user?.languages || [])],
    languagePreference: user?.languagePreference || 'hu',
    socialLinks: { ...(user?.socialLinks || {}) },
    privacySettings: user?.privacySettings || { publicProfile: true, showMatchHistory: true, showSocialLinks: true },
    notifications: user?.notificationSettings || {
      nearGames: true,
      reminders: true,
      groups: true,
      lastMinute: true
    }
  });

  const [newClub, setNewClub] = useState('');
  const [customInterest, setCustomInterest] = useState('');
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);

  const PREDEFINED_INTERESTS = ['Competitive', 'Social Padel', 'Morning Matches', 'Evening Matches', 'Mixed Matches', 'Tournaments', 'Coaching'];

  const onDrop = React.useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file || !currentUser) return;

    if (file.size > 2 * 1024 * 1024) {
      setAvatarError(lang === 'hu' ? 'A fájl max 2MB lehet.' : 'File must be under 2MB.');
      return;
    }

    setAvatarUploading(true);
    setAvatarError(null);
    try {
      const ext = file.name.split('.').pop() || 'jpg';
      const path = `${currentUser.id}/avatar.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true, contentType: file.type });
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from('avatars').getPublicUrl(path);
      // Append cache-buster so browser refreshes the image
      const publicUrl = data.publicUrl + '?t=' + Date.now();
      setFormData(prev => ({ ...prev, avatarUrl: publicUrl }));
    } catch (err: any) {
      setAvatarError(err.message || 'Upload failed');
    } finally {
      setAvatarUploading(false);
    }
  }, [currentUser, lang]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/jpeg': [], 'image/png': [], 'image/webp': [] },
    multiple: false,
    maxSize: 2 * 1024 * 1024,
  } as any);

  const toggleInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const togglePlayTime = (time: PlayTime) => {
    setFormData(prev => ({
      ...prev,
      playTime: prev.playTime.includes(time)
        ? prev.playTime.filter(t => t !== time)
        : [...prev.playTime, time]
    }));
  };

  const addCustomInterest = () => {
    if (customInterest.trim() && !formData.interests.includes(customInterest.trim())) {
      setFormData(prev => ({
        ...prev,
        interests: [...prev.interests, customInterest.trim()]
      }));
      setCustomInterest('');
    }
  };

  const addClub = () => {
    if (newClub.trim() && !formData.favoriteClubs.includes(newClub.trim())) {
      setFormData(prev => ({
        ...prev,
        favoriteClubs: [...prev.favoriteClubs, newClub.trim()]
      }));
      setNewClub('');
    }
  };

  const removeClub = (club: string) => {
    setFormData(prev => ({
      ...prev,
      favoriteClubs: prev.favoriteClubs.filter(c => c !== club)
    }));
  };

  const handleSave = () => {
    onSave({
      name: formData.name,
      skillLevel: formData.skillLevel,
      location: { ...user.location, city: formData.city },
      bio: formData.bio,
      avatarUrl: formData.avatarUrl,
      interests: formData.interests,
      favoriteClubs: formData.favoriteClubs,
      lfgStatus: formData.lfgStatus,
      playStyle: formData.playStyle,
      playTime: formData.playTime,
      notificationSettings: formData.notifications,
      experience: formData.experience,
      languagePreference: formData.languagePreference,
      languages: formData.languages,
      socialLinks: formData.socialLinks,
      privacySettings: formData.privacySettings
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black uppercase italic tracking-tighter">{t('profile.editTitle')}</h2>
        <button onClick={onCancel} className="p-2 hover:bg-[#141414]/5 rounded-xl transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#141414]/5 space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest opacity-40">@{t('auth.usernameLabel')}</label>
            <input
              type="text"
              disabled
              value={user.username || ''}
              className="w-full bg-[#141414]/5 border-none rounded-2xl py-4 px-6 text-sm outline-none font-bold text-[#141414]/30"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest opacity-40">{t('profile.avatar')}</label>
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-[#141414] rounded-2xl flex items-center justify-center shrink-0 overflow-hidden border-2 border-white shadow-md">
                {formData.avatarUrl ? (
                  <img src={formData.avatarUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-8 h-8 text-[#E2FF3B]/40" />
                )}
              </div>

              <div {...getRootProps()} className={`flex-1 border-2 border-dashed rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors ${avatarUploading ? 'opacity-50 pointer-events-none' : ''} ${isDragActive ? 'border-[#E2FF3B] bg-[#E2FF3B]/5' : 'border-[#141414]/10 hover:border-[#141414]/20'}`}>
                <input {...getInputProps()} />
                {avatarUploading ? (
                  <Loader2 className="w-5 h-5 animate-spin opacity-40" />
                ) : (
                  <>
                    <Upload className="w-4 h-4 mb-2 opacity-40" />
                    <p className="text-[10px] font-bold uppercase tracking-wider opacity-40 text-center">
                      {isDragActive ? (lang === 'hu' ? 'Engedd el!' : 'Drop it!') : (lang === 'hu' ? 'Kattints vagy húzd ide' : 'Click or drop here')}
                    </p>
                    <p className="text-[9px] opacity-30 mt-1">JPG, PNG, WebP · max 2 MB</p>
                  </>
                )}
              </div>
            </div>
            {avatarError && (
              <p className="text-[10px] font-bold text-red-500">{avatarError}</p>
            )}
            {formData.avatarUrl && (
              <button
                onClick={() => setFormData({ ...formData, avatarUrl: '' })}
                className="text-[10px] font-bold text-red-500 uppercase tracking-widest hover:underline"
              >
                {t('common.delete')} kép
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest opacity-40">{t('groups.name')}</label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-[#141414]/5 border-none rounded-xl py-3 px-4 text-sm font-bold focus:ring-1 focus:ring-[#E2FF3B] outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest opacity-40">{t('profile.location')}</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 opacity-30" />
                <input
                  type="text"
                  list="hu-cities"
                  value={formData.city}
                  onChange={e => setFormData({ ...formData, city: e.target.value })}
                  placeholder={t('profile.locationPlaceholder')}
                  className="w-full bg-[#141414]/5 border-none rounded-xl py-3 pl-8 pr-4 text-sm font-bold focus:ring-1 focus:ring-[#E2FF3B] outline-none"
                />
                <datalist id="hu-cities">
                  <option value="Budapest" />
                  <option value="Debrecen" />
                  <option value="Miskolc" />
                  <option value="Pécs" />
                  <option value="Győr" />
                  <option value="Nyíregyháza" />
                  <option value="Kecskemét" />
                  <option value="Székesfehérvár" />
                  <option value="Szombathely" />
                  <option value="Szolnok" />
                  <option value="Tatabánya" />
                  <option value="Kaposvár" />
                  <option value="Érd" />
                  <option value="Veszprém" />
                  <option value="Zalaegerszeg" />
                  <option value="Sopron" />
                  <option value="Eger" />
                  <option value="Dunakeszi" />
                  <option value="Gödöllő" />
                  <option value="Ózd" />
                  <option value="Nagykanizsa" />
                  <option value="Békéscsaba" />
                  <option value="Szeged" />
                  <option value="Dunaújváros" />
                  <option value="Szigetszentmiklós" />
                  <option value="Hódmezővásárhely" />
                  <option value="Budaörs" />
                  <option value="Cegléd" />
                  <option value="Baja" />
                  <option value="Pápa" />
                  <option value="Gyula" />
                  <option value="Mosonmagyaróvár" />
                  <option value="Esztergom" />
                  <option value="Vác" />
                  <option value="Ajka" />
                  <option value="Szekszárd" />
                  <option value="Kiskunfélegyháza" />
                  <option value="Orosháza" />
                  <option value="Hatvan" />
                  <option value="Gyöngyös" />
                  <option value="Komárom" />
                  <option value="Kazincbarcika" />
                  <option value="Salgótarján" />
                  <option value="Siófok" />
                  <option value="Paks" />
                  <option value="Várpalota" />
                  <option value="Celldömölk" />
                  <option value="Tapolca" />
                  <option value="Balatonalmádi" />
                </datalist>
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center px-1">
              <label className="text-[10px] font-bold uppercase tracking-widest opacity-40">{t('profile.skillLevel')}</label>
              <button
                type="button"
                onClick={onShowTutorial}
                className="p-1 hover:bg-[#141414]/5 rounded-lg transition-colors"
                title="Level Info"
              >
                <Award className="w-3.5 h-3.5 opacity-40" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {Object.values(SkillLevel).map(lvl => (
                <button
                  key={lvl}
                  onClick={() => setFormData({ ...formData, skillLevel: lvl })}
                  className={`py-2 rounded-lg text-[10px] font-black tracking-widest uppercase transition-all ${
                    formData.skillLevel === lvl
                    ? 'bg-[#141414] text-[#E2FF3B]'
                    : 'bg-[#141414]/5 text-[#141414]/30'
                  }`}
                >
                  {t(`profile.levels.${lvl}`)}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-widest opacity-40">{t('profile.bio')}</label>
            <textarea
              value={formData.bio}
              onChange={e => setFormData({ ...formData, bio: e.target.value })}
              className="w-full bg-[#141414]/5 border-none rounded-xl py-3 px-4 text-sm focus:ring-1 focus:ring-[#E2FF3B] outline-none min-h-[80px]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest opacity-40">{t('profile.status')}</label>
              <select
                value={formData.lfgStatus}
                onChange={e => setFormData({ ...formData, lfgStatus: e.target.value as LFGStatus })}
                className="w-full bg-[#141414]/5 border-none rounded-xl py-3 px-4 text-xs font-bold focus:ring-1 focus:ring-[#E2FF3B] outline-none appearance-none"
              >
                {Object.values(LFGStatus).map(s => <option key={s} value={s}>{t(`profile.lfg.${s}`)}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest opacity-40">{t('profile.playStyle')}</label>
              <div className="flex gap-1">
                {(['Casual', 'Competitive'] as const).map(s => (
                  <button
                    key={s}
                    onClick={() => setFormData({ ...formData, playStyle: s })}
                    className={`flex-1 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                      formData.playStyle === s ? 'bg-[#141414] text-[#E2FF3B]' : 'bg-[#141414]/5 text-[#141414]/40'
                    }`}
                  >
                    {t(`profile.playStyles.${s}`)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-widest opacity-40">{t('profile.appLanguage')}</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { code: 'hu', label: 'Magyar' },
                { code: 'en', label: 'English' }
              ].map(langOption => (
                <button
                  key={langOption.code}
                  onClick={() => setFormData({ ...formData, languagePreference: langOption.code as Language })}
                  className={`py-2 rounded-lg text-[10px] font-black tracking-widest uppercase transition-all ${
                    formData.languagePreference === langOption.code
                    ? 'bg-[#141414] text-[#E2FF3B]'
                    : 'bg-[#141414]/5 text-[#141414]/30'
                  }`}
                >
                  {langOption.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-widest opacity-40">{t('profile.padelExperience')}</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {Object.values(PadelExperience).map(exp => (
                <button
                  key={exp}
                  onClick={() => setFormData({ ...formData, experience: exp })}
                  className={`py-2 rounded-lg text-[10px] font-black tracking-widest uppercase transition-all ${
                    formData.experience === exp
                    ? 'bg-[#141414] text-[#E2FF3B]'
                    : 'bg-[#141414]/5 text-[#141414]/30'
                  }`}
                >
                  {t(`profile.experienceLevels.${exp}`) || exp}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-widest opacity-40">{t('profile.languages')}</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {['Hungarian', 'English'].map(lang_val => (
                <button
                  key={lang_val}
                  onClick={() => {
                    const next = formData.languages.includes(lang_val)
                      ? formData.languages.filter((l: string) => l !== lang_val)
                      : [...formData.languages, lang_val];
                    setFormData({ ...formData, languages: next });
                  }}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all border ${
                    formData.languages.includes(lang_val)
                      ? 'bg-white border-[#141414] text-[#141414]'
                      : 'bg-transparent border-[#141414]/10 text-[#141414]/40'
                  }`}
                >
                  {t(`profile.languageList.${lang_val}`) || lang_val}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-[#141414]/5">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 opacity-40" />
              <h3 className="text-xs font-bold uppercase tracking-widest opacity-40">{t('profile.socialLinks')}</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3 bg-[#141414]/5 rounded-xl px-3 group focus-within:ring-1 focus-within:ring-[#E2FF3B]">
                <Instagram className="w-4 h-4 opacity-30" />
                <input
                  type="text"
                  placeholder={t('profile.instagramPlaceholder') || 'Instagram felhasználónév'}
                  value={formData.socialLinks.instagram || ''}
                  onChange={e => setFormData({ ...formData, socialLinks: { ...formData.socialLinks, instagram: e.target.value } })}
                  className="flex-1 bg-transparent border-none py-3 text-xs font-bold outline-none"
                />
              </div>
              <div className="flex items-center gap-3 bg-[#141414]/5 rounded-xl px-3 group focus-within:ring-1 focus-within:ring-[#E2FF3B]">
                <Facebook className="w-4 h-4 opacity-30" />
                <input
                  type="text"
                  placeholder={t('profile.facebookPlaceholder') || 'Facebook profil vagy név'}
                  value={formData.socialLinks.facebook || ''}
                  onChange={e => setFormData({ ...formData, socialLinks: { ...formData.socialLinks, facebook: e.target.value } })}
                  className="flex-1 bg-transparent border-none py-3 text-xs font-bold outline-none"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-[#141414]/5">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 opacity-40" />
              <h3 className="text-xs font-bold uppercase tracking-widest opacity-40">{t('profile.privacy')}</h3>
            </div>
            <div className="space-y-3">
              {[
                { id: 'publicProfile', label: t('profile.publicProfile') },
                { id: 'showMatchHistory', label: t('profile.showMatchHistory') },
                { id: 'showSocialLinks', label: t('profile.showSocialLinks') }
              ].map(item => (
                <label key={item.id} className="flex items-center justify-between cursor-pointer group">
                  <span className="text-sm font-medium opacity-60 group-hover:opacity-100 transition-opacity">{item.label}</span>
                  <input
                    type="checkbox"
                    checked={formData.privacySettings[item.id as keyof typeof formData.privacySettings]}
                    onChange={e => setFormData({
                      ...formData,
                      privacySettings: { ...formData.privacySettings, [item.id]: e.target.checked }
                    })}
                    className="w-5 h-5 accent-[#E2FF3B] rounded-lg"
                  />
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-widest opacity-40">{t('profile.playTimes')}</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {Object.values(PlayTime).map(t_val => (
                <button
                  key={t_val}
                  onClick={() => togglePlayTime(t_val)}
                  className={`py-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                    formData.playTime.includes(t_val) ? 'bg-[#141414] text-[#E2FF3B]' : 'bg-[#141414]/5 text-[#141414]/30'
                  }`}
                >
                  {t(`profile.playTimesList.${t_val}`) || t_val}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Interests */}
        <div className="space-y-4 pt-4 border-t border-[#141414]/5">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 opacity-40" />
            <h3 className="text-xs font-bold uppercase tracking-widest opacity-40">{t('profile.interests')}</h3>
          </div>

          <div className="flex flex-wrap gap-2">
            {PREDEFINED_INTERESTS.map(interest => (
              <button
                key={interest}
                onClick={() => toggleInterest(interest)}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all ${
                  formData.interests.includes(interest)
                  ? 'bg-[#E2FF3B] text-[#141414]'
                  : 'bg-[#141414]/5 text-[#141414]/50 hover:bg-[#141414]/10'
                }`}
              >
                {t(`profile.interestsList.${interest}`) || interest}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder={t('profile.addInterest')}
              value={customInterest}
              onChange={e => setCustomInterest(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && addCustomInterest()}
              className="flex-1 bg-[#141414]/5 border-none rounded-xl py-3 px-4 text-xs focus:ring-1 focus:ring-[#E2FF3B] outline-none"
            />
            <button
              onClick={addCustomInterest}
              className="p-3 bg-[#141414] text-[#E2FF3B] rounded-xl"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {formData.interests.filter((i: string) => !PREDEFINED_INTERESTS.includes(i)).length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {formData.interests.filter((i: string) => !PREDEFINED_INTERESTS.includes(i)).map((interest: string) => (
                <span key={interest} className="flex items-center gap-1 px-3 py-1.5 bg-[#141414] text-white rounded-xl text-[10px] font-bold uppercase tracking-wider">
                  {interest}
                  <X
                    className="w-3 h-3 ml-1 cursor-pointer hover:text-[#E2FF3B]"
                    onClick={() => toggleInterest(interest)}
                  />
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Clubs */}
        <div className="space-y-4 pt-4 border-t border-[#141414]/5">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 opacity-40" />
            <h3 className="text-xs font-bold uppercase tracking-widest opacity-40">{t('profile.favoriteClubs')}</h3>
          </div>

          <div className="space-y-3">
            {formData.favoriteClubs.map((club: string) => (
              <div key={club} className="flex items-center justify-between bg-[#141414]/5 rounded-xl py-3 px-4">
                <span className="text-sm font-medium">{club}</span>
                <X className="w-4 h-4 opacity-30 cursor-pointer hover:text-red-500" onClick={() => removeClub(club)} />
              </div>
            ))}

            <div className="flex gap-2">
              <input
                type="text"
                placeholder={t('profile.addClub')}
                value={newClub}
                onChange={e => setNewClub(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && addClub()}
                className="flex-1 bg-[#141414]/5 border-none rounded-xl py-3 px-4 text-xs focus:ring-1 focus:ring-[#E2FF3B] outline-none"
              />
              <button
                onClick={addClub}
                className="p-3 bg-[#141414] text-[#E2FF3B] rounded-xl"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="space-y-4 pt-4 border-t border-[#141414]/5">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 opacity-40" />
            <h3 className="text-xs font-bold uppercase tracking-widest opacity-40">{t('profile.notifications')}</h3>
          </div>

          <div className="space-y-3">
            {[
              { id: 'nearGames', label: t('notifications.nearbyGames') },
              { id: 'reminders', label: t('notifications.reminders') },
              { id: 'groups', label: t('notifications.groupUpdates') },
              { id: 'lastMinute', label: t('notifications.lastMinute') }
            ].map(pref => (
              <label key={pref.id} className="flex items-center justify-between cursor-pointer group">
                <span className="text-sm font-medium opacity-60 group-hover:opacity-100 transition-opacity">{pref.label}</span>
                <input
                  type="checkbox"
                  checked={formData.notifications[pref.id as keyof typeof formData.notifications]}
                  onChange={e => setFormData({
                    ...formData,
                    notifications: { ...formData.notifications, [pref.id]: e.target.checked }
                  })}
                  className="w-5 h-5 accent-[#E2FF3B] rounded-lg cursor-pointer"
                />
              </label>
            ))}
          </div>
        </div>

        <div className="pt-6 border-t border-[#141414]/5 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-4 bg-[#141414]/5 text-[#141414] rounded-2xl font-bold text-sm hover:bg-[#141414]/10 transition-colors"
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={handleSave}
            className="flex-2 py-4 bg-[#141414] text-[#E2FF3B] rounded-2xl font-black uppercase tracking-widest text-sm hover:shadow-xl transition-all"
          >
            {t('common.save')}
          </button>
        </div>
      </div>
    </div>
  );
}
