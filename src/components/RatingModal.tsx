import React from 'react';
import { motion } from 'motion/react';
import { X, User as UserIcon } from 'lucide-react';
import { Game, User } from '../types.ts';

export default function RatingModal({
  game,
  players,
  currentUser,
  onClose,
  onSubmit,
  t,
  lang
}: {
  game: Game;
  players: User[];
  currentUser: User;
  onClose: () => void;
  onSubmit: (ratings: { userId: string; reliable: boolean; goodPlayer: boolean }[]) => void;
  t: (key: string) => string;
  lang: string;
}) {
  const teammates = (game.joinedPlayers || [])
    .filter(id => id !== currentUser.id)
    .map(id => players.find(p => p.id === id))
    .filter(Boolean) as User[];

  const [ratings, setRatings] = React.useState<Record<string, { reliable: boolean; goodPlayer: boolean }>>(
    Object.fromEntries(teammates.map(p => [p.id, { reliable: true, goodPlayer: true }]))
  );

  const toggle = (userId: string, field: 'reliable' | 'goodPlayer') => {
    setRatings(prev => ({
      ...prev,
      [userId]: { ...prev[userId], [field]: !prev[userId][field] }
    }));
  };

  const handleSubmit = () => {
    const ratingsList = Object.entries(ratings).map(([userId, r]) => ({ userId, ...r }));
    onSubmit(ratingsList);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[140] flex items-end sm:items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="bg-[#141414] px-6 py-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-black uppercase tracking-tight text-lg">⭐ {lang === 'hu' ? 'Értékeld a csapatot!' : 'Rate your team!'}</h3>
              <p className="text-white/40 text-[11px] font-bold uppercase mt-0.5">{game.location}</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Players */}
        <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
          {teammates.length === 0 ? (
            <div className="py-8 text-center opacity-40">
              <p className="text-sm font-bold">{lang === 'hu' ? 'Nincs értékelhető játékos' : 'Nincs értékelhető játékos'}</p>
            </div>
          ) : (
            teammates.map(player => {
              const r = ratings[player.id];
              return (
                <div key={player.id} className="bg-[#F8F8F5] rounded-2xl p-4">
                  {/* Player info */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-[#141414] flex items-center justify-center overflow-hidden shrink-0">
                      {player.avatarUrl ? (
                        <img src={player.avatarUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <UserIcon className="w-5 h-5 text-white/60" />
                      )}
                    </div>
                    <div>
                      <p className="font-black text-sm">{player.name}</p>
                      <p className="text-[10px] opacity-40 font-bold uppercase">{t(`profile.levels.${player.skillLevel}`)}</p>
                    </div>
                  </div>
                  {/* Toggle buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => toggle(player.id, 'reliable')}
                      className={`py-2.5 px-3 rounded-xl flex items-center gap-2 transition-all ${
                        r.reliable
                          ? 'bg-green-100 border-2 border-green-400 text-green-700'
                          : 'bg-white border-2 border-[#141414]/10 text-[#141414]/30'
                      }`}
                    >
                      <span className="text-lg">👍</span>
                      <span className="text-[11px] font-black uppercase tracking-wide">
                        {lang === 'hu' ? 'Megbízható' : 'Megbízható'}
                      </span>
                    </button>
                    <button
                      onClick={() => toggle(player.id, 'goodPlayer')}
                      className={`py-2.5 px-3 rounded-xl flex items-center gap-2 transition-all ${
                        r.goodPlayer
                          ? 'bg-blue-100 border-2 border-blue-400 text-blue-700'
                          : 'bg-white border-2 border-[#141414]/10 text-[#141414]/30'
                      }`}
                    >
                      <span className="text-lg">🎾</span>
                      <span className="text-[11px] font-black uppercase tracking-wide">
                        {lang === 'hu' ? 'Jó játékos' : 'Jó játékos'}
                      </span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Submit */}
        <div className="p-4 border-t border-[#141414]/5">
          <button
            onClick={handleSubmit}
            disabled={teammates.length === 0}
            className="w-full py-4 bg-[#141414] text-[#E2FF3B] rounded-2xl font-black uppercase tracking-widest hover:bg-[#252525] transition-colors disabled:opacity-30"
          >
            {lang === 'hu' ? '⭐ Értékelés küldése' : '⭐ Submit Ratings'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
