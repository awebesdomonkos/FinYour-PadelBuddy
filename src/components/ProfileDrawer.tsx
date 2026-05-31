import React from 'react';
import { motion } from 'motion/react';
import {
  User as UserIcon, MapPin, Heart, Check, X, History, Award, Users,
  Target, Shield, BookOpen, Smartphone, Instagram, Facebook, EyeOff, Eye
} from 'lucide-react';
import { User, Game, Group } from '../types.ts';
import { useI18n } from '../hooks/useI18n.ts';
import MatchHistory from './MatchHistory.tsx';

export default function ProfileDrawer({
  user,
  currentUser,
  games = [],
  groups = [],
  onClose,
  onFavorite,
  onSendFriendRequest,
  onBlock
}: {
  user: User,
  currentUser: User,
  games: Game[],
  groups: Group[],
  onClose: () => void,
  onFavorite: (id: string) => void,
  onSendFriendRequest: (id: string) => void,
  onBlock: (id: string) => void
}) {
  const { t, lang } = useI18n(currentUser.languagePreference || 'hu');
  const userGames = (games || []).filter(g => (g.joinedPlayers || []).includes(user.id));
  const isFriend = currentUser.friendIds?.includes(user.id);
  const isBlocked = currentUser.blockedUserIds?.includes(user.id);

  return (
    <div className="fixed inset-0 z-[110] flex justify-end">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onClose} className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
      <motion.div
        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
        className="relative w-full max-w-sm bg-[#F5F5F0] h-full shadow-2xl flex flex-col overflow-hidden"
      >
        <div className="relative h-64">
          {user.avatarUrl ? (
            <img src={user.avatarUrl} className="w-full h-full object-cover" alt="" />
          ) : (
            <div className="w-full h-full bg-[#141414] flex items-center justify-center">
              <UserIcon className="w-20 h-20 text-[#E2FF3B] opacity-20" />
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-[#F5F5F0] via-[#F5F5F0]/80 to-transparent">
            <div className="flex justify-between items-end flex-wrap gap-4">
              <div>
                <span className="px-2 py-0.5 bg-[#E2FF3B] text-[#141414] rounded-lg text-[10px] font-black uppercase tracking-widest mb-2 inline-block shadow-sm">
                  {t(`profile.levels.${user.skillLevel}`)}
                </span>
                <h2 className="text-2xl sm:text-3xl font-black uppercase leading-none italic">{user.name}</h2>
                {user.username && <p className="text-[10px] font-black opacity-30 lowercase mt-0.5">@{user.username}</p>}
                <p className="text-xs font-bold opacity-40 uppercase tracking-widest flex items-center gap-1 mt-2">
                  <MapPin className="w-3 h-3" /> {user.location?.city || ''}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onFavorite(user.id)}
                  className="w-10 h-10 bg-white shadow-sm rounded-xl flex items-center justify-center border border-[#141414]/5 hover:scale-110 active:scale-95 transition-all"
                >
                  <Heart className={`w-5 h-5 ${currentUser.favoritePlayerIds?.includes(user.id) ? 'fill-red-500 text-red-500' : 'text-[#141414]/20'}`} />
                </button>
                {!isFriend && !isBlocked && (
                  <button
                    onClick={() => onSendFriendRequest(user.id)}
                    className="px-4 py-2 bg-[#141414] text-[#E2FF3B] rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all"
                  >
                    {t('profile.addFriend')}
                  </button>
                )}
                {isFriend && (
                  <div className="px-4 py-2 bg-[#E2FF3B] text-[#141414] rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                    <Check className="w-3 h-3" /> {t('profile.friends')}
                  </div>
                )}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="absolute top-4 right-4 w-10 h-10 bg-black/20 backdrop-blur-md text-white rounded-full flex items-center justify-center"><X className="w-5 h-5"/></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 pb-12">
          {/* Block Action */}
          <div className="flex gap-2">
            <button
              onClick={() => onBlock(user.id)}
              className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                isBlocked
                ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
                : 'bg-white border border-[#141414]/5 text-[#141414]/40 hover:bg-red-50 hover:text-red-500'
              }`}
            >
              {isBlocked ? (
                <>
                  <Eye className="w-3 h-3" />
                  {t('profile.unblock')}
                </>
              ) : (
                <>
                  <EyeOff className="w-3 h-3" />
                  {t('profile.block')}
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
            {[
              { icon: History, label: t('profile.playedGames'), value: user.attendedGamesCount || 0 },
              { icon: Award, label: t('groups.members'), value: (groups || []).filter(g => g.memberIds.includes(user.id)).length },
              { icon: Users, label: t('profile.friends'), value: user.friendIds?.length || 0 },
              { icon: Award, label: t('profile.skillLevel'), value: t(`profile.levels.${user.skillLevel}`) }
            ].map((stat, i) => (
              <div key={i} className="bg-white p-3 rounded-2xl border border-[#141414]/5 text-center flex flex-col items-center justify-center shadow-sm min-h-[90px]">
                <div className="text-[8px] font-black uppercase opacity-40 mb-1 leading-tight h-6 flex items-center justify-center text-center">
                  {stat.label}
                </div>
                <p className="text-sm font-black truncate w-full">{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-[#141414]/5 shadow-sm">
              <p className="text-[10px] font-black uppercase opacity-40 mb-2">{t('profile.playStyle')}</p>
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-[#141414]" />
                <span className="text-sm font-black">{user.playStyle ? t(`profile.playStyles.${user.playStyle}`) : t('profile.playStyles.Casual')}</span>
              </div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-[#141414]/5 shadow-sm">
              <p className="text-[10px] font-black uppercase opacity-40 mb-2">{t('profile.reliability')}</p>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-black text-blue-600">{user.reliabilityStatus ? t(`profile.reliabilityStatus.${user.reliabilityStatus}`) : t('profile.reliabilityStatus.New Player')}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest opacity-40">{t('profile.bio')}</h3>
            <p className="text-sm opacity-70 leading-relaxed font-medium bg-white/50 p-4 rounded-2xl italic border border-[#141414]/5">
              "{user.bio || (lang === 'hu' ? 'Ez a játékos még nem írt bemutatkozást.' : 'This player hasn\'t written a bio yet.')}"
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-widest opacity-40 flex items-center gap-2">
                <BookOpen className="w-3 h-3" /> {t('profile.languages')}
              </h3>
              <div className="flex flex-wrap gap-2">
                {user.languages?.length ? user.languages.map(lang_val => (
                  <span key={lang_val} className="px-3 py-1 bg-white border border-[#141414]/5 rounded-xl text-[10px] font-bold">{t(`profile.languageList.${lang_val}`) || lang_val}</span>
                )) : <span className="text-[10px] opacity-30 italic">{t('common.noData')}</span>}
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-widest opacity-40 flex items-center gap-2">
                <Smartphone className="w-3 h-3" /> {t('profile.socialLinks')}
              </h3>
              <div className="flex gap-3">
                {(!user.privacySettings || user.privacySettings.showSocialLinks) ? (
                  <>
                    {user.socialLinks?.instagram && (
                      <a href={`https://instagram.com/${user.socialLinks.instagram}`} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-lg bg-gradient-to-tr from-orange-400 to-pink-500 flex items-center justify-center text-white shadow-md">
                        <Instagram className="w-4 h-4" />
                      </a>
                    )}
                    {user.socialLinks?.facebook && (
                      <a href="#" className="w-8 h-8 rounded-lg bg-[#1877F2] flex items-center justify-center text-white shadow-md">
                        <Facebook className="w-4 h-4" />
                      </a>
                    )}
                    {!user.socialLinks?.instagram && !user.socialLinks?.facebook && (
                      <span className="text-[10px] opacity-30 italic">{t('profile.privacy')}</span>
                    )}
                  </>
                ) : (
                  <div className="flex items-center gap-1 opacity-20">
                    <EyeOff className="w-3 h-3" />
                    <span className="text-[10px] font-bold uppercase">{t('profile.privacy')}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest opacity-40 flex items-center gap-2">
              <Target className="w-3 h-3" /> {t('profile.interests')}
            </h3>
            <div className="flex flex-wrap gap-2">
              {user.interests?.length ? user.interests.map(interest => (
                <span key={interest} className="px-3 py-1.5 bg-white border border-[#141414]/5 rounded-xl text-[10px] font-bold uppercase tracking-wider">
                  {t(`profile.interestsList.${interest}`) || interest}
                </span>
              )) : <span className="text-[10px] opacity-30 italic">{t('common.noData')}</span>}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-black uppercase tracking-widest opacity-40">{t('profile.matchHistory')}</h3>
              <History className="w-4 h-4 opacity-20" />
            </div>
            {(!user.privacySettings || user.privacySettings.showMatchHistory) ? (
              <MatchHistory games={userGames} />
            ) : (
              <div className="p-8 text-center bg-[#141414]/5 rounded-[32px] border border-dashed border-[#141414]/10">
                <EyeOff className="w-8 h-8 mx-auto mb-3 opacity-20" />
                <p className="text-[10px] font-black uppercase tracking-widest opacity-30">{lang === 'hu' ? 'Ez az előzmény privát' : 'Ez az előzmény privát'}</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
