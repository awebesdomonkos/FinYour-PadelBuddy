import React from 'react';
import { User as UserIcon, MapPin, Heart, ChevronRight } from 'lucide-react';
import { User, LFGStatus } from '../types.ts';
import { useI18n } from '../hooks/useI18n.ts';

export default function PlayerCard({
  player,
  isFavorite,
  onToggleFavorite,
  onOpenProfile
}: {
  key?: string,
  player: User,
  isFavorite?: boolean,
  onToggleFavorite: () => void,
  onOpenProfile: (p: User) => void
}) {
  const { t } = useI18n(player.languagePreference || 'hu');
  const isOnline = player.lastActive && (new Date(player.lastActive) > new Date(Date.now() - 3600000));
  const isLfg = player.lfgStatus && player.lfgStatus !== LFGStatus.None;

  const levelColors: Record<string, string> = {
    Bronze: 'bg-orange-100 text-orange-700',
    Silver: 'bg-slate-100 text-slate-600',
    Gold:   'bg-yellow-100 text-yellow-700',
  };
  const reliabilityIcon = player.reliabilityStatus === 'Very Reliable' ? '🏆'
    : player.reliabilityStatus === 'Regularly Appears' ? '✅'
    : player.reliabilityStatus === 'Unreliable' ? '⚠️' : null;

  return (
    <div
      onClick={() => onOpenProfile(player)}
      className="bg-white rounded-3xl p-4 flex items-center gap-3 border border-[#141414]/5 shadow-sm hover:border-[#E2FF3B] hover:shadow-md transition-all cursor-pointer group"
    >
      {/* Avatar */}
      <div className="relative shrink-0">
        <div className="w-12 h-12 bg-[#141414] text-[#E2FF3B] rounded-2xl flex items-center justify-center overflow-hidden">
          {player.avatarUrl ? (
            <img src={player.avatarUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <UserIcon className="w-5 h-5" />
          )}
        </div>
        {isOnline && (
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
        )}
        {isLfg && !isOnline && (
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#E2FF3B] rounded-full border-2 border-white flex items-center justify-center">
            <span className="text-[6px]">🔥</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-1">
          <h3 className="font-black text-sm truncate">{player.name}</h3>
          {reliabilityIcon && <span className="text-[11px]">{reliabilityIcon}</span>}
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg ${levelColors[player.skillLevel] || 'bg-[#141414]/5 text-[#141414]/50'}`}>
            {t(`profile.levels.${player.skillLevel}`)}
          </span>
          {player.location?.city && (
            <span className="text-[10px] opacity-40 flex items-center gap-0.5 truncate">
              <MapPin className="w-2.5 h-2.5 shrink-0" /> {player.location.city}
            </span>
          )}
          {isLfg && (
            <span className="text-[9px] bg-[#E2FF3B]/30 text-[#141414] px-1.5 py-0.5 rounded-lg font-black uppercase tracking-widest whitespace-nowrap">
              {player.lfgStatus === LFGStatus.Now ? '🔥 Most' : '📅 Ma'}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}
          className={`p-2.5 rounded-xl transition-colors ${isFavorite ? 'text-red-500 bg-red-50' : 'bg-[#141414]/5 text-[#141414]/30 hover:text-red-500 hover:bg-red-50'}`}
        >
          <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
        </button>
        <button className="p-2.5 rounded-xl bg-[#141414]/5 hover:bg-[#E2FF3B] transition-colors">
          <ChevronRight className="w-4 h-4 opacity-40" />
        </button>
      </div>
    </div>
  );
}
