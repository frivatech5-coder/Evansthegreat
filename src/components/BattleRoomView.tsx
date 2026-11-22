import React, { useMemo, useState } from 'react';
import { Check, Plus, ShieldAlert, Trash2 } from 'lucide-react';
import { useRebirth } from '../context/RebirthContext';
import { todayIsoDate } from '../lib/firebase';
import type { BattleEntryType } from '../types/rebirth';

export const BattleRoomView: React.FC = () => {
  const {
    battleLogs,
    addBattleLog,
    togglePositiveHabitToday,
    deleteBattleLog,
    setEmergencyOpen,
  } = useRebirth();

  const [newHabitName, setNewHabitName] = useState('');
  const [logType, setLogType] = useState<BattleEntryType>('urge_victory');
  const [habitTopic, setHabitTopic] = useState('');
  const [trigger, setTrigger] = useState('');
  const [intensity, setIntensity] = useState(6);
  const [alternativeAction, setAlternativeAction] = useState('');
  const [lesson, setLesson] = useState('');

  const today = todayIsoDate();

  const positiveHabits = useMemo(
    () => battleLogs.filter((b) => b.entryType === 'positive_habit'),
    [battleLogs]
  );

  const recoveryEvents = useMemo(
    () => battleLogs.filter((b) => b.entryType !== 'positive_habit'),
    [battleLogs]
  );

  // Real recurring pattern analysis from user's logged triggers
  const patternSummary = useMemo(() => {
    const triggerCounts: Record<string, number> = {};
    let victories = 0;
    let setbacks = 0;
    for (const ev of recoveryEvents) {
      if (ev.entryType === 'urge_victory' || ev.entryType === 'emergency_reset') victories += 1;
      if (ev.entryType === 'setback_lesson') setbacks += 1;
      if (ev.trigger && ev.trigger.trim()) {
        const key = ev.trigger.trim().toLowerCase();
        triggerCounts[key] = (triggerCounts[key] || 0) + 1;
      }
    }
    const topTriggers = Object.entries(triggerCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4);
    return { victories, setbacks, topTriggers };
  }, [recoveryEvents]);

  const handleAddPositiveHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;
    await addBattleLog({
      entryType: 'positive_habit',
      habitName: newHabitName.trim(),
    });
    setNewHabitName('');
  };

  const handleLogEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!habitTopic.trim()) return;
    await addBattleLog({
      entryType: logType,
      habitName: habitTopic.trim(),
      trigger: trigger.trim(),
      intensity,
      alternativeAction: alternativeAction.trim(),
      lesson: lesson.trim(),
    });
    setHabitTopic('');
    setTrigger('');
    setAlternativeAction('');
    setLesson('');
  };

  return (
    <div className="space-y-6">
      {/* Header with Emergency Help Button */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-5">
        <div>
          <p className="text-xs font-mono uppercase tracking-[0.18em] text-[#9A7420] dark:text-[#C8A24A]">
            Self-Control &amp; Habit Recovery
          </p>
          <h1 className="text-3xl font-display font-semibold text-zinc-900 dark:text-white mt-1">
            THE BATTLE ROOM
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Track urges privately without shame, identify triggers, and build steady replacement routines. A streak never defines your worth, and setbacks carry zero XP penalties.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setEmergencyOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-500 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <ShieldAlert className="w-4 h-4" />
          I NEED HELP RIGHT NOW
        </button>
      </div>

      {/* Stats Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111114] p-5">
          <p className="text-xs text-zinc-500">Urge Victories &amp; Resets</p>
          <p className="text-2xl font-mono font-semibold tabular-nums text-[#C8A24A] mt-1">
            {patternSummary.victories}
          </p>
        </div>
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111114] p-5">
          <p className="text-xs text-zinc-500">Positive Habits Tracked</p>
          <p className="text-2xl font-mono font-semibold tabular-nums text-zinc-900 dark:text-white mt-1">
            {positiveHabits.length}
          </p>
        </div>
        <div className="col-span-2 lg:col-span-1 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111114] p-5">
          <p className="text-xs text-zinc-500">Honest Setback Lessons</p>
          <p className="text-2xl font-mono font-semibold tabular-nums text-zinc-900 dark:text-white mt-1">
            {patternSummary.setbacks}
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Positive Habits & Pattern Insights */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111114] p-6 space-y-4">
            <h2 className="text-xl font-display font-semibold text-zinc-900 dark:text-white">
              Positive Replacement Habits
            </h2>
            <form onSubmit={(e) => void handleAddPositiveHabit(e)} className="flex gap-2">
              <input
                type="text"
                required
                maxLength={140}
                value={newHabitName}
                onChange={(e) => setNewHabitName(e.target.value)}
                placeholder="e.g., Phone outside bedroom at 22:00"
                className="flex-1 rounded-lg border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-[#09090B] px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100"
              />
              <button
                type="submit"
                className="px-3.5 py-2 rounded-lg bg-[#C8A24A] text-zinc-950 text-xs font-semibold inline-flex items-center gap-1 shrink-0 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Add
              </button>
            </form>

            {positiveHabits.length === 0 ? (
              <p className="text-xs text-zinc-500 py-4">
                Add positive daily habits that guard your focus, sleep, and peace.
              </p>
            ) : (
              <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {positiveHabits.map((h) => {
                  const doneToday = (h.completedDates ?? []).includes(today);
                  return (
                    <div key={h.id} className="py-3 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => void togglePositiveHabitToday(h)}
                        className="flex items-center gap-3 text-left flex-1 cursor-pointer"
                      >
                        <span
                          className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 ${
                            doneToday
                              ? 'bg-[#C8A24A] border-[#C8A24A] text-zinc-950'
                              : 'border-zinc-400 dark:border-zinc-600'
                          }`}
                        >
                          {doneToday && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                        </span>
                        <div>
                          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                            {h.habitName}
                          </p>
                          <p className="text-xs font-mono text-zinc-500">
                            {(h.completedDates ?? []).length} days kept
                          </p>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => void deleteBattleLog(h.id)}
                        className="text-zinc-400 hover:text-red-400 p-1 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recurring Pattern Summary */}
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111114] p-6 space-y-3">
            <h3 className="text-lg font-display font-semibold text-zinc-900 dark:text-white">
              Identified Trigger Patterns
            </h3>
            {patternSummary.topTriggers.length === 0 ? (
              <p className="text-xs text-zinc-500">
                As you log urges and triggers privately, recurring patterns will appear here to help you redesign your environment.
              </p>
            ) : (
              <div className="space-y-2">
                {patternSummary.topTriggers.map(([trig, count]) => (
                  <div
                    key={trig}
                    className="flex items-center justify-between text-xs py-2 border-b border-zinc-200 dark:border-zinc-800"
                  >
                    <span className="text-zinc-700 dark:text-zinc-300 capitalize">{trig}</span>
                    <span className="font-mono tabular-nums text-[#9A7420] dark:text-[#C8A24A]">
                      {count}x
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Private Urge & Setback Lesson Logger + History */}
        <div className="lg:col-span-7 space-y-6">
          <form
            onSubmit={(e) => void handleLogEvent(e)}
            className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111114] p-6 space-y-4"
          >
            <h2 className="text-xl font-display font-semibold text-zinc-900 dark:text-white">
              Log Urge, Trigger, or Setback Lesson
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
              <select
                value={logType}
                onChange={(e) => setLogType(e.target.value as BattleEntryType)}
                className="rounded-lg border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-[#09090B] px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100"
              >
                <option value="urge_victory">Urge Faced &amp; Redirected (+40 XP)</option>
                <option value="setback_lesson">Setback &amp; Honest Lesson (No Penalty)</option>
              </select>
              <input
                type="text"
                required
                maxLength={140}
                value={habitTopic}
                onChange={(e) => setHabitTopic(e.target.value)}
                placeholder="Area / Habit (e.g., Late-night scrolling)"
                className="rounded-lg border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-[#09090B] px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <input
                type="text"
                maxLength={500}
                value={trigger}
                onChange={(e) => setTrigger(e.target.value)}
                placeholder="Trigger (e.g., Boredom, Stress, Alone late)"
                className="rounded-lg border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-[#09090B] px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100"
              />
              <div>
                <div className="flex justify-between text-xs text-zinc-500 mb-1">
                  <span>Urge Intensity</span>
                  <span className="font-mono">{intensity}/10</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={intensity}
                  onChange={(e) => setIntensity(Number(e.target.value))}
                  className="w-full accent-[#C8A24A]"
                />
              </div>
            </div>

            <input
              type="text"
              maxLength={500}
              value={alternativeAction}
              onChange={(e) => setAlternativeAction(e.target.value)}
              placeholder="What you did instead (or will do next time)"
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-[#09090B] px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100"
            />
            <textarea
              rows={2}
              maxLength={2000}
              value={lesson}
              onChange={(e) => setLesson(e.target.value)}
              placeholder="Honest lesson or boundary to strengthen tomorrow..."
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-[#09090B] px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100"
            />
            <button
              type="submit"
              className="px-5 py-2.5 rounded-lg bg-[#C8A24A] text-zinc-950 text-xs font-semibold hover:bg-[#d6b25e] cursor-pointer"
            >
              Record Privately
            </button>
          </form>

          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111114] p-6 space-y-4">
            <h3 className="text-lg font-display font-semibold text-zinc-900 dark:text-white">
              Battle Room Private Log
            </h3>
            {recoveryEvents.length === 0 ? (
              <p className="text-sm text-zinc-500">No private battle logs recorded yet.</p>
            ) : (
              <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {recoveryEvents.map((ev) => (
                  <div key={ev.id} className="py-3.5 space-y-1 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[#9A7420] dark:text-[#C8A24A]">
                        {ev.date} · {ev.entryType.replace('_', ' ').toUpperCase()}
                      </span>
                      <button
                        type="button"
                        onClick={() => void deleteBattleLog(ev.id)}
                        className="text-zinc-400 hover:text-red-400 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                      {ev.habitName}
                    </p>
                    {ev.trigger && (
                      <p className="text-zinc-500">
                        <strong>Trigger:</strong> {ev.trigger} {ev.intensity ? `(Intensity ${ev.intensity}/10)` : ''}
                      </p>
                    )}
                    {ev.alternativeAction && (
                      <p className="text-zinc-600 dark:text-zinc-300">
                        <strong>Action:</strong> {ev.alternativeAction}
                      </p>
                    )}
                    {ev.lesson && (
                      <p className="text-zinc-600 dark:text-zinc-400">
                        <strong>Lesson:</strong> {ev.lesson}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
