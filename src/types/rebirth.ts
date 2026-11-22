import type { Timestamp } from 'firebase/firestore';

export type AppView =
  | 'dashboard'
  | 'builder'
  | 'faith'
  | 'thinker'
  | 'mentor'
  | 'battle'
  | 'planner'
  | 'analytics'
  | 'vault'
  | 'ranks'
  | 'settings';

export type PillarKey = 'builder' | 'faith' | 'thinker' | 'discipline';

export type MentorMode =
  | 'CLEAR MY MIND'
  | 'DAILY CHECK-IN'
  | 'ACCOUNTABILITY'
  | 'FAITH AND WISDOM'
  | 'BUSINESS AND WEALTH'
  | 'DECISION ROOM'
  | 'EMOTIONAL SUPPORT'
  | 'CODING GUIDE';

export interface UserProfile {
  uid: string;
  displayName: string;
  email?: string;
  avatarId: string;
  theme: 'dark' | 'light';
  dailyLearningGoalHours?: number;
  notificationsEnabled?: boolean;
  reminderTime?: string;
  xp: number;
  streakDays: number;
  lastActiveDate?: string;
  totalLearningMinutes: number;
  trustedContactName?: string;
  trustedContactPhone?: string;
  createdAt?: Timestamp | unknown;
  updatedAt?: Timestamp | unknown;
}

export interface DailyMission {
  id: string;
  userId: string;
  title: string;
  pillar: PillarKey;
  frequency: 'daily' | 'weekly' | 'monthly';
  xpReward: number;
  completedDates: string[];
  isCustom?: boolean;
  createdAt?: Timestamp | unknown;
  updatedAt?: Timestamp | unknown;
}

export interface BuilderModuleProgress {
  id: string;
  userId: string;
  moduleKey: string;
  completedLessons: string[];
  practiceMinutes: number;
  notes: string;
  createdAt?: Timestamp | unknown;
  updatedAt?: Timestamp | unknown;
}

export interface ProjectMilestone {
  id: string;
  title: string;
  done: boolean;
}

export interface BuilderProject {
  id: string;
  userId: string;
  title: string;
  description?: string;
  techStack?: string;
  deadline?: string;
  status: 'active' | 'completed' | 'paused';
  evidenceUrl?: string;
  evidenceNotes?: string;
  milestones: ProjectMilestone[];
  hoursLogged: number;
  createdAt?: Timestamp | unknown;
  updatedAt?: Timestamp | unknown;
}

export interface CodingPracticeLog {
  id: string;
  userId: string;
  moduleKey: string;
  topic: string;
  minutes: number;
  date: string;
  takeaway?: string;
  createdAt?: Timestamp | unknown;
  updatedAt?: Timestamp | unknown;
}

export type FaithEntryKind = 'bible_study' | 'prayer' | 'daily_reflection' | 'character_check';

export interface FaithEntry {
  id: string;
  userId: string;
  kind: FaithEntryKind;
  title: string;
  scriptureRef?: string;
  content?: string;
  question?: string;
  lessonLearned?: string;
  answered?: boolean;
  answeredNote?: string;
  learnedAboutGod?: string;
  didWell?: string;
  whereFailed?: string;
  improveTomorrow?: string;
  characterVirtue?: string;
  virtueRating?: number;
  date: string;
  createdAt?: Timestamp | unknown;
  updatedAt?: Timestamp | unknown;
}

export type ThinkerSection =
  | 'chess'
  | 'puzzle'
  | 'decision'
  | 'finance_tx'
  | 'savings_goal'
  | 'business_idea'
  | 'discovery'
  | 'peer_pressure'
  | 'communication';

export interface ThinkerEntry {
  id: string;
  userId: string;
  section: ThinkerSection;
  title: string;
  category?: string;
  amount?: number;
  targetAmount?: number;
  txType?: 'income' | 'expense' | 'savings' | 'none';
  notes?: string;
  date: string;
  createdAt?: Timestamp | unknown;
  updatedAt?: Timestamp | unknown;
}

