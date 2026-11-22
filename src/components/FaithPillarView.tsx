import React, { useMemo, useState } from 'react';
import { BookOpen, CheckCircle2, HeartHandshake, MessageSquare, Trash2 } from 'lucide-react';
import { BIBLE_READING_PLAN, CHARACTER_VIRTUES } from '../data/curriculum';
import { useRebirth } from '../context/RebirthContext';
import { todayIsoDate } from '../lib/firebase';

type FaithTab = 'bible' | 'prayer' | 'character' | 'reflection';

export const FaithPillarView: React.FC = () => {
  const { faithEntries, addFaithEntry, updateFaithEntry, deleteFaithEntry, openMentorWithPrompt } =
    useRebirth();

  const [tab, setTab] = useState<FaithTab>('bible');

  // Bible study form
  const [selectedPlanDay, setSelectedPlanDay] = useState(BIBLE_READING_PLAN[0]);
  const [scriptureRef, setScriptureRef] = useState(BIBLE_READING_PLAN[0].passage);
  const [studyTitle, setStudyTitle] = useState('');
  const [studyContent, setStudyContent] = useState('');
  const [studyQuestion, setStudyQuestion] = useState('');
  const [studyLesson, setStudyLesson] = useState('');

  // Prayer journal form
  const [prayerCategory, setPrayerCategory] = useState('Prayer Request');
  const [prayerTitle, setPrayerTitle] = useState('');
  const [prayerContent, setPrayerContent] = useState('');
  const [answeringId, setAnsweringId] = useState<string | null>(null);
  const [answeredNoteDraft, setAnsweredNoteDraft] = useState('');

  // Character form
  const [virtue, setVirtue] = useState<string>(CHARACTER_VIRTUES[0]);
  const [virtueRating, setVirtueRating] = useState(3);
  const [virtueNote, setVirtueNote] = useState('');

  // 4-question daily reflection
  const [learnedAboutGod, setLearnedAboutGod] = useState('');
  const [didWell, setDidWell] = useState('');
  const [whereFailed, setWhereFailed] = useState('');
  const [improveTomorrow, setImproveTomorrow] = useState('');

  const bibleEntries = useMemo(
    () => faithEntries.filter((e) => e.kind === 'bible_study'),
    [faithEntries]
  );
  const prayerEntries = useMemo(
    () => faithEntries.filter((e) => e.kind === 'prayer'),
    [faithEntries]
  );
  const characterEntries = useMemo(
    () => faithEntries.filter((e) => e.kind === 'character_check'),
    [faithEntries]
  );
  const reflectionEntries = useMemo(
    () => faithEntries.filter((e) => e.kind === 'daily_reflection'),
    [faithEntries]
  );

  const virtueAverages = useMemo(() => {
    const map: Record<string, { sum: number; count: number }> = {};
    for (const v of CHARACTER_VIRTUES) {
      map[v] = { sum: 0, count: 0 };
    }
    for (const e of characterEntries) {
      if (e.characterVirtue && e.virtueRating && map[e.characterVirtue]) {
        map[e.characterVirtue].sum += e.virtueRating;
        map[e.characterVirtue].count += 1;
      }
    }
    return map;
  }, [characterEntries]);

  const handleSaveStudy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scriptureRef.trim()) return;
    await addFaithEntry({
      kind: 'bible_study',
      title: studyTitle.trim() || `Study: ${scriptureRef.trim()}`,
      scriptureRef: scriptureRef.trim(),
      content: studyContent.trim(),
      question: studyQuestion.trim(),
      lessonLearned: studyLesson.trim(),
      date: todayIsoDate(),
    });
    setStudyTitle('');
    setStudyContent('');
    setStudyQuestion('');
    setStudyLesson('');
  };

  const handleSavePrayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prayerTitle.trim()) return;
    await addFaithEntry({
      kind: 'prayer',
      title: `${prayerCategory}: ${prayerTitle.trim()}`,
      content: prayerContent.trim(),
      answered: false,
      answeredNote: '',
      date: todayIsoDate(),
    });
    setPrayerTitle('');
    setPrayerContent('');
  };

  const handleSaveCharacter = async (e: React.FormEvent) => {
    e.preventDefault();
    await addFaithEntry({
      kind: 'character_check',
      title: `${virtue} Check-In`,
      characterVirtue: virtue,
      virtueRating,
      content: virtueNote.trim(),
      date: todayIsoDate(),
    });
    setVirtueNote('');
  };

  const handleSaveDailyReflection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!learnedAboutGod.trim() && !didWell.trim() && !whereFailed.trim() && !improveTomorrow.trim()) {
      return;
    }
    await addFaithEntry({
      kind: 'daily_reflection',
      title: `Daily Examination · ${todayIsoDate()}`,
      learnedAboutGod: learnedAboutGod.trim(),
      didWell: didWell.trim(),
      whereFailed: whereFailed.trim(),
      improveTomorrow: improveTomorrow.trim(),
      date: todayIsoDate(),
    });
    setLearnedAboutGod('');
    setDidWell('');
    setWhereFailed('');
    setImproveTomorrow('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-5">
        <div>
          <p className="text-xs font-mono uppercase tracking-[0.18em] text-[#9A7420] dark:text-[#C8A24A]">
            Pillar Two · The Man of God
          </p>
          <h1 className="text-3xl font-display font-semibold text-zinc-900 dark:text-white mt-1">
            Jesus Christ, Biblical Wisdom &amp; Character
          </h1>
          <p className="text-xs text-zinc-500 mt-1.5 max-w-2xl">
            This journal supports personal study and reflection—it never replaces the Bible, your local church, pastoral guidance, or personal prayer with God.
          </p>
        </div>
        <button
          type="button"
          onClick={() =>
            openMentorWithPrompt(
              'FAITH AND WISDOM',
              'I want to reflect on a passage of Scripture or a question about godly character today.'
            )
          }
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 text-xs font-medium text-zinc-900 dark:text-zinc-100 hover:border-[#C8A24A] whitespace-nowrap shrink-0 cursor-pointer"
        >
          <MessageSquare className="w-3.5 h-3.5 text-[#C8A24A]" />
          Faith &amp; Wisdom Mentor
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-1 p-1 rounded-lg bg-zinc-200/70 dark:bg-[#111114] border border-zinc-300 dark:border-zinc-800 w-fit">
        {(
          [
            { id: 'bible', label: 'Bible Study & Plan' },
            { id: 'prayer', label: 'Prayer Journal' },
            { id: 'character', label: 'Character Development' },
            { id: 'reflection', label: 'Daily Reflection' },
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

      {/* TAB 1: BIBLE STUDY */}
      {tab === 'bible' && (
        <div className="grid lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111114] p-5 space-y-3 h-fit">
            <h2 className="text-lg font-display font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#C8A24A]" />
              Daily Reading Plan
            </h2>
            <div className="space-y-1.5 max-h-[460px] overflow-y-auto pr-1">
              {BIBLE_READING_PLAN.map((plan) => (
                <button
                  key={plan.day}
                  type="button"
                  onClick={() => {
                    setSelectedPlanDay(plan);
                    setScriptureRef(plan.passage);
                  }}
                  className={`w-full text-left p-3 rounded-lg border text-xs transition-colors cursor-pointer ${
                    selectedPlanDay.day === plan.day
                      ? 'border-[#C8A24A] bg-[#C8A24A]/10 text-zinc-900 dark:text-white'
                      : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#18181C] text-zinc-600 dark:text-zinc-400'
                  }`}
                >
                  <p className="font-mono text-[#9A7420] dark:text-[#C8A24A]">
                    Day {String(plan.day).padStart(2, '0')} · {plan.passage}
                  </p>
                  <p className="mt-0.5 text-zinc-800 dark:text-zinc-200 font-medium">{plan.theme}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-8 space-y-6">
            <form
              onSubmit={(e) => void handleSaveStudy(e)}
              className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111114] p-6 space-y-4"
            >
              <h2 className="text-xl font-display font-semibold text-zinc-900 dark:text-white">
                Scripture Journal &amp; Notes
              </h2>
              <div className="grid sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  maxLength={120}
                  value={scriptureRef}
                  onChange={(e) => setScriptureRef(e.target.value)}
                  placeholder="Passage (e.g., Proverbs 4:1-27)"
                  className="rounded-lg border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-[#09090B] px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100"
                />
                <input
                  type="text"
                  maxLength={180}
                  value={studyTitle}
                  onChange={(e) => setStudyTitle(e.target.value)}
                  placeholder="Study heading"
                  className="rounded-lg border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-[#09090B] px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100"
                />
              </div>
              <textarea
                rows={4}
                maxLength={8000}
                value={studyContent}
                onChange={(e) => setStudyContent(e.target.value)}
                placeholder="Observations, personal reflections, and context from the passage..."
                className="w-full rounded-lg border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-[#09090B] px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100"
              />
              <div className="grid sm:grid-cols-2 gap-3">
                <textarea
                  rows={2}
                  maxLength={1500}
                  value={studyQuestion}
                  onChange={(e) => setStudyQuestion(e.target.value)}
                  placeholder="Questions about this passage (to ask a pastor or study deeper)"
                  className="rounded-lg border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-[#09090B] px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100"
                />
                <textarea
                  rows={2}
                  maxLength={2000}
                  value={studyLesson}
                  onChange={(e) => setStudyLesson(e.target.value)}
                  placeholder="Key lesson learned & obedience step"
                  className="rounded-lg border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-[#09090B] px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100"
                />
              </div>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-lg bg-[#C8A24A] text-zinc-950 text-xs font-semibold hover:bg-[#d6b25e] cursor-pointer"
              >
                Save Study Entry
              </button>
            </form>

            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111114] p-6 space-y-4">
              <h3 className="text-lg font-display font-semibold text-zinc-900 dark:text-white">
                Recorded Scripture Notes
              </h3>
              {bibleEntries.length === 0 ? (
                <p className="text-sm text-zinc-500">No Scripture notes logged yet.</p>
              ) : (
                <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {bibleEntries.map((entry) => (
                    <div key={entry.id} className="py-4 space-y-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-xs font-mono text-[#9A7420] dark:text-[#C8A24A]">
                            {entry.date} · {entry.scriptureRef}
                          </p>
                          <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                            {entry.title}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => void deleteFaithEntry(entry.id)}
                          aria-label="Delete study entry"
                          className="text-zinc-400 hover:text-red-400 p-1.5 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      {entry.content && (
                        <p className="text-sm text-zinc-600 dark:text-zinc-300 whitespace-pre-wrap">
                          {entry.content}
                        </p>
                      )}
                      {entry.question && (
                        <p className="text-xs text-zinc-500">
                          <strong>Question:</strong> {entry.question}
                        </p>
                      )}
                      {entry.lessonLearned && (
                        <p className="text-xs text-zinc-500">
                          <strong>Lesson:</strong> {entry.lessonLearned}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PRAYER JOURNAL */}
      {tab === 'prayer' && (
        <div className="grid lg:grid-cols-12 gap-6">
          <form
            onSubmit={(e) => void handleSavePrayer(e)}
            className="lg:col-span-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111114] p-6 space-y-4 h-fit"
          >
            <h2 className="text-xl font-display font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
              <HeartHandshake className="w-5 h-5 text-[#C8A24A]" />
              Private Prayer &amp; Gratitude
            </h2>
            <select
              value={prayerCategory}
              onChange={(e) => setPrayerCategory(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-[#09090B] px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100"
            >
              <option value="Prayer Request">Prayer Request</option>
              <option value="Gratitude">Gratitude</option>
              <option value="Private Prayer">Private Prayer Entry</option>
              <option value="Intercession">Praying for Others</option>
            </select>
            <input
              type="text"
              required
              maxLength={140}
              value={prayerTitle}
              onChange={(e) => setPrayerTitle(e.target.value)}
              placeholder="Summary (e.g., Wisdom for exams & family)"
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-[#09090B] px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100"
            />
            <textarea
              rows={4}
              maxLength={8000}
              value={prayerContent}
              onChange={(e) => setPrayerContent(e.target.value)}
              placeholder="Write your prayer or gratitude honestly..."
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-[#09090B] px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100"
            />
            <button
              type="submit"
              className="w-full py-2.5 rounded-lg bg-[#C8A24A] text-zinc-950 text-xs font-semibold hover:bg-[#d6b25e] cursor-pointer"
            >
              Record Private Prayer
            </button>
          </form>

          <div className="lg:col-span-7 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111114] p-6 space-y-4">
            <h2 className="text-xl font-display font-semibold text-zinc-900 dark:text-white">
              Prayer &amp; Answered-Prayer Log
            </h2>
            {prayerEntries.length === 0 ? (
              <p className="text-sm text-zinc-500">No prayer entries yet.</p>
            ) : (
              <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {prayerEntries.map((entry) => (
                  <div key={entry.id} className="py-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-xs font-mono text-zinc-500">
                          {entry.date} · {entry.answered ? 'Answered' : 'Awaiting'}
                        </p>
                        <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                          {entry.title}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {!entry.answered && (
                          <button
                            type="button"
                            onClick={() => {
                              setAnsweringId(entry.id);
                              setAnsweredNoteDraft('');
                            }}
                            className="text-xs text-[#9A7420] dark:text-[#C8A24A] hover:underline cursor-pointer"
                          >
                            Mark Answered
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => void deleteFaithEntry(entry.id)}
                          aria-label="Delete prayer"
                          className="text-zinc-400 hover:text-red-400 p-1 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    {entry.content && (
                      <p className="text-sm text-zinc-600 dark:text-zinc-300 whitespace-pre-wrap">
                        {entry.content}
                      </p>
                    )}
                    {entry.answered && (
                      <p className="text-xs text-emerald-500 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Answered: {entry.answeredNote || 'Marked answered with gratitude'}
                      </p>
                    )}
                    {answeringId === entry.id && (
                      <div className="flex items-center gap-2 pt-2">
                        <input
                          type="text"
                          maxLength={1500}
                          value={answeredNoteDraft}
                          onChange={(e) => setAnsweredNoteDraft(e.target.value)}
                          placeholder="How did God answer or guide you?"
                          className="flex-1 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-[#09090B] px-3 py-1.5 text-xs text-zinc-900 dark:text-zinc-100"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            void updateFaithEntry(entry.id, {
                              answered: true,
                              answeredNote: answeredNoteDraft.trim() || 'Answered',
                            });
                            setAnsweringId(null);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-[#C8A24A] text-zinc-950 text-xs font-semibold cursor-pointer"
                        >
                          Save
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: CHARACTER DEVELOPMENT */}
      {tab === 'character' && (
        <div className="grid lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111114] p-6 space-y-4">
            <h2 className="text-xl font-display font-semibold text-zinc-900 dark:text-white">
              Eight Pillars of Character
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {CHARACTER_VIRTUES.map((v) => {
                const stat = virtueAverages[v];
                const avg = stat.count > 0 ? (stat.sum / stat.count).toFixed(1) : '—';
                const pct = stat.count > 0 ? Math.round((stat.sum / stat.count / 5) * 100) : 0;
                return (
                  <div
                    key={v}
                    className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#18181C] p-4 space-y-2"
                  >
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100">{v}</span>
                      <span className="font-mono text-xs tabular-nums text-[#9A7420] dark:text-[#C8A24A]">
                        {avg} / 5 ({stat.count})
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                      <div className="h-full bg-[#C8A24A]" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <form
            onSubmit={(e) => void handleSaveCharacter(e)}
            className="lg:col-span-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111114] p-6 space-y-4 h-fit"
          >
            <h2 className="text-xl font-display font-semibold text-zinc-900 dark:text-white">
              Log Character Check-In
            </h2>
            <select
              value={virtue}
              onChange={(e) => setVirtue(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-[#09090B] px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100"
            >
              {CHARACTER_VIRTUES.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
            <div>
              <div className="flex justify-between text-xs text-zinc-500 mb-1">
                <span>Honest Practice Today</span>
                <span className="font-mono">{virtueRating} / 5</span>
              </div>
              <input
                type="range"
                min={1}
                max={5}
                value={virtueRating}
                onChange={(e) => setVirtueRating(Number(e.target.value))}
                className="w-full accent-[#C8A24A]"
              />
            </div>
            <textarea
              rows={3}
              maxLength={2000}
              value={virtueNote}
              onChange={(e) => setVirtueNote(e.target.value)}
              placeholder="Where was this virtue tested today?"
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-[#09090B] px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100"
            />
            <button
              type="submit"
              className="w-full py-2.5 rounded-lg bg-[#C8A24A] text-zinc-950 text-xs font-semibold hover:bg-[#d6b25e] cursor-pointer"
            >
              Save Character Check-In
            </button>
          </form>
        </div>
      )}

      {/* TAB 4: DAILY 4-QUESTION REFLECTION */}
      {tab === 'reflection' && (
        <div className="grid lg:grid-cols-12 gap-6">
          <form
            onSubmit={(e) => void handleSaveDailyReflection(e)}
            className="lg:col-span-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111114] p-6 space-y-4"
          >
            <h2 className="text-xl font-display font-semibold text-zinc-900 dark:text-white">
              Daily Examination
            </h2>
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                1. What did I learn about God today?
              </label>
              <textarea
                rows={2}
                required
                maxLength={2000}
                value={learnedAboutGod}
                onChange={(e) => setLearnedAboutGod(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-[#09090B] px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                2. What did I do well?
              </label>
              <textarea
                rows={2}
                maxLength={2000}
                value={didWell}
                onChange={(e) => setDidWell(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-[#09090B] px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                3. Where did I fail?
              </label>
              <textarea
                rows={2}
                maxLength={2000}
                value={whereFailed}
                onChange={(e) => setWhereFailed(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-[#09090B] px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                4. What should I improve tomorrow?
              </label>
              <textarea
                rows={2}
                maxLength={2000}
                value={improveTomorrow}
                onChange={(e) => setImproveTomorrow(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-[#09090B] px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 rounded-lg bg-[#C8A24A] text-zinc-950 text-xs font-semibold hover:bg-[#d6b25e] cursor-pointer"
            >
              Save Daily Reflection
            </button>
          </form>

          <div className="lg:col-span-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111114] p-6 space-y-4">
            <h2 className="text-xl font-display font-semibold text-zinc-900 dark:text-white">
              Past Reflections
            </h2>
            {reflectionEntries.length === 0 ? (
              <p className="text-sm text-zinc-500">No daily reflections saved yet.</p>
            ) : (
              <div className="space-y-4 max-h-[540px] overflow-y-auto pr-1">
                {reflectionEntries.map((r) => (
                  <div
                    key={r.id}
                    className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#18181C] p-4 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[#9A7420] dark:text-[#C8A24A]">{r.date}</span>
                      <button
                        type="button"
                        onClick={() => void deleteFaithEntry(r.id)}
                        aria-label="Delete reflection"
                        className="text-zinc-400 hover:text-red-400 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    {r.learnedAboutGod && <p><strong>About God:</strong> {r.learnedAboutGod}</p>}
                    {r.didWell && <p><strong>Did well:</strong> {r.didWell}</p>}
                    {r.whereFailed && <p><strong>Fell short:</strong> {r.whereFailed}</p>}
                    {r.improveTomorrow && <p><strong>Tomorrow:</strong> {r.improveTomorrow}</p>}
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
