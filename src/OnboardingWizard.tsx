import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, MapPin, Check } from 'lucide-react';
import { User, SkillLevel, PlayTime } from './types';

const HU_CITIES = [
  'Budapest','Debrecen','Miskolc','Pécs','Győr','Nyíregyháza','Kecskemét',
  'Székesfehérvár','Szombathely','Szolnok','Tatabánya','Kaposvár','Érd',
  'Veszprém','Zalaegerszeg','Sopron','Eger','Szeged','Dunakeszi','Nagykanizsa',
  'Békéscsaba','Dunaújváros','Gyula','Mosonmagyaróvár','Esztergom','Vác',
  'Siófok','Paks','Hódmezővásárhely','Ajka','Gyöngyös','Hatvan','Ózd','Baja'
];

interface Props {
  user: User;
  step: number;
  setStep: (s: number) => void;
  onComplete: (data: Partial<User>) => void;
  onSkip: () => void;
  onLogout: () => void;
  t: (k: string) => string;
  toastMsg: string | null;
}

export function OnboardingWizard({ user, step, setStep, onComplete, onSkip, onLogout, toastMsg }: Props) {
  const [form, setForm] = React.useState({
    skillLevel: user.skillLevel || SkillLevel.Bronze,
    experience: user.experience || ('' as any),
    city: user.location?.city || '',
    playTime: user.playTime || ([] as PlayTime[]),
    playStyle: user.playStyle || ('' as any),
  });

  const TOTAL = 3;

  const levelData = [
    { level: SkillLevel.Bronze, emoji: '🟤', label: 'Bronz', desc: 'Kezdő – ismerkedem az alapokkal' },
    { level: SkillLevel.Silver, emoji: '⚪', label: 'Ezüst', desc: 'Középhaladó – stabil játékstílus' },
    { level: SkillLevel.Gold,   emoji: '🟡', label: 'Arany', desc: 'Haladó – magas technikai szint' },
  ];

  const playTimeData = [
    { val: PlayTime.Morning, emoji: '🌅', label: 'Reggel',  sub: '6:00 – 11:00'  },
    { val: PlayTime.Day,     emoji: '☀️',  label: 'Délután', sub: '11:00 – 17:00' },
    { val: PlayTime.Evening, emoji: '🌙', label: 'Este',    sub: '17:00 – 22:00' },
  ];

  const playStyles = [
    { val: 'Casual',      emoji: '😊', label: 'Alkalmi',    desc: 'Szórakozásból játszom' },
    { val: 'Competitive', emoji: '🔥', label: 'Versenyző',  desc: 'Mindig nyerni akarok' },
    { val: 'Technical',   emoji: '🎯', label: 'Technikai',  desc: 'A pontosság a fontos' },
    { val: 'Power',       emoji: '💪', label: 'Erőjátékos', desc: 'Kemény ütések, erős játék' },
  ];

  const togglePlayTime = (pt: PlayTime) => {
    setForm(f => ({
      ...f,
      playTime: f.playTime.includes(pt)
        ? f.playTime.filter(x => x !== pt)
        : [...f.playTime, pt],
    }));
  };

  const canNext = () => {
    if (step === 1) return !!form.skillLevel;
    if (step === 2) return form.city.trim().length >= 2;
    if (step === 3) return form.playTime.length > 0;
    return true;
  };

  const handleNext = () => {
    if (step < TOTAL) { setStep(step + 1); return; }
    onComplete({
      skillLevel: form.skillLevel,
      experience: form.experience || undefined,
      location: { ...(user.location || { lat: 0, lng: 0 }), city: form.city },
      playTime: form.playTime,
      playStyle: form.playStyle || undefined,
      bio: user.bio || '',
    });
  };

  const expLabels: Record<string, string> = {
    'Less than 6 months': '< 6 hónap',
    '6-12 months': '6–12 hónap',
    '1-2 years': '1–2 év',
    '2+ years': '2+ év',
  };

  return (
    <div className="min-h-screen bg-[#141414] flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 pt-10 pb-4">
        <button onClick={onLogout} className="text-white/30 hover:text-white/60 transition-colors p-2">
          <LogOut className="w-4 h-4" />
        </button>
        <div className="flex gap-2 items-center">
          {Array.from({ length: TOTAL }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                i < step ? 'bg-[#E2FF3B] w-8' : 'bg-white/15 w-4'
              }`}
            />
          ))}
        </div>
        <button
          onClick={onSkip}
          className="text-white/30 hover:text-white/60 text-[11px] font-black uppercase tracking-widest transition-colors"
        >
          Kihagyás
        </button>
      </div>

      {/* Step counter */}
      <div className="px-6 pb-1">
        <p className="text-white/25 text-[10px] font-black uppercase tracking-[0.3em]">
          {step} / {TOTAL}
        </p>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-6 pb-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 32 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -32 }}
            transition={{ duration: 0.22 }}
          >

            {/* ── STEP 1: Skill level ── */}
            {step === 1 && (
              <div>
                <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter leading-none mb-2 mt-4">
                  Mi a<br />szinted?
                </h1>
                <p className="text-white/40 text-sm mb-8">
                  Őszintén válaszolj — így találhatsz hasonló szintű partnereket
                </p>

                <div className="space-y-3 mb-8">
                  {levelData.map(l => (
                    <button
                      key={l.level}
                      onClick={() => setForm(f => ({ ...f, skillLevel: l.level }))}
                      className={`w-full p-5 rounded-2xl border-2 text-left transition-all ${
                        form.skillLevel === l.level
                          ? 'bg-[#E2FF3B] border-[#E2FF3B] text-[#141414] scale-[1.02]'
                          : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-3xl">{l.emoji}</span>
                        <div className="flex-1">
                          <p className="font-black text-lg uppercase tracking-tight">{l.label}</p>
                          <p className={`text-sm font-medium ${
                            form.skillLevel === l.level ? 'text-[#141414]/60' : 'text-white/40'
                          }`}>{l.desc}</p>
                        </div>
                        {form.skillLevel === l.level && (
                          <div className="w-6 h-6 bg-[#141414] rounded-full flex items-center justify-center shrink-0">
                            <Check className="w-3.5 h-3.5 text-[#E2FF3B]" />
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                <div>
                  <p className="text-white/30 text-[10px] font-black uppercase tracking-widest mb-3">
                    Mennyi tapasztalatod van?
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(expLabels).map(([val, label]) => (
                      <button
                        key={val}
                        onClick={() => setForm(f => ({ ...f, experience: val as any }))}
                        className={`py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all border ${
                          form.experience === val
                            ? 'bg-white text-[#141414] border-white'
                            : 'bg-white/5 text-white/40 border-white/10 hover:bg-white/10'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 2: City ── */}
            {step === 2 && (
              <div>
                <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter leading-none mb-2 mt-4">
                  Melyik<br />városban<br />játszol?
                </h1>
                <p className="text-white/40 text-sm mb-8">
                  Így tudunk közeli meccseket és játékosokat megmutatni
                </p>

                <div className="relative mb-6">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30 pointer-events-none" />
                  <input
                    type="text"
                    list="ob-cities"
                    value={form.city}
                    onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                    placeholder="pl. Budapest"
                    autoFocus
                    className="w-full bg-white/10 border-2 border-white/10 focus:border-[#E2FF3B] rounded-2xl py-5 pl-12 pr-4 text-white text-lg font-bold placeholder:text-white/20 outline-none transition-colors"
                  />
                  <datalist id="ob-cities">
                    {HU_CITIES.map(c => <option key={c} value={c} />)}
                  </datalist>
                </div>

                <div>
                  <p className="text-white/30 text-[10px] font-black uppercase tracking-widest mb-3">
                    Legnépszerűbb városok
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {['Budapest','Debrecen','Győr','Pécs','Miskolc','Szeged','Sopron','Veszprém'].map(c => (
                      <button
                        key={c}
                        onClick={() => setForm(f => ({ ...f, city: c }))}
                        className={`px-4 py-2 rounded-xl text-sm font-black uppercase tracking-wider transition-all ${
                          form.city === c
                            ? 'bg-[#E2FF3B] text-[#141414]'
                            : 'bg-white/10 text-white/60 hover:bg-white/20'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 3: Play time + Style ── */}
            {step === 3 && (
              <div>
                <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter leading-none mb-2 mt-4">
                  Mikor<br />érsz rá?
                </h1>
                <p className="text-white/40 text-sm mb-8">
                  Több időpontot is választhatsz — így jobban összepárosítunk
                </p>

                <div className="space-y-3 mb-8">
                  {playTimeData.map(pt => {
                    const sel = form.playTime.includes(pt.val);
                    return (
                      <button
                        key={pt.val}
                        onClick={() => togglePlayTime(pt.val)}
                        className={`w-full p-4 rounded-2xl border-2 text-left transition-all flex items-center gap-4 ${
                          sel
                            ? 'bg-[#E2FF3B] border-[#E2FF3B] text-[#141414] scale-[1.01]'
                            : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                        }`}
                      >
                        <span className="text-2xl">{pt.emoji}</span>
                        <div className="flex-1">
                          <p className="font-black text-base uppercase tracking-tight">{pt.label}</p>
                          <p className={`text-xs font-bold ${sel ? 'text-[#141414]/50' : 'text-white/30'}`}>{pt.sub}</p>
                        </div>
                        {sel && (
                          <div className="w-6 h-6 bg-[#141414] rounded-full flex items-center justify-center shrink-0">
                            <Check className="w-3.5 h-3.5 text-[#E2FF3B]" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                <div>
                  <p className="text-white/30 text-[10px] font-black uppercase tracking-widest mb-3">
                    Játékstílusod <span className="text-white/15">(opcionális)</span>
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {playStyles.map(ps => (
                      <button
                        key={ps.val}
                        onClick={() => setForm(f => ({
                          ...f,
                          playStyle: f.playStyle === ps.val ? '' as any : ps.val as any,
                        }))}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          form.playStyle === ps.val
                            ? 'bg-white text-[#141414] border-white'
                            : 'bg-white/5 text-white/50 border-white/10 hover:bg-white/10'
                        }`}
                      >
                        <span className="text-xl">{ps.emoji}</span>
                        <p className="font-black text-xs uppercase tracking-wider mt-1">{ps.label}</p>
                        <p className={`text-[10px] mt-0.5 ${
                          form.playStyle === ps.val ? 'text-[#141414]/50' : 'text-white/25'
                        }`}>{ps.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>

      {/* CTA Button */}
      <div className="px-6 pb-10 pt-4">
        <button
          onClick={handleNext}
          disabled={!canNext()}
          className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest text-base transition-all ${
            canNext()
              ? 'bg-[#E2FF3B] text-[#141414] hover:scale-[1.02] active:scale-95 shadow-xl shadow-[#E2FF3B]/20'
              : 'bg-white/10 text-white/20 cursor-not-allowed'
          }`}
        >
          {step === TOTAL ? '🎾  Belépés a pályára!' : 'Tovább →'}
        </button>
      </div>

      {toastMsg && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-white text-[#141414] text-sm font-bold px-6 py-3 rounded-2xl shadow-xl whitespace-nowrap">
          {toastMsg}
        </div>
      )}
    </div>
  );
}
