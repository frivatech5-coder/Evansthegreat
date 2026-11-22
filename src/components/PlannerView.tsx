import React, { useMemo, useState } from 'react';
import { Bell, Calendar, Check, Plus, Trash2 } from 'lucide-react';
import { useRebirth } from '../context/RebirthContext';
import { todayIsoDate } from '../lib/firebase';
import type { PlannerCategory } from '../types/rebirth';

const CATEGORY_LABELS: Record<PlannerCategory, string> = {
  learning: 'Learning Session',
  prayer_bible: 'Prayer & Bible Study',
  exercise: 'Exercise',
  responsibility: 'Personal Responsibility',
  rest: 'Rest & Recreation',
  project: 'Project Deep Work',
};

export const PlannerView: React.FC = () => {
  const {
    plannerBlocks,
    addPlannerBlock,
    togglePlannerBlock,
    deletePlannerBlock,
    profile,
    updateProfileSettings,
  } = useRebirth();

  const [selectedDate, setSelectedDate] = useState(todayIsoDate());
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<PlannerCategory>('learning');
  const [startTime, setStartTime] = useState('06:30');
  const [endTime, setEndTime] = useState('07:30');
  const [recurring, setRecurring] = useState<'none' | 'daily' | 'weekdays' | 'weekly'>('daily');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('high');
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [timeError, setTimeError] = useState('');
  const [notifStatus, setNotifStatus] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );

  const visibleBlocks = useMemo(() => {
    const dayObj = new Date(`${selectedDate}T12:00:00`);
    const dayOfWeek = dayObj.getDay();
    const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;
    return plannerBlocks
      .filter((b) => {
        if (b.date === selectedDate) return true;
        if (b.recurring === 'daily' && selectedDate >= b.date) return true;
        if (b.recurring === 'weekdays' && isWeekday && selectedDate >= b.date) return true;
        if (b.recurring === 'weekly' && selectedDate >= b.date) {
          const originDay = new Date(`${b.date}T12:00:00`).getDay();
          return originDay === dayOfWeek;
        }
        return false;
      })
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [plannerBlocks, selectedDate]);

  const highPriorities = useMemo(
    () => visibleBlocks.filter((b) => b.priority === 'high'),
    [visibleBlocks]
  );

  const requestNotifications = async () => {
    if (typeof Notification === 'undefined') return;
    const perm = await Notification.requestPermission();
    setNotifStatus(perm);
    if (perm === 'granted') {
      await updateProfileSettings({ notificationsEnabled: true });
    }
  };

  const handleAddBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    if (endTime < startTime) {
      setTimeError('End time must be after start time.');
      return;
    }
    setTimeError('');
    await addPlannerBlock({
      title: title.trim(),
      category,
      startTime,
      endTime,
      date: selectedDate,
      recurring,
      completed: false,
      reminderEnabled,
      priority,
    });
    setTitle('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-5">
        <div>
          <p className="text-xs font-mono uppercase tracking-[0.18em] text-[#9A7420] dark:text-[#C8A24A]">
            Structured Time Stewardship
          </p>
          <h1 className="text-3xl font-display font-semibold text-zinc-900 dark:text-white mt-1">
            Daily Planner &amp; Routines
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#111114] px-3 py-2 text-xs font-mono text-zinc-900 dark:text-zinc-100"
          />
          {notifStatus !== 'granted' ? (
            <button
              type="button"
              onClick={() => void requestNotifications()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-[#C8A24A]/60 text-xs font-medium text-[#9A7420] dark:text-[#C8A24A] hover:bg-[#C8A24A]/10 cursor-pointer"
            >
              <Bell className="w-3.5 h-3.5" />
              Enable Reminders
            </button>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-xs text-emerald-500 font-medium">
              <Bell className="w-3.5 h-3.5" />
              {profile?.notificationsEnabled ? 'Reminders Active' : 'Permission Granted'}
            </span>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        <form
          onSubmit={(e) => void handleAddBlock(e)}
          className="lg:col-span-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111114] p-6 space-y-4 h-fit"
        >
          <h2 className="text-xl font-display font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#C8A24A]" />
            Schedule Time Block
          </h2>
          <input
            type="text"
            required
            maxLength={160}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Block title (e.g., Morning Prayer & Proverbs)"
            className="w-full rounded-lg border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-[#09090B] px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as PlannerCategory)}
            className="w-full rounded-lg border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-[#09090B] px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100"
          >
            {Object.entries(CATEGORY_LABELS).map(([k, label]) => (
              <option key={k} value={k}>
                {label}
              </option>
            ))}
          </select>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Start</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-[#09090B] px-3 py-2 text-sm font-mono text-zinc-900 dark:text-zinc-100"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1">End</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-[#09090B] px-3 py-2 text-sm font-mono text-zinc-900 dark:text-zinc-100"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <select
              value={recurring}
              onChange={(e) =>
                setRecurring(e.target.value as 'none' | 'daily' | 'weekdays' | 'weekly')
              }
              className="rounded-lg border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-[#09090B] px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100"
            >
              <option value="none">One-time</option>
              <option value="daily">Daily Routine</option>
              <option value="weekdays">Weekdays</option>
              <option value="weekly">Weekly</option>
            </select>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as 'high' | 'medium' | 'low')}
              className="rounded-lg border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-[#09090B] px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100"
            >
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
          </div>
          <label className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400 cursor-pointer">
            <input
              type="checkbox"
              checked={reminderEnabled}
              onChange={(e) => setReminderEnabled(e.target.checked)}
              className="accent-[#C8A24A]"
            />
            Send reminder notification at start time
          </label>
          {timeError && (
            <p className="text-xs text-red-400">{timeError}</p>
          )}
          <button
            type="submit"
            className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[#C8A24A] text-zinc-950 text-xs font-semibold hover:bg-[#d6b25e] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Time Block
          </button>
        </form>

        <div className="lg:col-span-8 space-y-6">
          {/* Today's Top Priorities */}
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111114] p-6 space-y-3">
            <h2 className="text-xl font-display font-semibold text-zinc-900 dark:text-white">
              Priority Anchors ({selectedDate})
            </h2>
            {highPriorities.length === 0 ? (
              <p className="text-xs text-zinc-500">
                Mark key blocks as High Priority to pin them here.
              </p>
            ) : (
              <div className="grid sm:grid-cols-2 gap-3">
                {highPriorities.map((b) => (
                  <div
                    key={b.id}
                    className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#18181C] p-3.5 flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-mono text-[#9A7420] dark:text-[#C8A24A]">
                        {b.startTime} – {b.endTime}
                      </p>
                      <p className="text-sm font-medium text-zinc-900 dark:text-white truncate">
                        {b.title}
                      </p>
                    </div>
                    <span className="text-xs text-zinc-500 shrink-0">
                      {b.completed ? 'Done' : 'Pending'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Chronological Time Blocks */}
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111114] p-6 space-y-4">
            <h2 className="text-xl font-display font-semibold text-zinc-900 dark:text-white">
              Schedule Timeline
            </h2>
            {visibleBlocks.length === 0 ? (
              <p className="text-sm text-zinc-500 py-8 text-center">
                No time blocks scheduled for {selectedDate}. Create your routine on the left.
              </p>
            ) : (
              <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {visibleBlocks.map((block) => (
                  <div key={block.id} className="py-3.5 flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => void togglePlannerBlock(block)}
                      className="flex items-start gap-3 text-left flex-1 min-w-0 cursor-pointer"
                    >
                      <span
                        className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center shrink-0 ${
                          block.completed
                            ? 'bg-[#C8A24A] border-[#C8A24A] text-zinc-950'
                            : 'border-zinc-400 dark:border-zinc-600'
                        }`}
                      >
                        {block.completed && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                      </span>
                      <div className="min-w-0">
                        <p
                          className={`text-sm font-medium ${
                            block.completed
                              ? 'line-through text-zinc-500'
                              : 'text-zinc-900 dark:text-zinc-100'
                          }`}
                        >
                          {block.title}
                        </p>
                        <p className="text-xs text-zinc-500 mt-0.5 font-mono tabular-nums">
                          {block.startTime}–{block.endTime} · {CATEGORY_LABELS[block.category]} ·{' '}
                          {block.recurring}
                        </p>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => void deletePlannerBlock(block.id)}
                      aria-label={`Delete ${block.title}`}
                      className="text-zinc-400 hover:text-red-400 p-1.5 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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
