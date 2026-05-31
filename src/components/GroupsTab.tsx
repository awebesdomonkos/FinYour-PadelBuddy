import React, { useState } from 'react';
import { Plus, MapPin, User as UserIcon, ChevronRight, MessageSquare, LogOut, Trash2, Shield } from 'lucide-react';
import { Group, User } from '../types.ts';
import { useI18n } from '../hooks/useI18n.ts';

export default function GroupsTab({
  groups,
  currentUser,
  onJoin,
  onOpenChat,
  onCreateClick,
  onLeaveGroup,
  onDeleteGroup,
  onMakeAdmin,
  onSelectGroup
}: {
  groups: Group[],
  currentUser: User | null,
  onJoin: (id: string) => void,
  onOpenChat: (group: Group) => void,
  onCreateClick: () => void,
  onLeaveGroup: (id: string) => void,
  onDeleteGroup: (id: string) => void,
  onMakeAdmin: (groupId: string, userId: string) => void,
  onSelectGroup: (group: Group) => void
}) {
  const { t, lang } = useI18n(currentUser?.languagePreference || 'hu');
  const [makeAdminGroupId, setMakeAdminGroupId] = useState<string | null>(null);
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tight">{t('groups.title')}</h2>
          <p className="text-xs opacity-40 font-bold uppercase tracking-widest">{t('groups.subTitle')}</p>
        </div>
        <button
          onClick={onCreateClick}
          className="w-12 h-12 bg-[#141414] text-[#E2FF3B] rounded-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-lg shadow-black/10"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {groups.length === 0 && (
          <div className="col-span-full py-16 flex flex-col items-center text-center gap-4 bg-white border border-[#141414]/5 rounded-3xl shadow-sm">
            <div className="w-20 h-20 bg-[#F8F8F5] rounded-3xl flex items-center justify-center text-4xl">👥</div>
            <div>
              <p className="font-black text-lg uppercase tracking-tight">{t('groups.noGroups')}</p>
              <p className="text-xs opacity-40 mt-1">{t('groups.subTitle')}</p>
            </div>
            <button
              onClick={onCreateClick}
              className="px-6 py-3 bg-[#141414] text-[#E2FF3B] rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#252525] transition-colors"
            >
              + {t('groups.createGroup')}
            </button>
          </div>
        )}
        {groups.map(group => {
          const isMember = (group.memberIds || []).includes(currentUser?.id || '');
          return (
            <div key={group.id} className="bg-white p-5 rounded-3xl border border-[#141414]/5 shadow-sm hover:shadow-md transition-all group">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-bold">{group.name}</h3>
                  <div className="flex items-center gap-1 opacity-40 text-[10px] font-black uppercase tracking-widest">
                    <MapPin className="w-3 h-3" /> {group.city}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {group.recommendedLevel && (
                    <span className="px-3 py-1 bg-[#141414] text-[#E2FF3B] rounded-full text-[10px] font-black uppercase tracking-widest">
                      {t(`profile.levels.${group.recommendedLevel}`)}
                    </span>
                  )}
                  <span className="text-[9px] font-black uppercase opacity-30 tracking-widest">
                    {group.visibility === 'public' ? t('groups.public') : t('groups.private')}
                  </span>
                </div>
              </div>
              <p className="text-xs opacity-60 leading-relaxed mb-4 line-clamp-2">{group.description}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {(group.memberIds || []).slice(0, 3).map(mid => (
                      <div key={mid} className="w-8 h-8 rounded-full border-2 border-white bg-[#141414]/10 overflow-hidden flex items-center justify-center">
                        <UserIcon className="w-4 h-4 opacity-40" />
                      </div>
                    ))}
                    {(group.memberIds || []).length > 3 && (
                      <div className="w-8 h-8 rounded-full border-2 border-white bg-[#141414] flex items-center justify-center text-[10px] font-black text-[#E2FF3B]">
                        +{group.memberIds.length - 3}
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] font-bold opacity-30 uppercase">{(group.memberIds || []).length} {t('groups.members')}</span>
                </div>
                {isMember ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => onSelectGroup(group)}
                      className="px-3 py-2.5 bg-[#141414]/5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#141414]/10 transition-all"
                      title={lang === 'hu' ? 'Részletek' : 'Details'}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onOpenChat(group)}
                      className="px-4 py-2.5 bg-[#141414] text-[#E2FF3B] rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      {t('games.chatShort') || 'Chat'}
                    </button>
                    {(() => {
                      const isAdmin = (group.adminIds || []).includes(currentUser?.id || '');
                      const isOnlyAdmin = isAdmin && (group.adminIds || []).length === 1;
                      return (
                        <div className="flex gap-1.5">
                          {/* Admin: törlés gomb */}
                          {isAdmin && (
                            <button
                              onClick={() => { if (window.confirm(lang === 'hu' ? 'Biztosan törlöd a csoportot?' : 'Delete this group?')) onDeleteGroup(group.id); }}
                              className="px-3 py-2.5 bg-red-50 text-red-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-100 transition-all"
                              title={lang === 'hu' ? 'Csoport törlése' : 'Delete group'}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {/* Admin: admin jog adása */}
                          {isAdmin && (
                            <div className="relative">
                              <button
                                onClick={() => setMakeAdminGroupId(makeAdminGroupId === group.id ? null : group.id)}
                                className="px-3 py-2.5 bg-yellow-50 text-yellow-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-yellow-100 transition-all"
                                title={lang === 'hu' ? 'Admin jog adása' : 'Grant admin'}
                              >
                                <Shield className="w-3.5 h-3.5" />
                              </button>
                              {makeAdminGroupId === group.id && (
                                <div className="absolute right-0 top-full mt-1 z-50 bg-white border border-[#141414]/10 rounded-2xl shadow-xl overflow-hidden w-48">
                                  <p className="px-3 py-2 text-[10px] font-black uppercase opacity-40">{lang === 'hu' ? 'Admin jogot kap:' : 'Grant admin to:'}</p>
                                  {(group.memberIds || []).filter(mid => mid !== currentUser?.id).map(mid => {
                                    const isAlreadyAdmin = (group.adminIds || []).includes(mid);
                                    return (
                                      <button
                                        key={mid}
                                        onClick={() => { onMakeAdmin(group.id, mid); setMakeAdminGroupId(null); }}
                                        disabled={isAlreadyAdmin}
                                        className={`w-full px-3 py-2.5 text-left text-xs font-bold transition-colors ${isAlreadyAdmin ? 'opacity-30 cursor-not-allowed' : 'hover:bg-[#E2FF3B]'}`}
                                      >
                                        {mid} {isAlreadyAdmin ? '✓' : ''}
                                      </button>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          )}
                          {/* Kilépés */}
                          {isOnlyAdmin ? (
                            <button
                              disabled
                              className="px-3 py-2.5 bg-gray-50 text-gray-300 rounded-xl text-[10px] font-black uppercase tracking-widest cursor-not-allowed"
                              title={lang === 'hu' ? 'Előbb adj admin jogot másnak' : 'Grant admin to someone first'}
                            >
                              <LogOut className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <button
                              onClick={() => onLeaveGroup(group.id)}
                              className="px-3 py-2.5 bg-red-50 text-red-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-100 transition-all"
                              title={t('groups.leaveGroup')}
                            >
                              <LogOut className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                ) : (
                  <button
                    onClick={() => onJoin(group.id)}
                    className="px-6 py-2.5 bg-[#E2FF3B] text-[#141414] rounded-xl text-xs font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all"
                  >
                    {t('common.join')}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
