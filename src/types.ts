export enum SkillLevel {
  Bronze = "Bronze",
  Silver = "Silver",
  Gold = "Gold",
}

export enum GameType {
  Friendly = "Friendly",
  Competitive = "Competitive",
  Training = "Training",
}

export enum PlayTime {
  Morning = "Morning",
  Day = "Day",
  Evening = "Evening",
}

export enum LFGStatus {
  None = "None",
  Now = "Now",
  Today = "Today",
}

export enum PadelExperience {
  Less6Months = "Less than 6 months",
  Months6To12 = "6-12 months",
  Years1To2 = "1-2 years",
  Years2Plus = "2+ years",
}

export type Language = 'hu' | 'en';

export interface FriendRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  username?: string;
  phone?: string;
  skillLevel: SkillLevel;
  location: {
    lat: number;
    lng: number;
    city: string;
  };
  bio?: string;
  avatarUrl?: string;
  favoriteClubs?: string[];
  interests?: string[];
  playTime?: PlayTime[];
  playStyle?: "Casual" | "Competitive" | "Technical" | "Power";
  lfgStatus?: LFGStatus;
  lastActive?: string;
  favoritePlayerIds?: string[];
  friendIds?: string[];
  blockedUserIds?: string[];
  completedGamesCount?: number;
  attendedGamesCount?: number;
  missedGamesCount?: number;
  reliabilityStatus?: "Very Reliable" | "Regularly Appears" | "New Player" | "Unreliable";
  experience?: PadelExperience;
  languagePreference?: Language;
  languages?: string[];
  socialLinks?: {
    instagram?: string;
    facebook?: string;
    website?: string;
  };
  notificationSettings?: {
    nearGames: boolean;
    reminders: boolean;
    groups: boolean;
    friends: boolean;
    requests: boolean;
  };
  privacySettings?: {
    publicProfile: boolean;
    showMatchHistory: boolean;
    showSocialLinks: boolean;
  };
  createdAt?: string;
}

export interface Club {
  id: string;
  name: string;
  address: string;
  city: string;
  location: { lat: number; lng: number };
  courts?: number;
  amenities?: string[];
  imageUrl?: string;
}

export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  text: string;
  timestamp: string;
}

export interface GameRequest {
  userId: string;
  userName: string;
  status: 'pending' | 'approved' | 'rejected';
  timestamp: string;
}

export interface Game {
  id: string;
  creatorId: string;
  title?: string;
  location: string;
  city?: string;
  date: string;
  time: string;
  maxPlayers: number;
  joinedPlayers: string[];
  recommendedLevel?: SkillLevel;
  gameType?: GameType;
  note?: string;
  requests?: GameRequest[];
  chat?: ChatMessage[];
  attendanceConfirmed?: boolean;
  attendanceRecords?: Record<string, "appeared" | "missed" | "unknown">;
  isRecurring?: boolean;
  recurrenceId?: string;
  isCompleted?: boolean;
  status: "scheduled" | "played" | "cancelled";
  result?: {
    score: string;
    sets: { team1: number; team2: number }[];
  };
  groupId?: string;
  visibility: 'public' | 'group-only' | 'invite-only';
  invitedUserIds?: string[];
  createdAt: string;
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  city?: string;
  adminIds: string[];
  memberIds: string[];
  invitedUserIds?: string[];
  recommendedLevel?: SkillLevel;
  visibility?: 'public' | 'private';
  chat?: ChatMessage[];
  createdAt: string;
  imageUrl?: string;
}

export interface GroupInvitation {
  id: string;
  groupId: string;
  invitedUserId: string;
  invitedByUserId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: "game_near" | "player_needed" | "reminder" | "request_status" | "new_request" | "gameInvite";
  title: string;
  message: string;
  gameId?: string;
  read?: boolean;
  createdAt: string;
  requestId?: string;
  friendRequestId?: string;
  fromUserId?: string;
  requestUserId?: string;
}
