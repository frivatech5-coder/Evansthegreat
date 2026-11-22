import React, { useEffect, useState } from 'react';
import { Download, LogOut, RotateCcw, Smartphone, Trash2 } from 'lucide-react';
import { AVATAR_OPTIONS } from '../data/curriculum';
import { useRebirth } from '../context/RebirthContext';
import { PWAInstallButton } from './PWAComponents';

export const SettingsView: React.FC = () => {
  const {
    profile,
    updateProfileSettings,
    exportAllUserData,
    resetSavedProgress,
    deleteAccountAndData,
    signOutUser,
  } = useRebirth();

  const [displayName, setDisplayName] = useState(profile?.displayName || 'Evans');
  const [avatarId, setAvatarId] = useState(profile?.avatarId || 'monolith');
  const [theme, setTheme] = useState<'dark' | 'light'>(profile?.theme || 'dark');
  const [goalHours, setGoalHours] = useState(String(profile?.dailyLearningGoalHours ?? 2));
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    Boolean(profile?.notificationsEnabled)
  );
  const [reminderTime, setReminderTime] = useState(profile?.reminderTime || '07:00');
  const [trustedName, setTrustedName] = useState(profile?.trustedContactName || '');
  const [trustedPhone, setTrustedPhone] = useState(profile?.trustedContactPhone || '');
  const [savedNotice, setSavedNotice] = useState('');
  const [confirmReset, setConfirmReset] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [resetDoneNotice, setResetDoneNotice] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setDisplayName(profile.displayName || '');
    setAvatarId(profile.avatarId || 'monolith');
    setTheme(profile.theme || 'dark');
    setGoalHours(String(profile.dailyLearningGoalHours ?? 2));
    setNotificationsEnabled(Boolean(profile.notificationsEnabled));
    setReminderTime(profile.reminderTime || '07:00');
    setTrustedName(profile.trustedContactName || '');
    setTrustedPhone(profile.trustedContactPhone || '');
  }, [profile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (notificationsEnabled && typeof Notification !== 'undefined' && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
    await updateProfileSettings({
      displayName: displayName.trim() || 'Evans',
      avatarId,
      theme,
      dailyLearningGoalHours: Math.max(0.5, Math.min(16, Number(goalHours) || 2)),
      notificationsEnabled,
      reminderTime,
      trustedContactName: trustedName.trim(),
      trustedContactPhone: trustedPhone.trim(),
    });
    setSavedNotice('Settings saved');
    setTimeout(() => setSavedNotice(''), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-5">
        <div>
          <p className="text-xs font-mono uppercase tracking-[0.18em] text-[#9A7420] dark:text-[#C8A24A]">
            Personal Configuration &amp; Privacy
          </p>
          <h1 className="text-3xl font-display font-semibold text-zinc-900 dark:text-white mt-1">
            Settings &amp; Deployment
          </h1>
        </div>
        <button
          type="button"
          onClick={() => void signOutUser()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 text-xs font-medium text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign Out
        </button>
      </div>

      <form
        onSubmit={(e) => void handleSave(e)}
        className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111114] p-6 space-y-6"
      >
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
              Display Name
            </label>
            <input
              type="text"
              required
              maxLength={80}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-[#09090B] px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
              Avatar Crest
            </label>
            <select
              value={avatarId}
              onChange={(e) => setAvatarId(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-[#09090B] px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100"
            >
              {AVATAR_OPTIONS.map((av) => (
                <option key={av.id} value={av.id}>
                  {av.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
              Theme
            </label>
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value as 'dark' | 'light')}
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-[#09090B] px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100"
            >
              <option value="dark">Obsidian Dark (Default)</option>
              <option value="light">Stone Light</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
              Daily Learning Goal (Hours)
            </label>
            <input
              type="number"
              min="0.5"
              max="16"
              step="0.5"
              value={goalHours}
              onChange={(e) => setGoalHours(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-[#09090B] px-3 py-2 text-sm font-mono text-zinc-900 dark:text-zinc-100"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
              Daily Schedule Reminder
            </label>
            <input
              type="time"
              value={reminderTime}
              onChange={(e) => setReminderTime(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-[#09090B] px-3 py-2 text-sm font-mono text-zinc-900 dark:text-zinc-100"
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 pt-2 border-t border-zinc-200 dark:border-zinc-800">
          <div>
            <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
              Trusted Person Name (For Battle Room)
            </label>
            <input
              type="text"
              maxLength={80}
              value={trustedName}
              onChange={(e) => setTrustedName(e.target.value)}
              placeholder="e.g., Dad, Mentor, Pastor"
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-[#09090B] px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
              Trusted Contact Phone
            </label>
            <input
              type="tel"
              maxLength={30}
              value={trustedPhone}
              onChange={(e) => setTrustedPhone(e.target.value)}
              placeholder="+254..."
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-[#09090B] px-3 py-2 text-sm font-mono text-zinc-900 dark:text-zinc-100"
            />
          </div>
        </div>

        <label className="flex items-center gap-2.5 text-sm text-zinc-700 dark:text-zinc-300 cursor-pointer">
          <input
            type="checkbox"
            checked={notificationsEnabled}
            onChange={(e) => setNotificationsEnabled(e.target.checked)}
            className="accent-[#C8A24A]"
          />
          Enable browser/PWA reminders for Planner time blocks and deadlines
        </label>

        <div className="flex items-center justify-between gap-4 pt-2">
          {savedNotice ? (
            <span className="text-xs font-medium text-emerald-500">{savedNotice}</span>
          ) : (
            <span className="text-xs text-zinc-500">Account: {profile?.email || 'Verified User'}</span>
          )}
          <button
            type="submit"
            className="px-5 py-2.5 rounded-lg bg-[#C8A24A] text-zinc-950 text-xs font-semibold hover:bg-[#d6b25e] cursor-pointer"
          >
            Save Preferences
          </button>
        </div>
      </form>

      {/* PWA & Android Packaging */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111114] p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-xl font-display font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-[#C8A24A]" />
              PWA &amp; Android APK Packaging
            </h2>
            <p className="text-xs text-zinc-500">
              Install directly as an offline-capable Progressive Web App, or build a native Android APK with Capacitor.
            </p>
          </div>
          <PWAInstallButton />
        </div>
        <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#18181C] p-4 font-mono text-xs text-zinc-700 dark:text-zinc-300 space-y-1">
          <p>1. npm run build</p>
          <p>2. npx cap sync android</p>
          <p>3. npx cap open android (build signed release APK in Android Studio)</p>
        </div>
      </div>

      {/* Data Backup, Progress Reset & Account Deletion */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111114] p-6 space-y-5">
        <div>
          <h2 className="text-xl font-display font-semibold text-zinc-900 dark:text-white">
            Data Backup, Reset Progress &amp; Account Deletion
          </h2>
          <p className="text-xs text-zinc-500 mt-1">
            Delete saved XP, logs, journals, chats, and projects to start fresh today while keeping your account active, or permanently delete your account.
          </p>
        </div>

        {resetDoneNotice && (
          <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-2.5 text-xs text-emerald-500 font-medium">
            {resetDoneNotice}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={exportAllUserData}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 text-xs font-medium text-zinc-900 dark:text-zinc-100 hover:border-[#C8A24A] cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Export Complete JSON Backup
          </button>

          {!confirmReset ? (
            <button
              type="button"
              onClick={() => {
                setConfirmReset(true);
                setConfirmDelete(false);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-amber-500/50 text-xs font-medium text-amber-500 hover:bg-amber-500/10 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              Delete Saved Progress (Start Fresh)
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={resetting}
                onClick={() => {
                  setResetting(true);
                  setResetDoneNotice('');
                  void resetSavedProgress()
                    .then(() => {
                      setConfirmReset(false);
                      setResetDoneNotice(
                        'All saved progress deleted. XP, streaks, logs, and starter missions are reset for today.'
                      );
                    })
                    .finally(() => setResetting(false));
                }}
                className="px-4 py-2.5 rounded-lg bg-amber-500 text-zinc-950 text-xs font-semibold hover:bg-amber-400 disabled:opacity-60 cursor-pointer"
              >
                {resetting ? 'Resetting...' : 'Confirm Delete Progress'}
              </button>
              <button
                type="button"
                disabled={resetting}
                onClick={() => setConfirmReset(false)}
                className="px-3 py-2.5 rounded-lg border border-zinc-700 text-xs text-zinc-400 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          )}

          {!confirmDelete ? (
            <button
              type="button"
              onClick={() => {
                setConfirmDelete(true);
                setConfirmReset(false);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-red-500/40 text-xs font-medium text-red-500 hover:bg-red-500/10 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              Delete All Data &amp; Account
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => void deleteAccountAndData()}
                className="px-4 py-2.5 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-500 cursor-pointer"
              >
                Confirm Permanent Deletion
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="px-3 py-2.5 rounded-lg border border-zinc-700 text-xs text-zinc-400 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
