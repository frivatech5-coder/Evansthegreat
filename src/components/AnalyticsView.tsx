import React, { useMemo } from 'react';
import { Download } from 'lucide-react';
import { useRebirth } from '../context/RebirthContext';
import { todayIsoDate } from '../lib/firebase';

export const AnalyticsView: React.FC = () => {
  const {
    profile,
    missions,
    codingLogs,
    projects,
    faithEntries,
    battleLogs,
    thinkerEntries,
    xpHistory,
    achievements,
  } = useRebirth();

  const today = todayIsoDate();

  const last7DaysData = useMemo(() => {
    const days: Array<{ date: string; label: string; minutes: number; missionsDone: number }> = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
        d.getDate()
      ).padStart(2, '0')}`;
      const label = new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(d);
      const minutes = codingLogs
        .filter((l) => l.date === iso)
        .reduce((acc, l) => acc + l.minutes, 0);
      const missionsDone = missions.filter((m) => m.completedDates.includes(iso)).length;
      days.push({ date: iso, label, minutes, missionsDone });
    }
    return days;
  }, [codingLogs, missions]);

  const maxMinutes = useMemo(
    () => Math.max(60, ...last7DaysData.map((d) => d.minutes)),
    [last7DaysData]
  );

  const metrics = useMemo(() => {
    const completedProjects = projects.filter((p) => p.status === 'completed').length;
    const bibleCount = faithEntries.filter((f) => f.kind === 'bible_study').length;
    const urgeVictories = battleLogs.filter(
      (b) => b.entryType === 'urge_victory' || b.entryType === 'emergency_reset'
    ).length;
    const positiveHabits = battleLogs.filter((b) => b.entryType === 'positive_habit');
    const habitCheckins = positiveHabits.reduce(
      (sum, h) => sum + (h.completedDates?.length || 0),
      0
    );

    const savingsGoals = thinkerEntries.filter((e) => e.section === 'savings_goal');
    const savedTotal = savingsGoals.reduce((sum, g) => sum + (g.amount || 0), 0);
    const savedTarget = savingsGoals.reduce((sum, g) => sum + (g.targetAmount || 0), 0);
    const savingsPct = savedTarget > 0 ? Math.min(100, Math.round((savedTotal / savedTarget) * 100)) : 0;

    return {
      completedProjects,
      bibleCount,
      urgeVictories,
      habitCheckins,
      savingsPct,
      savedTotal,
      savedTarget,
      totalHours: ((profile?.totalLearningMinutes || 0) / 60).toFixed(1),
    };
  }, [projects, faithEntries, battleLogs, thinkerEntries, profile?.totalLearningMinutes]);

  const downloadReport = (period: 'Weekly' | 'Monthly') => {
    const daysWindow = period === 'Weekly' ? 7 : 30;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - daysWindow);
    const cutoffIso = `${cutoff.getFullYear()}-${String(cutoff.getMonth() + 1).padStart(
      2,
      '0'
    )}-${String(cutoff.getDate()).padStart(2, '0')}`;

    const periodLogs = codingLogs.filter((l) => l.date >= cutoffIso);
    const periodMinutes = periodLogs.reduce((s, l) => s + l.minutes, 0);
    const periodXp = xpHistory
      .filter((x) => x.date >= cutoffIso)
      .reduce((s, x) => s + x.amount, 0);
    const periodFaith = faithEntries.filter((f) => f.date >= cutoffIso).length;

    const reportText = [
      `PROJECT REBIRTH — ${period.toUpperCase()} PROGRESS REPORT`,
      `Motto: JISHINDE USHINDE — CONQUER YOURSELF TO CONQUER`,
      `Generated: ${today}`,
      `Member: ${profile?.displayName || 'Evans'}`,
      `--------------------------------------------------`,
      `Period Window: ${cutoffIso} to ${today}`,
      `Total XP Earned in Period: ${periodXp} XP (Lifetime: ${profile?.xp || 0} XP)`,
      `Current Discipline Streak: ${profile?.streakDays || 0} days`,
      `Learning Time in Period: ${(periodMinutes / 60).toFixed(1)} hours (${periodLogs.length} sessions)`,
      `Projects Completed (Lifetime): ${metrics.completedProjects} / ${projects.length}`,
      `Faith & Scripture Entries in Period: ${periodFaith}`,
      `Battle Room Victories (Lifetime): ${metrics.urgeVictories}`,
      `Savings Goal Progress: ${metrics.savingsPct}% (${metrics.savedTotal} / ${metrics.savedTarget})`,
      `Badges Unlocked: ${achievements.length}`,
      `--------------------------------------------------`,
      `All figures above reflect verified user entries stored in Firestore.`,
    ].join('\n');

    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `project-rebirth-${period.toLowerCase()}-report-${today}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-5">
        <div>
          <p className="text-xs font-mono uppercase tracking-[0.18em] text-[#9A7420] dark:text-[#C8A24A]">
            Verified Performance Metrics
          </p>
          <h1 className="text-3xl font-display font-semibold text-zinc-900 dark:text-white mt-1">
            Analytics &amp; Progress Reports
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => downloadReport('Weekly')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 text-xs font-medium text-zinc-800 dark:text-zinc-200 hover:border-[#C8A24A] cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Weekly Report
          </button>
          <button
            type="button"
            onClick={() => downloadReport('Monthly')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#C8A24A] text-zinc-950 text-xs font-semibold hover:bg-[#d6b25e] cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Monthly Report
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111114] p-5">
          <p className="text-xs text-zinc-500">Total Learning Hours</p>
          <p className="text-2xl font-mono font-semibold tabular-nums text-zinc-900 dark:text-white mt-1">
            {metrics.totalHours}h
          </p>
        </div>
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111114] p-5">
          <p className="text-xs text-zinc-500">Projects Completed</p>
          <p className="text-2xl font-mono font-semibold tabular-nums text-zinc-900 dark:text-white mt-1">
            {metrics.completedProjects} <span className="text-sm text-zinc-500">/ {projects.length}</span>
          </p>
        </div>
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111114] p-5">
          <p className="text-xs text-zinc-500">Bible Study Notes</p>
          <p className="text-2xl font-mono font-semibold tabular-nums text-zinc-900 dark:text-white mt-1">
            {metrics.bibleCount}
          </p>
        </div>
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111114] p-5">
          <p className="text-xs text-zinc-500">Savings Goal Progress</p>
          <p className="text-2xl font-mono font-semibold tabular-nums text-[#C8A24A] mt-1">
            {metrics.savingsPct}%
          </p>
        </div>
      </div>

      {/* 7-Day Learning & Mission Consistency Chart */}
      <div className="grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111114] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-display font-semibold text-zinc-900 dark:text-white">
              7-Day Coding Minutes
            </h2>
            <span className="text-xs font-mono text-zinc-500">Real logged minutes</span>
          </div>
          <div className="grid grid-cols-7 gap-3 items-end h-48 pt-6 border-b border-zinc-200 dark:border-zinc-800 pb-3">
            {last7DaysData.map((d) => {
              const barPct = Math.round((d.minutes / maxMinutes) * 100);
              return (
                <div key={d.date} className="flex flex-col items-center justify-end h-full gap-2">
                  <span className="text-[11px] font-mono tabular-nums text-zinc-500">
                    {d.minutes}m
                  </span>
                  <div className="w-full max-w-[36px] flex-1 flex items-end bg-zinc-100 dark:bg-zinc-900 rounded-md overflow-hidden">
                    <div
                      className="w-full bg-[#C8A24A] transition-all duration-300"
                      style={{ height: `${Math.max(d.minutes > 0 ? 8 : 0, barPct)}%` }}
                    />
                  </div>
                  <span className="text-xs text-zinc-500">{d.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111114] p-6 space-y-4">
          <h2 className="text-xl font-display font-semibold text-zinc-900 dark:text-white">
            7-Day Mission Consistency
          </h2>
          <div className="space-y-3">
            {last7DaysData.map((d) => (
              <div key={d.date} className="flex items-center justify-between text-xs gap-3">
                <span className="font-mono text-zinc-500 w-24 shrink-0">{d.date}</span>
                <div className="flex-1 h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-zinc-900 dark:bg-[#C8A24A]"
                    style={{
                      width: `${Math.min(100, Math.round((d.missionsDone / Math.max(1, missions.length)) * 100))}%`,
                    }}
                  />
                </div>
                <span className="font-mono tabular-nums text-zinc-700 dark:text-zinc-300 w-12 text-right">
                  {d.missionsDone} done
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
