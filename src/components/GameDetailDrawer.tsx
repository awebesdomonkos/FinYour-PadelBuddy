import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Calendar, User as UserIcon, Plus, TrendingUp, MessageSquare, Trash2 } from 'lucide-react';
import { Game, User } from '../types.ts';

export default function GameDetailDrawer({
  game,
  players,
  currentUser,
  t,
  onClose,
  onJoin,
  onOpenChat,
  onDelete
}: {
  game: Game,
  players: User[],
  currentUser: User,
  t: (key: string) => string,
  onClose: () => void,
  onJoin: () => void,
  onOpenChat: () => void,
  onDelete?: () => void
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
        className="relative w-full max-w-md bg-[#080B0F] h-full shadow-2xl flex flex-col overflow-hidden"
      >
        <div className="p-6 flex justify-between items-center bg-[#1A2233] border-b border-[#FFFFFF]/6">
          <button onClick={onClose} className="p-2 -ml-2 hover:bg-[#FFFFFF]/5 rounded-full"><ArrowLeft className="w-5 h-5"/></button>
          <h3 className="text-xl font-black uppercase tracking-tight italic">{t('games.title')}</h3>
          {onDelete ? (
            <button
              onClick={onDelete}
              className="p-2 -mr-2 hover:bg-red-50 text-red-500 rounded-full transition-colors"
              title={isOwner ? t('games.deleteGame') : 'Remove from history'}
            >
              <Trash2 className="w-5 h-5" />
            </button>
          ) : <div className="w-9" />}
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
              <div className="bg-[#1A2233] p-4 rounded-2xl border border-[#FFFFFF]/6 shadow-sm italic text-sm opacity-70">
                "{game.note}"
              </div>
            )}
          </div>

          {/* Organizer */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">{t('games.admin') || 'Organizer'}</h4>
            <div className="bg-[#1A2233] p-4 rounded-2xl border border-[#FFFFFF]/6 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#FFFFFF]/5 flex items-center justify-center overflow-hidden">
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
              <TrendingUp className="w-4 h-4 text-[#080B0F] fill-current" />
            </div>
          </div>

          {/* Players List */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">{t('groups.members')}</h4>
              <span className="text-[10px] font-black px-2 py-0.5 bg-[#141414] text-[#080B0F] rounded-full">
                {joinedPlayers.length} / {Number(game.requiredPlayers || 4)}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {joinedUsers.map(user => (
                <div key={user.id} className="bg-[#1A2233] p-4 rounded-2xl border border-[#FFFFFF]/6 shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#FFFFFF]/5 flex items-center justify-center overflow-hidden">
                      {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <UserIcon className="w-5 h-5 opacity-40" />
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-sm tracking-tight">{user.name}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase opacity-40 bg-[#FFFFFF]/5 px-1.5 rounded">{t(`profile.levels.${user.skillLevel}`)}</span>
                        {user.reliabilityStatus && (
                          <span className="text-[10px] font-bold text-blue-500 uppercase">{t(`profile.reliabilityStatus.${user.reliabilityStatus}`)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  {user.id === game.creatorId && (
                    <div className="px-2 py-0.5 bg-[#00E676] text-[#141414] text-[8px] font-black uppercase rounded shadow-sm italic">Host</div>
                  )}
                </div>
              ))}

              {Array.from({ length: Math.max(0, Math.min(slotsLeft, 10)) }).map((_, i) => (
                <div key={`empty-${i}`} className="bg-[#FFFFFF]/5 border border-dashed border-[#FFFFFF]/8 rounded-2xl p-4 flex items-center gap-3 opacity-40">
                  <div className="w-10 h-10 rounded-full bg-[#1A2233] flex items-center justify-center">
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
                    <div className="w-8 h-8 rounded-full bg-[#1A2233]/10 flex items-center justify-center shrink-0">
                      <UserIcon className="w-4 h-4 text-[#080B0F]" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-[#080B0F] uppercase">{msg.userName}</span>
                        <span className="text-[8px] text-white/30 uppercase font-bold">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p className="text-xs text-white/70 leading-relaxed font-bold">{msg.text}</p>
                    </div>
                  </div>
                ))}
                <button
                  onClick={onOpenChat}
                  className="w-full py-2 text-[10px] font-black uppercase tracking-widest text-[#080B0F] bg-[#1A2233]/5 rounded-xl hover:bg-[#1A2233]/10 transition-colors"
                >
                  {t('common.enter') || 'View all messages'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Action Bar */}
        <div className="p-6 bg-[#1A2233] border-t border-[#FFFFFF]/6 space-y-3">
          {(isJoined || isOwner) ? (
            <button
              onClick={onOpenChat}
              className="w-full py-4 bg-[#141414] text-[#080B0F] rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2 shadow-xl shadow-black/10"
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
                    ? 'bg-[#FFFFFF]/8 text-[#4A5568] scale-95'
                    : 'bg-[#00E676] text-[#141414] hover:scale-[1.02] active:scale-95 shadow-[#00E676]/20'
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
