import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, MessageSquare, Plus, Users, X, Check, Send, User as UserIcon } from 'lucide-react';
import { Game, User } from '../types.ts';

export default function ChatDrawer({
  game,
  currentUser,
  players,
  onClose,
  onSendMessage,
  onApprove,
  onLeave,
  t
}: {
  game: Game,
  currentUser: User | null,
  players: User[],
  onClose: () => void,
  onSendMessage: (text: string) => void,
  onApprove: (uid: string, apr: boolean) => void,
  onLeave: () => void,
  t: (key: string) => string
}) {
  const [msg, setMsg] = useState('');
  const [activeTab, setActiveTab] = useState<'chat' | 'members' | 'requests'>('chat');
  const chatEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [game.chat?.length]);

  if (!game) return null;

  const isOwner = game.creatorId === currentUser?.id;
  const isJoined = (game.joinedPlayers || []).includes(currentUser?.id || '');
  const pendingRequests = (game.requests || []).filter(r => r.status === 'pending');
  const joinedUsers = (game.joinedPlayers || []).map(id => (players || []).find(p => p.id === id)).filter(Boolean) as User[];
  const gameDateTime = game.datetime || (game.date && game.time ? `${game.date}T${game.time}` : null);
  const dateStr = gameDateTime ? new Date(gameDateTime).toLocaleDateString('hu-HU', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';

  const safeTimestamp = (ts: string | undefined) => {
    if (!ts) return '';
    const d = new Date(ts);
    return isNaN(d.getTime()) ? '' : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const send = () => {
    if (!msg.trim()) return;
    onSendMessage(msg.trim());
    setMsg('');
  };

  const quickMessages = ['Ott vagyok! 👋', 'Kések 10 percet ⏰', 'Még aktuális? 🎾', 'Jó meccset! 🏆'];

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      className="fixed inset-y-0 right-0 w-full max-w-sm bg-[#F8F8F5] z-[60] shadow-2xl border-l border-[#141414]/10 flex flex-col"
    >
      {/* Header */}
      <div className="p-4 bg-[#141414] text-white">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1 min-w-0">
            <h3 className="font-black uppercase tracking-tight leading-none truncate">{game.location || 'Meccs'}</h3>
            <p className="text-[10px] text-white/40 font-bold uppercase mt-0.5">{dateStr}</p>
          </div>
          {!isOwner && isJoined && (
            <button
              onClick={onLeave}
              className="px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-red-500/30 transition-colors"
            >
              Kilépés
            </button>
          )}
        </div>
        {/* Tabs */}
        <div className="flex gap-1">
          {[
            { key: 'chat', label: 'Chat', count: game.chat?.length || 0 },
            { key: 'members', label: 'Tagok', count: joinedUsers.length },
            ...(isOwner && pendingRequests.length > 0 ? [{ key: 'requests', label: 'Kérelmek', count: pendingRequests.length }] : [])
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors ${
                activeTab === tab.key ? 'bg-[#E2FF3B] text-[#141414]' : 'bg-white/10 text-white/60 hover:bg-white/20'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`w-4 h-4 rounded-full text-[9px] flex items-center justify-center ${
                  activeTab === tab.key ? 'bg-[#141414] text-[#E2FF3B]' : 'bg-white/20 text-white'
                }`}>{tab.count}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* CHAT TAB */}
        {activeTab === 'chat' && (
          <div className="p-4 space-y-3">
            {!game.chat || game.chat.length === 0 ? (
              <div className="py-16 text-center opacity-30">
                <MessageSquare className="w-10 h-10 mx-auto mb-3" />
                <p className="text-xs font-black uppercase tracking-widest">{t('common.noMessages')}</p>
              </div>
            ) : (
              (game.chat || []).map((c, i) => {
                const isMine = c.userId === currentUser?.id;
                return (
                  <div key={c.id || i} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                    <div className="flex items-baseline gap-2 mb-1 px-1">
                      {!isMine && <span className="text-[10px] font-black uppercase tracking-widest opacity-40">{c.userName}</span>}
                      <span className="text-[8px] opacity-20">{safeTimestamp(c.timestamp)}</span>
                    </div>
                    <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm shadow-sm ${
                      isMine
                        ? 'bg-[#141414] text-white rounded-tr-sm'
                        : 'bg-white rounded-tl-sm border border-[#141414]/5'
                    }`}>
                      {c.text}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={chatEndRef} />
          </div>
        )}

        {/* MEMBERS TAB */}
        {activeTab === 'members' && (
          <div className="p-4 space-y-2">
            <p className="text-[10px] font-black uppercase tracking-widest opacity-30 mb-4">
              {joinedUsers.length} / {Number(game.requiredPlayers || 4)} {t('games.players')}
            </p>
            {joinedUsers.map(user => (
              <div key={user.id} className="bg-white p-3 rounded-2xl border border-[#141414]/5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#141414]/5 flex items-center justify-center overflow-hidden">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon className="w-5 h-5 opacity-40" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-sm">{user.name}</p>
                  <p className="text-[10px] opacity-40 font-bold uppercase">{t(`profile.levels.${user.skillLevel}`)}</p>
                </div>
                {user.id === game.creatorId && (
                  <span className="px-2 py-0.5 bg-[#E2FF3B] text-[#141414] text-[8px] font-black uppercase rounded">Host</span>
                )}
              </div>
            ))}
            {/* Empty slots */}
            {Array.from({ length: Math.max(0, Number(game.requiredPlayers || 4) - joinedUsers.length) }).map((_, i) => (
              <div key={i} className="bg-[#141414]/5 border border-dashed border-[#141414]/10 rounded-2xl p-3 flex items-center gap-3 opacity-40">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest">Szabad hely</span>
              </div>
            ))}
          </div>
        )}

        {/* REQUESTS TAB */}
        {activeTab === 'requests' && isOwner && (
          <div className="p-4 space-y-2">
            {pendingRequests.length === 0 ? (
              <div className="py-16 text-center opacity-30">
                <Users className="w-10 h-10 mx-auto mb-3" />
                <p className="text-xs font-black uppercase tracking-widest">Nincs függő kérelem</p>
              </div>
            ) : (
              pendingRequests.map(req => (
                <div key={req.userId} className="bg-white p-4 rounded-2xl border border-[#141414]/5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold">{req.userName}</p>
                      <p className="text-[10px] opacity-40 font-bold uppercase">Csatlakozni szeretne</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => onApprove(req.userId, false)}
                        className="w-9 h-9 bg-red-50 text-red-500 rounded-xl flex items-center justify-center hover:bg-red-100 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onApprove(req.userId, true)}
                        className="w-9 h-9 bg-green-50 text-green-500 rounded-xl flex items-center justify-center hover:bg-green-100 transition-colors"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Message Input (only in chat tab) */}
      {activeTab === 'chat' && (
        <div className="p-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] bg-white border-t border-[#141414]/10">
          {/* Quick messages */}
          <div className="flex gap-2 mb-3 overflow-x-auto pb-1 scrollbar-hide">
            {quickMessages.map(txt => (
              <button
                key={txt}
                onClick={() => onSendMessage(txt)}
                className="shrink-0 px-3 py-1.5 bg-[#141414]/5 text-[10px] font-bold uppercase tracking-wider rounded-xl hover:bg-[#E2FF3B] transition-colors"
              >
                {txt}
              </button>
            ))}
          </div>
          {/* Input */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder={t('common.typeMessage')}
              value={msg}
              onChange={e => setMsg(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (send(), e.preventDefault())}
              className="flex-1 bg-[#141414]/5 border-none rounded-2xl py-3 px-4 text-sm focus:ring-2 focus:ring-[#E2FF3B] outline-none"
            />
            <button
              disabled={!msg.trim()}
              onClick={send}
              className="w-12 h-12 bg-[#141414] text-[#E2FF3B] rounded-2xl flex items-center justify-center disabled:opacity-30 hover:bg-[#252525] transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
