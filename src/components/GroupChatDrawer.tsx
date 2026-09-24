import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, MessageSquare, Send } from 'lucide-react';
import { Group, User } from '../types.ts';
import { useDialogA11y } from '../hooks/useDialogA11y.ts';

export default function GroupChatDrawer({
  group,
  currentUser,
  onClose,
  onSendMessage,
  t
}: {
  group: Group,
  currentUser: User | null,
  onClose: () => void,
  onSendMessage: (text: string) => void,
  t: (key: string) => string
}) {
  const [msg, setMsg] = useState('');
  const { dialogProps } = useDialogA11y(onClose);
  const send = () => { if (!msg.trim()) return; onSendMessage(msg.trim()); setMsg(''); };

  return (
    <>
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} aria-hidden="true" className="fixed inset-0 z-[109] bg-black/30 backdrop-blur-sm" />
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      {...dialogProps}
      aria-labelledby="group-chat-title"
      className="fixed inset-y-0 right-0 w-full max-w-sm bg-[#F5F5F0] z-[110] shadow-2xl border-l border-[#141414]/10 flex flex-col outline-none"
    >
      <div className="p-4 pt-[calc(1rem+env(safe-area-inset-top,0px))] bg-white border-b border-[#141414]/10 flex items-center gap-4">
        <button onClick={onClose} aria-label={t('a11y.back')} className="p-2.5 hover:bg-[#141414]/5 rounded-xl">
          <ArrowLeft className="w-5 h-5" aria-hidden="true" />
        </button>
        <div>
          <h3 id="group-chat-title" className="font-black uppercase tracking-tight leading-none">{group.name}</h3>
          <p className="text-[10px] opacity-40 font-bold uppercase tracking-widest mt-1">{t('games.groupChat')}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="space-y-3">
          {group.chat?.length === 0 && (
            <div className="py-10 text-center opacity-30">
              <MessageSquare className="w-8 h-8 mx-auto mb-2" />
              <p className="text-xs font-bold uppercase tracking-widest">{t('common.noMessages')}</p>
            </div>
          )}
          {group.chat?.map(c => (
            <div key={c.id} className={`flex flex-col ${c.userId === currentUser?.id ? 'items-end' : 'items-start'}`}>
              <div className="flex items-baseline gap-2 mb-1 px-1">
                <span className="text-[10px] font-black uppercase tracking-widest opacity-30">{c.userName}</span>
                <span className="text-[8px] opacity-20">{new Date(c.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <div className={`max-w-[85%] px-4 py-2 rounded-2xl text-sm shadow-sm ${
                c.userId === currentUser?.id
                  ? 'bg-[#141414] text-white rounded-tr-none'
                  : 'bg-white rounded-tl-none border border-[#141414]/5'
              }`}>
                {c.text}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] bg-white border-t border-[#141414]/10">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder={t('common.typeMessage')}
            value={msg}
            onChange={e => setMsg(e.target.value)}
            aria-label={t('chat.messageLabel')}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
            className="flex-1 bg-[#141414]/5 border-none rounded-2xl py-3 px-4 text-sm focus:ring-1 focus:ring-[#E2FF3B] outline-none"
          />
          <button
            disabled={!msg.trim()}
            onClick={send}
            aria-label={t('chat.send')}
            className="w-12 h-12 bg-[#141414] text-[#E2FF3B] rounded-2xl flex items-center justify-center disabled:opacity-30"
          >
            <Send className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </motion.div>
    </>
  );
}
