import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Calendar, User as UserIcon, Plus, TrendingUp, MessageSquare } from 'lucide-react';
import { Game, User } from '../types.ts';

export default function GameDetailDrawer({
  game,
  players,
  currentUser,
  t,
  onClose,
  onJoin,
  onOpenChat
}: {
  game: Game,
  players: User[],
  currentUser: User,
  t: (key: string) => string,
  onClose: () => void,
  onJoin: () => void,
  onOpenChat: () => void
}) {
  const gameDateTime = game.datetime || (game.date && game.time ? `${game.date}T${game.time}` : null);
  const date = gameDateTime ? new Date(gameDateTime) : new Date();
  const joinedPlayers = game.joinedPlayers || [];
  const slotsLeft = Number(game.requiredPlayers || 4) - joinedPlayers.length;
  const isJoined = joinedPlayers.includes(currentUser?.id || '');
  const isOwner = game.creatorId === currentUser?.id;
  const isFull = slotsLeft <= 0;

  const joinedUsers = joinedPlayers.map(id => (players || []).find(p => p.id === id)).filter(Boolean) as User[];
  const creatorUser = (players || []).find(p => p.id === game.creatorId);
  const myRequest = game.requests?.find(r => r.userId === currentUser?.id);

  return (
    <div className="fixed inset-0 z-[110] flex justify-end">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        className="relative w-full max-w-md bg-[#F5F5F0] h-full shadow-2xl flex flex-col overflow-hidden"
      >
        <div className="p-6 flex justify-between items-center bg-white border-b border-[#141414]/5">
          <button onClick={onClose} className="p-2 -ml-2 hover:bg-[#141414]/5 rounded-full"><ArrowLeft className="w-5 h-5"/></button>
          <h3 className="text-xl font-black uppercase tracking-tight italic">{t('games.title')}</h3>
          <div className="w-9" />
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Header Info */}
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <h2 className="text-3xl font-black uppercase italic leading-none">{game.location}</h2>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded font-black uppercase">
                    {t(`profile.levels.${game.recommendedLevel}`)} {t('groups.recommendedLevel')}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-black uppercase ${game.gameType === 'Competitive' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                    {t(`games.gameTypes.${game.gameType}`)}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 justify-end text-xs font-bold opacity-40 uppercase tracking-widest">
                  <Calendar className="w-3 h-3" />
                  {date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </div>
                <div className="text-2xl font-black mt-1">
                  {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>

            {game.note && (
              <div className="bg-white p-4 rounded-2xl border border-[#141414]/5 shadow-sm italic text-sm opacity-70">
                "{game.note}"
              </div>
            )}
          </div>

          {/* Organizer */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">{t('games.admin') || 'Organizer'}</h4>
            <div className="bg-white p-4 rounded-2xl border border-[#141414]/5 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#141414]/5 flex items-center justify-center overflow-hidden">
                  {creatorUser?.avatarUrl ? (
                    <img src={creatorUser.avatarUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon className="w-5 h-5 opacity-40" />
                  )}
                </div>
                <div>
                  <p className="font-bold">{creatorUser?.name || 'Player'}</p>
                  <p className="text-[10px] font-black uppercase opacity-30">
                    {creatorUser?.skillLevel ? t(`profile.levels.${creatorUser.skillLevel}`) : ''}
                  </p>
                </div>
              </div>
              <TrendingUp className="w-4 h-4 text-[#E2FF3B] fill-current" />
            </div>
          </div>

          {/* Players List */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">{t('groups.members')}</h4>
              <span className="text-[10px] font-black px-2 py-0.5 bg-[#141414] text-[#E2FF3B] rounded-full">
                {joinedPlayers.length} / {Number(game.requiredPlayers || 4)}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {joinedUsers.map(user => (
                <div key={user.id} className="bg-white p-4 rounded-2xl border border-[#141414]/5 shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#141414]/5 flex items-center justify-center overflow-hidden">
                      {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <UserIcon className="w-5 h-5 opacity-40" />
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-sm tracking-tight">{user.name}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase opacity-40 bg-[#141414]/5 px-1.5 rounded">{t(`profile.levels.${user.skillLevel}`)}</span>
                        {user.reliabilityStatus && (
                          <span className="text-[10px] font-bold text-blue-500 uppercase">{t(`profile.reliabilityStatus.${user.reliabilityStatus}`)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  {user.id === game.creatorId && (
                    <div className="px-2 py-0.5 bg-[#E2FF3B] text-[#141414] text-[8px] font-black uppercase rounded shadow-sm italic">Host</div>
                  )}
                </div>
              ))}

              {Array.from({ length: Math.max(0, Math.min(slotsLeft, 10)) }).map((_, i) => (
                <div key={`empty-${i}`} className="bg-[#141414]/5 border border-dashed border-[#141414]/10 rounded-2xl p-4 flex items-center gap-3 opacity-40">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                    <Plus className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest">{t('common.noData')}...</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          {(game.chat && game.chat.length > 0) && (
            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">{t('notifications.title') || 'Recent Activity'}</h4>
              <div className="bg-[#141414] rounded-3xl p-6 shadow-xl space-y-4">
                {(game.chat || []).slice(-2).map((msg, i) => (
                  <div key={msg.id || i} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                      <UserIcon className="w-4 h-4 text-[#E2FF3B]" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-[#E2FF3B] uppercase">{msg.userName}</span>
                        <span className="text-[8px] text-white/30 uppercase font-bold">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p className="text-xs text-white/70 leading-relaxed font-bold">{msg.text}</p>
                    </div>
                  </div>
                ))}
                <button
                  onClick={onOpenChat}
                  className="w-full py-2 text-[10px] font-black uppercase tracking-widest text-[#E2FF3B] bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
                >
                  {t('common.enter') || 'View all messages'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Action Bar */}
        <div className="p-6 bg-white border-t border-[#141414]/5 space-y-3">
          {(isJoined || isOwner) ? (
            <button
              onClick={onOpenChat}
              className="w-full py-4 bg-[#141414] text-[#E2FF3B] rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2 shadow-xl shadow-black/10"
            >
              <MessageSquare className="w-5 h-5" />
              {t('games.chat')}
            </button>
          ) : (
            <button
              disabled={isFull || myRequest?.status === 'pending'}
              onClick={onJoin}
              className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl transition-all ${
                myRequest?.status === 'pending'
                  ? 'bg-yellow-400 text-[#141414]'
                  : isFull
                    ? 'bg-[#141414]/10 text-[#141414]/40 scale-95'
                    : 'bg-[#E2FF3B] text-[#141414] hover:scale-[1.02] active:scale-95 shadow-[#E2FF3B]/30'
              }`}
            >
              {myRequest?.status === 'pending' ? t('common.requested') : isFull ? t('common.full') : t('common.joinMatch')}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
