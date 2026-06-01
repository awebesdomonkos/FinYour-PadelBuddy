import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus,
  MapPin,
  Search,
  User as UserIcon,
  TrendingUp,
  Edit2,
  Edit,
  AlertCircle,
  History,
  Users,
  MessageSquare,
  ChevronDown,
  Calendar,
  Clock,
  ArrowLeft,
  Heart,
  Target,
  X,
  LogOut,
  Trash2,
} from 'lucide-react';
import { useI18n } from './hooks/useI18n.ts';
import { useAuth } from './context/AuthContext.tsx';
import {
  User,
  Game,
  LFGStatus,
  Club,
  Group,
  Notification as PadelNotification,
  Language
} from './types.ts';

import ProfileCompleteness from './components/ProfileCompleteness.tsx';
import ErrorBoundary from './components/ErrorBoundary.tsx';
import GameCard from './components/GameCard.tsx';
import AttendanceModal from './components/AttendanceModal.tsx';
import PlayerCard from './components/PlayerCard.tsx';
import CreateGameForm from './components/CreateGameForm.tsx';
import { AuthScreen, RegistrationForm, LoginForm } from './components/AuthScreens.tsx';
import ProfileEdit from './components/ProfileEdit.tsx';
import ChatDrawer from './components/ChatDrawer.tsx';
import NotificationsDrawer from './components/NotificationsDrawer.tsx';
import GroupChatDrawer from './components/GroupChatDrawer.tsx';
import GroupsTab from './components/GroupsTab.tsx';
import MatchHistory from './components/MatchHistory.tsx';
import ResultModal from './components/ResultModal.tsx';
import ProfileDrawer from './components/ProfileDrawer.tsx';
import NavBtn from './components/NavBtn.tsx';
import LevelTutorial from './components/LevelTutorial.tsx';
import CreateGroupModal from './components/CreateGroupModal.tsx';
import GameDetailDrawer from './components/GameDetailDrawer.tsx';
import RatingModal from './components/RatingModal.tsx';
import { OnboardingWizard } from './OnboardingWizard.tsx';