export type BattleEntryType =
  | 'positive_habit'
  | 'urge_victory'
  | 'setback_lesson'
  | 'emergency_reset';

export interface BattleLog {
  id: string;
  userId: string;
  entryType: BattleEntryType;
  habitName: string;
  trigger?: string;
  intensity?: number;
  alternativeAction?: string;
  lesson?: string;
  completedDates?: string[];
  date: string;
  createdAt?: Timestamp | unknown;
  updatedAt?: Timestamp | unknown;
}

export type PlannerCategory =
  | 'learning'
  | 'prayer_bible'
  | 'exercise'
  | 'responsibility'
  | 'rest'
  | 'project';

export interface PlannerBlock {
  id: string;
  userId: string;
  title: string;
  category: PlannerCategory;
  startTime: string;
  endTime: string;
  date: string;
  recurring: 'none' | 'daily' | 'weekdays' | 'weekly';
  completed: boolean;
  reminderEnabled: boolean;
  priority: 'high' | 'medium' | 'low';
  createdAt?: Timestamp | unknown;
  updatedAt?: Timestamp | unknown;
}

export const VAULT_CATEGORIES = [
  'My thoughts',
  'Bible lessons',
  'Coding notes',
  'Business ideas',
  'Financial lessons',
  'Life lessons',
  'Goals',
  'Personal reflections',
] as const;

export type VaultCategory = (typeof VAULT_CATEGORIES)[number];

export interface VaultNote {
  id: string;
  userId: string;
  title: string;
  category: VaultCategory;
  content: string;
  tags: string[];
  pinned: boolean;
  createdAt?: Timestamp | unknown;
  updatedAt?: Timestamp | unknown;
}

export interface MentorChat {
  id: string;
  userId: string;
  mode: MentorMode;
  title: string;
  createdAt?: Timestamp | unknown;
  updatedAt?: Timestamp | unknown;
}

export interface MentorMessage {
  id: string;
  userId: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt?: Timestamp | unknown;
}

export interface XpEvent {
  id: string;
  userId: string;
  source: string;
  pillar: PillarKey | 'planner';
  description: string;
  amount: number;
  date: string;
  createdAt?: Timestamp | unknown;
}

export interface UnlockedBadge {
  id: string;
  userId: string;
  badgeKey: string;
  title: string;
  createdAt?: Timestamp | unknown;
}

export interface RankDefinition {
  level: number;
  title: string;
  minXp: number;
  description: string;
}

export const RANKS: RankDefinition[] = [
  { level: 1, title: 'THE AWAKENED', minXp: 0, description: 'You have chosen clarity over drift and begun building deliberate habits.' },
  { level: 2, title: 'THE DISCIPLINED', minXp: 300, description: 'Consistency is replacing impulse. Daily commitments are taking root.' },
  { level: 3, title: 'THE STUDENT', minXp: 900, description: 'Focused study, Scripture reflection, and structured thinking define your week.' },
  { level: 4, title: 'THE BUILDER', minXp: 2000, description: 'You ship real projects, steward your finances, and solve hard problems.' },
  { level: 5, title: 'THE STRATEGIST', minXp: 4000, description: 'Independent of peer pressure, anchored in truth, thinking in systems.' },
  { level: 6, title: 'THE MASTER', minXp: 7500, description: 'Jishinde Ushinde lived daily — self-mastery in service of purpose.' },
];

export function getRankForXp(xp: number): {
  current: RankDefinition;
  next: RankDefinition | null;
  progressPct: number;
} {
  let current = RANKS[0];
  for (const r of RANKS) {
    if (xp >= r.minXp) {
      current = r;
    }
  }
  const idx = RANKS.findIndex((r) => r.level === current.level);
  const next = idx < RANKS.length - 1 ? RANKS[idx + 1] : null;
  if (!next) {
    return { current, next: null, progressPct: 100 };
  }
  const span = next.minXp - current.minXp;
  const gained = Math.max(0, xp - current.minXp);
  const progressPct = Math.min(100, Math.round((gained / span) * 100));
  return { current, next, progressPct };
}
