import React from 'react';
import {
  User as UserIcon,
  TrendingUp,
  Plus,
  MessageSquare,
  Share2,
  Edit2,
  X,
  ShieldCheck,
} from 'lucide-react';
import { Game, User } from '../types.ts';

export default function GameCard({
  game,
  currentUser,
  onJoin,
  isJoined,
  requestStatus,
  onOpenChat,
  onEdit,
  isOwner,
  onLeave,
  onDelete,
  onRepeat,
  onConfirmAttendance,
  onRecordResult,
  onRate,
  onShowDetails,
  onShare,
  t,
  lang = 'hu'
}: {
  key?: string,
  game: Game,
  currentUser?: User | null,
  onJoin: () => Promise<void> | void,
  isJoined: boolean,
  requestStatus?: 'pending' | 'accepted' | 'rejected',
  onOpenChat: () => void,
  onEdit?: () => void,
  isOwner: boolean,
  onLeave: () => void,
  onDelete?: () => void,
  onRepeat: () => void,
  onConfirmAttendance: () => void,
  onRecordResult: () => void,
  onRate: () => void,
  onShowDetails: () => void,
  onShare: () => void,
  t: (key: string) => string,
  lang?: string
}) {
  const gameDateTime = game.datetime || (game.date && game.time ? `${game.date}T${game.time}` : null);
  const date = gameDateTime ? new Date(gameDateTime) : new Date();
  const now = new Date();
  const isPast = gameDateTime ? date < now : false;
  const isLastMinute = !isPast && (date.getTime() - now.getTime()) / 3600000 <= 3;

  const joinedPlayers = game.joinedPlayers || [];
  const slotsLeft = Number(game.requiredPlayers || 4) - joinedPlayers.length;
  const isFull = slotsLeft <= 0;
  const creatorName = game.creatorName || (currentUser?.id === game.creatorId ? currentUser?.name : undefined);

  return (
    <div
      onClick={onShowDetails}
      className={`bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all relative cursor-pointer ${isPast ? 'opacity-60' : 'border-[#141414]/5 hover:border-[#E2FF3B]'}`}
    >
      {/* Top badges */}
      {isLastMinute && !isFull && !isPast && (
        <div className="absolute top-0 left-0 bg-red-500 text-white text-[9px] font-black uppercase px-2 py-1 rounded-tl-2xl rounded-br-xl z-20 animate-pulse">
          🔥 Last Minute
        </div>
      )}
      {requestStatus === 'pending' && !isJoined && (
        <div className="absolute top-3 right-3 bg-yellow-400 text-[#141414] text-[9px] font-black uppercase px-2 py-1 rounded-xl z-20">
          {t('common.requested')}
        </div>
      )}
      {isJoined && (
        <div className="absolute top-3 right-3 bg-[#E2FF3B] text-[#141414] text-[9px] font-black uppercase px-2 py-1 rounded-xl z-20">
          {t('common.joined')}
        </div>
      )}

      <div className="p-4">
        {/* Header row: creator + date */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 bg-[#141414]/5 rounded-full flex items-center justify-center shrink-0">
              <UserIcon className="w-3.5 h-3.5 opacity-40" />
            </div>
            <span className="text-xs font-bold truncate opacity-50">
              {creatorName || game.creatorName || (lang === 'hu' ? 'Játékos' : 'Player')}
            </span>
          </div>
          <div className="text-right shrink-0 mr-14">
            <p className="text-[10px] font-bold uppercase tracking-tighter opacity-40">
              {date.toLocaleDateString(lang === 'hu' ? 'hu-HU' : 'en-US', { month: 'short', day: 'numeric' })}
            </p>
            <p className="text-base font-black leading-none">
              {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>

        {/* Location */}
        <h3 className="font-black text-base leading-tight mb-2 truncate">{game.location}</h3>

        {/* Tags */}
        <div className="flex gap-1.5 flex-wrap mb-3">
          {game.recommendedLevel && (
            <span className="text-[9px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-lg font-black uppercase">
              {t(`profile.levels.${game.recommendedLevel}`)}
            </span>
          )}
          {game.gameType && (
            <span className={`text-[9px] px-2 py-0.5 rounded-lg font-black uppercase ${
              game.gameType === 'Competitive' ? 'bg-red-50 text-red-600' :
              game.gameType === 'Training' ? 'bg-purple-50 text-purple-600' : 'bg-green-50 text-green-600'
            }`}>
              {t(`games.gameTypes.${game.gameType}`)}
            </span>
          )}
          {isFull && !isJoined && (
            <span className="text-[9px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-lg font-black uppercase">
              {t('common.full')}
            </span>
          )}
        </div>

        {game.note && (
          <p className="text-xs opacity-40 mb-3 line-clamp-1 italic">{game.note}</p>
        )}

        {/* Bottom row: slots + actions */}
        <div className="flex items-center justify-between gap-2">
          {/* Player slots */}
          <div className="flex -space-x-1.5 shrink-0">
            {(game.joinedPlayers || []).slice(0, 4).map((_, i) => (
              <div key={i} className="w-7 h-7 rounded-full bg-[#141414] border-2 border-white flex items-center justify-center shadow-sm">
                {i === 0 ? <TrendingUp className="w-3 h-3 text-[#E2FF3B]" /> : <UserIcon className="w-3 h-3 text-white/60" />}
              </div>
            ))}
            {Array.from({ length: Math.max(0, Math.min(slotsLeft, 3)) }).map((_, i) => (
              <div key={i} className="w-7 h-7 rounded-full bg-[#F5F5F0] border-2 border-white border-dashed flex items-center justify-center">
                <Plus className="w-2.5 h-2.5 opacity-20" />
              </div>
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5">
            {(isJoined || isOwner) && (
              <button
                onClick={(e) => { e.stopPropagation(); onOpenChat(); }}
                className="w-8 h-8 rounded-xl bg-[#141414]/5 flex items-center justify-center hover:bg-[#141414]/10 transition-colors relative shrink-0"
              >
                <MessageSquare className="w-4 h-4" />
                {(game.chat && game.chat.length > 0) && (
                  <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
                )}
              </button>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); onShare(); }}
              className="w-8 h-8 rounded-xl bg-[#141414]/5 flex items-center justify-center hover:bg-[#E2FF3B] transition-colors shrink-0"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>

            {/* Owner edit/delete */}
            {isOwner && (
              <>
                {!isPast && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onEdit?.(); }}
                    className="w-8 h-8 rounded-xl bg-[#141414]/5 flex items-center justify-center hover:bg-[#E2FF3B] transition-colors shrink-0"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete?.(); }}
                  className="w-8 h-8 rounded-xl bg-[#141414]/5 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </>
            )}

            {/* Past game actions */}
            {isPast && isOwner && !game.attendanceRecords && (
              <button
                onClick={(e) => { e.stopPropagation(); onConfirmAttendance(); }}
                className="px-3 py-2 rounded-xl text-[10px] font-black uppercase bg-orange-500 text-white hover:bg-orange-600 transition-colors whitespace-nowrap"
              >
                {t('common.verify')}
              </button>
            )}
            {isPast && isOwner && game.attendanceRecords && !game.result && (
              <button
                onClick={(e) => { e.stopPropagation(); onRecordResult(); }}
                className="px-3 py-2 rounded-xl text-[10px] font-black uppercase bg-blue-500 text-white hover:bg-blue-600 transition-colors whitespace-nowrap"
              >
                {t('common.score')}
              </button>
            )}
            {isPast && isJoined && !(game.ratedBy || []).includes(currentUser?.id || '') && (game.joinedPlayers || []).length > 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); onRate(); }}
                className="px-3 py-2 rounded-xl text-[10px] font-black bg-[#E2FF3B] text-[#141414] hover:scale-105 transition-all whitespace-nowrap"
              >
                ⭐ {lang === 'hu' ? 'Értékelj!' : 'Rate!'}
              </button>
            )}
            {isPast && (isJoined || isOwner) && (
              <button
                onClick={(e) => { e.stopPropagation(); onRepeat(); }}
                className="px-3 py-2 rounded-xl text-[10px] font-black bg-[#141414] text-[#E2FF3B] hover:bg-[#252525] transition-all flex items-center gap-1 whitespace-nowrap"
              >
                <Plus className="w-3 h-3" /> {t('common.repeat')}
              </button>
            )}

            {/* Future game join */}
            {!isPast && (
              <button
                disabled={isFull && !isJoined}
                onClick={(e) => { e.stopPropagation(); onJoin(); }}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all whitespace-nowrap ${
                  isJoined
                    ? 'bg-[#141414] text-[#E2FF3B] cursor-default'
                    : requestStatus === 'pending'
                      ? 'bg-yellow-100 text-yellow-700 cursor-default'
                      : isFull
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-[#E2FF3B] text-[#141414] hover:scale-105 active:scale-95 shadow-md shadow-[#E2FF3B]/20'
                }`}
              >
                {isJoined ? t('common.joined') : requestStatus === 'pending' ? t('common.requested') : isFull ? t('common.full') : t('common.joinMatch')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
