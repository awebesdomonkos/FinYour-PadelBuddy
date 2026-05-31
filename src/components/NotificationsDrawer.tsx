import React from 'react';
import { motion } from 'motion/react';
import { X } from 'lucide-react';
import { Notification as PadelNotification } from '../types.ts';

export default function NotificationsDrawer({
  notifications,
  onClose,
  onRead,
  onFriendResponse,
  onGameInviteResponse,
  t
}: {
  notifications: PadelNotification[],
  onClose: () => void,
  onRead: (id: string) => void,
  onFriendResponse?: (requestId: string, status: 'accepted' | 'rejected') => void,
  onGameInviteResponse?: (gameId: string, status: 'accepted' | 'rejected', notifId: string) => void,
  t: (key: string) => string
}) {
  const unreadCount = notifications.filter(n => !n.read).length;

  const getIcon = (type: string) => {
    if (type === 'new_request') return '👋';
    if (type === 'gameInvite') return '🎾';
    if (type === 'request_status') return '✅';
    if (type === 'game_near') return '📍';
    if (type === 'reminder') return '⏰';
    return '🔔';
  };

  const formatDate = (ts: string | undefined) => {
    if (!ts) return '';
    const d = new Date(ts);
    if (isNaN(d.getTime())) return '';
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 1) return 'Most';
    if (diffMins < 60) return `${diffMins} perce`;
    if (diffHours < 24) return `${diffHours} órája`;
    if (diffDays < 7) return `${diffDays} napja`;
    return d.toLocaleDateString('hu-HU', { month: 'short', day: 'numeric' });
  };

  const handleFriendAccept = (e: React.MouseEvent, n: PadelNotification) => {
    e.stopPropagation();
    const reqId = n.requestId || n.friendRequestId || '';
    if (reqId) {
      onFriendResponse?.(reqId, 'accepted');
      onRead(n.id);
    }
  };

  const handleFriendDecline = (e: React.MouseEvent, n: PadelNotification) => {
    e.stopPropagation();
    const reqId = n.requestId || n.friendRequestId || '';
    if (reqId) {
      onFriendResponse?.(reqId, 'rejected');
      onRead(n.id);
    }
  };

  return (
    <div className="fixed inset-0 z-[130] flex justify-end">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
      />
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="relative w-full max-w-sm bg-[#0F1419] h-full shadow-2xl flex flex-col"
      >
        {/* Header */}
        <div className="p-6 pb-4 bg-[#141414] text-white">
          <div className="flex justify-between items-center mb-1">
            <h2 className="text-xl font-black uppercase tracking-tight">{t('notifications.title')}</h2>
            <button onClick={onClose} className="p-2 hover:bg-[#1A2233]/10 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-[11px] text-white/40 font-bold uppercase tracking-widest">
            {unreadCount > 0 ? `${unreadCount} olvasatlan` : 'Minden olvasott'}
          </p>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.length === 0 ? (
            <div className="text-center py-20 opacity-30">
              <div className="text-5xl mb-4">🔔</div>
              <p className="text-xs font-black uppercase tracking-widest">{t('notifications.allCaughtUp')}</p>
            </div>
          ) : (
            notifications.map(n => {
              const isFriendReq = n.type === 'new_request' && (n.requestId || n.friendRequestId) && !n.gameId;
              const isGameInvite = n.type === 'gameInvite' && n.gameId;
              const hasActions = (isFriendReq || isGameInvite) && !n.read;

              return (
                <div
                  key={n.id}
                  onClick={() => onRead(n.id)}
                  className={`rounded-2xl border overflow-hidden transition-all cursor-pointer hover:shadow-md ${
                    n.read
                      ? 'bg-[#1A2233] border-[#FFFFFF]/6'
                      : 'bg-[#1A2233] border-[#00E676]/50 shadow-sm shadow-[#00E676]/20'
                  }`}
                >
                  <div className="p-4">
                    <div className="flex gap-3">
                      {/* Icon */}
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 ${
                        n.read ? 'bg-[#FFFFFF]/5' : 'bg-[#00E676]'
                      }`}>
                        {getIcon(n.type)}
                      </div>
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2 mb-0.5">
                          <h4 className="font-bold text-sm leading-tight">{n.title}</h4>
                          {!n.read && <div className="w-2 h-2 bg-[#00E676] rounded-full border border-[#FFFFFF]/10 shrink-0 mt-1" />}
                        </div>
                        <p className="text-xs text-[#8A99AA] leading-relaxed mb-1">{n.message}</p>
                        <p className="text-[10px] font-bold text-[#4A5568] uppercase tracking-widest">
                          {formatDate(n.createdAt || (n as any).created_at)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {hasActions && (
                    <div className="flex border-t border-[#FFFFFF]/6">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isFriendReq) handleFriendAccept(e, n);
                          else if (isGameInvite) { onGameInviteResponse?.(n.gameId!, 'accepted', n.id); onRead(n.id); }
                        }}
                        className="flex-1 py-3 text-[11px] font-black uppercase tracking-widest bg-[#141414] text-[#080B0F] hover:bg-[#00C853] transition-colors"
                      >
                        {isFriendReq ? t('common.accept') : t('common.join')}
                      </button>
                      <div className="w-px bg-[#FFFFFF]/8" />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isFriendReq) handleFriendDecline(e, n);
                          else if (isGameInvite) { onGameInviteResponse?.(n.gameId!, 'rejected', n.id); onRead(n.id); }
                        }}
                        className="flex-1 py-3 text-[11px] font-black uppercase tracking-widest text-[#4A5568] hover:bg-[#FFFFFF]/5 transition-colors"
                      >
                        {t('common.decline')}
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer - mark all read */}
        {unreadCount > 0 && (
          <div className="p-4 border-t border-[#FFFFFF]/6 bg-[#1A2233]">
            <button
              onClick={() => notifications.filter(n => !n.read).forEach(n => onRead(n.id))}
              className="w-full py-3 text-[11px] font-black uppercase tracking-widest text-[#4A5568] hover:text-[#141414] transition-colors"
            >
              Összes megjelölése olvasottként
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
