import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type User,
} from 'firebase/auth';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  increment,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
  type DocumentReference,
} from 'firebase/firestore';
import {
  auth,
  clampStr,
  db,
  googleProvider,
  handleFirestoreError,
  OperationType,
  sanitizeId,
  testConnection,
  todayIsoDate,
} from '../lib/firebase';
import type {
  AppView,
  BattleEntryType,
  BattleLog,
  BuilderModuleProgress,
  BuilderProject,
  CodingPracticeLog,
  DailyMission,
  FaithEntry,
  MentorChat,
  MentorMode,
  PillarKey,
  PlannerBlock,
  ProjectMilestone,
  ThinkerEntry,
  UnlockedBadge,
  UserProfile,
  VaultNote,
  XpEvent,
} from '../types/rebirth';

export interface MentorLaunchDraft {
  mode: MentorMode;
  prompt: string;
}

interface RebirthContextValue {
  user: User | null;
  authReady: boolean;
  emailVerified: boolean;
  profile: UserProfile | null;
  activeView: AppView;
  setActiveView: (v: AppView) => void;
  emergencyOpen: boolean;
  setEmergencyOpen: (open: boolean) => void;
  mentorDraft: MentorLaunchDraft | null;
  openMentorWithPrompt: (mode: MentorMode, prompt: string) => void;
  clearMentorDraft: () => void;

  missions: DailyMission[];
  builderModules: BuilderModuleProgress[];
  projects: BuilderProject[];
  codingLogs: CodingPracticeLog[];
  faithEntries: FaithEntry[];
  thinkerEntries: ThinkerEntry[];
  battleLogs: BattleLog[];
  plannerBlocks: PlannerBlock[];
  vaultNotes: VaultNote[];
  mentorChats: MentorChat[];
  xpHistory: XpEvent[];
  achievements: UnlockedBadge[];

  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, displayName?: string) => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
  refreshEmailVerification: () => Promise<boolean>;
  clearAuthError: () => void;
  signOutUser: () => Promise<void>;
  authError: string | null;

  awardXp: (
    amount: number,
    pillar: PillarKey | 'planner',
    source: string,
    description: string,
    extraMinutes?: number
  ) => Promise<void>;

  toggleMissionToday: (mission: DailyMission) => Promise<void>;
  createMission: (input: {
    title: string;
    pillar: PillarKey;
    frequency: 'daily' | 'weekly' | 'monthly';
    xpReward: number;
  }) => Promise<void>;
  deleteMission: (missionId: string) => Promise<void>;

  toggleBuilderLesson: (moduleKey: string, lessonId: string) => Promise<void>;
  saveBuilderModuleNotes: (moduleKey: string, notes: string) => Promise<void>;
  logCodingSession: (input: {
    moduleKey: string;
    topic: string;
    minutes: number;
    takeaway: string;
  }) => Promise<void>;
  createProject: (input: {
    title: string;
    description: string;
    techStack: string;
    deadline: string;
    milestones: string[];
  }) => Promise<void>;
  updateProject: (
    projectId: string,
    updates: Partial<
      Pick<
        BuilderProject,
        | 'title'
        | 'description'
        | 'techStack'
        | 'deadline'
        | 'status'
        | 'evidenceUrl'
        | 'evidenceNotes'
        | 'milestones'
        | 'hoursLogged'
      >
    >
  ) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;

  addFaithEntry: (
    input: Omit<FaithEntry, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
  ) => Promise<void>;
  updateFaithEntry: (
    entryId: string,
    updates: Partial<FaithEntry>
  ) => Promise<void>;
  deleteFaithEntry: (entryId: string) => Promise<void>;

  addThinkerEntry: (
    input: Omit<ThinkerEntry, 'id' | 'userId' | 'createdAt' | 'updatedAt'>,
    xpAward?: { amount: number; source: string; desc: string }
  ) => Promise<void>;
  deleteThinkerEntry: (entryId: string) => Promise<void>;

  addBattleLog: (input: {
    entryType: BattleEntryType;
    habitName: string;
    trigger?: string;
    intensity?: number;
    alternativeAction?: string;
    lesson?: string;
  }) => Promise<void>;
  togglePositiveHabitToday: (log: BattleLog) => Promise<void>;
  deleteBattleLog: (logId: string) => Promise<void>;

  addPlannerBlock: (
    input: Omit<PlannerBlock, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
  ) => Promise<void>;
  togglePlannerBlock: (block: PlannerBlock) => Promise<void>;
  deletePlannerBlock: (blockId: string) => Promise<void>;

  addVaultNote: (
    input: Omit<VaultNote, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
  ) => Promise<void>;
  updateVaultNote: (
    noteId: string,
    updates: Partial<Pick<VaultNote, 'title' | 'category' | 'content' | 'tags' | 'pinned'>>
  ) => Promise<void>;
  deleteVaultNote: (noteId: string) => Promise<void>;

  createMentorChat: (mode: MentorMode, title: string) => Promise<string>;
  updateMentorChatTitle: (chatId: string, title: string, mode: MentorMode) => Promise<void>;
  deleteMentorChat: (chatId: string) => Promise<void>;

  updateProfileSettings: (
    updates: Partial<
      Pick<
        UserProfile,
        | 'displayName'
        | 'avatarId'
        | 'theme'
        | 'dailyLearningGoalHours'
        | 'notificationsEnabled'
        | 'reminderTime'
        | 'trustedContactName'
        | 'trustedContactPhone'
      >
    >
  ) => Promise<void>;
  exportAllUserData: () => void;
  resetSavedProgress: () => Promise<void>;
  deleteAccountAndData: () => Promise<void>;
}

const RebirthContext = createContext<RebirthContextValue | null>(null);

const STARTER_MISSIONS: Array<{
  id: string;
  title: string;
  pillar: PillarKey;
  frequency: 'daily' | 'weekly' | 'monthly';
  xpReward: number;
}> = [
  { id: 'mission_bible_read', title: 'Read today\'s Scripture passage & note 1 truth', pillar: 'faith', frequency: 'daily', xpReward: 30 },
  { id: 'mission_code_session', title: 'Complete 45 minutes of focused coding practice', pillar: 'builder', frequency: 'daily', xpReward: 40 },
  { id: 'mission_mental_rep', title: 'Solve 1 logic puzzle or analyze 1 decision', pillar: 'thinker', frequency: 'daily', xpReward: 25 },
  { id: 'mission_evening_reflect', title: 'Complete the 4-question evening self-examination', pillar: 'discipline', frequency: 'daily', xpReward: 30 },
  { id: 'mission_weekly_peer', title: 'Complete the weekly Peer Pressure Independence Audit', pillar: 'thinker', frequency: 'weekly', xpReward: 75 },
  { id: 'mission_monthly_build', title: 'Ship or advance a real-world Builder project milestone', pillar: 'builder', frequency: 'monthly', xpReward: 150 },
];

