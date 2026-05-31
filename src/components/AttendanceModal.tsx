import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck } from 'lucide-react';
import { Game, User } from '../types.ts';

export default function AttendanceModal({
  game,
  players,
  onClose,
  onConfirm,
  t
}: {
  game: Game,
  players: User[],
  onClose: () => void,
  onConfirm: (records: Record<string, "appeared" | "missed">) => void,
  t: (key: string) => string
}) {
  const [records, setRecords] = useState<Record<string, "appeared" | "missed">>(
    (game.joinedPlayers || []).reduce((acc, uid) => ({ ...acc, [uid]: "appeared" }), {})
  );

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-[40px] w-full max-w-sm p-8 space-y-6 shadow-2xl"
      >
        <div className="text-center space-y-2">
          <ShieldCheck className="w-12 h-12 text-orange-500 mx-auto" />
          <h2 className="text-2xl font-black uppercase tracking-tight">{t('games.attendanceTitle')}</h2>
          <p className="text-xs opacity-50 uppercase font-black tracking-widest">{t('games.attendanceSub')}</p>
        </div>

        <div className="space-y-3">
          {(game.joinedPlayers || []).map(uid => {
            const player = players.find(p => p.id === uid);
            return (
              <div key={uid} className="flex items-center justify-between p-3 bg-[#141414]/5 rounded-2xl">
                <span className="text-sm font-bold">{player?.name || 'Player'}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setRecords({ ...records, [uid]: "missed" })}
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${records[uid] === 'missed' ? 'bg-red-500 text-white' : 'bg-white text-red-500 opacity-40'}`}
                  >
                    {t('games.missed')}
                  </button>
                  <button
                    onClick={() => setRecords({ ...records, [uid]: "appeared" })}
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${records[uid] === 'appeared' ? 'bg-green-500 text-white' : 'bg-white text-green-500 opacity-40'}`}
                  >
                    {t('games.appeared')}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex gap-3 pt-4">
          <button
            onClick={onClose}
            className="flex-1 py-4 text-sm font-bold uppercase tracking-widest opacity-40"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(records)}
            className="flex-1 py-4 bg-[#141414] text-[#E2FF3B] rounded-2xl text-sm font-black uppercase tracking-widest"
          >
            Confirm
          </button>
        </div>
      </motion.div>
    </div>
  );
}
