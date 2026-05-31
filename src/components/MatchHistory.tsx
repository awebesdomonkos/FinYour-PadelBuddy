import React from 'react';
import { History, CheckCircle2, User as UserIcon, Trash2 } from 'lucide-react';
import { Game } from '../types.ts';
import { useI18n } from '../hooks/useI18n.ts';

export default function MatchHistory({ games = [], userId = '', onGameClick, onDeleteGame }: { games: Game[], userId?: string, onGameClick?: (game: Game) => void, onDeleteGame?: (gameId: string) => void }) {
  const { t, lang } = useI18n('hu');
  const completedGames = (games || []).filter(g => {
    const dt = g.datetime || g.date;
    const isPast = dt ? new Date(dt).getTime() < Date.now() : false;
    return g.isCompleted || g.status === 'played' || (isPast && (g.joinedPlayers || []).includes(userId));
  }).sort((a, b) => { const da = a.datetime || a.date || ''; const db2 = b.datetime || b.date || ''; return new Date(db2).getTime() - new Date(da).getTime(); });

  if (completedGames.length === 0) {
    return (
      <div className="py-8 text-center opacity-30">
        <History className="w-8 h-8 mx-auto mb-2" />
        <p className="text-xs font-black uppercase tracking-widest">{t('profile.noMatchHistory') || 'Nincs meccselőzmény'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {completedGames.map(game => (
        <div key={game.id} className="bg-[#1A2233] p-4 rounded-2xl border border-[#FFFFFF]/6 flex items-center gap-3 transition-all hover:border-[#00E676]/30 hover:shadow-sm">
          <div onClick={() => onGameClick?.(game)} className={`flex-1 flex items-center gap-3 min-w-0 ${onGameClick ? 'cursor-pointer' : ''}`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${game.status === 'played' ? 'bg-[#00E676]/10 text-[#141414]' : 'bg-red-50/50 text-red-500'}`}>
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-xs font-black uppercase tracking-widest opacity-40">
                    {game.datetime || game.date ? new Date(game.datetime || game.date).toLocaleDateString('hu-HU') : '-'}
                  </p>
                  <span className="text-[10px] px-2 py-0.5 bg-[#FFFFFF]/5 rounded-full font-bold opacity-60 capitalize">
                    {game.gameType ? t(`games.gameTypes.${game.gameType}`) : t('games.gameTypes.Friendly')}
                  </span>
                </div>
                <h4 className="font-bold text-sm truncate max-w-[150px]">{game.location}</h4>
                <p className="text-[10px] font-bold text-[#080B0F] bg-[#141414] inline-block px-1.5 rounded mt-1">
                  {game.result?.score || (lang === 'hu' ? 'Nincs eredmény' : 'Nincs rögzített eredmény')}
                </p>
              </div>
            </div>
          </div>
          <div className="flex -space-x-1.5 translate-x-1">
            {(game.joinedPlayers || []).slice(0, 3).map((pid, i) => (
              <div key={i} className="w-6 h-6 rounded-full border border-white bg-[#161D26] overflow-hidden ring-1 ring-black/5">
                <UserIcon className="w-3 h-3 m-auto mt-1.5 opacity-20" />
              </div>
            ))}
            {(game.joinedPlayers || []).length > 3 && (
              <div className="w-6 h-6 rounded-full border border-white bg-[#141414] flex items-center justify-center text-[8px] font-bold text-white ring-1 ring-black/5">
                +{(game.joinedPlayers || []).length - 3}
              </div>
            )}
          </div>
          {onDeleteGame && (
            <button
              onClick={(e) => { e.stopPropagation(); if(window.confirm('Biztosan törlöd ezt a meccset?')) onDeleteGame(game.id); }}
              className="ml-1 p-2 text-[#141414]/20 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors shrink-0"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