export default function App() {
  const { currentUser, token, login, register, logout, updateUser, authError, setAuthError, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'games' | 'players' | 'profile' | 'create' | 'groups' | 'mygames'>('games');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [games, setGames] = useState<Game[]>([]);
  const [players, setPlayers] = useState<User[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [notifications, setNotifications] = useState<PadelNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filters
  const [gameFilter, setGameFilter] = useState<'all' | 'today' | 'tomorrow' | 'weekend' | 'lastminute'>('all');
  const [playerFilter, setPlayerFilter] = useState<'all' | 'active' | 'lfg' | 'friends'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals / Overlays
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<User | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isGroupChatOpen, setIsGroupChatOpen] = useState(false);
  const [isAttendanceOpen, setIsAttendanceOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);
  const [isLevelTutorialOpen, setIsLevelTutorialOpen] = useState(false);
  const [gameToEdit, setGameToEdit] = useState<Game | null>(null);
  const { t, lang, setLang } = useI18n('hu');

  // Registration/Auth state
  const [authForm, setAuthForm] = useState({ username: '', name: '', email: '', password: '', phone: '' });
  const [authMode, setAuthMode] = useState<'landing' | 'login' | 'register'>('landing');
  const [isCompletingProfile, setIsCompletingProfile] = useState(false);
  const onboardingDoneRef = React.useRef(false);
  const [onboardingStep, setOnboardingStep] = useState(1); // 1, 2, 3
  const [ratingGameId, setRatingGameId] = useState<string | null>(null);
  const [selectedGroupDetail, setSelectedGroupDetail] = useState<Group | null>(null);
  const [reminderGame, setReminderGame] = useState<Game | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string, duration = 2500) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), duration);
  };

  const safeFetch = async (url: string, options: RequestInit = {}) => {
    const response = await fetch(url, options);
    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error(`Server returned invalid JSON response from ${url}`);
    }
    if (!response.ok) {
      throw new Error(data?.message || data?.error || `Request to ${url} failed`);
    }
    // Auto-unwrap standard responses
    if (data && data.success === true && data.data !== undefined) {
      return data.data;
    }
    return data;
  };

  const authHeaders = useCallback((): Record<string, string> => ({
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  }), [token]);

  const updateReminders = useCallback((gamesList: Game[]) => {
    if (!currentUser?.id) return;
    const now = Date.now();
    const upcoming = gamesList
      .filter(g => (g.joinedPlayers || []).includes(currentUser.id) && g.status !== 'played' && g.status !== 'cancelled')
      .filter(g => {
        const dt = g.datetime || (g.date && g.time ? `${g.date}T${g.time}` : null);
        if (!dt) return false;
        const diff = new Date(dt).getTime() - now;
        return diff > 0 && diff < 7200000;
      })
      .sort((a, b) => new Date(a.datetime || a.date || '').getTime() - new Date(b.datetime || b.date || '').getTime());
    const found = upcoming.find(g => !localStorage.getItem(`reminded_${g.id}`));
    setReminderGame(found || null);
  }, [currentUser?.id]);

  const fetchGames = useCallback(async () => {
    try {
      const data = await safeFetch('/api/games', { headers: authHeaders() });
      const list = Array.isArray(data) ? data : [];
      const unique = list.filter((g, idx, arr) => arr.findIndex(x => x.id === g.id) === idx);
      setGames(unique);
      updateReminders(unique);
    } catch (err) { console.error("Failed to fetch games", err); }
  }, [authHeaders, updateReminders]);

  const fetchPlayers = useCallback(async () => {
    try {
      const data = await safeFetch('/api/users', { headers: authHeaders() });
      setPlayers(Array.isArray(data) ? data : []);
    } catch (err) { console.error("Failed to fetch players", err); }
  }, [authHeaders]);

  const fetchGroups = useCallback(async () => {
    try {
      const data = await safeFetch('/api/groups', { headers: authHeaders() });
      setGroups(Array.isArray(data) ? data : []);
    } catch (err) { console.error("Failed to fetch groups", err); }
  }, [authHeaders]);

  const fetchNotifications = useCallback(async () => {
    try {
      const data = await safeFetch('/api/notifications/me', { headers: authHeaders() });
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) { console.error("Failed to fetch notifications", err); }
  }, [authHeaders]);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const headers = authHeaders();
      const [gamesData, playersData, groupsData, clubsData, notifsData] = await Promise.all([
        safeFetch('/api/games', { headers }),
        safeFetch('/api/users', { headers }),
        safeFetch('/api/groups', { headers }),
        safeFetch('/api/clubs', { headers }),
        safeFetch('/api/notifications/me', { headers })
      ]);
      const unique = (Array.isArray(gamesData) ? gamesData : []).filter((g, idx, arr) => arr.findIndex(x => x.id === g.id) === idx);
      setGames(unique);
      setPlayers(Array.isArray(playersData) ? playersData : []);
      setGroups(Array.isArray(groupsData) ? groupsData : []);
      setClubs(Array.isArray(clubsData) ? clubsData : []);
      setNotifications(Array.isArray(notifsData) ? notifsData : []);
      updateReminders(unique);
    } catch (err) {
      console.error("Failed to fetch data", err);
    } finally {
      setIsLoading(false);
    }
  }, [authHeaders, updateReminders]);

  useEffect(() => {
    if (currentUser?.languagePreference) {
      setLang(currentUser.languagePreference);
    } else {
      setLang('hu');
    }
  }, [currentUser?.languagePreference, setLang]);

  // Keep selectedGame in sync with games array; close modals if game was deleted
  useEffect(() => {
    if (selectedGame) {
      const fresh = (games || []).find(g => g.id === selectedGame.id);
      if (fresh) {
        setSelectedGame(fresh);
      } else {
        // Game was deleted — close all related modals
        setSelectedGame(null);
        setIsChatOpen(false);
        setIsAttendanceOpen(false);
        setIsResultModalOpen(false);
        setIsDetailOpen(false);
      }
    }
  }, [games]);

  // Deep link: ?game=xyz opens game detail on load
  useEffect(() => {
    if (!currentUser || !games.length) return;
    const params = new URLSearchParams(window.location.search);
    const gameId = params.get('game');
    if (gameId) {
      const game = games.find(g => g.id === gameId);
      if (game) {
        setSelectedGame(game);
        setIsDetailOpen(true);
        // Clean URL without reload
        window.history.replaceState({}, '', window.location.pathname);
      }
    }
  }, [currentUser, games]);

  useEffect(() => {
    if (currentUser?.id) {
      fetchData();
      const onboardingDoneLocal = localStorage.getItem(`onboarding_done_${currentUser.id}`);
      const onboardingDoneDB = currentUser.onboardingDone === true;
      if (!onboardingDoneRef.current && !onboardingDoneLocal && !onboardingDoneDB) {
        setIsCompletingProfile(true);
        setOnboardingStep(1);
      } else {
        setIsCompletingProfile(false);
        if (onboardingDoneDB && !onboardingDoneLocal) {
          localStorage.setItem(`onboarding_done_${currentUser.id}`, '1');
        }
      }
    } else if (!authLoading) {
      setAuthMode('landing');
      fetchData();
    }
  }, [currentUser, authLoading, fetchData]);

  // Poll notifications every 30s when logged in
  useEffect(() => {
    if (!currentUser?.id) return;
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [currentUser?.id, fetchNotifications]);

  // Poll active game chat every 5s when chat is open
  useEffect(() => {
    if (!isChatOpen || !selectedGame) return;
    const interval = setInterval(fetchGames, 5000);
    return () => clearInterval(interval);
  }, [isChatOpen, selectedGame?.id, fetchGames]);

  // Poll group chat every 5s when group chat is open
  useEffect(() => {
    if (!isGroupChatOpen || !selectedGroup) return;
    const fetchGroup = async () => {
      try {
        const data = await safeFetch(`/api/groups/${selectedGroup.id}`, { headers: authHeaders() });
        if (data?.chat) setSelectedGroup(prev => prev ? { ...prev, chat: data.chat } : prev);
      } catch { /* silent */ }
    };
    const interval = setInterval(fetchGroup, 5000);
    return () => clearInterval(interval);
  }, [isGroupChatOpen, selectedGroup?.id, authHeaders]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#F5F5F0] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#141414] border-t-[#E2FF3B] rounded-full animate-spin"></div>
          <p className="font-black uppercase tracking-tighter italic text-sm opacity-50">Find Your Padel Buddy</p>
        </div>
      </div>
    );
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register(authForm);
      setAuthMode('landing');
      // If registration is successful, AuthContext updates currentUser
      // which triggers the useEffect that sets isCompletingProfile
    } catch (err) {
      // Error handled by context
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(authForm.email.toLowerCase().trim(), authForm.password);
      setAuthMode('landing');
    } catch (err) {
      // Error handled by context
    }
  };

  const handleProfileComplete = async (data: Partial<User>) => {
    if (!currentUser) return;
    try {
      await safeFetch(`/api/users/${currentUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ...data, onboardingDone: true })
      });
      onboardingDoneRef.current = true;
      if (currentUser?.id) localStorage.setItem(`onboarding_done_${currentUser.id}`, '1');
      updateUser({ ...data, onboardingDone: true });
      setIsCompletingProfile(false);
      setActiveTab('games');
      showToast('✅ ' + (lang === 'hu' ? 'Profil sikeresen mentve!' : 'Profile saved!'));
      fetchData();
    } catch (err: any) {
      console.error('Profile save error:', err);
      showToast('❌ ' + (lang === 'hu' ? 'Hiba: ' : 'Error: ') + (err?.message || (lang === 'hu' ? 'Mentés sikertelen' : 'Save failed')));
    }
  };

  const handleLogout = () => {
    logout();
    setAuthMode('landing');
  };


  const handleJoinGame = async (gameId: string) => {
    if (!currentUser) return;
    try {
      // Always call /request - the API auto-joins for public games
      await safeFetch(`/api/games/${gameId}/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId: currentUser?.id, userName: currentUser?.name })
      });
      fetchGames();
      showToast('✅ ' + (lang === 'hu' ? 'Csatlakoztál a meccshez!' : 'Joined the game!'));
    } catch (err: any) {
      console.error("Failed to request joining game", err);
      showToast('❌ ' + (err?.message || (lang === 'hu' ? 'Csatlakozás sikertelen' : 'Failed to join')));
    }
  };

  const handleDeleteGame = async (gameId: string) => {
    const confirmed = window.confirm(lang === 'hu' ? 'Biztosan törlöd ezt a meccset?' : 'Are you sure you want to delete this game?');
    if (!confirmed) return;
    try {
      await safeFetch(`/api/games/${gameId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchGames();
      showToast('✅ ' + (lang === 'hu' ? 'Meccs törölve' : 'Game deleted'));
    } catch (err: any) {
      console.error("Failed to delete game", err);
      showToast('❌ ' + (err?.message || (lang === 'hu' ? 'Törlés sikertelen' : 'Delete failed')));
    }
  };

  const handleToggleBlock = async (targetId: string) => {
    if (!currentUser) return;
    try {
      const data = await safeFetch(`/api/users/${targetId}/block`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId: currentUser?.id })
      });
      const updatedUser = data?.user || data?.data || data;
      if (updatedUser?.id) updateUser(updatedUser);
      fetchPlayers();
      // If the blocked player was selected, maybe close the profile
      if (selectedPlayer?.id === targetId) {
        setSelectedPlayer(null);
      }
    } catch (err) {
      console.error("Failed to toggle block", err);
    }
  };

  const handleApproveRequest = async (gameId: string, userId: string, approve: boolean) => {
    try {
      await safeFetch(`/api/games/${gameId}/approve`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId, approve })
      });
      fetchGames();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendMessage = async (gameId: string, text: string) => {
    if (!currentUser) return;
    const optimisticMsg = { id: crypto.randomUUID(), userId: currentUser.id, userName: currentUser.name, text, timestamp: new Date().toISOString() };
    // Optimistic update
    setGames(prev => prev.map(g => g.id === gameId ? { ...g, chat: [...(g.chat || []), optimisticMsg] } : g));
    if (selectedGame?.id === gameId) setSelectedGame(prev => prev ? { ...prev, chat: [...(prev.chat || []), optimisticMsg] } : prev);
    try {
      const updatedGame = await safeFetch(`/api/games/${gameId}/chat`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId: currentUser?.id, userName: currentUser?.name, text })
      });
      if (updatedGame?.chat) {
        setGames(prev => prev.map(g => g.id === gameId ? { ...g, chat: updatedGame.chat } : g));
        if (selectedGame?.id === gameId) setSelectedGame(prev => prev ? { ...prev, chat: updatedGame.chat } : prev);
      }
    } catch (err) {
      console.error(err);
      showToast('❌ ' + (lang === 'hu' ? 'Üzenet küldése sikertelen' : 'Failed to send message'));
    }
  };

  const handleToggleFavorite = async (targetUserId: string) => {
    if (!currentUser) return;
    try {
      const data = await safeFetch(`/api/users/${currentUser.id}/favorite`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ targetUserId })
      });
      const updatedUser = data?.user || data?.data || data;
      if (updatedUser?.id) updateUser(updatedUser);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRepeatGame = (game: Game) => {
    localStorage.setItem('padel_repeat_game', JSON.stringify(game));
    setActiveTab('create');
  };

  const handleConfirmAttendance = async (gameId: string, records: Record<string, "appeared" | "missed">) => {
    try {
      await safeFetch(`/api/games/${gameId}/attendance`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ attendanceRecords: records, status: 'played', isCompleted: true })
      });
      fetchGames();
      fetchPlayers();
      setIsAttendanceOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendGroupMessage = async (text: string) => {
    if (!currentUser || !selectedGroup) return;
    const optimisticMsg = { id: crypto.randomUUID(), userId: currentUser.id, userName: currentUser.name, text, timestamp: new Date().toISOString() };
    // Optimistic update
    setSelectedGroup(prev => prev ? { ...prev, chat: [...(prev.chat || []), optimisticMsg] } : prev);
    try {
      const updatedGroup = await safeFetch(`/api/groups/${selectedGroup.id}/chat`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId: currentUser?.id, userName: currentUser?.name, text })
      });
      if (updatedGroup?.chat) {
        setSelectedGroup(prev => prev ? { ...prev, chat: updatedGroup.chat } : prev);
      }
    } catch (err) {
      console.error("Failed to send group message", err);
      showToast('❌ ' + (lang === 'hu' ? 'Üzenet küldése sikertelen' : 'Failed to send message'));
    }
  };

  const handleJoinGroup = async (groupId: string) => {
    if (!currentUser) return;
    try {
      await safeFetch(`/api/groups/${groupId}/join`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId: currentUser?.id })
      });
      fetchGroups();
    } catch (err) {
      console.error("Failed to join group", err);
    }
  };

  const handleRecordResult = async (gameId: string, result: { score: string, sets: { team1: number, team2: number }[] }) => {
    try {
      await safeFetch(`/api/games/${gameId}/result`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(result)
      });
      fetchGames();
      setIsResultModalOpen(false);
    } catch (err) {
      console.error("Failed to record result", err);
    }
  };

  const handleSendFriendRequest = async (toUserId: string) => {
    if (!currentUser) return;
    if ((currentUser.friendIds || []).includes(toUserId)) {
      showToast(lang === 'hu' ? 'Már barátok vagytok!' : 'Already friends!');
      return;
    }
    try {
      await safeFetch('/api/friends/request', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ fromUserId: currentUser?.id, toUserId })
      });
      showToast('✅ ' + (lang === 'hu' ? 'Barátkérés elküldve!' : 'Friend request sent!'));
    } catch (err: any) {
      console.error("Failed to send friend request", err);
      showToast('❌ ' + (err?.message || (lang === 'hu' ? 'Hiba történt' : 'Error')));
    }
  };

  const handleFriendResponse = async (requestId: string, status: 'accepted' | 'rejected') => {
    try {
      const data = await safeFetch('/api/friends/respond', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ requestId, status })
      });
      const updatedUser = data?.user || data?.data || data;
      if (updatedUser?.id) updateUser(updatedUser);
      fetchPlayers();
      if (status === 'accepted') {
        showToast('✅ ' + (lang === 'hu' ? 'Barát elfogadva!' : 'Friend request accepted!'));
      } else {
        showToast(lang === 'hu' ? 'Kérés elutasítva' : 'Request declined');
      }
    } catch (err: any) {
      console.error("Failed to respond to friend request", err);
      showToast('❌ ' + (err?.message || 'Error'));
    }
  };

  const handleGameInviteResponse = async (gameId: string, status: 'accepted' | 'rejected', notifId: string) => {
    try {
      if (status === 'accepted') {
        await safeFetch(`/api/games/${gameId}/request`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ userId: currentUser?.id, userName: currentUser?.name })
        });
        showToast('✅ ' + (lang === 'hu' ? 'Csatlakoztál a meccshez!' : 'Joined the game!'));
      } else {
        showToast(lang === 'hu' ? 'Meghívás elutasítva' : 'Invite declined');
      }
      // Mark notification as read
      setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, read: true } : n));
      fetchGames();
    } catch (err: any) {
      showToast('❌ ' + (err?.message || 'Error'));
    }
  };

  const handleShareGame = async (game: Game) => {
    const gameDateTime = game.datetime || (game.date && game.time ? `${game.date}T${game.time}` : null);
    const dateStr = gameDateTime
      ? new Date(gameDateTime).toLocaleDateString('hu-HU', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
      : '';
    const joined = (game.joinedPlayers || []).length;
    const total = Number(game.requiredPlayers || 4);
    const url = `${window.location.origin}?game=${game.id}`;
    const level = game.recommendedLevel ? `${game.recommendedLevel} szint | ` : '';
    const text = `🎾 Padel meccs — ${game.location}
📅 ${dateStr}
📊 ${level}${game.gameType || ''}
👥 ${total - joined} szabad hely
`;

    try {
      if (navigator.share) {
        await navigator.share({ title: 'Find Your Padel Buddy', text, url });
        return;
      }
      // WhatsApp fallback
      const waUrl = `https://wa.me/?text=${encodeURIComponent(text + url)}`;
      window.open(waUrl, '_blank');
    } catch (err) {
      // Clipboard fallback
      try {
        await navigator.clipboard.writeText(url);
        showToast('🔗 ' + (lang === 'hu' ? 'Link másolva!' : 'Link copied!'));
      } catch {
        showToast('❌ ' + (lang === 'hu' ? 'Megosztás sikertelen' : 'Share failed'));
      }
    }
  };

  const handleRateGame = async (gameId: string, ratings: { userId: string; reliable: boolean; goodPlayer: boolean }[]) => {
    try {
      await safeFetch(`/api/games/${gameId}/rate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ ratings })
      });
      showToast('⭐ ' + (lang === 'hu' ? 'Értékelés elküldve, köszönöm!' : 'Rating submitted, thank you!'));
      fetchGames();
      fetchPlayers();
    } catch (err: any) {
      showToast('❌ ' + (err?.message || 'Hiba'));
    }
  };

  const handleLeaveGame = async (gameId: string) => {
    if (!currentUser) return;
    try {
      await safeFetch(`/api/games/${gameId}/leave`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ userId: currentUser.id })
      });
      showToast(lang === 'hu' ? '✅ Kilépés sikeres' : '✅ Left the game');
      fetchGames();
    } catch (err: any) {
      showToast('❌ ' + (err?.message || 'Hiba történt'));
    }
  };

  const handleRemoveFriend = async (friendId: string) => {
    if (!currentUser) return;
    try {
      await safeFetch(`/api/friends/remove`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ friendId })
      });
      updateUser({ friendIds: (currentUser.friendIds || []).filter(id => id !== friendId) });
      showToast(lang === 'hu' ? '✅ Barát eltávolítva' : '✅ Friend removed');
      fetchPlayers();
    } catch (err: any) {
      showToast('❌ ' + (err?.message || 'Hiba'));
    }
  };

  const handleLeaveGroup = async (groupId: string) => {
    if (!currentUser) return;
    try {
      await safeFetch(`/api/groups/${groupId}/leave`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ userId: currentUser.id })
      });
      showToast(lang === 'hu' ? '✅ Kilépés sikeres' : '✅ Left the group');
      fetchGroups();
    } catch (err: any) {
      showToast('❌ ' + (err?.message || 'Hiba'));
    }
  };

  const handleCreateGroup = async (groupData: Partial<Group>) => {
    if (!currentUser) return;
    try {
      await safeFetch('/api/groups', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ...groupData, adminId: currentUser?.id })
      });
      fetchGroups();
      setActiveTab('groups');
    } catch (err) {
      console.error("Failed to create group", err);
    }
  };

  const handleInviteToGroup = async (groupId: string, invitedUserId: string) => {
    if (!currentUser) return;
    try {
      await safeFetch(`/api/groups/${groupId}/invite`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ invitedUserId, invitedByUserId: currentUser?.id })
      });
      fetchGroups();
    } catch (err) {
      console.error("Failed to invite to group", err);
    }
  };

  // Hide a single game from the user's history (non-creator)
  const handleHideFromHistory = async (gameId: string) => {
    if (!currentUser) return;
    const hidden = [...(currentUser.hiddenFromHistory || []), gameId];
    updateUser({ hiddenFromHistory: hidden });
    try {
      await safeFetch(`/api/users/${currentUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ hiddenFromHistory: hidden })
      });
    } catch (err) { console.error(err); }
  };

  // Clear all past games from history
  const handleClearHistory = async () => {
    if (!currentUser) return;
    const confirmed = window.confirm(
      lang === 'hu'
        ? 'Biztosan törlöd az összes meccselőzményt? Ez nem vonható vissza.'
        : 'Are you sure you want to clear all match history? This cannot be undone.'
    );
    if (!confirmed) return;
    const pastGameIds = (games || [])
      .filter(g => {
        const dt = g.datetime || (g.date && g.time ? `${g.date}T${g.time}` : null);
        return dt && new Date(dt) < new Date() &&
          (g.creatorId === currentUser.id || (g.joinedPlayers || []).includes(currentUser.id));
      })
      .map(g => g.id);
    const hidden = [...new Set([...(currentUser.hiddenFromHistory || []), ...pastGameIds])];
    updateUser({ hiddenFromHistory: hidden });
    try {
      await safeFetch(`/api/users/${currentUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ hiddenFromHistory: hidden })
      });
      showToast('✅ ' + (lang === 'hu' ? 'Előzmények törölve' : 'History cleared'));
    } catch (err: any) {
      showToast('❌ ' + (err?.message || 'Hiba'));
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    if (!currentUser) return;
    try {
      await safeFetch(`/api/groups/${groupId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchGroups();
      showToast('✅ ' + (lang === 'hu' ? 'Csoport törölve' : 'Group deleted'));
    } catch (err: any) {
      showToast('❌ ' + (err?.message || 'Hiba'));
    }
  };

  const handleMakeAdmin = async (groupId: string, userId: string) => {
    if (!currentUser) return;
    try {
      const groupRows = groups.find(g => g.id === groupId);
      if (!groupRows) return;
      const newAdminIds = [...new Set([...(groupRows.adminIds || []), userId])];
      await safeFetch(`/api/groups/${groupId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ adminIds: newAdminIds })
      });
      fetchGroups();
      showToast('✅ ' + (lang === 'hu' ? 'Admin jog megadva' : 'Admin rights granted'));
    } catch (err: any) {
      showToast('❌ ' + (err?.message || 'Hiba'));
    }
  };

  const handleUpdateUser = async (updatedData: Partial<User>) => {
    if (!currentUser) return;
    try {
      const data = await safeFetch(`/api/users/${currentUser.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedData)
      });
      const savedUser = data?.user || data?.data || data;
      if (savedUser?.id) updateUser(savedUser); else updateUser(updatedData);
      setIsEditingProfile(false);
      showToast('✅ ' + (lang === 'hu' ? 'Profil sikeresen mentve!' : 'Profile saved!'));
    } catch (err: any) {
      console.error("Failed to update user", err);
      showToast('❌ ' + (lang === 'hu' ? 'Hiba: ' : 'Error: ') + (err?.message || (lang === 'hu' ? 'Mentés sikertelen' : 'Save failed')));
    }
  };

  const handleUpdateLanguage = async (newLang: Language) => {
    if (!currentUser) return;
    setLang(newLang);
    handleUpdateUser({ languagePreference: newLang });
  };

  if (!currentUser) {
    if (authMode === 'register') {
      return (
        <RegistrationForm 
          formData={authForm}
          setFormData={setAuthForm}
          onSubmit={handleRegister}
          error={authError}
          onCancel={() => {
            setAuthMode('landing');
            setAuthError(null);
          }}
          t={t}
        />
      );
    }
    if (authMode === 'login') {
      return (
        <LoginForm 
          formData={authForm}
          setFormData={setAuthForm}
          onSubmit={handleLogin}
          error={authError}
          onCancel={() => {
            setAuthMode('landing');
            setAuthError(null);
          }}
          t={t}
        />
      );
    }
    return (
      <AuthScreen 
        onSelectMode={(mode) => {
          setAuthError(null);
          setAuthMode(mode);
        }} 
        t={t}
        lang={lang}
        onLangChange={(l) => { setLang(l); }}
      />
    );
  }

  if (isCompletingProfile && currentUser) {
    return (
      <OnboardingWizard
        user={currentUser}
        step={onboardingStep}
        setStep={setOnboardingStep}
        onComplete={handleProfileComplete}
        onSkip={() => {
          if (currentUser?.id) localStorage.setItem(`onboarding_done_${currentUser.id}`, '1');
          safeFetch(`/api/users/${currentUser.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ onboardingDone: true }) }).catch(() => {});
          updateUser({ onboardingDone: true });
          setIsCompletingProfile(false);
          setActiveTab('games');
        }}
        onLogout={() => { if (currentUser?.id) localStorage.setItem(`onboarding_done_${currentUser.id}`, '1'); logout(); setAuthMode('landing'); }}
        t={t}
        toastMsg={toastMsg}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F0] text-[#141414] font-sans selection:bg-[#E2FF3B]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-[#141414]/10 px-4 py-3">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('games')}>
              <div className="w-8 h-8 bg-[#141414] rounded-full flex items-center justify-center shrink-0">
                <TrendingUp className="text-[#E2FF3B] w-5 h-5" />
              </div>
              <span className="font-bold text-lg sm:text-xl tracking-tight">
                <span className="sm:hidden">Padel Buddy</span>
                <span className="hidden sm:block">Find Your Padel Buddy</span>
              </span>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              <button 
                onClick={() => setActiveTab('games')}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'games' ? 'text-[#141414] bg-[#E2FF3B]' : 'text-[#141414]/40 hover:text-[#141414]'}`}
              >
                {t('nav.games')}
              </button>
              <button 
                onClick={() => setActiveTab('players')}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'players' ? 'text-[#141414] bg-[#E2FF3B]' : 'text-[#141414]/40 hover:text-[#141414]'}`}
              >
                {t('nav.players')}
              </button>
              <button 
                onClick={() => setActiveTab('groups')}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'groups' ? 'text-[#141414] bg-[#E2FF3B]' : 'text-[#141414]/40 hover:text-[#141414]'}`}
              >
                {t('nav.groups')}
              </button>
              <button 
                onClick={() => setActiveTab('mygames')}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'mygames' ? 'text-[#141414] bg-[#E2FF3B]' : 'text-[#141414]/40 hover:text-[#141414]'}`}
              >
                {t('nav.myGames') || 'Saját meccsek'}
              </button>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {/* Language switcher */}
            <button
              onClick={() => handleUpdateLanguage(lang === 'hu' ? 'en' : 'hu')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#141414]/5 hover:bg-[#E2FF3B] transition-colors text-xs font-black uppercase tracking-widest"
              title={lang === 'hu' ? 'Switch to English' : 'Váltás magyarra'}
            >
              <span className="text-base leading-none">{lang === 'hu' ? '🇭🇺' : '🇬🇧'}</span>
              <span className="hidden sm:block">{lang === 'hu' ? 'HU' : 'EN'}</span>
            </button>
            <button
              onClick={() => setIsNotificationsOpen(true)}
              className="w-10 h-10 rounded-full bg-[#141414]/5 flex items-center justify-center relative hover:bg-[#141414]/10 transition-colors"
            >
              <AlertCircle className="w-5 h-5 opacity-60" />
              {notifications.some(n => !n.read) && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
              )}
            </button>
            <button 
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-2 p-1 pr-3 rounded-full border transition-all ${activeTab === 'profile' ? 'bg-[#E2FF3B] border-[#141414]/10' : 'bg-[#141414]/5 border-transparent hover:border-[#141414]/10'}`}
            >
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center overflow-hidden">
                {currentUser?.avatarUrl ? <img src={currentUser.avatarUrl} className="w-full h-full object-cover" /> : <UserIcon className="w-4 h-4" />}
              </div>
              <span className="text-xs font-bold hidden sm:block">{currentUser?.name}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 pb-[calc(8rem+env(safe-area-inset-bottom,0px))] md:pb-12 pt-6">
        <AnimatePresence mode="wait">
          {activeTab === 'games' && (
            <motion.div
              key="games"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-end">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black uppercase italic tracking-tighter">{t('games.findGame')}</h2>
                  <p className="text-xs sm:text-sm opacity-60">{t('games.findGameSub')}</p>
                </div>
                <button 
                  onClick={() => setActiveTab('create')}
                  className="bg-[#141414] text-[#E2FF3B] p-3 rounded-full hover:rotate-90 transition-transform duration-300"
                >
                  <Plus className="w-6 h-6" />
                </button>
              </div>

              {/* Game Filters */}
              <div className="flex flex-wrap gap-2">
                {(['all', 'today', 'tomorrow', 'weekend', 'lastminute'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setGameFilter(f)}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      gameFilter === f ? 'bg-[#141414] text-[#E2FF3B]' : 'bg-[#141414]/5 text-[#141414]/40'
                    }`}
                  >
                    {t(`games.filters.${f}`)}
                  </button>
                ))}
              </div>

              <div className="flex flex-col sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {isLoading ? (
                  <div className="md:col-span-2 lg:col-span-3 py-20 text-center font-mono text-xs opacity-50 uppercase tracking-widest">{t('common.scanning')}</div>
                ) : (
                  (() => {
                    const filteredGames = (games || []).filter(g => {
                      if (currentUser?.blockedUserIds?.includes(g.creatorId)) return false;

                      // Visibility controls
                      if (g.visibility === 'group-only' && g.groupId) {
                        const group = (groups || []).find(gr => gr.id === g.groupId);
                        if (!(group?.memberIds || []).includes(currentUser?.id || '') && g.creatorId !== currentUser?.id) return false;
                      }
                      
                      if (g.visibility === 'invite-only') {
                        if (!g.invitedUserIds?.includes(currentUser?.id || '') && g.creatorId !== currentUser?.id) return false;
                      }

                      const dt = g.datetime || (g.date && g.time ? `${g.date}T${g.time}` : null);
                      const date = dt ? new Date(dt) : null;
                      const now = new Date();

                      // Hide past games from main list
                      if (!date || date < now) return false;
                      
                      if (gameFilter === 'lastminute') {
                        const diffHours = (date!.getTime() - now.getTime()) / 3600000;
                        const slotsLeft = Number(g.requiredPlayers || 4) - (g.joinedPlayers || []).length;
                        return diffHours > 0 && diffHours <= 3 && slotsLeft > 0;
                      }

                      if (gameFilter === 'today') return date!.toDateString() === now.toDateString();
                      if (gameFilter === 'tomorrow') {
                        const tomorrow = new Date(now);
                        tomorrow.setDate(now.getDate() + 1);
                        return date!.toDateString() === tomorrow.toDateString();
                      }
                      if (gameFilter === 'weekend') {
                        const day = date!.getDay();
                        return day === 0 || day === 6;
                      }
                      return true;
                    });

                    // Sort by date (nearest first)
                    filteredGames.sort((a, b) => { const da = a.datetime || a.date || '2099-01-01'; const db2 = b.datetime || b.date || '2099-01-01'; return new Date(da).getTime() - new Date(db2).getTime(); });

                    return filteredGames.length > 0 ? (
                      filteredGames.map(game => {
                        const myRequest = game.requests?.find(r => r.userId === currentUser?.id);
                        return (
                          <GameCard 
                            key={game.id} 
                            game={game} 
                            t={t}
                            isJoined={(game.joinedPlayers || []).includes(currentUser?.id || '')}
                            requestStatus={myRequest?.status}
                            onJoin={() => handleJoinGame(game.id)}
                            onOpenChat={() => {
                              const freshGame = (games || []).find(g => g.id === game.id) || game;
                              setSelectedGame(freshGame);
                              setIsChatOpen(true);
                            }}
                            onEdit={() => {
                              setGameToEdit(game);
                              setActiveTab('create');
                            }}
                            isOwner={game.creatorId === currentUser?.id}
                            onLeave={() => handleLeaveGame(game.id)}
                            onDelete={() => handleDeleteGame(game.id)}
                            onRepeat={() => handleRepeatGame(game)}
                            onConfirmAttendance={(e?: React.MouseEvent) => {
                              e?.stopPropagation?.();
                              setSelectedGame(game);
                              setIsAttendanceOpen(true);
                            }}
                            onRecordResult={() => {
                              setSelectedGame(game);
                              setIsResultModalOpen(true);
                            }}
                            onShowDetails={() => { setSelectedGame(game); setIsDetailOpen(true); }}
                            onRate={() => setRatingGameId(game.id)}
                            onShare={() => handleShareGame(game)}
                            currentUser={currentUser}
                          />
                        );
                      })
                    ) : (
                      <div className="md:col-span-2 lg:col-span-3 py-16 flex flex-col items-center text-center gap-4 bg-white border border-[#141414]/5 rounded-3xl shadow-sm">
                        <div className="w-20 h-20 bg-[#F8F8F5] rounded-3xl flex items-center justify-center text-4xl">🎾</div>
                        <div>
                          <p className="font-black text-lg uppercase tracking-tight">{t('common.noMatchesFound')}</p>
                          <p className="text-xs opacity-40 mt-1">{lang === 'hu' ? 'Próbálj más szűrőt, vagy hozz létre egy meccset!' : 'Try different filters or create a match!'}</p>
                        </div>
                        <div className="flex gap-2 flex-wrap justify-center">
                          <button
                            onClick={() => setGameFilter('all')}
                            className="px-5 py-2.5 bg-[#141414]/5 text-[#141414] rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#141414]/10 transition-colors"
                          >
                            {lang === 'hu' ? 'Szűrők törlése' : 'Clear filters'}
                          </button>
                          <button
                            onClick={() => setActiveTab('create')}
                            className="px-5 py-2.5 bg-[#141414] text-[#E2FF3B] rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#252525] transition-colors"
                          >
                            + {lang === 'hu' ? 'Meccs létrehozása' : 'Create match'}
                          </button>
                        </div>
                      </div>
                    );
                  })()
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'players' && (
            <motion.div
              key="players"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black uppercase italic tracking-tighter">{t('nav.players')}</h2>
                  <p className="text-xs sm:text-sm opacity-60">{t('players.subTitle')}</p>
                </div>
              </div>

              {/* ─── LFG Section ─── */}
              {(() => {
                const lfgPlayers = (players || [])
                  .filter(p => currentUser && p.id !== currentUser.id)
                  .filter(p => !currentUser?.blockedUserIds?.includes(p.id))
                  .filter(p => p.lfgStatus && p.lfgStatus !== LFGStatus.None)
                  .sort((a, b) => {
                    if (a.lfgStatus === LFGStatus.Now && b.lfgStatus !== LFGStatus.Now) return -1;
                    if (b.lfgStatus === LFGStatus.Now && a.lfgStatus !== LFGStatus.Now) return 1;
                    return 0;
                  })
                  .slice(0, 8);

                if (lfgPlayers.length === 0) return null;

                return (
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                        <h3 className="text-[11px] font-black uppercase tracking-widest">
                          {lang === 'hu' ? 'Most keresnek játékost' : 'Looking for a game'}
                        </h3>
                        <span className="px-1.5 py-0.5 bg-[#141414] text-[#E2FF3B] rounded-md text-[9px] font-black">{lfgPlayers.length}</span>
                      </div>
                      {/* Quick LFG setter */}
                      <div className="relative group">
                        <button className="flex items-center gap-1 px-3 py-1.5 bg-[#141414]/5 hover:bg-[#E2FF3B] rounded-xl transition-colors text-[10px] font-black uppercase tracking-widest">
                          {currentUser?.lfgStatus && currentUser.lfgStatus !== LFGStatus.None ? '🔥' : '+'} {lang === 'hu' ? 'Én is' : 'Join'}
                        </button>
                        <div className="absolute right-0 top-full mt-1 z-50 hidden group-hover:flex flex-col bg-white border border-[#141414]/10 rounded-2xl shadow-xl overflow-hidden w-44">
                          {[
                            { key: LFGStatus.Now,   label: lang === 'hu' ? '🔥 Azonnal játszanék' : '🔥 Playing Now', },
                            { key: LFGStatus.Today, label: lang === 'hu' ? '📅 Ma játszanék' : '📅 Playing Today', },
                            { key: LFGStatus.None,  label: lang === 'hu' ? '⏸ Nem most' : '⏸ Not now', },
                          ].map(opt => (
                            <button
                              key={opt.key}
                              onClick={() => handleUpdateUser({ lfgStatus: opt.key })}
                              className={`px-4 py-3 text-left text-xs font-bold hover:bg-[#E2FF3B] transition-colors ${
                                currentUser?.lfgStatus === opt.key ? 'bg-[#E2FF3B]/30 font-black' : ''
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Horizontal scroll cards */}
                    <div className="flex gap-3 overflow-x-auto scrollbar-none pb-2 -mx-4 px-4">
                      {lfgPlayers.map(player => {
                        const isNow = player.lfgStatus === LFGStatus.Now;
                        return (
                          <button
                            key={player.id}
                            onClick={() => setSelectedPlayer(player)}
                            className="shrink-0 w-36 bg-white border border-[#141414]/5 rounded-2xl p-3 text-left hover:shadow-md hover:border-[#E2FF3B] transition-all group"
                          >
                            {/* Avatar */}
                            <div className="relative mb-2">
                              <div className="w-12 h-12 rounded-xl bg-[#141414] flex items-center justify-center overflow-hidden">
                                {player.avatarUrl ? (
                                  <img src={player.avatarUrl} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <UserIcon className="w-6 h-6 text-white/50" />
                                )}
                              </div>
                              <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${isNow ? 'bg-red-500 animate-pulse' : 'bg-yellow-400'}`} />
                            </div>
                            {/* Name & level */}
                            <p className="font-black text-sm leading-tight truncate">{player.name}</p>
                            <p className="text-[10px] opacity-40 font-bold uppercase truncate">{player.location?.city || '—'}</p>
                            {/* LFG badge */}
                            <div className={`mt-2 px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest inline-block ${
                              isNow ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {isNow ? '🔥 Most' : '📅 Ma'}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}
              
              <div className="flex flex-col gap-4">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40" />
                  <input 
                    type="text" 
                    placeholder={t('common.searchPlaceholder')}
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full bg-[#141414]/5 border-none rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-[#E2FF3B] outline-none"
                  />
                </div>

                <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
                  {(['all', 'active', 'lfg', 'friends'] as const).map(f => (
                    <button
                      key={f}
                      onClick={() => setPlayerFilter(f)}
                      className={`whitespace-nowrap px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                        playerFilter === f ? 'bg-[#141414] text-[#E2FF3B]' : 'bg-[#141414]/5 text-[#141414]/40'
                      }`}
                    >
                      {f === 'lfg' ? '🔥 LFG' : f === 'friends' ? t('profile.friends') : f === 'active' ? t('common.active') : t('common.all')}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {(() => {
                  const filteredPlayers = (players || [])
                    .filter(p => !currentUser || p.id !== currentUser.id)
                    .filter(p => !currentUser || !currentUser.blockedUserIds?.includes(p.id))
                    .filter(p => {
                      const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (p.location?.city || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (p.username || '').toLowerCase().includes(searchQuery.toLowerCase());
                      if (!matchSearch) return false;
                      if (playerFilter === 'active') {
                        if (!p.lastActive) return false;
                        return new Date(p.lastActive) > new Date(Date.now() - 3600000);
                      }
                      if (playerFilter === 'lfg') return p.lfgStatus && p.lfgStatus !== LFGStatus.None;
                      if (playerFilter === 'friends') return currentUser?.friendIds?.includes(p.id);
                      return true;
                    });

                  return filteredPlayers.length > 0
                    ? filteredPlayers.map(player => (
                        <PlayerCard
                          key={player.id}
                          player={player}
                          isFavorite={currentUser?.favoritePlayerIds?.includes(player.id)}
                          onToggleFavorite={() => handleToggleFavorite(player.id)}
                          onOpenProfile={(p) => setSelectedPlayer(p)}
                        />
                      ))
                    : [(
                  <div key="empty" className="col-span-full py-16 flex flex-col items-center text-center gap-4 bg-white border border-[#141414]/5 rounded-3xl shadow-sm">
                    <div className="w-20 h-20 bg-[#F8F8F5] rounded-3xl flex items-center justify-center text-4xl">
                      {playerFilter === 'friends' ? '👥' : playerFilter === 'lfg' ? '🔥' : '🔍'}
                    </div>
                    <div>
                      <p className="font-black text-lg uppercase tracking-tight">
                        {playerFilter === 'friends' ? (lang === 'hu' ? 'Még nincsenek barátaid' : 'No friends yet') :
                         playerFilter === 'lfg' ? (lang === 'hu' ? 'Senki sem keres most' : 'Nobody is looking now') :
                         (lang === 'hu' ? 'Nincs találat' : 'No results')}
                      </p>
                      <p className="text-xs opacity-40 mt-1">
                        {playerFilter === 'friends' ? (lang === 'hu' ? 'Küldj barátkérést más játékosoknak!' : 'Send friend requests to other players!') :
                         (lang === 'hu' ? 'Próbálj más szűrőt' : 'Try different filters')}
                      </p>
                    </div>
                    <div className="flex gap-2 flex-wrap justify-center">
                      {(searchQuery || playerFilter !== 'all') && (
                        <button
                          onClick={() => { setSearchQuery(''); setPlayerFilter('all'); }}
                          className="px-5 py-2.5 bg-[#141414]/5 text-[#141414] rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#141414]/10 transition-colors"
                        >
                          {lang === 'hu' ? 'Szűrők törlése' : 'Clear filters'}
                        </button>
                      )}
                    </div>
                  </div>
                )];
                })()}
              </div>
            </motion.div>
          )}

          {activeTab === 'groups' && (
            <motion.div
              key="groups"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <GroupsTab
                groups={groups}
                currentUser={currentUser}
                players={players}
                onJoin={handleJoinGroup}
                onLeaveGroup={handleLeaveGroup}
                onDeleteGroup={handleDeleteGroup}
                onMakeAdmin={handleMakeAdmin}
                onSelectGroup={(group) => setSelectedGroupDetail(group)}
                onOpenChat={(group) => {
                  setSelectedGroup(group);
                  setIsGroupChatOpen(true);
                }}
                onCreateClick={() => setIsCreateGroupModalOpen(true)}
              />
            </motion.div>
          )}

          {activeTab === 'create' && (
            <motion.div
              key="create"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl sm:rounded-[40px] p-4 sm:p-8 shadow-sm border border-[#141414]/5"
            >
              <h2 className="text-3xl font-black uppercase tracking-tight mb-8">{t('games.createGame')}</h2>
              <CreateGameForm 
                creatorId={currentUser?.id || ''} 
                token={token || ''}
                groups={(groups || []).filter(g => currentUser && (g.memberIds || []).includes(currentUser.id))}
                allUsers={players || []}
                t={t}
                lang={lang}
                gameToEdit={gameToEdit}
                onSuccess={() => {
                  fetchGames();
                  setGameToEdit(null);
                  setActiveTab('games');
                }} 
                onShowTutorial={() => setIsLevelTutorialOpen(true)}
              />
            </motion.div>
          )}

          {activeTab === 'mygames' && (
            <motion.div
              key="mygames"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-end mb-6">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black uppercase italic tracking-tighter">{t('nav.myGames') || 'Saját meccsek'}</h2>
                  <p className="text-xs sm:text-sm opacity-60">{t('profile.matchHistory')}</p>
                </div>
                <button
                  onClick={handleClearHistory}
                  className="flex items-center gap-1.5 px-3 py-2 bg-red-50 text-red-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-100 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  {lang === 'hu' ? 'Mind törlése' : 'Clear all'}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {(() => {
                  const hidden = currentUser?.hiddenFromHistory || [];
                  const myGames = (games || [])
                    .filter(g => !hidden.includes(g.id))
                    .filter(g => g.creatorId === currentUser?.id || (g.joinedPlayers || []).includes(currentUser?.id || ''))
                    .sort((a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime());

                  return myGames.length > 0 ? myGames.map(game => (
                    <div key={game.id} className="relative group">
                      {/* Swipe/hover delete overlay for non-owners */}
                      {game.creatorId !== currentUser?.id && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleHideFromHistory(game.id); }}
                          className="absolute top-2 left-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity w-7 h-7 bg-red-500 text-white rounded-lg flex items-center justify-center shadow-md"
                          title={lang === 'hu' ? 'Eltávolítás az előzményekből' : 'Remove from history'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <GameCard
                        game={game}
                        isJoined={(game.joinedPlayers || []).includes(currentUser?.id || '')}
                        requestStatus={game.requests?.find(r => r.userId === currentUser?.id)?.status}
                        isOwner={game.creatorId === currentUser?.id}
                        t={t}
                        onShowDetails={() => { setSelectedGame(game); setIsDetailOpen(true); }}
                        onJoin={() => handleJoinGame(game.id)}
                        onOpenChat={() => {
                          const freshGame = (games || []).find(g => g.id === game.id) || game;
                          setSelectedGame(freshGame);
                          setIsChatOpen(true);
                        }}
                        onEdit={() => { setGameToEdit(game); setActiveTab('create'); }}
                        onDelete={() => handleDeleteGame(game.id)}
                        onLeave={() => handleLeaveGame(game.id)}
                        onRepeat={() => handleRepeatGame(game)}
                        onConfirmAttendance={(e?: React.MouseEvent) => {
                          e?.stopPropagation?.();
                          setSelectedGame(game);
                          setIsAttendanceOpen(true);
                        }}
                        onRecordResult={() => { setSelectedGame(game); setIsResultModalOpen(true); }}
                        onRate={() => setRatingGameId(game.id)}
                        onShare={() => handleShareGame(game)}
                        currentUser={currentUser}
                      />
                    </div>
                  )) : (
                  <div className="col-span-full py-16 flex flex-col items-center text-center gap-5 bg-white rounded-3xl border border-[#141414]/5 shadow-sm">
                    <div className="w-20 h-20 bg-[#F8F8F5] rounded-3xl flex items-center justify-center text-4xl">📅</div>
                    <div>
                      <p className="font-black text-lg uppercase tracking-tight">{lang === 'hu' ? 'Még nincs meccsed' : 'No games yet'}</p>
                      <p className="text-xs opacity-40 mt-1 max-w-xs mx-auto">{lang === 'hu' ? 'Csatlakozz egy meglévő meccshez, vagy hozz létre sajátot!' : 'Join an existing game or create your own!'}</p>
                    </div>
                    <div className="flex gap-3 flex-wrap justify-center">
                      <button
                        onClick={() => setActiveTab('games')}
                        className="px-5 py-3 bg-[#141414]/5 text-[#141414] rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#141414]/10 transition-colors flex items-center gap-2"
                      >
                        <Search className="w-3.5 h-3.5" /> {t('games.findGame')}
                      </button>
                      <button
                        onClick={() => setActiveTab('create')}
                        className="px-5 py-3 bg-[#141414] text-[#E2FF3B] rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#252525] transition-colors flex items-center gap-2"
                      >
                        <Plus className="w-3.5 h-3.5" /> {t('games.createGame')}
                      </button>
                    </div>
                  </div>
                  );
                })()}
              </div>
            </motion.div>
          )}

          {activeTab === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              {!isEditingProfile ? (
                 <div className="space-y-8">

                  {/* Profile Completeness */}
                  <ProfileCompleteness
                    user={currentUser}
                    friendCount={(currentUser.friendIds || []).length}
                    onEdit={() => setIsEditingProfile(true)}
                    onNavigate={(tab) => setActiveTab(tab as any)}
                    lang={lang}
                  />

                  <div className="flex flex-col items-center py-6 text-center relative">
                    <button 
                      onClick={() => setIsEditingProfile(true)}
                      className="absolute top-0 right-0 p-3 bg-white shadow-sm border border-[#141414]/5 rounded-2xl hover:scale-105 transition-transform"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <div className="w-24 h-24 bg-[#141414] text-[#E2FF3B] rounded-full flex items-center justify-center mb-4 border-4 border-white shadow-xl overflow-hidden">
                      {currentUser?.avatarUrl ? (
                         <img src={currentUser.avatarUrl} alt={currentUser?.name} className="w-full h-full object-cover" />
                      ) : (
                        <UserIcon className="w-12 h-12" />
                      )}
                    </div>
                    <h2 className="text-2xl font-black tracking-tight">{currentUser?.name}</h2>
                    <div className="flex gap-2 mt-2 flex-wrap justify-center">
                      <span className="px-3 py-1 bg-[#141414] text-[#E2FF3B] rounded-full text-xs font-bold uppercase tracking-widest">{currentUser?.skillLevel}</span>
                      <span className="px-3 py-1 bg-[#141414]/5 rounded-full text-xs font-medium uppercase tracking-widest flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {currentUser?.location?.city || t('common.unknown')}
                      </span>
                      {currentUser?.lfgStatus && currentUser?.lfgStatus !== LFGStatus.None && (
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {currentUser?.lfgStatus ? t(`profile.lfg.${currentUser.lfgStatus}`) : t('profile.lfg.None')}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-6 bg-white rounded-3xl p-6 shadow-sm border border-[#141414]/5">
                    <div className="grid grid-cols-2 gap-4 pb-4 border-b border-[#141414]/5">
                      <div>
                        <h3 className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-1">{t('profile.playStyle')}</h3>
                        <p className="text-sm font-bold">{currentUser?.playStyle ? t(`profile.playStyles.${currentUser.playStyle}`) : t('profile.playStyles.Casual')}</p>
                      </div>
                      <div>
                        <h3 className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-1">{t('profile.reliability')}</h3>
                        <div className="flex flex-col">
                           <p className={`text-sm font-bold ${
                             currentUser?.reliabilityStatus === 'Unreliable' ? 'text-red-500' : 
                             currentUser?.reliabilityStatus === 'Very Reliable' ? 'text-green-600' : 'text-blue-600'
                           }`}>
                             {t(`profile.reliabilityStatus.${currentUser?.reliabilityStatus || 'New Player'}`)}
                           </p>
                           {currentUser?.completedGamesCount !== undefined && (
                             <span className="text-[9px] opacity-40 font-bold uppercase">{currentUser?.attendedGamesCount || 0} / {currentUser?.completedGamesCount} {t('profile.gamesAttended')}</span>
                           )}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-2 py-4 border-b border-[#141414]/5">
                      <div className="text-center p-2 bg-[#141414]/5 rounded-2xl">
                        <p className="text-[8px] font-black uppercase opacity-40">{t('profile.playedGames')}</p>
                        <p className="text-xl font-black">{currentUser?.attendedGamesCount || 0}</p>
                      </div>
                      <div className="text-center p-2 bg-[#141414]/5 rounded-2xl">
                        <p className="text-[8px] font-black uppercase opacity-40">{t('nav.groups')}</p>
                        <p className="text-xl font-black">{(groups || []).filter(g => currentUser && (g.memberIds || []).includes(currentUser.id)).length}</p>
                      </div>
                      <div className="text-center p-2 bg-[#141414]/5 rounded-2xl">
                        <p className="text-[8px] font-black uppercase opacity-40">{t('profile.friends')}</p>
                        <p className="text-xl font-black">{currentUser?.friendIds?.length || 0}</p>
                      </div>
                      <div className="text-center p-2 bg-[#141414]/5 rounded-2xl">
                        <p className="text-[8px] font-black uppercase opacity-40">{t('profile.skillLevel')}</p>
                        <p className="text-xl font-black truncate">{currentUser?.skillLevel}</p>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-[#141414]/5">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xs font-black uppercase tracking-widest opacity-40 flex items-center gap-2">
                          <Users className="w-3 h-3" /> {t('profile.friends')}
                        </h3>
                      </div>
                      <div className="grid grid-cols-1 gap-2">
                        {(players || []).filter(p => currentUser?.friendIds?.includes(p.id)).map(friend => (
                          <div key={friend.id} className="flex items-center justify-between p-3 bg-[#141414]/5 rounded-2xl">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-[#141414] overflow-hidden flex items-center justify-center">
                                {friend.avatarUrl ? <img src={friend.avatarUrl} className="w-full h-full object-cover" /> : <UserIcon className="w-5 h-5 text-[#E2FF3B]" />}
                              </div>
                              <div>
                                <p className="text-sm font-bold">{friend.name}</p>
                                <p className="text-[10px] opacity-40 font-bold uppercase">{friend.skillLevel} • {friend.location?.city || ''}</p>
                              </div>
                            </div>
                            <button
                              onClick={() => handleRemoveFriend(friend.id)}
                              className="p-2 text-[#141414]/20 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                              title={lang === 'hu' ? 'Barát eltávolítása' : 'Remove friend'}
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        {(!currentUser?.friendIds || currentUser.friendIds.length === 0) && (
                          <div className="py-6 flex flex-col items-center gap-3 text-center">
                            <div className="text-3xl">🤝</div>
                            <p className="text-xs font-black uppercase tracking-widest opacity-40">{t('profile.noFriends')}</p>
                            <button
                              onClick={() => setActiveTab('players')}
                              className="px-4 py-2 bg-[#141414] text-[#E2FF3B] rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#252525] transition-colors"
                            >
                              {lang === 'hu' ? 'Játékosok keresése' : 'Find players'}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* My Groups Section */}
                    {(groups || []).filter(g => currentUser && (g.memberIds || []).includes(currentUser.id)).length > 0 && (
                      <div className="pt-4 pb-4 border-b border-[#141414]/5">
                        <h3 className="text-xs font-black uppercase tracking-widest opacity-40 mb-3 flex items-center gap-2">
                          <Users className="w-3 h-3" /> {t('nav.groups')}
                        </h3>
                        <div className="space-y-2">
                          {(groups || []).filter(g => currentUser && (g.memberIds || []).includes(currentUser.id)).map(group => {
                            const isAdmin = (group.adminIds || []).includes(currentUser?.id || '');
                            const isOnlyAdmin = isAdmin && (group.adminIds || []).length === 1;
                            return (
                              <div key={group.id} className="flex items-center justify-between p-3 bg-[#141414]/5 rounded-2xl">
                                <div>
                                  <p className="text-sm font-bold">{group.name}</p>
                                  <p className="text-[10px] opacity-40 font-bold uppercase">{group.city} • {(group.memberIds || []).length} {t('groups.members')}{isAdmin ? ' • 👑 Admin' : ''}</p>
                                </div>
                                <div className="flex gap-1.5">
                                  <button
                                    onClick={() => setActiveTab('groups')}
                                    className="px-3 py-1.5 bg-[#141414] text-[#E2FF3B] rounded-lg text-[10px] font-black uppercase tracking-widest"
                                  >
                                    {t('games.chatShort')}
                                  </button>
                                  {isAdmin ? (
                                    <button
                                      onClick={() => { if (window.confirm(lang === 'hu' ? 'Biztosan törlöd a csoportot?' : 'Delete this group?')) handleDeleteGroup(group.id); }}
                                      className="p-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors"
                                      title={lang === 'hu' ? 'Csoport törlése' : 'Delete group'}
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => !isOnlyAdmin && handleLeaveGroup(group.id)}
                                      disabled={isOnlyAdmin}
                                      className={`p-1.5 rounded-lg transition-colors ${isOnlyAdmin ? 'bg-gray-50 text-gray-300 cursor-not-allowed' : 'bg-red-50 text-red-500 hover:bg-red-100'}`}
                                      title={lang === 'hu' ? 'Kilépés' : 'Leave'}
                                    >
                                      <LogOut className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <div className="pb-4 border-b border-[#141414]/5">
                      <h3 className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-2">{t('profile.playTimes')}</h3>
                      <div className="flex flex-wrap gap-2">
                        {currentUser?.playTime && currentUser.playTime.length > 0 ? (
                          currentUser.playTime.map(pt => (
                            <span key={pt} className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest">{t(`profile.playTimesList.${pt}`)}</span>
                          ))
                        ) : (
                          <p className="text-xs opacity-40 italic">{t('common.noData')}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-widest opacity-40 mb-2">{t('profile.bio')}</h3>
                      <p className="text-sm leading-relaxed">{currentUser?.bio || t('common.noData')}</p>
                    </div>

                    {(currentUser?.interests && currentUser.interests.length > 0) && (
                      <div className="pt-4 border-t border-[#141414]/5">
                        <h3 className="text-xs font-bold uppercase tracking-widest opacity-40 mb-3 flex items-center gap-2">
                          <Target className="w-3 h-3" /> {t('profile.interests')}
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {currentUser.interests.map(interest => (
                            <span key={interest} className="px-3 py-1.5 bg-[#141414]/5 rounded-xl text-[10px] font-bold uppercase tracking-wider">
                              {t(`profile.interestsList.${interest}`) || interest}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {(currentUser?.favoriteClubs && currentUser.favoriteClubs.length > 0) && (
                      <div className="pt-4 border-t border-[#141414]/5">
                        <h3 className="text-xs font-bold uppercase tracking-widest opacity-40 mb-3 flex items-center gap-2">
                          <Heart className="w-3 h-3" /> {t('profile.favoriteClubs')}
                        </h3>
                        <div className="space-y-2">
                          {currentUser.favoriteClubs.map(club => (
                            <div key={club} className="flex items-center gap-2 text-sm font-medium">
                              <div className="w-1.5 h-1.5 bg-[#E2FF3B] rounded-full" />
                              {club}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="pt-6 border-t border-[#141414]/5">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xs font-black uppercase tracking-widest opacity-40 flex items-center gap-2">
                          <History className="w-3 h-3" /> {t('profile.matchHistory')}
                        </h3>
                        <button
                          onClick={handleClearHistory}
                          className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-100 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                          {lang === 'hu' ? 'Mind törlése' : 'Clear all'}
                        </button>
                      </div>
                      <MatchHistory
                        games={(games || [])
                          .filter(g => !(currentUser?.hiddenFromHistory || []).includes(g.id))
                          .filter(g => (g.joinedPlayers || []).includes(currentUser?.id || ''))}
                        userId={currentUser?.id || ''}
                        onGameClick={(game) => { setSelectedGame(game); setIsDetailOpen(true); }}
                        onDeleteGame={(gameId) => {
                          const game = games.find(g => g.id === gameId);
                          if (game?.creatorId === currentUser?.id) handleDeleteGame(gameId);
                          else handleHideFromHistory(gameId);
                        }}
                      />
                    </div>

                    <div className="pt-6 border-t border-[#141414]/5">
                      <button 
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 py-4 bg-red-50 text-red-600 rounded-2xl text-sm font-bold hover:bg-red-100 transition-colors"
                      >
                        <LogOut className="w-4 h-4" /> {t('common.signOut')}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <ProfileEdit 
                  user={currentUser} 
                  onSave={handleUpdateUser} 
                  onCancel={() => setIsEditingProfile(false)} 
                  onShowTutorial={() => setIsLevelTutorialOpen(true)}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
        {/* Rating Modal */}
        {ratingGameId && (() => {
          const ratingGame = (games || []).find(g => g.id === ratingGameId);
          return ratingGame ? (
            <AnimatePresence>
              <RatingModal
                game={ratingGame}
                players={players || []}
                currentUser={currentUser!}
                onClose={() => setRatingGameId(null)}
                onSubmit={(ratings) => handleRateGame(ratingGameId, ratings)}
                t={t}
                lang={lang}
              />
            </AnimatePresence>
          ) : null;
        })()}

      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white/95 backdrop-blur-xl border-t border-[#141414]/5 pb-[env(safe-area-inset-bottom,24px)]">
        <div className="flex justify-around items-center px-2 pt-3 pb-1">
          <NavBtn 
            active={activeTab === 'games'} 
            onClick={() => setActiveTab('games')} 
            icon={<MapPin className="w-5 h-5" />} 
            label={t('nav.games')} 
          />
          <NavBtn 
            active={activeTab === 'players'} 
            onClick={() => setActiveTab('players')} 
            icon={<Users className="w-5 h-5" />} 
            label={t('nav.players')} 
          />
          <NavBtn 
            active={activeTab === 'create' || !!gameToEdit} 
            onClick={() => {
              if (activeTab !== 'create') {
                setGameToEdit(null);
                setActiveTab('create');
              }
            }} 
            isSpecial={true}
            icon={
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${activeTab === 'create' ? 'bg-[#E2FF3B] text-[#141414] shadow-lg shadow-[#E2FF3B]/30 scale-110' : 'bg-[#141414] text-white shadow-md hover:bg-[#252525]'}`}>
                {gameToEdit ? <Edit2 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
              </div>
            } 
            label={gameToEdit ? t('common.edit') || 'Edit' : t('games.createGameShort') || 'Új Játék'} 
          />
          <NavBtn 
            active={activeTab === 'groups'} 
            onClick={() => setActiveTab('groups')} 
            icon={<MessageSquare className="w-5 h-5" />} 
            label={t('nav.groups')} 
          />
          <NavBtn 
            active={activeTab === 'mygames'} 
            onClick={() => setActiveTab('mygames')} 
            icon={<Calendar className="w-5 h-5" />} 
            label={t('nav.myGames') || 'Saját meccsek'} 
          />
          <NavBtn 
            active={activeTab === 'profile'} 
            onClick={() => setActiveTab('profile')} 
            icon={<UserIcon className="w-5 h-5" />} 
            label={t('nav.profile')} 
          />
        </div>
      </nav>

      {/* Overlays */}
      <AnimatePresence>
        {isChatOpen && selectedGame && (
          <ChatDrawer 
            game={selectedGame} 
            currentUser={currentUser}
            players={players || []}
            t={t}
            onClose={() => setIsChatOpen(false)}
            onSendMessage={(text) => handleSendMessage(selectedGame.id, text)}
            onApprove={(uid, apr) => handleApproveRequest(selectedGame.id, uid, apr)}
            onLeave={() => { handleLeaveGame(selectedGame.id); setIsChatOpen(false); }}
          />
        )}
        {isGroupChatOpen && selectedGroup && (
          <GroupChatDrawer 
            group={selectedGroup} 
            currentUser={currentUser!}
            t={t}
            onClose={() => setIsGroupChatOpen(false)}
            onSendMessage={(text) => handleSendGroupMessage(text)}
          />
        )}
        {isAttendanceOpen && selectedGame && (
          <AttendanceModal 
            game={selectedGame}
            players={players}
            t={t}
            onClose={() => setIsAttendanceOpen(false)}
            onConfirm={(recs) => handleConfirmAttendance(selectedGame.id, recs)}
          />
        )}
        {/* Group Detail Drawer */}
        {selectedGroupDetail && (
          <div className="fixed inset-0 z-[60] flex justify-end">
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setSelectedGroupDetail(null)} />
            <div className="relative w-full max-w-sm bg-[#F8F8F5] h-full shadow-2xl flex flex-col overflow-y-auto">
              <div className="bg-[#141414] text-white p-5">
                <div className="flex items-center gap-3">
                  <button onClick={() => setSelectedGroupDetail(null)} className="p-2 hover:bg-white/10 rounded-xl">
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div className="flex-1">
                    <h3 className="font-black text-lg uppercase">{selectedGroupDetail.name}</h3>
                    <p className="text-white/40 text-[10px] font-bold uppercase">{selectedGroupDetail.city}</p>
                  </div>
                </div>
                <div className="flex gap-2 mt-3 flex-wrap">
                  <span className="px-2 py-1 bg-white/10 rounded-lg text-[10px] font-black uppercase">{(selectedGroupDetail.memberIds || []).length} {lang === 'hu' ? 'tag' : 'members'}</span>
                  {selectedGroupDetail.recommendedLevel && <span className="px-2 py-1 bg-[#E2FF3B] text-[#141414] rounded-lg text-[10px] font-black uppercase">{t(`profile.levels.${selectedGroupDetail.recommendedLevel}`)}</span>}
                  <span className="px-2 py-1 bg-white/10 rounded-lg text-[10px] font-black uppercase">{selectedGroupDetail.visibility === 'public' ? (lang === 'hu' ? 'Nyilvános' : 'Public') : (lang === 'hu' ? 'Privát' : 'Private')}</span>
                </div>
              </div>
              <div className="flex-1 p-4 space-y-4">
                {selectedGroupDetail.description && (
                  <div className="bg-white p-4 rounded-2xl border border-[#141414]/5">
                    <p className="text-[10px] opacity-40 font-bold uppercase mb-1">{lang === 'hu' ? 'Leírás' : 'Description'}</p>
                    <p className="text-sm">{selectedGroupDetail.description}</p>
                  </div>
                )}
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2">{t('groups.members')}</p>
                  <div className="space-y-2">
                    {(selectedGroupDetail.memberIds || []).map(mid => {
                      const member = (players || []).find(p => p.id === mid);
                      const isAdmin = (selectedGroupDetail.adminIds || []).includes(mid);
                      return (
                        <div key={mid} className="bg-white p-3 rounded-2xl border border-[#141414]/5 flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-[#141414]/5 flex items-center justify-center overflow-hidden shrink-0">
                            {member?.avatarUrl ? <img src={member.avatarUrl} className="w-full h-full object-cover" /> : <UserIcon className="w-4 h-4 opacity-40" />}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-bold">{member?.name || 'Ismeretlen'}</p>
                            <p className="text-[10px] opacity-40 font-bold uppercase">{member ? t(`profile.levels.${member.skillLevel}`) : ''}</p>
                          </div>
                          {isAdmin && <span className="px-2 py-0.5 bg-[#E2FF3B] text-[#141414] text-[9px] font-black rounded-lg uppercase">Admin</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>
                {(selectedGroupDetail.memberIds || []).includes(currentUser?.id || '') && (
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2">{lang === 'hu' ? 'Barátok meghívása' : 'Invite Friends'}</p>
                    <div className="space-y-2">
                      {(players || []).filter(p => (currentUser?.friendIds || []).includes(p.id) && !(selectedGroupDetail.memberIds || []).includes(p.id)).map(friend => (
                        <div key={friend.id} className="bg-white p-3 rounded-2xl border border-[#141414]/5 flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-[#141414]/5 flex items-center justify-center overflow-hidden shrink-0">
                            {friend.avatarUrl ? <img src={friend.avatarUrl} className="w-full h-full object-cover" /> : <UserIcon className="w-4 h-4 opacity-40" />}
                          </div>
                          <p className="flex-1 text-sm font-bold">{friend.name}</p>
                          <button onClick={async () => { try { await safeFetch(`/api/groups/${selectedGroupDetail.id}/invite`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ invitedUserId: friend.id }) }); showToast('✅ ' + (lang === 'hu' ? 'Meghívó elküldve!' : 'Elküldve!')); } catch { showToast('❌'); } }} className="px-3 py-1.5 bg-[#141414] text-[#E2FF3B] rounded-xl text-[10px] font-black uppercase hover:bg-[#252525] transition-colors">
                            {lang === 'hu' ? 'Meghív' : 'Meghív'}
                          </button>
                        </div>
                      ))}
                      {(players || []).filter(p => (currentUser?.friendIds || []).includes(p.id) && !(selectedGroupDetail.memberIds || []).includes(p.id)).length === 0 && (
                        <p className="text-xs opacity-40 italic text-center py-3">{lang === 'hu' ? 'Nincs meghívható barát' : 'Nincs meghívható barát'}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div className="p-4 border-t border-[#141414]/5 space-y-2">
                {(selectedGroupDetail.memberIds || []).includes(currentUser?.id || '') ? (
                  <div className="flex gap-2">
                    <button onClick={() => { setSelectedGroup(selectedGroupDetail); setIsGroupChatOpen(true); setSelectedGroupDetail(null); }} className="flex-1 py-3 bg-[#141414] text-[#E2FF3B] rounded-2xl font-black uppercase text-sm flex items-center justify-center gap-2 hover:bg-[#252525] transition-colors">
                      <MessageSquare className="w-4 h-4" /> Chat
                    </button>
                    {!(selectedGroupDetail.adminIds || []).includes(currentUser?.id || '') && (
                      <button onClick={() => { handleLeaveGroup(selectedGroupDetail.id); setSelectedGroupDetail(null); }} className="px-4 py-3 bg-red-50 text-red-500 rounded-2xl font-black uppercase text-sm flex items-center gap-2 hover:bg-red-100 transition-colors">
                        <LogOut className="w-4 h-4" /> {lang === 'hu' ? 'Kilépés' : 'Leave'}
                      </button>
                    )}
                  </div>
                ) : (
                  <button onClick={() => { handleJoinGroup(selectedGroupDetail.id); setSelectedGroupDetail(null); }} className="w-full py-3 bg-[#E2FF3B] text-[#141414] rounded-2xl font-black uppercase text-sm hover:scale-[1.02] transition-all">
                    {t('groups.joinGroup')}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {isNotificationsOpen && (
          <NotificationsDrawer 
            notifications={notifications}
            onGameInviteResponse={handleGameInviteResponse}
            t={t}
            onFriendResponse={handleFriendResponse}
            onRead={async (id) => {
              setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
              try {
                await fetch(`/api/notifications/${id}/read`, {
                  method: 'POST',
                  headers: { 'Authorization': `Bearer ${token}` }
                });
              } catch { /* silent */ }
            }}
            onClose={() => setIsNotificationsOpen(false)}
          />
        )}
        {isDetailOpen && selectedGame && (
          <GameDetailDrawer
            game={selectedGame}
            players={players}
            currentUser={currentUser!}
            t={t}
            onClose={() => setIsDetailOpen(false)}
            onJoin={() => handleJoinGame(selectedGame.id)}
            onOpenChat={() => {
              setIsDetailOpen(false);
              setIsChatOpen(true);
            }}
            onDelete={selectedGame.creatorId === currentUser?.id
              ? () => { setIsDetailOpen(false); handleDeleteGame(selectedGame.id); }
              : () => { setIsDetailOpen(false); handleHideFromHistory(selectedGame.id); }
            }
          />
        )}
        {selectedPlayer && (
          <ProfileDrawer 
            user={selectedPlayer} 
            currentUser={currentUser}
            games={games}
            groups={groups}
            onClose={() => setSelectedPlayer(null)}
            onFavorite={handleToggleFavorite}
            onSendFriendRequest={handleSendFriendRequest}
            onBlock={handleToggleBlock}
          />
        )}
        {isResultModalOpen && selectedGame && (
          <ResultModal 
            game={selectedGame}
            onSave={(res) => handleRecordResult(selectedGame.id, res)}
            onClose={() => setIsResultModalOpen(false)}
          />
        )}
        {isCreateGroupModalOpen && (
          <CreateGroupModal 
            currentUser={currentUser!}
            onClose={() => setIsCreateGroupModalOpen(false)}
            onSave={handleCreateGroup}
          />
        )}
        {isLevelTutorialOpen && (
          <LevelTutorial onClose={() => setIsLevelTutorialOpen(false)} t={t} />
        )}
      </AnimatePresence>

    </div>
  );
}

