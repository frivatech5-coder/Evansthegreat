import React, { useMemo } from 'react';
import { Award, Check, Flame, ShieldCheck } from 'lucide-react';
import { useRebirth } from '../context/RebirthContext';
import { getRankForXp, RANKS } from '../types/rebirth';
import { todayIsoDate } from '../lib/firebase';

const BADGE_CATALOG = [
  { key: 'first_action', title: 'First Deliberate Step', criteria: 'Complete your first verified discipline action' },
  { key: 'seven_day_streak', title: 'Seven-Day Steadfastness', criteria: 'Maintain 7 active days of meaningful progress' },
  { key: 'ten_hours_builder', title: '10 Hours of Craft', criteria: 'Log 10+ total hours of coding and study' },
  { key: 'project_shipped', title: 'Builder Who Ships', criteria: 'Complete a Builder project with milestones' },
  { key: 'word_rooted', title: 'Rooted in Scripture & Truth', criteria: 'Record entries in Pillar Two: Man of God' },
  { key: 'logic_strategist', title: 'Sharp Mind Strategist', criteria: 'Solve a logic puzzle in Pillar Three' },
  { key: 'iron_will', title: 'Battle Room Victory', criteria: 'Use a healthy replacement action in The Battle Room' },
  { key: 'vault_chronicler', title: 'Vault Chronicler', criteria: 'Capture insights in the Knowledge Vault' },
];