function formatFirebaseAuthError(err: unknown): string {
  const code =
    err && typeof err === 'object' && 'code' in err
      ? String((err as { code?: unknown }).code || '')
      : '';

  switch (code) {
    case 'auth/operation-not-allowed':
      return 'Email/Password sign-in is not yet enabled in Firebase Console (Authentication > Sign-in method > Email/Password). Enable it there or use Google Sign-In.';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Incorrect email or password. Double-check your details or use Forgot Password.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists. Switch to Sign In or reset your password.';
    case 'auth/weak-password':
      return 'Password is too weak. Choose at least 6 characters.';
    case 'auth/too-many-requests':
      return 'Too many attempts right now. Please wait a few minutes before trying again.';
    case 'auth/popup-closed-by-user':
      return 'Google sign-in popup was closed before finishing.';
    case 'auth/network-request-failed':
      return 'Network error while reaching Firebase Authentication. Check your connection.';
    default:
      return err instanceof Error ? err.message : 'Authentication failed. Please try again.';
  }
}

export const RebirthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [authRefreshTick, setAuthRefreshTick] = useState(0);
  const [authError, setAuthError] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activeView, setActiveView] = useState<AppView>('dashboard');
  const [emergencyOpen, setEmergencyOpen] = useState(false);
  const [mentorDraft, setMentorDraft] = useState<MentorLaunchDraft | null>(null);

  const [missions, setMissions] = useState<DailyMission[]>([]);
  const [builderModules, setBuilderModules] = useState<BuilderModuleProgress[]>([]);
  const [projects, setProjects] = useState<BuilderProject[]>([]);
  const [codingLogs, setCodingLogs] = useState<CodingPracticeLog[]>([]);
  const [faithEntries, setFaithEntries] = useState<FaithEntry[]>([]);
  const [thinkerEntries, setThinkerEntries] = useState<ThinkerEntry[]>([]);
  const [battleLogs, setBattleLogs] = useState<BattleLog[]>([]);
  const [plannerBlocks, setPlannerBlocks] = useState<PlannerBlock[]>([]);
  const [vaultNotes, setVaultNotes] = useState<VaultNote[]>([]);
  const [mentorChats, setMentorChats] = useState<MentorChat[]>([]);
  const [xpHistory, setXpHistory] = useState<XpEvent[]>([]);
  const [achievements, setAchievements] = useState<UnlockedBadge[]>([]);

  const firedNotificationsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    testConnection();
  }, []);

  // Theme sync with <html> class
  useEffect(() => {
    const theme = profile?.theme ?? 'dark';
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      document.body.className = 'bg-[#09090B] text-zinc-100 antialiased selection:bg-[#C8A24A]/30 selection:text-white';
    } else {
      root.classList.remove('dark');
      document.body.className = 'bg-[#F8F7F4] text-zinc-900 antialiased selection:bg-[#9A7420]/20 selection:text-zinc-950';
    }
  }, [profile?.theme]);

  const ensureUserProfileInitialized = useCallback(async (firebaseUser: User) => {
    const uid = firebaseUser.uid;
    const userRef = doc(db, 'users', uid);

    try {
      const snap = await getDoc(userRef);
      if (!snap.exists()) {
        const initialProfile = {
          uid,
          displayName: clampStr(firebaseUser.displayName || 'Evans', 80) || 'Evans',
          email: clampStr(firebaseUser.email || '', 160),
          avatarId: 'monolith',
          theme: 'dark' as const,
          dailyLearningGoalHours: 2,
          notificationsEnabled: false,
          reminderTime: '07:00',
          xp: 0,
          streakDays: 0,
          lastActiveDate: '',
          totalLearningMinutes: 0,
          trustedContactName: '',
          trustedContactPhone: '',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };
        await setDoc(userRef, initialProfile);

        // Seed starter customizable missions once root profile exists
        const batch = writeBatch(db);
        for (const m of STARTER_MISSIONS) {
          const mRef = doc(db, 'users', uid, 'missions', m.id);
          batch.set(mRef, {
            userId: uid,
            title: m.title,
            pillar: m.pillar,
            frequency: m.frequency,
            xpReward: m.xpReward,
            completedDates: [],
            isCustom: false,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        }
        await batch.commit();
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${uid}`);
    }
  }, []);

  // Auth listener & profile initialization
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setEmailVerified(false);
        setProfile(null);
        setMissions([]);
        setBuilderModules([]);
        setProjects([]);
        setCodingLogs([]);
        setFaithEntries([]);
        setThinkerEntries([]);
        setBattleLogs([]);
        setPlannerBlocks([]);
        setVaultNotes([]);
        setMentorChats([]);
        setXpHistory([]);
        setAchievements([]);
        setAuthReady(true);
        return;
      }

      setUser(firebaseUser);
      setEmailVerified(Boolean(firebaseUser.emailVerified));

      if (!firebaseUser.emailVerified) {
        setAuthError(null);
        setAuthReady(true);
        return;
      }

      setAuthError(null);
      await ensureUserProfileInitialized(firebaseUser);
      setAuthReady(true);
    });

    return () => unsub();
  }, [ensureUserProfileInitialized]);

  // Attach real-time Firestore listeners only when authenticated & verified
  useEffect(() => {
    if (!authReady || !user || !emailVerified) return;
    const uid = user.uid;

    const unsubs: Array<() => void> = [];

    unsubs.push(
      onSnapshot(
        doc(db, 'users', uid),
        (snap) => {
          if (snap.exists()) {
            setProfile(snap.data() as UserProfile);
          }
        },
        (err) => handleFirestoreError(err, OperationType.GET, `users/${uid}`)
      )
    );

    const subCollections = [
      {
        name: 'missions',
        setter: (items: DailyMission[]) => setMissions(items),
        order: 'createdAt',
        dir: 'asc' as const,
      },
      {
        name: 'builderModules',
        setter: (items: BuilderModuleProgress[]) => setBuilderModules(items),
        order: 'updatedAt',
        dir: 'desc' as const,
      },
      {
        name: 'projects',
        setter: (items: BuilderProject[]) => setProjects(items),
        order: 'createdAt',
        dir: 'desc' as const,
      },
      {
        name: 'codingLogs',
        setter: (items: CodingPracticeLog[]) => setCodingLogs(items),
        order: 'createdAt',
        dir: 'desc' as const,
      },
      {
        name: 'faithEntries',
        setter: (items: FaithEntry[]) => setFaithEntries(items),
        order: 'createdAt',
        dir: 'desc' as const,
      },
      {
        name: 'thinkerEntries',
        setter: (items: ThinkerEntry[]) => setThinkerEntries(items),
        order: 'createdAt',
        dir: 'desc' as const,
      },
      {
        name: 'battleLogs',
        setter: (items: BattleLog[]) => setBattleLogs(items),
        order: 'createdAt',
        dir: 'desc' as const,
      },
      {
        name: 'plannerBlocks',
        setter: (items: PlannerBlock[]) => setPlannerBlocks(items),
        order: 'startTime',
        dir: 'asc' as const,
      },
      {
        name: 'vaultNotes',
        setter: (items: VaultNote[]) => setVaultNotes(items),
        order: 'updatedAt',
        dir: 'desc' as const,
      },
      {
        name: 'mentorChats',
        setter: (items: MentorChat[]) => setMentorChats(items),
        order: 'updatedAt',
        dir: 'desc' as const,
      },
      {
        name: 'xpHistory',
        setter: (items: XpEvent[]) => setXpHistory(items),
        order: 'createdAt',
        dir: 'desc' as const,
      },
      {
        name: 'achievements',
        setter: (items: UnlockedBadge[]) => setAchievements(items),
        order: 'createdAt',
        dir: 'desc' as const,
      },
    ];

    for (const colCfg of subCollections) {
      const pathStr = `users/${uid}/${colCfg.name}`;
      const q = query(
        collection(db, pathStr),
        where('userId', '==', uid)
      );
      unsubs.push(
        onSnapshot(
          q,
          (snap) => {
            const list = snap.docs.map((d) => ({
              id: d.id,
              ...d.data(),
            })) as Array<Record<string, unknown>>;
            const toSortVal = (val: unknown): number | string => {
              if (val && typeof val === 'object' && 'toMillis' in val) {
                return (val as { toMillis: () => number }).toMillis();
              }
              if (typeof val === 'string') return val;
              if (typeof val === 'number') return val;
              return 0;
            };
            list.sort((a, b) => {
              const va = toSortVal(a[colCfg.order]);
              const vb = toSortVal(b[colCfg.order]);
              if (typeof va === 'string' && typeof vb === 'string') {
                return colCfg.dir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
              }
              const na = Number(va) || 0;
              const nb = Number(vb) || 0;
              return colCfg.dir === 'asc' ? na - nb : nb - na;
            });
            colCfg.setter(list as never);
          },
          (err) => handleFirestoreError(err, OperationType.LIST, pathStr)
        )
      );
    }

    return () => {
      for (const u of unsubs) u();
    };
  }, [authReady, user, emailVerified, authRefreshTick]);

  // Browser / PWA Reminder Loop for Planner Blocks & Project Deadlines
  useEffect(() => {
    if (!profile?.notificationsEnabled) return;
    if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;

    const checkReminders = () => {
      const now = new Date();
      const today = todayIsoDate();
      const dayOfWeek = now.getDay();
      const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;
      const hh = String(now.getHours()).padStart(2, '0');
      const mm = String(now.getMinutes()).padStart(2, '0');
      const currentHHMM = `${hh}:${mm}`;

      for (const block of plannerBlocks) {
        if (!block.reminderEnabled || block.completed) continue;
        const blockDay = new Date(`${block.date}T12:00:00`).getDay();
        const isForToday =
          block.date === today ||
          block.recurring === 'daily' ||
          (block.recurring === 'weekdays' && isWeekday) ||
          (block.recurring === 'weekly' && blockDay === dayOfWeek && today >= block.date);
        if (isForToday && block.startTime === currentHHMM) {
          const key = `block_${block.id}_${today}_${currentHHMM}`;
          if (!firedNotificationsRef.current.has(key)) {
            firedNotificationsRef.current.add(key);
            new Notification(`PROJECT REBIRTH · ${block.title}`, {
              body: `Scheduled block starts now (${block.startTime}–${block.endTime}).`,
              icon: '/pwa-192x192.png',
            });
          }
        }
      }

      for (const proj of projects) {
        if (proj.status === 'active' && proj.deadline === today) {
          const key = `proj_${proj.id}_${today}`;
          if (!firedNotificationsRef.current.has(key)) {
            firedNotificationsRef.current.add(key);
            new Notification(`Deadline Today · ${proj.title}`, {
              body: 'Review remaining milestones in Pillar One: The Builder.',
              icon: '/pwa-192x192.png',
            });
          }
        }
      }
    };

    checkReminders();
    const timer = window.setInterval(checkReminders, 30000);
    return () => window.clearInterval(timer);
  }, [profile?.notificationsEnabled, plannerBlocks, projects]);

  const clearAuthError = useCallback(() => {
    setAuthError(null);
  }, []);

  const signInWithGoogle = useCallback(async () => {
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      setAuthError(formatFirebaseAuthError(err));
    }
  }, []);

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    setAuthError(null);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (err) {
      const msg = formatFirebaseAuthError(err);
      setAuthError(msg);
      throw new Error(msg);
    }
  }, []);

  const signUpWithEmail = useCallback(
    async (email: string, password: string, displayName?: string) => {
      setAuthError(null);
      try {
        const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
        const cleanName = clampStr(displayName || 'Evans', 80) || 'Evans';
        await updateProfile(cred.user, { displayName: cleanName });
        await sendEmailVerification(cred.user);
      } catch (err) {
        const msg = formatFirebaseAuthError(err);
        setAuthError(msg);
        throw new Error(msg);
      }
    },
    []
  );

  const sendPasswordReset = useCallback(async (email: string) => {
    setAuthError(null);
    try {
      await sendPasswordResetEmail(auth, email.trim());
    } catch (err) {
      const msg = formatFirebaseAuthError(err);
      setAuthError(msg);
      throw new Error(msg);
    }
  }, []);

  const resendVerificationEmail = useCallback(async () => {
    setAuthError(null);
    if (!auth.currentUser) {
      throw new Error('No active session found. Sign in again to resend verification.');
    }
    try {
      await sendEmailVerification(auth.currentUser);
    } catch (err) {
      const msg = formatFirebaseAuthError(err);
      setAuthError(msg);
      throw new Error(msg);
    }
  }, []);

  const refreshEmailVerification = useCallback(async (): Promise<boolean> => {
    setAuthError(null);
    if (!auth.currentUser) return false;
    try {
      await auth.currentUser.reload();
      await auth.currentUser.getIdToken(true);
      const verified = Boolean(auth.currentUser.emailVerified);
      setEmailVerified(verified);
      setUser(auth.currentUser);
      if (verified) {
        await ensureUserProfileInitialized(auth.currentUser);
        setAuthRefreshTick((t) => t + 1);
      }
      return verified;
    } catch (err) {
      const msg = formatFirebaseAuthError(err);
      setAuthError(msg);
      return false;
    }
  }, [ensureUserProfileInitialized]);

  const signOutUser = useCallback(async () => {
    setAuthError(null);
    await signOut(auth);
  }, []);

  const openMentorWithPrompt = useCallback((mode: MentorMode, prompt: string) => {
    setMentorDraft({ mode, prompt });
    setActiveView('mentor');
  }, []);

  const clearMentorDraft = useCallback(() => {
    setMentorDraft(null);
  }, []);

  const maybeUnlockBadge = useCallback(
    async (badgeKey: string, title: string) => {
      if (!user) return;
      if (achievements.some((a) => a.badgeKey === badgeKey)) return;
      const cleanKey = sanitizeId(badgeKey);
      const pathStr = `users/${user.uid}/achievements`;
      try {
        await setDoc(doc(db, pathStr, cleanKey), {
          userId: user.uid,
          badgeKey: cleanKey,
          title: clampStr(title, 120),
          createdAt: serverTimestamp(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `${pathStr}/${cleanKey}`);
      }
    },
    [user, achievements]
  );

  const awardXp = useCallback(
    async (
      amount: number,
      pillar: PillarKey | 'planner',
      source: string,
      description: string,
      extraMinutes = 0
    ) => {
      if (!user || !profile) return;
      const safeAmount = Math.max(1, Math.min(5000, Math.round(amount)));
      const safeMinutes = Math.max(0, Math.round(extraMinutes));
      const today = todayIsoDate();
      const uid = user.uid;

      let nextStreak = profile.streakDays || 0;
      if (profile.lastActiveDate !== today) {
        const yesterdayDate = new Date();
        yesterdayDate.setDate(yesterdayDate.getDate() - 1);
        const yIso = `${yesterdayDate.getFullYear()}-${String(yesterdayDate.getMonth() + 1).padStart(2, '0')}-${String(yesterdayDate.getDate()).padStart(2, '0')}`;
        nextStreak = profile.lastActiveDate === yIso ? nextStreak + 1 : 1;
      }

      try {
        const xpRef = doc(collection(db, `users/${uid}/xpHistory`));
        await setDoc(xpRef, {
          userId: uid,
          source: clampStr(source, 80),
          pillar,
          description: clampStr(description, 200),
          amount: safeAmount,
          date: today,
          createdAt: serverTimestamp(),
        });

        await updateDoc(doc(db, 'users', uid), {
          xp: increment(safeAmount),
          streakDays: nextStreak,
          lastActiveDate: today,
          totalLearningMinutes: increment(safeMinutes),
          updatedAt: serverTimestamp(),
        });

        await maybeUnlockBadge('first_action', 'First Deliberate Step');
        if (nextStreak >= 7) {
          await maybeUnlockBadge('seven_day_streak', 'Seven-Day Steadfastness');
        }
        if ((profile.totalLearningMinutes || 0) + safeMinutes >= 600) {
          await maybeUnlockBadge('ten_hours_builder', '10 Hours of Craft');
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${uid}`);
      }
    },
    [user, profile, maybeUnlockBadge]
  );

  const toggleMissionToday = useCallback(
    async (mission: DailyMission) => {
      if (!user) return;
      const today = todayIsoDate();
      const alreadyDone = mission.completedDates.includes(today);
      const nextDates = alreadyDone
        ? mission.completedDates.filter((d) => d !== today)
        : [...mission.completedDates.slice(-364), today];

      const pathStr = `users/${user.uid}/missions/${mission.id}`;
      try {
        await updateDoc(doc(db, pathStr), {
          completedDates: nextDates,
          updatedAt: serverTimestamp(),
        });
        if (!alreadyDone) {
          await awardXp(mission.xpReward, mission.pillar, 'mission_complete', mission.title);
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, pathStr);
      }
    },
    [user, awardXp]
  );

  const createMission = useCallback(
    async (input: {
      title: string;
      pillar: PillarKey;
      frequency: 'daily' | 'weekly' | 'monthly';
      xpReward: number;
    }) => {
      if (!user) return;
      const pathStr = `users/${user.uid}/missions`;
      try {
        await addDoc(collection(db, pathStr), {
          userId: user.uid,
          title: clampStr(input.title, 160),
          pillar: input.pillar,
          frequency: input.frequency,
          xpReward: Math.max(5, Math.min(500, Math.round(input.xpReward))),
          completedDates: [],
          isCustom: true,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, pathStr);
      }
    },
    [user]
  );

  const deleteMission = useCallback(
    async (missionId: string) => {
      if (!user) return;
      const pathStr = `users/${user.uid}/missions/${missionId}`;
      try {
        await deleteDoc(doc(db, pathStr));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, pathStr);
      }
    },
    [user]
  );

  const toggleBuilderLesson = useCallback(
    async (moduleKey: string, lessonId: string) => {
      if (!user) return;
      const cleanKey = sanitizeId(moduleKey);
      const existing = builderModules.find((m) => m.moduleKey === cleanKey);
      const pathStr = `users/${user.uid}/builderModules/${cleanKey}`;

      try {
        if (!existing) {
          await setDoc(doc(db, pathStr), {
            userId: user.uid,
            moduleKey: cleanKey,
            completedLessons: [clampStr(lessonId, 80)],
            practiceMinutes: 0,
            notes: '',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
          await awardXp(35, 'builder', 'lesson_complete', `Completed lesson ${lessonId}`);
        } else {
          const isDone = existing.completedLessons.includes(lessonId);
          const nextLessons = isDone
            ? existing.completedLessons.filter((l) => l !== lessonId)
            : [...existing.completedLessons.slice(0, 49), clampStr(lessonId, 80)];
          await updateDoc(doc(db, pathStr), {
            completedLessons: nextLessons,
            updatedAt: serverTimestamp(),
          });
          if (!isDone) {
            await awardXp(35, 'builder', 'lesson_complete', `Completed lesson ${lessonId}`);
          }
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, pathStr);
      }
    },
    [user, builderModules, awardXp]
  );

  const saveBuilderModuleNotes = useCallback(
    async (moduleKey: string, notes: string) => {
      if (!user) return;
      const cleanKey = sanitizeId(moduleKey);
      const existing = builderModules.find((m) => m.moduleKey === cleanKey);
      const pathStr = `users/${user.uid}/builderModules/${cleanKey}`;
      try {
        if (!existing) {
          await setDoc(doc(db, pathStr), {
            userId: user.uid,
            moduleKey: cleanKey,
            completedLessons: [],
            practiceMinutes: 0,
            notes: clampStr(notes, 8000),
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        } else {
          await updateDoc(doc(db, pathStr), {
            notes: clampStr(notes, 8000),
            updatedAt: serverTimestamp(),
          });
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, pathStr);
      }
    },
    [user, builderModules]
  );

  const logCodingSession = useCallback(
    async (input: {
      moduleKey: string;
      topic: string;
      minutes: number;
      takeaway: string;
    }) => {
      if (!user) return;
      const safeMin = Math.max(1, Math.min(1440, Math.round(input.minutes)));
      const cleanKey = sanitizeId(input.moduleKey);
      const pathStr = `users/${user.uid}/codingLogs`;
      try {
        await addDoc(collection(db, pathStr), {
          userId: user.uid,
          moduleKey: cleanKey,
          topic: clampStr(input.topic, 180),
          minutes: safeMin,
          date: todayIsoDate(),
          takeaway: clampStr(input.takeaway, 2000),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        const existing = builderModules.find((m) => m.moduleKey === cleanKey);
        const modPath = `users/${user.uid}/builderModules/${cleanKey}`;
        if (!existing) {
          await setDoc(doc(db, modPath), {
            userId: user.uid,
            moduleKey: cleanKey,
            completedLessons: [],
            practiceMinutes: safeMin,
            notes: '',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        } else {
          await updateDoc(doc(db, modPath), {
            practiceMinutes: (existing.practiceMinutes || 0) + safeMin,
            updatedAt: serverTimestamp(),
          });
        }

        const earnedXp = Math.max(15, Math.min(200, Math.round(safeMin * 0.8)));
        await awardXp(
          earnedXp,
          'builder',
          'coding_practice',
          `Practice: ${clampStr(input.topic, 100)} (${safeMin}m)`,
          safeMin
        );
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, pathStr);
      }
    },
    [user, builderModules, awardXp]
  );

  const createProject = useCallback(
    async (input: {
      title: string;
      description: string;
      techStack: string;
      deadline: string;
      milestones: string[];
    }) => {
      if (!user) return;
      const pathStr = `users/${user.uid}/projects`;
      const milestones: ProjectMilestone[] = input.milestones
        .filter((m) => m.trim())
        .slice(0, 25)
        .map((m, idx) => ({
          id: `ms_${Date.now()}_${idx}`,
          title: clampStr(m, 160),
          done: false,
        }));
      try {
        await addDoc(collection(db, pathStr), {
          userId: user.uid,
          title: clampStr(input.title, 140),
          description: clampStr(input.description, 2000),
          techStack: clampStr(input.techStack, 200),
          deadline: clampStr(input.deadline, 20),
          status: 'active',
          evidenceUrl: '',
          evidenceNotes: '',
          milestones,
          hoursLogged: 0,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, pathStr);
      }
    },
    [user]
  );

  const updateProject = useCallback(
    async (
      projectId: string,
      updates: Partial<
        Pick<
          BuilderProject,
          | 'title'
          | 'description'
          | 'techStack'
          | 'deadline'
          | 'status'
          | 'evidenceUrl'
          | 'evidenceNotes'
          | 'milestones'
          | 'hoursLogged'
        >
      >
    ) => {
      if (!user) return;
      const pathStr = `users/${user.uid}/projects/${projectId}`;
      const current = projects.find((p) => p.id === projectId);
      if (!current || current.status === 'completed') return;

      const payload: Record<string, unknown> = { updatedAt: serverTimestamp() };
      if (updates.title !== undefined) payload.title = clampStr(updates.title, 140);
      if (updates.description !== undefined) payload.description = clampStr(updates.description, 2000);
      if (updates.techStack !== undefined) payload.techStack = clampStr(updates.techStack, 200);
      if (updates.deadline !== undefined) payload.deadline = clampStr(updates.deadline, 20);
      if (updates.status !== undefined) payload.status = updates.status;
      if (updates.evidenceUrl !== undefined) payload.evidenceUrl = clampStr(updates.evidenceUrl, 500);
      if (updates.evidenceNotes !== undefined) payload.evidenceNotes = clampStr(updates.evidenceNotes, 2000);
      if (updates.milestones !== undefined) payload.milestones = updates.milestones.slice(0, 25);
      if (updates.hoursLogged !== undefined) payload.hoursLogged = Math.max(0, updates.hoursLogged);

      try {
        await updateDoc(doc(db, pathStr), payload);
        if (updates.status === 'completed') {
          await awardXp(150, 'builder', 'project_shipped', `Completed project: ${current.title}`);
          await maybeUnlockBadge('project_shipped', 'Builder Who Ships');
        } else if (updates.milestones) {
          const prevDone = current.milestones.filter((m) => m.done).length;
          const nextDone = updates.milestones.filter((m) => m.done).length;
          if (nextDone > prevDone) {
            await awardXp(30, 'builder', 'project_milestone', `Milestone completed on ${current.title}`);
          }
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, pathStr);
      }
    },
    [user, projects, awardXp, maybeUnlockBadge]
  );

  const deleteProject = useCallback(
    async (projectId: string) => {
      if (!user) return;
      const pathStr = `users/${user.uid}/projects/${projectId}`;
      try {
        await deleteDoc(doc(db, pathStr));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, pathStr);
      }
    },
    [user]
  );

  const addFaithEntry = useCallback(
    async (input: Omit<FaithEntry, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
      if (!user) return;
      const pathStr = `users/${user.uid}/faithEntries`;
      const cleanPayload: Record<string, unknown> = {
        userId: user.uid,
        kind: input.kind,
        title: clampStr(input.title, 180) || 'Reflection',
        date: clampStr(input.date || todayIsoDate(), 10),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      if (input.scriptureRef !== undefined) cleanPayload.scriptureRef = clampStr(input.scriptureRef, 120);
      if (input.content !== undefined) cleanPayload.content = clampStr(input.content, 8000);
      if (input.question !== undefined) cleanPayload.question = clampStr(input.question, 1500);
      if (input.lessonLearned !== undefined) cleanPayload.lessonLearned = clampStr(input.lessonLearned, 2000);
      if (input.answered !== undefined) cleanPayload.answered = input.answered;
      if (input.answeredNote !== undefined) cleanPayload.answeredNote = clampStr(input.answeredNote, 1500);
      if (input.learnedAboutGod !== undefined) cleanPayload.learnedAboutGod = clampStr(input.learnedAboutGod, 2000);
      if (input.didWell !== undefined) cleanPayload.didWell = clampStr(input.didWell, 2000);
      if (input.whereFailed !== undefined) cleanPayload.whereFailed = clampStr(input.whereFailed, 2000);
      if (input.improveTomorrow !== undefined) cleanPayload.improveTomorrow = clampStr(input.improveTomorrow, 2000);
      if (input.characterVirtue !== undefined) cleanPayload.characterVirtue = clampStr(input.characterVirtue, 60);
      if (input.virtueRating !== undefined) cleanPayload.virtueRating = Math.min(5, Math.max(1, input.virtueRating));

      try {
        await addDoc(collection(db, pathStr), cleanPayload);
        await awardXp(25, 'faith', `faith_${input.kind}`, `Logged ${input.title}`);
        await maybeUnlockBadge('word_rooted', 'Rooted in Scripture & Truth');
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, pathStr);
      }
    },
    [user, awardXp, maybeUnlockBadge]
  );

  const updateFaithEntry = useCallback(
    async (entryId: string, updates: Partial<FaithEntry>) => {
      if (!user) return;
      const pathStr = `users/${user.uid}/faithEntries/${entryId}`;
      const payload: Record<string, unknown> = { updatedAt: serverTimestamp() };
      if (updates.answered !== undefined) payload.answered = updates.answered;
      if (updates.answeredNote !== undefined) payload.answeredNote = clampStr(updates.answeredNote, 1500);
      if (updates.content !== undefined) payload.content = clampStr(updates.content, 8000);
      try {
        await updateDoc(doc(db, pathStr), payload);
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, pathStr);
      }
    },
    [user]
  );

  const deleteFaithEntry = useCallback(
    async (entryId: string) => {
      if (!user) return;
      const pathStr = `users/${user.uid}/faithEntries/${entryId}`;
      try {
        await deleteDoc(doc(db, pathStr));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, pathStr);
      }
    },
    [user]
  );

  const addThinkerEntry = useCallback(
    async (
      input: Omit<ThinkerEntry, 'id' | 'userId' | 'createdAt' | 'updatedAt'>,
      xpAward?: { amount: number; source: string; desc: string }
    ) => {
      if (!user) return;
      const pathStr = `users/${user.uid}/thinkerEntries`;
      const payload: Record<string, unknown> = {
        userId: user.uid,
        section: input.section,
        title: clampStr(input.title, 180),
        date: clampStr(input.date || todayIsoDate(), 10),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      if (input.category !== undefined) payload.category = clampStr(input.category, 80);
      if (input.amount !== undefined) payload.amount = Math.max(0, input.amount);
      if (input.targetAmount !== undefined) payload.targetAmount = Math.max(0, input.targetAmount);
      if (input.txType !== undefined) payload.txType = input.txType;
      if (input.notes !== undefined) payload.notes = clampStr(input.notes, 6000);

      try {
        await addDoc(collection(db, pathStr), payload);
        if (xpAward) {
          await awardXp(xpAward.amount, 'thinker', xpAward.source, xpAward.desc);
        }
        if (input.section === 'puzzle') {
          await maybeUnlockBadge('logic_strategist', 'Sharp Mind Strategist');
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, pathStr);
      }
    },
    [user, awardXp, maybeUnlockBadge]
  );

  const deleteThinkerEntry = useCallback(
    async (entryId: string) => {
      if (!user) return;
      const pathStr = `users/${user.uid}/thinkerEntries/${entryId}`;
      try {
        await deleteDoc(doc(db, pathStr));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, pathStr);
      }
    },
    [user]
  );

  const addBattleLog = useCallback(
    async (input: {
      entryType: BattleEntryType;
      habitName: string;
      trigger?: string;
      intensity?: number;
      alternativeAction?: string;
      lesson?: string;
    }) => {
      if (!user) return;
      const pathStr = `users/${user.uid}/battleLogs`;
      const payload: Record<string, unknown> = {
        userId: user.uid,
        entryType: input.entryType,
        habitName: clampStr(input.habitName, 140),
        date: todayIsoDate(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      if (input.trigger !== undefined) payload.trigger = clampStr(input.trigger, 500);
      if (input.intensity !== undefined) payload.intensity = Math.min(10, Math.max(1, Math.round(input.intensity)));
      if (input.alternativeAction !== undefined) payload.alternativeAction = clampStr(input.alternativeAction, 500);
      if (input.lesson !== undefined) payload.lesson = clampStr(input.lesson, 2000);
      if (input.entryType === 'positive_habit') {
        payload.completedDates = [];
      }

      try {
        await addDoc(collection(db, pathStr), payload);
        if (input.entryType === 'urge_victory' || input.entryType === 'emergency_reset') {
          await awardXp(40, 'discipline', 'battle_victory', `Self-control action: ${clampStr(input.habitName, 90)}`);
          await maybeUnlockBadge('iron_will', 'Battle Room Victory');
        } else if (input.entryType === 'setback_lesson') {
          // Zero XP penalty for honest setback reflection!
          await awardXp(15, 'discipline', 'honest_reflection', `Honest lesson recorded: ${clampStr(input.habitName, 90)}`);
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, pathStr);
      }
    },
    [user, awardXp, maybeUnlockBadge]
  );

  const togglePositiveHabitToday = useCallback(
    async (log: BattleLog) => {
      if (!user) return;
      const today = todayIsoDate();
      const current = log.completedDates ?? [];
      const done = current.includes(today);
      const next = done ? current.filter((d) => d !== today) : [...current.slice(-364), today];
      const pathStr = `users/${user.uid}/battleLogs/${log.id}`;
      try {
        await updateDoc(doc(db, pathStr), {
          completedDates: next,
          updatedAt: serverTimestamp(),
        });
        if (!done) {
          await awardXp(25, 'discipline', 'positive_habit', `Habit kept: ${log.habitName}`);
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, pathStr);
      }
    },
    [user, awardXp]
  );

  const deleteBattleLog = useCallback(
    async (logId: string) => {
      if (!user) return;
      const pathStr = `users/${user.uid}/battleLogs/${logId}`;
      try {
        await deleteDoc(doc(db, pathStr));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, pathStr);
      }
    },
    [user]
  );

  const addPlannerBlock = useCallback(
    async (input: Omit<PlannerBlock, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
      if (!user) return;
      const pathStr = `users/${user.uid}/plannerBlocks`;
      try {
        await addDoc(collection(db, pathStr), {
          userId: user.uid,
          title: clampStr(input.title, 160),
          category: input.category,
          startTime: clampStr(input.startTime, 10),
          endTime: clampStr(input.endTime, 10),
          date: clampStr(input.date || todayIsoDate(), 10),
          recurring: input.recurring,
          completed: input.completed,
          reminderEnabled: input.reminderEnabled,
          priority: input.priority,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, pathStr);
      }
    },
    [user]
  );

  const togglePlannerBlock = useCallback(
    async (block: PlannerBlock) => {
      if (!user) return;
      const pathStr = `users/${user.uid}/plannerBlocks/${block.id}`;
      const nextCompleted = !block.completed;
      try {
        await updateDoc(doc(db, pathStr), {
          completed: nextCompleted,
          updatedAt: serverTimestamp(),
        });
        if (nextCompleted) {
          await awardXp(20, 'planner', 'planner_block', `Completed time block: ${block.title}`);
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, pathStr);
      }
    },
    [user, awardXp]
  );

  const deletePlannerBlock = useCallback(
    async (blockId: string) => {
      if (!user) return;
      const pathStr = `users/${user.uid}/plannerBlocks/${blockId}`;
      try {
        await deleteDoc(doc(db, pathStr));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, pathStr);
      }
    },
    [user]
  );

  const addVaultNote = useCallback(
    async (input: Omit<VaultNote, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
      if (!user) return;
      const pathStr = `users/${user.uid}/vaultNotes`;
      try {
        await addDoc(collection(db, pathStr), {
          userId: user.uid,
          title: clampStr(input.title, 180),
          category: input.category,
          content: clampStr(input.content, 20000),
          tags: input.tags.slice(0, 10).map((t) => clampStr(t, 40)).filter(Boolean),
          pinned: input.pinned,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        await maybeUnlockBadge('vault_chronicler', 'Vault Chronicler');
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, pathStr);
      }
    },
    [user, maybeUnlockBadge]
  );

  const updateVaultNote = useCallback(
    async (
      noteId: string,
      updates: Partial<Pick<VaultNote, 'title' | 'category' | 'content' | 'tags' | 'pinned'>>
    ) => {
      if (!user) return;
      const pathStr = `users/${user.uid}/vaultNotes/${noteId}`;
      const payload: Record<string, unknown> = { updatedAt: serverTimestamp() };
      if (updates.title !== undefined) payload.title = clampStr(updates.title, 180);
      if (updates.category !== undefined) payload.category = updates.category;
      if (updates.content !== undefined) payload.content = clampStr(updates.content, 20000);
      if (updates.tags !== undefined) {
        payload.tags = updates.tags.slice(0, 10).map((t) => clampStr(t, 40)).filter(Boolean);
      }
      if (updates.pinned !== undefined) payload.pinned = updates.pinned;
      try {
        await updateDoc(doc(db, pathStr), payload);
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, pathStr);
      }
    },
    [user]
  );

  const deleteVaultNote = useCallback(
    async (noteId: string) => {
      if (!user) return;
      const pathStr = `users/${user.uid}/vaultNotes/${noteId}`;
      try {
        await deleteDoc(doc(db, pathStr));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, pathStr);
      }
    },
    [user]
  );

  const createMentorChat = useCallback(
    async (mode: MentorMode, title: string): Promise<string> => {
      if (!user) throw new Error('Not authenticated');
      const pathStr = `users/${user.uid}/mentorChats`;
      try {
        const ref = await addDoc(collection(db, pathStr), {
          userId: user.uid,
          mode,
          title: clampStr(title || mode, 140),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        return ref.id;
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, pathStr);
      }
    },
    [user]
  );

  const updateMentorChatTitle = useCallback(
    async (chatId: string, title: string, mode: MentorMode) => {
      if (!user) return;
      const pathStr = `users/${user.uid}/mentorChats/${chatId}`;
      try {
        await updateDoc(doc(db, pathStr), {
          title: clampStr(title, 140),
          mode,
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, pathStr);
      }
    },
    [user]
  );

  const deleteMentorChat = useCallback(
    async (chatId: string) => {
      if (!user) return;
      const messagesPath = `users/${user.uid}/mentorChats/${chatId}/messages`;
      const chatPath = `users/${user.uid}/mentorChats/${chatId}`;
      try {
        const snap = await getDocs(
          query(collection(db, messagesPath), where('userId', '==', user.uid))
        );
        const refs: DocumentReference[] = snap.docs.map((d) => d.ref);
        refs.push(doc(db, chatPath));
        for (let i = 0; i < refs.length; i += 400) {
          const batch = writeBatch(db);
          refs.slice(i, i + 400).forEach((r) => batch.delete(r));
          await batch.commit();
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, chatPath);
      }
    },
    [user]
  );

  const updateProfileSettings = useCallback(
    async (
      updates: Partial<
        Pick<
          UserProfile,
          | 'displayName'
          | 'avatarId'
          | 'theme'
          | 'dailyLearningGoalHours'
          | 'notificationsEnabled'
          | 'reminderTime'
          | 'trustedContactName'
          | 'trustedContactPhone'
        >
      >
    ) => {
      if (!user) return;
      const pathStr = `users/${user.uid}`;
      const payload: Record<string, unknown> = { updatedAt: serverTimestamp() };
      if (updates.displayName !== undefined) payload.displayName = clampStr(updates.displayName, 80) || 'Evans';
      if (updates.avatarId !== undefined) payload.avatarId = clampStr(updates.avatarId, 60);
      if (updates.theme !== undefined) payload.theme = updates.theme;
      if (updates.dailyLearningGoalHours !== undefined) {
        payload.dailyLearningGoalHours = Math.min(16, Math.max(0.5, updates.dailyLearningGoalHours));
      }
      if (updates.notificationsEnabled !== undefined) payload.notificationsEnabled = updates.notificationsEnabled;
      if (updates.reminderTime !== undefined) payload.reminderTime = clampStr(updates.reminderTime, 10);
      if (updates.trustedContactName !== undefined) payload.trustedContactName = clampStr(updates.trustedContactName, 80);
      if (updates.trustedContactPhone !== undefined) payload.trustedContactPhone = clampStr(updates.trustedContactPhone, 30);

      try {
        await updateDoc(doc(db, pathStr), payload);
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, pathStr);
      }
    },
    [user]
  );

  const exportAllUserData = useCallback(() => {
    const bundle = {
      exportedAt: new Date().toISOString(),
      application: 'PROJECT REBIRTH — JISHINDE USHINDE',
      profile,
      missions,
      builderModules,
      projects,
      codingLogs,
      faithEntries,
      thinkerEntries,
      battleLogs,
      plannerBlocks,
      vaultNotes,
      mentorChats,
      xpHistory,
      achievements,
    };
    const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `project-rebirth-backup-${todayIsoDate()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [
    profile,
    missions,
    builderModules,
    projects,
    codingLogs,
    faithEntries,
    thinkerEntries,
    battleLogs,
    plannerBlocks,
    vaultNotes,
    mentorChats,
    xpHistory,
    achievements,
  ]);

  const wipeUserSubcollections = useCallback(async (uid: string) => {
    const deleteRefsInChunks = async (refs: DocumentReference[]) => {
      for (let i = 0; i < refs.length; i += 400) {
        const batch = writeBatch(db);
        refs.slice(i, i + 400).forEach((r) => batch.delete(r));
        await batch.commit();
      }
    };

    const chatsSnap = await getDocs(
      query(collection(db, `users/${uid}/mentorChats`), where('userId', '==', uid))
    );
    const chatMessageRefs: DocumentReference[] = [];
    const chatRefs: DocumentReference[] = [];
    for (const chatDoc of chatsSnap.docs) {
      const msgSnap = await getDocs(
        query(collection(db, `users/${uid}/mentorChats/${chatDoc.id}/messages`), where('userId', '==', uid))
      );
      msgSnap.docs.forEach((d) => chatMessageRefs.push(d.ref));
      chatRefs.push(chatDoc.ref);
    }
    if (chatMessageRefs.length > 0) await deleteRefsInChunks(chatMessageRefs);
    if (chatRefs.length > 0) await deleteRefsInChunks(chatRefs);

    const collections = [
      'missions',
      'builderModules',
      'projects',
      'codingLogs',
      'faithEntries',
      'thinkerEntries',
      'battleLogs',
      'plannerBlocks',
      'vaultNotes',
      'xpHistory',
      'achievements',
    ];

    const subRefs: DocumentReference[] = [];
    for (const colName of collections) {
      const snap = await getDocs(
        query(collection(db, `users/${uid}/${colName}`), where('userId', '==', uid))
      );
      snap.docs.forEach((d) => subRefs.push(d.ref));
    }
    if (subRefs.length > 0) await deleteRefsInChunks(subRefs);
  }, []);

  const resetSavedProgress = useCallback(async () => {
    if (!user) return;
    const uid = user.uid;
    const preserved = {
      avatarId: profile?.avatarId || 'monolith',
      theme: profile?.theme || ('dark' as const),
      dailyLearningGoalHours: profile?.dailyLearningGoalHours ?? 2,
      notificationsEnabled: Boolean(profile?.notificationsEnabled),
      reminderTime: profile?.reminderTime || '07:00',
      trustedContactName: profile?.trustedContactName || '',
      trustedContactPhone: profile?.trustedContactPhone || '',
    };

    try {
      await wipeUserSubcollections(uid);
      await deleteDoc(doc(db, `users/${uid}`));

      const freshProfile = {
        uid,
        displayName: 'Evans',
        email: clampStr(user.email || '', 160),
        ...preserved,
        xp: 0,
        streakDays: 0,
        lastActiveDate: '',
        totalLearningMinutes: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      await setDoc(doc(db, 'users', uid), freshProfile);

      const batch = writeBatch(db);
      for (const m of STARTER_MISSIONS) {
        const mRef = doc(db, 'users', uid, 'missions', m.id);
        batch.set(mRef, {
          userId: uid,
          title: m.title,
          pillar: m.pillar,
          frequency: m.frequency,
          xpReward: m.xpReward,
          completedDates: [],
          isCustom: false,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
      await batch.commit();

      firedNotificationsRef.current.clear();
      setMissions([]);
      setBuilderModules([]);
      setProjects([]);
      setCodingLogs([]);
      setFaithEntries([]);
      setThinkerEntries([]);
      setBattleLogs([]);
      setPlannerBlocks([]);
      setVaultNotes([]);
      setMentorChats([]);
      setXpHistory([]);
      setAchievements([]);
      setAuthRefreshTick((t) => t + 1);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${uid}`);
    }
  }, [user, profile, wipeUserSubcollections]);

  const deleteAccountAndData = useCallback(async () => {
    if (!user) return;
    const uid = user.uid;
    try {
      await wipeUserSubcollections(uid);
      await deleteDoc(doc(db, `users/${uid}`));
      await signOut(auth);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `users/${uid}`);
    }
  }, [user, wipeUserSubcollections]);

  const value = useMemo<RebirthContextValue>(
    () => ({
      user,
      authReady,
      emailVerified,
      profile,
      activeView,
      setActiveView,
      emergencyOpen,
      setEmergencyOpen,
      mentorDraft,
      openMentorWithPrompt,
      clearMentorDraft,
      missions,
      builderModules,
      projects,
      codingLogs,
      faithEntries,
      thinkerEntries,
      battleLogs,
      plannerBlocks,
      vaultNotes,
      mentorChats,
      xpHistory,
      achievements,
      signInWithGoogle,
      signInWithEmail,
      signUpWithEmail,
      sendPasswordReset,
      resendVerificationEmail,
      refreshEmailVerification,
      clearAuthError,
      signOutUser,
      authError,
      awardXp,
      toggleMissionToday,
      createMission,
      deleteMission,
      toggleBuilderLesson,
      saveBuilderModuleNotes,
      logCodingSession,
      createProject,
      updateProject,
      deleteProject,
      addFaithEntry,
      updateFaithEntry,
      deleteFaithEntry,
      addThinkerEntry,
      deleteThinkerEntry,
      addBattleLog,
      togglePositiveHabitToday,
      deleteBattleLog,
      addPlannerBlock,
      togglePlannerBlock,
      deletePlannerBlock,
      addVaultNote,
      updateVaultNote,
      deleteVaultNote,
      createMentorChat,
      updateMentorChatTitle,
      deleteMentorChat,
      updateProfileSettings,
      exportAllUserData,
      resetSavedProgress,
      deleteAccountAndData,
    }),
    [
      user,
      authReady,
      emailVerified,
      profile,
      activeView,
      emergencyOpen,
      mentorDraft,
      openMentorWithPrompt,
      clearMentorDraft,
      missions,
      builderModules,
      projects,
      codingLogs,
      faithEntries,
      thinkerEntries,
      battleLogs,
      plannerBlocks,
      vaultNotes,
      mentorChats,
      xpHistory,
      achievements,
      signInWithGoogle,
      signInWithEmail,
      signUpWithEmail,
      sendPasswordReset,
      resendVerificationEmail,
      refreshEmailVerification,
      clearAuthError,
      signOutUser,
      authError,
      awardXp,
      toggleMissionToday,
      createMission,
      deleteMission,
      toggleBuilderLesson,
      saveBuilderModuleNotes,
      logCodingSession,
      createProject,
      updateProject,
      deleteProject,
      addFaithEntry,
      updateFaithEntry,
      deleteFaithEntry,
      addThinkerEntry,
      deleteThinkerEntry,
      addBattleLog,
      togglePositiveHabitToday,
      deleteBattleLog,
      addPlannerBlock,
      togglePlannerBlock,
      deletePlannerBlock,
      addVaultNote,
      updateVaultNote,
      deleteVaultNote,
      createMentorChat,
      updateMentorChatTitle,
      deleteMentorChat,
      updateProfileSettings,
      exportAllUserData,
      resetSavedProgress,
      deleteAccountAndData,
    ]
  );

  return <RebirthContext.Provider value={value}>{children}</RebirthContext.Provider>;
};

export function useRebirth(): RebirthContextValue {
  const ctx = useContext(RebirthContext);
  if (!ctx) {
    throw new Error('useRebirth must be used inside RebirthProvider');
  }
  return ctx;
}
