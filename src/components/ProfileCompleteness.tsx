import React from 'react';
import { ChevronDown } from 'lucide-react';
import { User, LFGStatus } from '../types.ts';

export function getProfileCompleteness(user: User, friendCount: number) {
  const items: { key: string; label: string; icon: string; weight: number; done: boolean; action: string }[] = [
    { key: 'avatar',    label: 'Profilkép',          icon: '📸', weight: 15, done: !!user.avatarUrl,                        action: 'edit' },
    { key: 'bio',       label: 'Bemutatkozó',         icon: '✍️',  weight: 15, done: !!(user.bio && user.bio.length > 5),     action: 'edit' },
    { key: 'city',      label: 'Városod',             icon: '📍', weight: 15, done: !!(user.location?.city),                 action: 'edit' },
    { key: 'playstyle', label: 'Játékstílus',         icon: '🎯', weight: 10, done: !!user.playStyle,                        action: 'edit' },
    { key: 'playtime',  label: 'Preferált időpontok', icon: '🕐', weight: 10, done: !!(user.playTime && user.playTime.length > 0), action: 'edit' },
    { key: 'exp',       label: 'Tapasztalat',         icon: '📊', weight: 10, done: !!user.experience,                       action: 'edit' },
    { key: 'interests', label: 'Érdeklődési körök',   icon: '🏷️',  weight: 10, done: !!(user.interests && user.interests.length > 0), action: 'edit' },
    { key: 'friends',   label: 'Első barátod',        icon: '👥', weight: 10, done: friendCount > 0,                         action: 'players' },
    { key: 'lfg',       label: 'LFG státusz',         icon: '🔥', weight: 5,  done: !!(user.lfgStatus && user.lfgStatus !== 'None'), action: 'edit' },
  ];
  const score = items.filter(i => i.done).reduce((acc, i) => acc + i.weight, 0);
  const missing = items.filter(i => !i.done);
  return { score, missing, items };
}

export default function ProfileCompleteness({
  user,
  friendCount,
  onEdit,
  onNavigate,
  lang
}: {
  user: User;
  friendCount: number;
  onEdit: () => void;
  onNavigate: (tab: string) => void;
  lang: string;
}) {
  const { score, missing } = getProfileCompleteness(user, friendCount);
  const [expanded, setExpanded] = React.useState(false);

  if (score === 100) {
    return (
      <div className="flex items-center gap-2 px-4 py-2.5 bg-green-50 border border-green-200 rounded-2xl">
        <span className="text-lg">🏆</span>
        <p className="text-xs font-black uppercase tracking-widest text-green-700">
          {lang === 'hu' ? 'Teljes profil — Szuper!' : 'Complete profile — Great!'}
        </p>
      </div>
    );
  }

  const color = score >= 80 ? 'bg-green-500' : score >= 50 ? 'bg-[#E2FF3B]' : 'bg-orange-400';
  const textColor = score >= 80 ? 'text-green-700' : score >= 50 ? 'text-[#141414]' : 'text-orange-700';
  const bgColor = score >= 80 ? 'bg-green-50 border-green-200' : score >= 50 ? 'bg-[#E2FF3B]/10 border-[#E2FF3B]/40' : 'bg-orange-50 border-orange-200';
  const label = score >= 80
    ? (lang === 'hu' ? 'Szinte teljes! ✨' : 'Almost there! ✨')
    : score >= 50
    ? (lang === 'hu' ? 'Jó úton jársz! 👍' : 'Good progress! 👍')
    : (lang === 'hu' ? 'Töltsd ki a profilod! 🎾' : 'Complete your profile! 🎾');

  return (
    <div className={`rounded-2xl border p-4 space-y-3 ${bgColor}`}>
      {/* Header */}
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <span className={`text-sm font-black ${textColor}`}>
            {lang === 'hu' ? `Profilod ${score}% teljes` : `Profile ${score}% complete`}
          </span>
          <span className="text-[10px] opacity-60">{label}</span>
        </div>
        <ChevronDown className={`w-4 h-4 opacity-40 transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </button>

      {/* Progress bar */}
      <div className="w-full h-2 bg-[#141414]/10 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: score + '%' }}
        />
      </div>

      {/* Missing items - only show when expanded */}
      {expanded && missing.length > 0 && (
        <div className="space-y-2 pt-1">
          <p className="text-[10px] font-black uppercase tracking-widest opacity-40">
            {lang === 'hu' ? 'Hiányzik még:' : 'Still missing:'}
          </p>
          <div className="flex flex-wrap gap-2">
            {missing.map(item => (
              <button
                key={item.key}
                onClick={() => item.action === 'edit' ? onEdit() : onNavigate(item.action)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-xl border border-[#141414]/10 hover:border-[#141414]/30 transition-colors group"
              >
                <span className="text-sm">{item.icon}</span>
                <span className="text-[10px] font-bold">{item.label}</span>
                <span className="text-[10px] opacity-30 group-hover:opacity-60 transition-opacity">→</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
