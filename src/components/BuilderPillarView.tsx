import React, { useEffect, useMemo, useState } from 'react';
import {
  Check,
  Clock,
  ExternalLink,
  FolderGit2,
  MessageSquare,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Save,
  Trash2,
} from 'lucide-react';
import { BUILDER_CURRICULUM } from '../data/curriculum';
import { useRebirth } from '../context/RebirthContext';

type BuilderTab = 'roadmap' | 'projects' | 'practice';

export const BuilderPillarView: React.FC = () => {
  const {
    builderModules,
    projects,
    codingLogs,
    toggleBuilderLesson,
    saveBuilderModuleNotes,
    logCodingSession,
    createProject,
    updateProject,
    deleteProject,
    openMentorWithPrompt,
  } = useRebirth();

  const [tab, setTab] = useState<BuilderTab>('roadmap');
  const [selectedModKey, setSelectedModKey] = useState(BUILDER_CURRICULUM[0].key);
  const [notesDraft, setNotesDraft] = useState('');
  const [notesDirty, setNotesDirty] = useState(false);
  const [notesSavedMsg, setNotesSavedMsg] = useState('');

  // Project creation form
  const [projTitle, setProjTitle] = useState('');
  const [projStack, setProjStack] = useState('');
  const [projDeadline, setProjDeadline] = useState('');
  const [projDesc, setProjDesc] = useState('');
  const [projMilestonesRaw, setProjMilestonesRaw] = useState('');

  // Project evidence edit state
  const [editingEvidenceId, setEditingEvidenceId] = useState<string | null>(null);
  const [evidenceUrlDraft, setEvidenceUrlDraft] = useState('');
  const [evidenceNotesDraft, setEvidenceNotesDraft] = useState('');
  const [hoursAddDraft, setHoursAddDraft] = useState('1');

  // Practice stopwatch & log form
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [logModKey, setLogModKey] = useState(BUILDER_CURRICULUM[0].key);
  const [logTopic, setLogTopic] = useState('');
  const [logMinutes, setLogMinutes] = useState('45');
  const [logTakeaway, setLogTakeaway] = useState('');

  useEffect(() => {
    if (!timerRunning) return;
    const id = window.setInterval(() => {
      setTimerSeconds((s) => s + 1);
    }, 1000);
    return () => window.clearInterval(id);
  }, [timerRunning]);

  const activeModule = useMemo(
    () => BUILDER_CURRICULUM.find((m) => m.key === selectedModKey) || BUILDER_CURRICULUM[0],
    [selectedModKey]
  );

  const activeModuleProgress = useMemo(
    () => builderModules.find((m) => m.moduleKey === activeModule.key),
    [builderModules, activeModule.key]
  );

  useEffect(() => {
    setNotesDraft(activeModuleProgress?.notes || '');
    setNotesDirty(false);
    setNotesSavedMsg('');
  }, [activeModule.key]);

  useEffect(() => {
    if (!notesDirty) {
      setNotesDraft(activeModuleProgress?.notes || '');
    }
  }, [activeModuleProgress?.notes, notesDirty]);

  const totalLessons = useMemo(
    () => BUILDER_CURRICULUM.reduce((sum, m) => sum + m.lessons.length, 0),
    []
  );
  const completedLessonsCount = useMemo(
    () => builderModules.reduce((sum, m) => sum + m.completedLessons.length, 0),
    [builderModules]
  );
  const masteryPct = Math.round((completedLessonsCount / Math.max(1, totalLessons)) * 100);
  const totalPracticeHours = useMemo(
    () => (codingLogs.reduce((sum, l) => sum + l.minutes, 0) / 60).toFixed(1),
    [codingLogs]
  );

  const handleSaveNotes = async () => {
    await saveBuilderModuleNotes(activeModule.key, notesDraft);
    setNotesDirty(false);
    setNotesSavedMsg('Notes saved');
    setTimeout(() => setNotesSavedMsg(''), 2000);
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projTitle.trim()) return;
    const msList = projMilestonesRaw
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    await createProject({
      title: projTitle.trim(),
      description: projDesc.trim(),
      techStack: projStack.trim(),
      deadline: projDeadline,
      milestones: msList.length > 0 ? msList : ['Core architecture', 'Build & test', 'Deploy & document'],
    });
    setProjTitle('');
    setProjStack('');
    setProjDeadline('');
    setProjDesc('');
    setProjMilestonesRaw('');
  };

  const handleLogPractice = async (e: React.FormEvent) => {
    e.preventDefault();
    const mins = Math.max(1, Number(logMinutes) || 1);
    if (!logTopic.trim()) return;
    await logCodingSession({
      moduleKey: logModKey,
      topic: logTopic.trim(),
      minutes: mins,
      takeaway: logTakeaway.trim(),
    });
    setLogTopic('');
    setLogTakeaway('');
    setTimerRunning(false);
    setTimerSeconds(0);
  };

  const applyTimerToLog = () => {
    const mins = Math.max(1, Math.round(timerSeconds / 60));
    setLogMinutes(String(mins));
    setTimerRunning(false);
  };

  const formattedStopwatch = `${String(Math.floor(timerSeconds / 3600)).padStart(2, '0')}:${String(
    Math.floor((timerSeconds % 3600) / 60)
  ).padStart(2, '0')}:${String(timerSeconds % 60).padStart(2, '0')}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-5">
        <div>
          <p className="text-xs font-mono uppercase tracking-[0.18em] text-[#9A7420] dark:text-[#C8A24A]">
            Pillar One · The Builder
          </p>
          <h1 className="text-3xl font-display font-semibold text-zinc-900 dark:text-white mt-1">
            Coding, Systems &amp; Wealth Creation
          </h1>
        </div>
        <div className="flex items-center gap-6 text-xs">
          <div>
            <span className="text-zinc-500">Skills Mastery</span>
            <p className="font-mono text-lg font-semibold tabular-nums text-zinc-900 dark:text-white">
              {masteryPct}%
            </p>
          </div>
          <div>
            <span className="text-zinc-500">Practice Logged</span>
            <p className="font-mono text-lg font-semibold tabular-nums text-zinc-900 dark:text-white">
              {totalPracticeHours}h
            </p>
          </div>
          <div>
            <span className="text-zinc-500">Projects</span>
            <p className="font-mono text-lg font-semibold tabular-nums text-zinc-900 dark:text-white">
              {projects.length}
            </p>
          </div>
        </div>
      </div>

      {/* Sub-navigation Tabs */}
      <div className="flex flex-wrap items-center gap-1 p-1 rounded-lg bg-zinc-200/70 dark:bg-[#111114] border border-zinc-300 dark:border-zinc-800 w-fit">
        {(
          [
            { id: 'roadmap', label: '10-Module Roadmap' },
            { id: 'projects', label: 'Project Tracker' },
            { id: 'practice', label: 'Coding Practice Log' },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              tab === t.id
                ? 'bg-white dark:bg-[#18181C] text-zinc-900 dark:text-[#C8A24A] shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* TAB 1: ROADMAP */}
      {tab === 'roadmap' && (
        <div className="grid lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 space-y-2">
            {BUILDER_CURRICULUM.map((mod) => {
              const prog = builderModules.find((m) => m.moduleKey === mod.key);
              const done = prog?.completedLessons.length ?? 0;
              const pct = Math.round((done / mod.lessons.length) * 100);
              const selected = mod.key === activeModule.key;
              return (
                <button
                  key={mod.key}
                  type="button"
                  onClick={() => setSelectedModKey(mod.key)}
                  className={`w-full text-left p-4 rounded-xl border transition-colors cursor-pointer ${
                    selected
                      ? 'border-[#C8A24A] bg-white dark:bg-[#18181C]'
                      : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111114] hover:border-zinc-400 dark:hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-mono text-[#9A7420] dark:text-[#C8A24A]">
                      {mod.index} · {mod.track}
                    </span>
                    <span className="text-xs font-mono tabular-nums text-zinc-500">
                      {done}/{mod.lessons.length} ({pct}%)
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-zinc-900 dark:text-white mt-1">
                    {mod.title}
                  </p>
                </button>
              );
            })}
          </div>

          <div className="lg:col-span-8 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111114] p-6 space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
              <div>
                <p className="text-xs font-mono text-[#9A7420] dark:text-[#C8A24A]">
                  Module {activeModule.index} · {activeModule.track}
                </p>
                <h2 className="text-2xl font-display font-semibold text-zinc-900 dark:text-white mt-1">
                  {activeModule.title}
                </h2>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                  {activeModule.overview}
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  openMentorWithPrompt(
                    'CODING GUIDE',
                    `I am studying ${activeModule.title} in Pillar One (${activeModule.overview}). Help me understand the core mental model and ask me a question to check my understanding without giving away full code solutions.`
                  )
                }
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#C8A24A] text-zinc-950 text-xs font-semibold hover:bg-[#d6b25e] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                Ask Mentor (Coding Guide)
              </button>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Lessons &amp; Hands-On Exercises
              </h3>
              {activeModule.lessons.map((lesson) => {
                const isDone =
                  activeModuleProgress?.completedLessons.includes(lesson.id) ?? false;
                return (
                  <div
                    key={lesson.id}
                    className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#18181C] p-4 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => void toggleBuilderLesson(activeModule.key, lesson.id)}
                        className="flex items-start gap-3 text-left flex-1 cursor-pointer"
                      >
                        <span
                          className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center shrink-0 ${
                            isDone
                              ? 'bg-[#C8A24A] border-[#C8A24A] text-zinc-950'
                              : 'border-zinc-400 dark:border-zinc-600'
                          }`}
                        >
                          {isDone && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                            {lesson.title}
                          </p>
                          <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                            {lesson.summary}
                          </p>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          openMentorWithPrompt(
                            'CODING GUIDE',
                            `Explain the concept behind "${lesson.title}" in ${activeModule.title}. Guide me through how to approach this exercise without writing the complete answer for me: "${lesson.exercise}"`
                          )
                        }
                        className="text-xs text-[#9A7420] dark:text-[#C8A24A] hover:underline whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        Explain
                      </button>
                    </div>
                    <p className="text-xs text-zinc-500 pl-8">
                      <strong>Exercise:</strong> {lesson.exercise}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="space-y-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  Personal Module Notes
                </h3>
                {notesSavedMsg && (
                  <span className="text-xs text-emerald-500 font-medium">{notesSavedMsg}</span>
                )}
              </div>
              <textarea
                value={notesDraft}
                onChange={(e) => {
                  setNotesDraft(e.target.value);
                  setNotesDirty(true);
                }}
                rows={5}
                maxLength={8000}
                placeholder={`Write your personal notes, code snippets, and key lessons for ${activeModule.title}...`}
                className="w-full rounded-lg border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-[#09090B] p-3.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[#C8A24A]"
              />
              <button
                type="button"
                onClick={() => void handleSaveNotes()}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 text-xs font-semibold hover:opacity-90 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                Save Module Notes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PROJECTS */}
      {tab === 'projects' && (
        <div className="grid lg:grid-cols-12 gap-6">
          <form
            onSubmit={(e) => void handleCreateProject(e)}
            className="lg:col-span-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111114] p-6 space-y-4 h-fit"
          >
            <h2 className="text-xl font-display font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
              <FolderGit2 className="w-5 h-5 text-[#C8A24A]" />
              New Builder Project
            </h2>
            <input
              type="text"
              required
              maxLength={140}
              value={projTitle}
              onChange={(e) => setProjTitle(e.target.value)}
              placeholder="Project title"
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-[#09090B] px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[#C8A24A]"
            />
            <input
              type="text"
              maxLength={200}
              value={projStack}
              onChange={(e) => setProjStack(e.target.value)}
              placeholder="Stack / Domain (e.g., TypeScript, Python)"
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-[#09090B] px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[#C8A24A]"
            />
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Target Deadline</label>
              <input
                type="date"
                value={projDeadline}
                onChange={(e) => setProjDeadline(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-[#09090B] px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[#C8A24A]"
              />
            </div>
            <textarea
              rows={2}
              maxLength={2000}
              value={projDesc}
              onChange={(e) => setProjDesc(e.target.value)}
              placeholder="What problem does this project solve?"
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-[#09090B] px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[#C8A24A]"
            />
            <div>
              <label className="block text-xs text-zinc-500 mb-1">
                Milestones (one per line)
              </label>
              <textarea
                rows={3}
                value={projMilestonesRaw}
                onChange={(e) => setProjMilestonesRaw(e.target.value)}
                placeholder={'Design schema\nImplement core API\nWrite tests & deploy'}
                className="w-full rounded-lg border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-[#09090B] px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[#C8A24A]"
              />
            </div>
            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#C8A24A] text-zinc-950 text-xs font-semibold hover:bg-[#d6b25e] cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Create Project
            </button>
          </form>

          <div className="lg:col-span-8 space-y-4">
            {projects.length === 0 ? (
              <div className="rounded-xl border border-dashed border-zinc-300 dark:border-zinc-800 p-10 text-center text-sm text-zinc-500">
                No projects created yet. Define your first real-world build on the left.
              </div>
            ) : (
              projects.map((p) => {
                const isCompleted = p.status === 'completed';
                const doneCount = p.milestones.filter((m) => m.done).length;
                const pct =
                  p.milestones.length > 0
                    ? Math.round((doneCount / p.milestones.length) * 100)
                    : 0;
                const isEditingEv = editingEvidenceId === p.id;

                return (
                  <div
                    key={p.id}
                    className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111114] p-6 space-y-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-mono text-[#9A7420] dark:text-[#C8A24A]">
                          {p.status.toUpperCase()} · {p.techStack || 'System Build'} · Due{' '}
                          {p.deadline || 'Unscheduled'}
                        </p>
                        <h3 className="text-xl font-display font-semibold text-zinc-900 dark:text-white mt-0.5">
                          {p.title}
                        </h3>
                        {p.description && (
                          <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                            {p.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono tabular-nums text-zinc-500">
                          {p.hoursLogged}h · {pct}%
                        </span>
                        <button
                          type="button"
                          onClick={() => void deleteProject(p.id)}
                          aria-label={`Delete project ${p.title}`}
                          className="min-h-[36px] min-w-[36px] flex items-center justify-center text-zinc-400 hover:text-red-400 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                      <div className="h-full bg-[#C8A24A]" style={{ width: `${pct}%` }} />
                    </div>

                    <div className="space-y-2">
                      {p.milestones.map((ms) => (
                        <button
                          key={ms.id}
                          type="button"
                          disabled={isCompleted}
                          onClick={() => {
                            const updated = p.milestones.map((item) =>
                              item.id === ms.id ? { ...item, done: !item.done } : item
                            );
                            void updateProject(p.id, { milestones: updated });
                          }}
                          className="w-full flex items-center gap-3 text-left py-1.5 text-sm cursor-pointer disabled:cursor-default"
                        >
                          <span
                            className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                              ms.done
                                ? 'bg-[#C8A24A] border-[#C8A24A] text-zinc-950'
                                : 'border-zinc-400 dark:border-zinc-600'
                            }`}
                          >
                            {ms.done && <Check className="w-3 h-3 stroke-[2.5]" />}
                          </span>
                          <span
                            className={
                              ms.done
                                ? 'line-through text-zinc-500'
                                : 'text-zinc-800 dark:text-zinc-200'
                            }
                          >
                            {ms.title}
                          </span>
                        </button>
                      ))}
                    </div>

                    {(p.evidenceUrl || p.evidenceNotes) && (
                      <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#18181C] p-3 text-xs space-y-1">
                        <p className="font-semibold text-zinc-800 dark:text-zinc-200">
                          Shipped Evidence
                        </p>
                        {p.evidenceUrl && (() => {
                          const rawUrl = p.evidenceUrl.trim();
                          const lowerUrl = rawUrl.toLowerCase();
                          const isUnsafe = lowerUrl.startsWith('javascript:') || lowerUrl.startsWith('data:');
                          const safeHref = isUnsafe
                            ? '#'
                            : lowerUrl.startsWith('http://') || lowerUrl.startsWith('https://')
                              ? rawUrl
                              : `https://${rawUrl}`;
                          return (
                            <a
                              href={safeHref}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[#9A7420] dark:text-[#C8A24A] hover:underline break-all"
                            >
                              <span>{p.evidenceUrl}</span>
                              <ExternalLink className="w-3 h-3 shrink-0" />
                            </a>
                          );
                        })()}
                        {p.evidenceNotes && (
                          <p className="text-zinc-600 dark:text-zinc-400">{p.evidenceNotes}</p>
                        )}
                      </div>
                    )}

                    {!isCompleted && (
                      <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            if (isEditingEv) {
                              setEditingEvidenceId(null);
                            } else {
                              setEditingEvidenceId(p.id);
                              setEvidenceUrlDraft(p.evidenceUrl || '');
                              setEvidenceNotesDraft(p.evidenceNotes || '');
                            }
                          }}
                          className="px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                        >
                          {isEditingEv ? 'Close Evidence' : 'Log Hours & Evidence'}
                        </button>
                        <button
                          type="button"
                          onClick={() => void updateProject(p.id, { status: 'completed' })}
                          className="ml-auto px-3.5 py-1.5 rounded-lg bg-[#C8A24A] text-zinc-950 text-xs font-semibold hover:bg-[#d6b25e] cursor-pointer"
                        >
                          Mark Project Completed (+150 XP)
                        </button>
                      </div>
                    )}

                    {isEditingEv && !isCompleted && (
                      <div className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#18181C] space-y-3">
                        <div className="grid sm:grid-cols-2 gap-3">
                          <input
                            type="url"
                            value={evidenceUrlDraft}
                            onChange={(e) => setEvidenceUrlDraft(e.target.value)}
                            placeholder="Repository or live URL (https://...)"
                            className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#09090B] px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100"
                          />
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="0.5"
                              max="24"
                              step="0.5"
                              value={hoursAddDraft}
                              onChange={(e) => setHoursAddDraft(e.target.value)}
                              className="w-24 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#09090B] px-3 py-2 text-xs font-mono text-zinc-900 dark:text-zinc-100"
                            />
                            <span className="text-xs text-zinc-500">add hours</span>
                          </div>
                        </div>
                        <textarea
                          rows={2}
                          value={evidenceNotesDraft}
                          onChange={(e) => setEvidenceNotesDraft(e.target.value)}
                          placeholder="What did you build, test, or verify?"
                          className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#09090B] px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const addH = Math.max(0, Number(hoursAddDraft) || 0);
                            void updateProject(p.id, {
                              evidenceUrl: evidenceUrlDraft.trim(),
                              evidenceNotes: evidenceNotesDraft.trim(),
                              hoursLogged: Number((p.hoursLogged + addH).toFixed(1)),
                            });
                            setEditingEvidenceId(null);
                          }}
                          className="px-4 py-2 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 text-xs font-semibold cursor-pointer"
                        >
                          Save Update
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 3: CODING PRACTICE LOG */}
      {tab === 'practice' && (
        <div className="grid lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-6">
            {/* Live Stopwatch */}
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111114] p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-[#9A7420] dark:text-[#C8A24A] uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  Focus Session Timer
                </span>
              </div>
              <p className="text-4xl font-mono font-semibold tabular-nums text-zinc-900 dark:text-white">
                {formattedStopwatch}
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setTimerRunning((r) => !r)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#C8A24A] text-zinc-950 text-xs font-semibold hover:bg-[#d6b25e] cursor-pointer"
                >
                  {timerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  {timerRunning ? 'Pause' : 'Start'}
                </button>
                <button
                  type="button"
                  onClick={applyTimerToLog}
                  className="px-3.5 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 text-xs font-medium text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                >
                  Use Minutes Below
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTimerRunning(false);
                    setTimerSeconds(0);
                  }}
                  aria-label="Reset timer"
                  className="p-2 rounded-lg border border-zinc-300 dark:border-zinc-700 text-zinc-500 hover:text-zinc-900 dark:hover:text-white cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Log Form */}
            <form
              onSubmit={(e) => void handleLogPractice(e)}
              className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111114] p-6 space-y-4"
            >
              <h2 className="text-xl font-display font-semibold text-zinc-900 dark:text-white">
                Log Coding Session
              </h2>
              <select
                value={logModKey}
                onChange={(e) => setLogModKey(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-[#09090B] px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100"
              >
                {BUILDER_CURRICULUM.map((m) => (
                  <option key={m.key} value={m.key}>
                    {m.index}. {m.title}
                  </option>
                ))}
              </select>
              <input
                type="text"
                required
                maxLength={180}
                value={logTopic}
                onChange={(e) => setLogTopic(e.target.value)}
                placeholder="What did you build or practice?"
                className="w-full rounded-lg border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-[#09090B] px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100"
              />
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Duration (minutes)</label>
                <input
                  type="number"
                  min={1}
                  max={1440}
                  required
                  value={logMinutes}
                  onChange={(e) => setLogMinutes(e.target.value)}
                  className="w-full rounded-lg border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-[#09090B] px-3 py-2 text-sm font-mono text-zinc-900 dark:text-zinc-100"
                />
              </div>
              <textarea
                rows={3}
                maxLength={2000}
                value={logTakeaway}
                onChange={(e) => setLogTakeaway(e.target.value)}
                placeholder="Key technical takeaway or bug solved..."
                className="w-full rounded-lg border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-[#09090B] px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100"
              />
              <button
                type="submit"
                className="w-full py-2.5 rounded-lg bg-[#C8A24A] text-zinc-950 text-xs font-semibold hover:bg-[#d6b25e] cursor-pointer"
              >
                Save Practice Log
              </button>
            </form>
          </div>

          <div className="lg:col-span-7 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111114] p-6 space-y-4">
            <h2 className="text-xl font-display font-semibold text-zinc-900 dark:text-white">
              Practice History
            </h2>
            {codingLogs.length === 0 ? (
              <p className="text-sm text-zinc-500 py-8 text-center">
                No coding sessions logged yet. Start the focus timer or record a completed session.
              </p>
            ) : (
              <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {codingLogs.map((log) => (
                  <div key={log.id} className="py-3.5 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        {log.topic}
                      </p>
                      <span className="text-xs font-mono tabular-nums text-[#9A7420] dark:text-[#C8A24A]">
                        {log.minutes} min
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500">
                      {log.date} · {BUILDER_CURRICULUM.find((m) => m.key === log.moduleKey)?.title || log.moduleKey}
                    </p>
                    {log.takeaway && (
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 pt-1">
                        {log.takeaway}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
