import React, { useMemo, useState } from 'react';
import {
  ArrowUpRight,
  Check,
  Plus,
  Trash2,
  BookOpen,
  Code2,
  Compass,
  Clock,
  Flame,
  Trophy,
} from 'lucide-react';
import { useRebirth } from '../context/RebirthContext';
import { BUILDER_CURRICULUM, DAILY_SCRIPTURES } from '../data/curriculum';
import { getRankForXp, type PillarKey } from '../types/rebirth';
import { todayIsoDate } from '../lib/firebase';

export const DashboardView: React.FC = () => {
  const {
    profile,
    missions,
    projects,
    codingLogs,
    faithEntries,
    thinkerEntries,
    builderModules,
    toggleMissionToday,
    createMission,
    deleteMission,
    setActiveView,
  } = useRebirth();

  const [newTitle, setNewTitle] = useState('');
  const [newPillar, setNewPillar] = useState<PillarKey>('builder');
  const [newFreq, setNewFreq] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [addingMission, setAddingMission] = useState(false);

  const today = todayIsoDate();
  const formattedDate = useMemo(() => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date());
  }, []);

  const scripture = useMemo(() => {
    const start = new Date(new Date().getFullYear(), 0, 0);
    const diff = Date.now() - start.getTime();
    const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
    return DAILY_SCRIPTURES[dayOfYear % DAILY_SCRIPTURES.length];
  }, []);

  const xp = profile?.xp ?? 0;
  const rankInfo = useMemo(() => getRankForXp(xp), [xp]);
  const totalHours = ((profile?.totalLearningMinutes ?? 0) / 60).toFixed(1);

  const dailyMissions = useMemo(
    () => missions.filter((m) => m.frequency === 'daily'),
    [missions]
  );
  const dailyDoneCount = useMemo(
    () => dailyMissions.filter((m) => m.completedDates.includes(today)).length,
    [dailyMissions, today]
  );
  const dailyCompletionPct =
    dailyMissions.length > 0 ? Math.round((dailyDoneCount / dailyMissions.length) * 100) : 0;

  // Real Weekly & Monthly progress calculated from completed dates across missions & logs
  const { weeklyPct, monthlyPct } = useMemo(() => {
    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(now.getDate() - 6);
    const monthPrefix = today.slice(0, 7);

    const last7Dates = new Set<string>();
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekAgo);
      d.setDate(weekAgo.getDate() + i);
      last7Dates.add(
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
      );
    }

    let weekHits = 0;
    const weekTarget = Math.max(1, dailyMissions.length * 7);
    let monthHits = 0;
    const monthTarget = Math.max(1, dailyMissions.length * now.getDate());

    for (const m of dailyMissions) {
      for (const d of m.completedDates) {
        if (last7Dates.has(d)) weekHits += 1;
        if (d.startsWith(monthPrefix)) monthHits += 1;
      }
    }

    return {
      weeklyPct: Math.min(100, Math.round((weekHits / weekTarget) * 100)),
      monthlyPct: Math.min(100, Math.round((monthHits / monthTarget) * 100)),
    };
  }, [dailyMissions, today]);

  const activeProjects = useMemo(
    () => projects.filter((p) => p.status === 'active').slice(0, 4),
    [projects]
  );

  const totalCurriculumLessons = useMemo(
    () => BUILDER_CURRICULUM.reduce((acc, m) => acc + m.lessons.length, 0),
    []
  );
  const completedLessonsCount = useMemo(
    () => builderModules.reduce((acc, m) => acc + m.completedLessons.length, 0),
    [builderModules]
  );

  const handleAddMission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    await createMission({
      title: newTitle.trim(),
      pillar: newPillar,
      frequency: newFreq,
      xpReward: newFreq === 'daily' ? 30 : newFreq === 'weekly' ? 75 : 150,
    });
    setNewTitle('');
    setAddingMission(false);
  };

  return (
    <div className="space-y-8">
      {/* Hero / Welcome & Daily Scripture */}
      <section className="grid lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-7 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111114] p-6 sm:p-8 flex flex-col justify-between space-y-6">
          <div className="space-y-2">
            <p className="text-xs font-mono uppercase tracking-[0.18em] text-[#9A7420] dark:text-[#C8A24A]">
              {formattedDate} · Jishinde Ushinde
            </p>
            <h1 className="text-3xl sm:text-4xl font-display font-semibold text-zinc-900 dark:text-white [text-wrap:balance]">
              Welcome back Evans
            </h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Level {rankInfo.current.level} — {rankInfo.current.title} ·{' '}
              <span className="font-mono tabular-nums text-zinc-900 dark:text-zinc-200">
                {xp.toLocaleString()} XP
              </span>
              {rankInfo.next && (
                <span className="text-zinc-500">
                  {' '}
                  / {rankInfo.next.minXp.toLocaleString()} XP to {rankInfo.next.title}
                </span>
              )}
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-zinc-500">
              <span>Rank Progression</span>
              <span className="font-mono tabular-nums">{rankInfo.progressPct}%</span>
            </div>
            <div className="h-2 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
              <div
                className="h-full bg-[#C8A24A] transition-all duration-300"
                style={{ width: `${rankInfo.progressPct}%` }}
              />
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111114] p-6 sm:p-8 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <p className="text-xs font-mono uppercase tracking-[0.18em] text-[#9A7420] dark:text-[#C8A24A]">
              Daily Scripture & Anchor · {scripture.ref}
            </p>
            <blockquote className="font-display text-xl sm:text-2xl italic text-zinc-900 dark:text-zinc-100 leading-snug">
              &ldquo;{scripture.text}&rdquo;
            </blockquote>
          </div>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed border-t border-zinc-200 dark:border-zinc-800 pt-4">
            {scripture.reflection}
          </p>
        </div>
      </section>

      {/* Primary Metrics Strip */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111114] p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-zinc-500">
            <span>Daily Completion</span>
            <Check className="w-4 h-4 text-[#C8A24A]" />
          </div>
          <p className="text-2xl sm:text-3xl font-mono font-semibold tabular-nums text-zinc-900 dark:text-white">
            {dailyCompletionPct}%
          </p>
          <p className="text-xs text-zinc-500 tabular-nums">
            {dailyDoneCount} of {dailyMissions.length} missions today
          </p>
        </div>

        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111114] p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-zinc-500">
            <span>Current Streak</span>
            <Flame className="w-4 h-4 text-[#C8A24A]" />
          </div>
          <p className="text-2xl sm:text-3xl font-mono font-semibold tabular-nums text-zinc-900 dark:text-white">
            {profile?.streakDays ?? 0}d
          </p>
          <p className="text-xs text-zinc-500">Consistent verified action</p>
        </div>

        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111114] p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-zinc-500">
            <span>Learning Hours</span>
            <Clock className="w-4 h-4 text-[#C8A24A]" />
          </div>
          <p className="text-2xl sm:text-3xl font-mono font-semibold tabular-nums text-zinc-900 dark:text-white">
            {totalHours}h
          </p>
          <p className="text-xs text-zinc-500 tabular-nums">
            {codingLogs.length} practice sessions logged
          </p>
        </div>

        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111114] p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-zinc-500">
            <span>Weekly / Monthly</span>
            <Trophy className="w-4 h-4 text-[#C8A24A]" />
          </div>
          <p className="text-2xl sm:text-3xl font-mono font-semibold tabular-nums text-zinc-900 dark:text-white">
            {weeklyPct}% <span className="text-sm font-normal text-zinc-500">/ {monthlyPct}%</span>
          </p>
          <p className="text-xs text-zinc-500">7-day &amp; month-to-date cadence</p>
        </div>
      </section>

      {/* Daily Mission Checklist + Current Projects */}
      <section className="grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111114] p-6 space-y-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-display font-semibold text-zinc-900 dark:text-white">
                Daily Mission Checklist
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                Complete meaningful commitments to advance your discipline and XP.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setAddingMission((v) => !v)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 text-xs font-medium text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Mission
            </button>
          </div>

          {addingMission && (
            <form
              onSubmit={(e) => void handleAddMission(e)}
              className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#18181C] space-y-3"
            >
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                maxLength={160}
                required
                placeholder="Mission title (e.g., Build 1 responsive CSS component)"
                className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#09090B] px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[#C8A24A]"
              />
              <div className="flex flex-wrap items-center gap-3">
                <select
                  value={newPillar}
                  onChange={(e) => setNewPillar(e.target.value as PillarKey)}
                  className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#09090B] px-3 py-2 text-xs text-zinc-800 dark:text-zinc-200"
                >
                  <option value="builder">The Builder</option>
                  <option value="faith">Man of God</option>
                  <option value="thinker">The Thinker</option>
                  <option value="discipline">Self-Control</option>
                </select>
                <select
                  value={newFreq}
                  onChange={(e) => setNewFreq(e.target.value as 'daily' | 'weekly' | 'monthly')}
                  className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#09090B] px-3 py-2 text-xs text-zinc-800 dark:text-zinc-200"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
                <button
                  type="submit"
                  className="ml-auto px-4 py-2 rounded-lg bg-[#C8A24A] text-zinc-950 text-xs font-semibold hover:bg-[#d6b25e] cursor-pointer"
                >
                  Save Mission
                </button>
              </div>
            </form>
          )}

          {dailyMissions.length === 0 ? (
            <div className="py-8 text-center text-sm text-zinc-500">
              No daily missions yet. Add your first daily discipline target above.
            </div>
          ) : (
            <div className="divide-y divide-zinc-200 dark:divide-zinc-800/80">
              {dailyMissions.map((m) => {
                const done = m.completedDates.includes(today);
                return (
                  <div
                    key={m.id}
                    className="py-3.5 flex items-center justify-between gap-3"
                  >
                    <button
                      type="button"
                      onClick={() => void toggleMissionToday(m)}
                      className="flex items-start gap-3 text-left flex-1 min-w-0 cursor-pointer group"
                    >
                      <span
                        className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${
                          done
                            ? 'bg-[#C8A24A] border-[#C8A24A] text-zinc-950'
                            : 'border-zinc-400 dark:border-zinc-600 group-hover:border-[#C8A24A]'
                        }`}
                      >
                        {done && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                      </span>
                      <div className="min-w-0">
                        <p
                          className={`text-sm font-medium ${
                            done
                              ? 'line-through text-zinc-400 dark:text-zinc-500'
                              : 'text-zinc-900 dark:text-zinc-100'
                          }`}
                        >
                          {m.title}
                        </p>
                        <p className="text-xs text-zinc-500 mt-0.5">
                          {m.pillar === 'builder'
                            ? 'The Builder'
                            : m.pillar === 'faith'
                              ? 'Man of God'
                              : m.pillar === 'thinker'
                                ? 'The Thinker'
                                : 'Discipline'}{' '}
                          · <span className="font-mono tabular-nums">+{m.xpReward} XP</span>
                        </p>
                      </div>
                    </button>
                    {m.isCustom && (
                      <button
                        type="button"
                        onClick={() => void deleteMission(m.id)}
                        aria-label={`Delete ${m.title}`}
                        className="min-h-[40px] min-w-[40px] flex items-center justify-center text-zinc-400 hover:text-red-400 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Active Projects & Quick Cadence */}
        <div className="lg:col-span-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111114] p-6 flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-2xl font-display font-semibold text-zinc-900 dark:text-white">
                Current Projects
              </h2>
              <button
                type="button"
                onClick={() => setActiveView('builder')}
                className="text-xs font-medium text-[#9A7420] dark:text-[#C8A24A] hover:underline whitespace-nowrap cursor-pointer"
              >
                Manage All
              </button>
            </div>

            {activeProjects.length === 0 ? (
              <div className="rounded-lg border border-dashed border-zinc-300 dark:border-zinc-800 p-6 text-center space-y-3">
                <p className="text-sm text-zinc-500">
                  No active projects yet. Start building a real system in Pillar One.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveView('builder')}
                  className="px-4 py-2 rounded-lg bg-[#C8A24A] text-zinc-950 text-xs font-semibold hover:bg-[#d6b25e] cursor-pointer"
                >
                  Create First Project
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {activeProjects.map((p) => {
                  const totalMs = p.milestones.length;
                  const doneMs = p.milestones.filter((ms) => ms.done).length;
                  const pct = totalMs > 0 ? Math.round((doneMs / totalMs) * 100) : 0;
                  return (
                    <div
                      key={p.id}
                      className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#18181C] p-4 space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                          {p.title}
                        </p>
                        <span className="text-xs font-mono tabular-nums text-zinc-500 shrink-0">
                          {pct}%
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500">
                        {p.techStack || 'Engineering'} · Due {p.deadline || 'Open'} ·{' '}
                        <span className="font-mono tabular-nums">{p.hoursLogged}h</span>
                      </p>
                      <div className="h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                        <div
                          className="h-full bg-[#C8A24A]"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-500">Weekly Consistency</span>
              <span className="font-mono tabular-nums text-zinc-900 dark:text-zinc-200">{weeklyPct}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
              <div className="h-full bg-zinc-900 dark:bg-zinc-200" style={{ width: `${weeklyPct}%` }} />
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-500">Monthly Consistency</span>
              <span className="font-mono tabular-nums text-zinc-900 dark:text-zinc-200">{monthlyPct}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
              <div className="h-full bg-[#C8A24A]" style={{ width: `${monthlyPct}%` }} />
            </div>
          </div>
        </div>
      </section>

      {/* Three Development Pillars */}
      <section className="space-y-4">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-display font-semibold text-zinc-900 dark:text-white">
              The Three Development Pillars
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Skill craft, spiritual grounding, and independent critical thinking.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111114] overflow-hidden flex flex-col">
            <div className="h-44 overflow-hidden bg-zinc-900">
              <img
                src="/src/assets/images/pillar_builder_desk_1795373490075.jpg"
                alt="Minimalist developer workstation with brass calipers"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-1.5">
                <p className="text-xs font-mono text-[#9A7420] dark:text-[#C8A24A] flex items-center gap-1.5">
                  <Code2 className="w-3.5 h-3.5" />
                  PILLAR 01 · THE BUILDER
                </p>
                <h3 className="text-xl font-display font-semibold text-zinc-900 dark:text-white">
                  Coding, Systems &amp; Enterprise
                </h3>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  {completedLessonsCount}/{totalCurriculumLessons} lessons mastered · {projects.length} projects · {totalHours}h logged
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveView('builder')}
                className="inline-flex items-center justify-between w-full px-4 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 text-xs font-medium text-zinc-900 dark:text-zinc-100 hover:border-[#C8A24A] transition-colors cursor-pointer"
              >
                <span>Open Pillar One</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111114] overflow-hidden flex flex-col">
            <div className="h-44 overflow-hidden bg-zinc-900">
              <img
                src="/src/assets/images/pillar_faith_study_1795373490616.jpg"
                alt="Leather-bound Bible resting on dark charcoal stone in morning sunlight"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-1.5">
                <p className="text-xs font-mono text-[#9A7420] dark:text-[#C8A24A] flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" />
                  PILLAR 02 · MAN OF GOD
                </p>
                <h3 className="text-xl font-display font-semibold text-zinc-900 dark:text-white">
                  Scripture, Prayer &amp; Character
                </h3>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  {faithEntries.length} journal &amp; study entries · 8 character virtues tracked
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveView('faith')}
                className="inline-flex items-center justify-between w-full px-4 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 text-xs font-medium text-zinc-900 dark:text-zinc-100 hover:border-[#C8A24A] transition-colors cursor-pointer"
              >
                <span>Open Pillar Two</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111114] overflow-hidden flex flex-col">
            <div className="h-44 overflow-hidden bg-zinc-900">
              <img
                src="/src/assets/images/pillar_thinker_chess_1795373490217.jpg"
                alt="Obsidian and gold chess pieces on stone board"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-1.5">
                <p className="text-xs font-mono text-[#9A7420] dark:text-[#C8A24A] flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5" />
                  PILLAR 03 · THE THINKER
                </p>
                <h3 className="text-xl font-display font-semibold text-zinc-900 dark:text-white">
                  Logic, Wealth &amp; Independence
                </h3>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  {thinkerEntries.length} cognitive, financial, and discovery records logged
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveView('thinker')}
                className="inline-flex items-center justify-between w-full px-4 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 text-xs font-medium text-zinc-900 dark:text-zinc-100 hover:border-[#C8A24A] transition-colors cursor-pointer"
              >
                <span>Open Pillar Three</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