export const GamificationView: React.FC = () => {
  const {
    profile,
    missions,
    achievements,
    xpHistory,
    projects,
    codingLogs,
    toggleMissionToday,
  } = useRebirth();

  const today = todayIsoDate();
  const xp = profile?.xp ?? 0;
  const rankInfo = useMemo(() => getRankForXp(xp), [xp]);

  const weeklyMissions = useMemo(
    () => missions.filter((m) => m.frequency === 'weekly'),
    [missions]
  );
  const monthlyMissions = useMemo(
    () => missions.filter((m) => m.frequency === 'monthly'),
    [missions]
  );

  const personalBests = useMemo(() => {
    const longestSession = codingLogs.reduce((max, l) => Math.max(max, l.minutes), 0);
    const completedProjects = projects.filter((p) => p.status === 'completed').length;
    return {
      streak: profile?.streakDays ?? 0,
      longestSession,
      completedProjects,
      totalHours: ((profile?.totalLearningMinutes ?? 0) / 60).toFixed(1),
    };
  }, [codingLogs, projects, profile]);

  return (
    <div className="space-y-6">
      <div className="border-b border-zinc-200 dark:border-zinc-800 pb-5">
        <p className="text-xs font-mono uppercase tracking-[0.18em] text-[#9A7420] dark:text-[#C8A24A]">
          Discipline Progression · Zero Spiritual Competition
        </p>
        <h1 className="text-3xl font-display font-semibold text-zinc-900 dark:text-white mt-1">
          Ranks, Challenges &amp; XP Ledger
        </h1>
        <p className="text-xs text-zinc-500 mt-1">
          XP rewards consistent study, building, and reflection. Your relationship with God is never measured or ranked by points.
        </p>
      </div>

      {/* Rank Ladder */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111114] p-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-mono text-[#9A7420] dark:text-[#C8A24A]">
              CURRENT RANK · LEVEL {rankInfo.current.level}
            </p>
            <h2 className="text-2xl font-display font-semibold text-zinc-900 dark:text-white">
              {rankInfo.current.title}
            </h2>
            <p className="text-xs text-zinc-500 mt-1">{rankInfo.current.description}</p>
          </div>
          <p className="text-2xl font-mono font-semibold tabular-nums text-[#C8A24A]">
            {xp.toLocaleString()} XP
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {RANKS.map((r) => {
            const unlocked = xp >= r.minXp;
            return (
              <div
                key={r.level}
                className={`rounded-lg border p-4 space-y-1 ${
                  unlocked
                    ? 'border-[#C8A24A]/60 bg-[#C8A24A]/5'
                    : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#18181C] opacity-70'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-[#9A7420] dark:text-[#C8A24A]">LEVEL {r.level}</span>
                  <span className="tabular-nums text-zinc-500">{r.minXp.toLocaleString()} XP</span>
                </div>
                <p className="text-sm font-semibold text-zinc-900 dark:text-white">{r.title}</p>
                <p className="text-xs text-zinc-500">{r.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Weekly & Monthly Challenges + Personal Bests */}
      <div className="grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111114] p-6 space-y-5">
          <h2 className="text-xl font-display font-semibold text-zinc-900 dark:text-white">
            Weekly Missions &amp; Monthly Challenges
          </h2>
          <div className="space-y-3">
            {[...weeklyMissions, ...monthlyMissions].map((m) => {
              const done = m.completedDates.includes(today);
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => void toggleMissionToday(m)}
                  className="w-full flex items-center justify-between gap-3 p-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#18181C] text-left cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 ${
                        done
                          ? 'bg-[#C8A24A] border-[#C8A24A] text-zinc-950'
                          : 'border-zinc-400 dark:border-zinc-600'
                      }`}
                    >
                      {done && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                        {m.title}
                      </p>
                      <p className="text-xs text-zinc-500 uppercase font-mono">
                        {m.frequency} · +{m.xpReward} XP
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111114] p-6 space-y-4">
          <h2 className="text-xl font-display font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
            <Flame className="w-5 h-5 text-[#C8A24A]" />
            Personal Bests
          </h2>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#18181C] p-4">
              <p className="text-zinc-500">Current Streak</p>
              <p className="text-xl font-mono font-semibold tabular-nums text-zinc-900 dark:text-white mt-1">
                {personalBests.streak} days
              </p>
            </div>
            <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#18181C] p-4">
              <p className="text-zinc-500">Longest Coding Block</p>
              <p className="text-xl font-mono font-semibold tabular-nums text-zinc-900 dark:text-white mt-1">
                {personalBests.longestSession} min
              </p>
            </div>
            <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#18181C] p-4">
              <p className="text-zinc-500">Total Learning</p>
              <p className="text-xl font-mono font-semibold tabular-nums text-zinc-900 dark:text-white mt-1">
                {personalBests.totalHours}h
              </p>
            </div>
            <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#18181C] p-4">
              <p className="text-zinc-500">Projects Shipped</p>
              <p className="text-xl font-mono font-semibold tabular-nums text-zinc-900 dark:text-white mt-1">
                {personalBests.completedProjects}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Achievement Badges & XP Ledger */}
      <div className="grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111114] p-6 space-y-4">
          <h2 className="text-xl font-display font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-[#C8A24A]" />
            Achievement Badges
          </h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {BADGE_CATALOG.map((b) => {
              const earned = achievements.some((a) => a.badgeKey === b.key);
              return (
                <div
                  key={b.key}
                  className={`rounded-lg border p-3.5 space-y-1 ${
                    earned
                      ? 'border-[#C8A24A] bg-[#C8A24A]/10'
                      : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#18181C] opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-zinc-900 dark:text-white">{b.title}</span>
                    {earned && <ShieldCheck className="w-4 h-4 text-[#C8A24A]" />}
                  </div>
                  <p className="text-xs text-zinc-500">{b.criteria}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111114] p-6 space-y-4">
          <h2 className="text-xl font-display font-semibold text-zinc-900 dark:text-white">
            XP History Ledger
          </h2>
          {xpHistory.length === 0 ? (
            <p className="text-sm text-zinc-500">
              Complete lessons, missions, or reflections to earn your first XP.
            </p>
          ) : (
            <div className="divide-y divide-zinc-200 dark:divide-zinc-800 max-h-80 overflow-y-auto">
              {xpHistory.slice(0, 30).map((ev) => (
                <div key={ev.id} className="py-2.5 flex items-center justify-between gap-2 text-xs">
                  <div className="min-w-0">
                    <p className="font-medium text-zinc-900 dark:text-zinc-100 truncate">
                      {ev.description}
                    </p>
                    <p className="text-zinc-500">
                      {ev.date} · {ev.pillar}
                    </p>
                  </div>
                  <span className="font-mono tabular-nums text-[#9A7420] dark:text-[#C8A24A] font-semibold shrink-0">
                    +{ev.amount} XP
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
