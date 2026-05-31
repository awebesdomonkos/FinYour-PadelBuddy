import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, MessageSquare, Send } from 'lucide-react';
import { Group, User } from '../types.ts';

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

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      className="fixed inset-y-0 right-0 w-full max-w-sm bg-[#080B0F] z-[110] shadow-2xl border-l border-[#FFFFFF]/8 flex flex-col"
    >
      <div className="p-4 bg-[#1A2233] border-b border-[#FFFFFF]/8 flex items-center gap-4">
        <button onClick={onClose} className="p-2 hover:bg-[#FFFFFF]/5 rounded-xl">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h3 className="font-black uppercase tracking-tight leading-none">{group.name}</h3>
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
                  : 'bg-[#1A2233] rounded-tl-none border border-[#141414]/5'
              }`}>
                {c.text}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 bg-[#1A2233] border-t border-[#FFFFFF]/8">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder={t('common.typeMessage')}
            value={msg}
            onChange={e => setMsg(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && msg.trim() && (onSendMessage(msg), setMsg(''))}
            className="flex-1 bg-[#FFFFFF]/5 border-none rounded-2xl py-3 px-4 text-sm focus:ring-1 focus:ring-[#00E676] outline-none"
          />
          <button
            disabled={!msg.trim()}
            onClick={() => {
              onSendMessage(msg);
              setMsg('');
            }}
            className="w-12 h-12 bg-[#141414] text-[#080B0F] rounded-2xl flex items-center justify-center disabled:opacity-30"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
