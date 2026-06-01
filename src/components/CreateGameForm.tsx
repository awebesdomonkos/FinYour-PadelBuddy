import React, { useState, useEffect } from 'react';
import { MapPin, Clock, Calendar, Target, TrendingUp, Users, Award, Search, User as UserIcon, Check } from 'lucide-react';
import { Game, Group, User, GameType, SkillLevel } from '../types.ts';

export default function CreateGameForm({
  creatorId,
  token,
  groups,
  allUsers,
  onSuccess,
  t,
  lang,
  onShowTutorial,
  gameToEdit
}: {
  creatorId: string,
  token: string,
  groups: Group[],
  allUsers: User[],
  onSuccess: () => void,
  t: (key: string) => string,
  lang: string,
  onShowTutorial?: () => void,
  gameToEdit?: Game | null
}) {
  const [formData, setFormData] = useState({
    location: '',
    datetime: '',
    requiredPlayers: '3',
    recommendedLevel: SkillLevel.Silver,
    gameType: GameType.Friendly,
    note: '',
    recurrence: 'none',
    groupId: '',
    visibility: 'public' as 'public' | 'group-only' | 'invite-only',
    invitedUserIds: [] as string[]
  });

  const [inviteSearch, setInviteSearch] = useState('');

  useEffect(() => {
    if (gameToEdit) {
      setFormData({
        location: gameToEdit.location,
        datetime: gameToEdit.datetime.split(':').slice(0, 2).join(':'),
        requiredPlayers: String(gameToEdit.requiredPlayers),
        recommendedLevel: gameToEdit.recommendedLevel || SkillLevel.Silver,
        gameType: gameToEdit.gameType || GameType.Friendly,
        note: gameToEdit.note || '',
        recurrence: gameToEdit.isRecurring ? 'weekly' : 'none',
        groupId: gameToEdit.groupId || '',
        visibility: gameToEdit.visibility || 'public',
        invitedUserIds: gameToEdit.invitedUserIds || []
      });
    } else {
      const repeatData = localStorage.getItem('padel_repeat_game');
      if (repeatData) {
        const g = JSON.parse(repeatData) as Game;
        setFormData({
          location: g.location,
          datetime: '',
          requiredPlayers: String(g.requiredPlayers),
          recommendedLevel: g.recommendedLevel || SkillLevel.Silver,
          gameType: g.gameType || GameType.Friendly,
          note: g.note || '',
          recurrence: 'none',
          groupId: '',
          visibility: 'public',
          invitedUserIds: []
        });
        localStorage.removeItem('padel_repeat_game');
      }
    }
  }, [gameToEdit]);

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    if (!formData.location.trim()) { setSubmitError(lang === 'hu' ? 'Add meg a helyszínt!' : 'Helyszín megadása kötelező!'); return; }
    if (!formData.datetime) { setSubmitError(lang === 'hu' ? 'Add meg az időpontot!' : 'Dátum és időpont megadása kötelező!'); return; }
    const gameDate = new Date(formData.datetime);
    if (formData.datetime && gameDate < new Date() && !gameToEdit) { setSubmitError(lang === 'hu' ? 'Az időpont a múltban van! Adj meg jövőbeli időpontot.' : 'Date must be in the future!'); return; }
    setIsSubmitting(true);
    try {
      const url = gameToEdit ? `/api/games/${gameToEdit.id}` : '/api/games';
      const method = gameToEdit ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ ...formData, creator_id: creatorId })
      });
      if (res.ok) {
        onSuccess();
      } else {
        const data = await res.json().catch(() => ({}));
        setSubmitError(data?.message || (lang === 'hu' ? 'Hiba történt, próbáld újra!' : 'Valami hiba történt, próbáld újra!'));
      }
    } catch (err) {
      setSubmitError(lang === 'hu' ? 'Hálózati hiba. Ellenőrizd az internetkapcsolatot.' : 'Hálózati hiba. Ellenőrizd az internetkapcsolatot.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleInvite = (userId: string) => {
    setFormData(prev => ({
      ...prev,
      invitedUserIds: prev.invitedUserIds.includes(userId)
        ? prev.invitedUserIds.filter(id => id !== userId)
        : [...prev.invitedUserIds, userId]
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 w-full min-w-0">
      <div className="grid grid-cols-1 gap-4 w-full">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest opacity-40 px-1">{t('games.location')}</label>
          <div className="relative">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40" />
            <input
              type="text"
              required
              value={formData.location}
              onChange={e => setFormData({ ...formData, location: e.target.value })}
              placeholder="e.g. Club Padel World"
              className="w-full bg-[#141414]/5 border-none rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-[#E2FF3B] outline-none"
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest opacity-40 px-1">{t('notifications.reminders')}</label>
          <div className="relative">
            <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40" />
            <select
              value={formData.recurrence}
              onChange={e => setFormData({ ...formData, recurrence: e.target.value })}
              className="w-full bg-[#141414]/5 border-none rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-[#E2FF3B] outline-none appearance-none"
            >
              <option value="none">{lang === 'hu' ? 'Egyszeri alkalom' : 'Egyszeri meccs'}</option>
              <option value="weekly">{lang === 'hu' ? 'Minden héten' : 'Minden héten'}</option>
              <option value="biweekly">{lang === 'hu' ? '2 hetente' : '2 hetente'}</option>
              <option value="monthly">{lang === 'hu' ? 'Havonta' : 'Havonta'}</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest opacity-40 px-1">{t('common.datetime')}</label>
          <div className="relative">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40" />
            <input
              type="datetime-local"
              required
              value={formData.datetime}
              onChange={e => setFormData({ ...formData, datetime: e.target.value })}
              className="w-full bg-[#141414]/5 border-none rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-[#E2FF3B] outline-none box-border"
              style={{ maxWidth: '100%' }}
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest opacity-40 px-1">{t('games.type')}</label>
          <div className="relative">
            <Target className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40" />
            <select
              value={formData.gameType}
              onChange={e => setFormData({ ...formData, gameType: e.target.value as GameType })}
              className="w-full bg-[#141414]/5 border-none rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-[#E2FF3B] outline-none appearance-none"
            >
              <option value={GameType.Friendly}>{t('games.gameTypes.Friendly')}</option>
              <option value={GameType.Competitive}>{t('games.gameTypes.Competitive')}</option>
              <option value={GameType.Training}>{t('games.gameTypes.Training')}</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center px-1">
            <label className="text-xs font-bold uppercase tracking-widest opacity-40">{t('games.level')}</label>
            <button
              type="button"
              onClick={onShowTutorial}
              className="p-1 hover:bg-[#141414]/5 rounded-lg transition-colors"
            >
              <Award className="w-3.5 h-3.5 opacity-40" />
            </button>
          </div>
          <div className="relative">
            <TrendingUp className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40" />
            <select
              value={formData.recommendedLevel}
              onChange={e => setFormData({ ...formData, recommendedLevel: e.target.value as SkillLevel })}
              className="w-full bg-[#141414]/5 border-none rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-[#E2FF3B] outline-none appearance-none"
            >
              {Object.values(SkillLevel).map(lvl => <option key={lvl} value={lvl}>{t(`profile.levels.${lvl}`)}</option>)}
            </select>
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest opacity-40 px-1">{t('games.required')}</label>
          <div className="relative">
            <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40" />
            <select
              value={formData.requiredPlayers}
              onChange={e => setFormData({ ...formData, requiredPlayers: e.target.value })}
              className="w-full bg-[#141414]/5 border-none rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-[#E2FF3B] outline-none appearance-none"
            >
              <option value="1">{`1 ${t('games.players')}`}</option>
              <option value="2">{`2 ${t('games.players')}`}</option>
              <option value="3">{`3 ${t('games.players')}`}</option>
              <option value="4">{`4 ${t('games.players')}`}</option>
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-widest opacity-40 px-1">{t('games.note')}</label>
        <textarea
          value={formData.note}
          onChange={e => setFormData({ ...formData, note: e.target.value })}
          placeholder={t('games.notePlaceholder')}
          className="w-full bg-[#141414]/5 border-none rounded-2xl py-4 px-6 text-sm focus:ring-2 focus:ring-[#E2FF3B] outline-none min-h-[100px]"
        />
      </div>

      <div className="pt-4 border-t border-[#141414]/5 space-y-6">
        <div className="space-y-1">
          <label className="text-xs font-bold uppercase tracking-widest opacity-40 px-1">{t('games.visibility')}</label>
          <div className="grid grid-cols-3 gap-2">
            {(['public', 'group-only', 'invite-only'] as const).map(v => (
              <button
                key={v}
                type="button"
                onClick={() => setFormData({ ...formData, visibility: v })}
                className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  formData.visibility === v ? 'bg-[#141414] text-[#E2FF3B]' : 'bg-[#141414]/5 text-[#141414]/40'
                }`}
              >
                {v === 'public' ? t('games.public') : v === 'group-only' ? t('games.groupOnly') : t('games.inviteOnly')}
              </button>
            ))}
          </div>
        </div>

        {formData.visibility === 'group-only' && (
          <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
            <label className="text-xs font-bold uppercase tracking-widest opacity-40 px-1">{t('games.selectGroup')}</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {groups.map(g => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, groupId: g.id })}
                  className={`p-4 rounded-2xl text-left border transition-all ${
                    formData.groupId === g.id
                    ? 'border-[#E2FF3B] bg-[#E2FF3B]/5 ring-1 ring-[#E2FF3B]'
                    : 'border-[#141414]/5 bg-[#141414]/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#141414] flex items-center justify-center text-[#E2FF3B] font-black italic">
                      {g.name[0]}
                    </div>
                    <div>
                      <p className="text-sm font-bold">{g.name}</p>
                      <p className="text-[10px] opacity-40 uppercase font-black">{g.memberIds.length} {t('groups.members')}</p>
                    </div>
                  </div>
                </button>
              ))}
              {groups.length === 0 && <p className="text-xs opacity-40 italic">{t('games.noGroups')}</p>}
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <label className="text-xs font-bold uppercase tracking-widest opacity-40">{t('games.inviteFriends') || 'Invite People'}</label>
            <div className="relative w-32 sm:w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 opacity-30" />
              <input
                type="text"
                value={inviteSearch}
                onChange={e => setInviteSearch(e.target.value)}
                placeholder={t('common.search')}
                className="w-full bg-[#141414]/5 border-none rounded-xl py-2 pl-8 pr-3 text-[10px] focus:ring-1 focus:ring-[#E2FF3B] outline-none"
              />
            </div>
          </div>

          <div className="max-h-48 overflow-y-auto space-y-2 pr-2 scrollbar-none">
            {(() => {
              const currentUser = allUsers.find(u => u.id === creatorId);
              const friendIds = currentUser?.friendIds || [];
              const groupMemberIds = formData.groupId ? (groups.find(g => g.id === formData.groupId)?.memberIds || []) : [];

              const potentialInvitees = allUsers.filter(u =>
                u.id !== creatorId &&
                (
                  friendIds.includes(u.id) ||
                  groupMemberIds.includes(u.id) ||
                  formData.invitedUserIds.includes(u.id)
                )
              );

              const filteredInvitees = potentialInvitees.filter(u =>
                u.name.toLowerCase().includes(inviteSearch.toLowerCase()) ||
                u.username.toLowerCase().includes(inviteSearch.toLowerCase())
              );

              if (filteredInvitees.length === 0) {
                return <p className="text-xs opacity-40 italic text-center py-4">{t('common.noData')}</p>;
              }

              return filteredInvitees.map(f => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => {
                    const ids = formData.invitedUserIds.includes(f.id)
                      ? formData.invitedUserIds.filter(id => id !== f.id)
                      : [...formData.invitedUserIds, f.id];
                    setFormData({ ...formData, invitedUserIds: ids });
                  }}
                  className={`w-full p-3 rounded-2xl text-left flex items-center justify-between border transition-all ${
                    formData.invitedUserIds.includes(f.id)
                    ? 'border-[#E2FF3B] bg-[#E2FF3B]/5 ring-1 ring-[#E2FF3B]'
                    : 'border-[#141414]/5 bg-[#141414]/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#141414] overflow-hidden flex items-center justify-center border-2 border-white shadow-sm">
                      {f.avatarUrl ? <img src={f.avatarUrl} className="w-full h-full object-cover" /> : <UserIcon className="w-5 h-5 text-[#E2FF3B]" />}
                    </div>
                    <div>
                      <p className="text-sm font-bold">{f.name}</p>
                      <div className="flex gap-1">
                        {friendIds.includes(f.id) && <span className="text-[8px] uppercase font-black px-1.5 py-0.5 bg-blue-100 text-blue-600 rounded-md">{t('profile.friends')}</span>}
                        {groupMemberIds.includes(f.id) && <span className="text-[8px] uppercase font-black px-1.5 py-0.5 bg-purple-100 text-purple-600 rounded-md">{t('nav.groups')}</span>}
                      </div>
                    </div>
                  </div>
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${formData.invitedUserIds.includes(f.id) ? 'bg-green-500 text-white' : 'bg-white/50 text-white/0'}`}>
                    <Check className="w-4 h-4" />
                  </div>
                </button>
              ));
            })()}
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-[#141414] text-[#E2FF3B] py-5 rounded-2xl font-black uppercase tracking-widest hover:scale-[1.01] active:scale-95 transition-all shadow-xl shadow-black/10 disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {isSubmitting
          ? <><div className="w-4 h-4 border-2 border-[#E2FF3B]/30 border-t-[#E2FF3B] rounded-full animate-spin" />{lang === 'hu' ? 'Mentés...' : 'Mentés...'}</>
          : (gameToEdit ? t('common.save') : t('games.createGame'))
        }
      </button>
      {submitError && <p className="text-xs font-bold text-red-500 text-center">{submitError}</p>}
    </form>
  );
}
