import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck } from 'lucide-react';
import { Game, User } from '../types.ts';
import { useDialogA11y } from '../hooks/useDialogA11y.ts';

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

  const { dialogProps } = useDialogA11y(onClose);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        {...dialogProps}
        aria-labelledby="attendance-title"
        className="outline-none max-h-[90vh] overflow-y-auto bg-white rounded-2xl sm:rounded-[40px] w-full max-w-sm p-4 sm:p-8 space-y-6 shadow-2xl"
      >
        <div className="text-center space-y-2">
          <ShieldCheck className="w-12 h-12 text-orange-500 mx-auto" />
          <h2 id="attendance-title" className="text-2xl font-black uppercase tracking-tight">{t('games.attendanceTitle')}</h2>
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
                    aria-pressed={records[uid] === 'missed'}
                    onClick={() => setRecords({ ...records, [uid]: "missed" })}
                    className={`px-3 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${records[uid] === 'missed' ? 'bg-red-500 text-white' : 'bg-white text-red-600'}`}
                  >
                    {t('games.missed')}
                  </button>
                  <button
                    aria-pressed={records[uid] === 'appeared'}
                    onClick={() => setRecords({ ...records, [uid]: "appeared" })}
                    className={`px-3 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${records[uid] === 'appeared' ? 'bg-green-600 text-white' : 'bg-white text-green-700'}`}
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
            className="flex-1 py-4 text-sm font-bold uppercase tracking-widest text-[#141414]/60"
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={() => onConfirm(records)}
            className="flex-1 py-4 bg-[#141414] text-[#E2FF3B] rounded-2xl text-sm font-black uppercase tracking-widest"
          >
            {t('common.confirm')}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
