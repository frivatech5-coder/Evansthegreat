import React, { useMemo, useState } from 'react';
import { Brain, CheckCircle2, Coins, Compass, MessageCircle, Shield, Trash2 } from 'lucide-react';
import {
  COMMUNICATION_HABITS,
  LOGIC_PUZZLES,
  PEER_PRESSURE_QUESTIONS,
  WEALTH_LESSONS,
} from '../data/curriculum';
import { useRebirth } from '../context/RebirthContext';
import { todayIsoDate } from '../lib/firebase';

type ThinkerTab = 'mental' | 'wealth' | 'discovery' | 'peer' | 'communication';

export const ThinkerPillarView: React.FC = () => {
  const { thinkerEntries, addThinkerEntry, deleteThinkerEntry } = useRebirth();
  const [tab, setTab] = useState<ThinkerTab>('mental');

  // Mental Fitness states
  const [puzzleIdx, setPuzzleIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [puzzleResult, setPuzzleResult] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [chessTitle, setChessTitle] = useState('');
  const [chessNotes, setChessNotes] = useState('');
  const [decisionTitle, setDecisionTitle] = useState('');
  const [decisionNotes, setDecisionNotes] = useState('');

  // Wealth states
  const [txTitle, setTxTitle] = useState('');
  const [txType, setTxType] = useState<'income' | 'expense' | 'savings'>('income');
  const [txCategory, setTxCategory] = useState('Learning & Tools');
  const [txAmount, setTxAmount] = useState('');
  const [goalTitle, setGoalTitle] = useState('');
  const [goalCurrent, setGoalCurrent] = useState('');
  const [goalTarget, setGoalTarget] = useState('');
  const [ideaTitle, setIdeaTitle] = useState('');
  const [ideaNotes, setIdeaNotes] = useState('');

  // Discovery states
  const [discCategory, setDiscCategory] = useState('New Interests');
  const [discTitle, setDiscTitle] = useState('');
  const [discNotes, setDiscNotes] = useState('');

  // Peer pressure audit
  const [peerAnswers, setPeerAnswers] = useState<Record<number, string>>({});

  // Communication states
  const [commChecked, setCommChecked] = useState<string[]>([]);
  const [commNotes, setCommNotes] = useState('');

  const activePuzzle = LOGIC_PUZZLES[puzzleIdx];

  const handleCheckPuzzle = async () => {
    if (selectedOption === null) return;
    if (selectedOption === activePuzzle.correctIndex) {
      setPuzzleResult('correct');
      await addThinkerEntry(
        {
          section: 'puzzle',
          title: `Solved: ${activePuzzle.title}`,
          category: activePuzzle.category,
          notes: activePuzzle.explanation,
          date: todayIsoDate(),
        },
        { amount: 35, source: 'puzzle_solved', desc: `Solved puzzle: ${activePuzzle.title}` }
      );
    } else {
      setPuzzleResult('wrong');
    }
  };

  const financeSummary = useMemo(() => {
    let income = 0;
    let expense = 0;
    let savings = 0;
    for (const e of thinkerEntries) {
      if (e.section === 'finance_tx' && typeof e.amount === 'number') {
        if (e.txType === 'income') income += e.amount;
        if (e.txType === 'expense') expense += e.amount;
        if (e.txType === 'savings') savings += e.amount;
      }
    }
    return { income, expense, savings, net: income - expense };
  }, [thinkerEntries]);

  const savingsGoals = useMemo(
    () => thinkerEntries.filter((e) => e.section === 'savings_goal'),
    [thinkerEntries]
  );
  const transactions = useMemo(
    () => thinkerEntries.filter((e) => e.section === 'finance_tx'),
    [thinkerEntries]
  );
  const businessIdeas = useMemo(
    () => thinkerEntries.filter((e) => e.section === 'business_idea'),
    [thinkerEntries]
  );
  const discoveryLogs = useMemo(
    () => thinkerEntries.filter((e) => e.section === 'discovery'),
    [thinkerEntries]
  );
  const peerLogs = useMemo(
    () => thinkerEntries.filter((e) => e.section === 'peer_pressure'),
    [thinkerEntries]
  );
  const commLogs = useMemo(
    () => thinkerEntries.filter((e) => e.section === 'communication'),
    [thinkerEntries]
  );
  const mentalLogs = useMemo(
    () =>
      thinkerEntries.filter(
        (e) => e.section === 'chess' || e.section === 'decision' || e.section === 'puzzle'
      ),
    [thinkerEntries]
  );

  return (
    <div className="space-y-6">
      <div className="border-b border-zinc-200 dark:border-zinc-800 pb-5">
        <p className="text-xs font-mono uppercase tracking-[0.18em] text-[#9A7420] dark:text-[#C8A24A]">
          Pillar Three · The Thinker
        </p>
        <h1 className="text-3xl font-display font-semibold text-zinc-900 dark:text-white mt-1">
          Mental Fitness, Financial Intelligence &amp; Independence
        </h1>
      </div>

      <div className="flex flex-wrap items-center gap-1 p-1 rounded-lg bg-zinc-200/70 dark:bg-[#111114] border border-zinc-300 dark:border-zinc-800 w-fit">
        {(
          [
            { id: 'mental', label: 'Mental Fitness' },
            { id: 'wealth', label: 'Wealth Education' },
            { id: 'discovery', label: 'Discovering Myself' },
            { id: 'peer', label: 'Peer Pressure Audit' },
            { id: 'communication', label: 'Communication' },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`px-3.5 py-2 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              tab === t.id
                ? 'bg-white dark:bg-[#18181C] text-zinc-900 dark:text-[#C8A24A] shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* SECTION A: MENTAL FITNESS */}
      {tab === 'mental' && (
        <div className="grid lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-6">
            {/* Interactive Logic Puzzle */}
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111114] p-6 space-y-4">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-mono text-[#9A7420] dark:text-[#C8A24A] flex items-center gap-1.5">
                  <Brain className="w-4 h-4" />
                  {activePuzzle.category} · Challenge {puzzleIdx + 1} of {LOGIC_PUZZLES.length}
                </span>
                <div className="flex items-center gap-2">
                  {LOGIC_PUZZLES.map((p, idx) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setPuzzleIdx(idx);
                        setSelectedOption(null);
                        setPuzzleResult('idle');
                      }}
                      className={`w-7 h-7 rounded text-xs font-mono cursor-pointer ${
                        idx === puzzleIdx
                          ? 'bg-[#C8A24A] text-zinc-950 font-semibold'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                </div>
              </div>
              <h2 className="text-xl font-display font-semibold text-zinc-900 dark:text-white">
                {activePuzzle.title}
              </h2>
              <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                {activePuzzle.prompt}
              </p>
              <div className="space-y-2">
                {activePuzzle.options.map((opt, idx) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      setSelectedOption(idx);
                      setPuzzleResult('idle');
                    }}
                    className={`w-full text-left p-3.5 rounded-lg border text-sm transition-colors cursor-pointer ${
                      selectedOption === idx
                        ? 'border-[#C8A24A] bg-[#C8A24A]/10 text-zinc-900 dark:text-white'
                        : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#18181C] text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => void handleCheckPuzzle()}
                disabled={selectedOption === null}
                className="px-5 py-2.5 rounded-lg bg-[#C8A24A] text-zinc-950 text-xs font-semibold hover:bg-[#d6b25e] disabled:opacity-50 cursor-pointer"
              >
                Verify Reasoning (+35 XP)
              </button>
              {puzzleResult === 'correct' && (
                <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-3.5 text-xs text-emerald-700 dark:text-emerald-300">
                  <strong>Correct.</strong> {activePuzzle.explanation}
                </div>
              )}
              {puzzleResult === 'wrong' && (
                <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-3.5 text-xs text-amber-700 dark:text-amber-300">
                  Re-read the assumptions carefully and test another option.
                </div>
              )}
            </div>

            {/* Chess & Decision Logs */}
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111114] p-6 space-y-4">
              <h3 className="text-lg font-display font-semibold text-zinc-900 dark:text-white">
                Mental Training History
              </h3>
              {mentalLogs.length === 0 ? (
                <p className="text-sm text-zinc-500">No chess, puzzle, or decision logs yet.</p>
              ) : (
                <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {mentalLogs.map((item) => (
                    <div key={item.id} className="py-3 flex items-start justify-between gap-2">
                      <div>
                        <p className="text-xs font-mono text-[#9A7420] dark:text-[#C8A24A]">
                          {item.date} · {item.section.toUpperCase()}
                        </p>
                        <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                          {item.title}
                        </p>
                        {item.notes && (
                          <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                            {item.notes}
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => void deleteThinkerEntry(item.id)}
                        aria-label="Delete mental entry"
                        className="text-zinc-400 hover:text-red-400 p-1 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-5 space-y-6">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!chessTitle.trim()) return;
                void addThinkerEntry(
                  {
                    section: 'chess',
                    title: chessTitle.trim(),
                    notes: chessNotes.trim(),
                    date: todayIsoDate(),
                  },
                  { amount: 25, source: 'chess_practice', desc: `Chess session: ${chessTitle.trim()}` }
                );
                setChessTitle('');
                setChessNotes('');
              }}
              className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111114] p-6 space-y-3"
            >
              <h3 className="text-lg font-display font-semibold text-zinc-900 dark:text-white">
                Chess Practice Tracker
              </h3>
              <input
                type="text"
                required
                maxLength={180}
                value={chessTitle}
                onChange={(e) => setChessTitle(e.target.value)}
                placeholder="Session focus (e.g., 15 tactical puzzles + 2 rapid games)"
                className="w-full rounded-lg border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-[#09090B] px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100"
              />
              <textarea
                rows={3}
                maxLength={6000}
                value={chessNotes}
                onChange={(e) => setChessNotes(e.target.value)}
                placeholder="Blunders avoided, calculation lessons..."
                className="w-full rounded-lg border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-[#09090B] px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100"
              />
              <button
                type="submit"
                className="w-full py-2.5 rounded-lg bg-[#C8A24A] text-zinc-950 text-xs font-semibold cursor-pointer"
              >
                Log Chess Session (+25 XP)
              </button>
            </form>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!decisionTitle.trim()) return;
                void addThinkerEntry(
                  {
                    section: 'decision',
                    title: decisionTitle.trim(),
                    notes: decisionNotes.trim(),
                    date: todayIsoDate(),
                  },
                  { amount: 25, source: 'decision_journal', desc: `Decision analyzed: ${decisionTitle.trim()}` }
                );
                setDecisionTitle('');
                setDecisionNotes('');
              }}
              className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111114] p-6 space-y-3"
            >
              <h3 className="text-lg font-display font-semibold text-zinc-900 dark:text-white">
                Decision-Making Journal
              </h3>
              <input
                type="text"
                required
                maxLength={180}
                value={decisionTitle}
                onChange={(e) => setDecisionTitle(e.target.value)}
                placeholder="Decision under review"
                className="w-full rounded-lg border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-[#09090B] px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100"
              />
              <textarea
                rows={3}
                maxLength={6000}
                value={decisionNotes}
                onChange={(e) => setDecisionNotes(e.target.value)}
                placeholder="Options weighed, second-order consequences, reversibility..."
                className="w-full rounded-lg border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-[#09090B] px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100"
              />
              <button
                type="submit"
                className="w-full py-2.5 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 text-xs font-semibold cursor-pointer"
              >
                Save Decision Analysis
              </button>
            </form>
          </div>
        </div>
      )}

      {/* SECTION B: WEALTH EDUCATION */}
      {tab === 'wealth' && (
        <div className="space-y-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111114] p-5">
              <p className="text-xs text-zinc-500">Total Income</p>
              <p className="text-2xl font-mono font-semibold tabular-nums text-emerald-500 mt-1">
                {financeSummary.income.toLocaleString()}
              </p>
            </div>
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111114] p-5">
              <p className="text-xs text-zinc-500">Total Expenses</p>
              <p className="text-2xl font-mono font-semibold tabular-nums text-amber-500 mt-1">
                {financeSummary.expense.toLocaleString()}
              </p>
            </div>
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111114] p-5">
              <p className="text-xs text-zinc-500">Allocated Savings</p>
              <p className="text-2xl font-mono font-semibold tabular-nums text-[#C8A24A] mt-1">
                {financeSummary.savings.toLocaleString()}
              </p>
            </div>
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111114] p-5">
              <p className="text-xs text-zinc-500">Net Cashflow</p>
              <p className="text-2xl font-mono font-semibold tabular-nums text-zinc-900 dark:text-white mt-1">
                {financeSummary.net.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="grid lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 space-y-6">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const amt = Number(txAmount);
                  if (!txTitle.trim() || !amt || amt <= 0) return;
                  void addThinkerEntry(
                    {
                      section: 'finance_tx',
                      title: txTitle.trim(),
                      txType,
                      category: txCategory,
                      amount: amt,
                      date: todayIsoDate(),
                    },
                    { amount: 15, source: 'finance_logged', desc: `Budget entry: ${txTitle.trim()}` }
                  );
                  setTxTitle('');
                  setTxAmount('');
                }}
                className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111114] p-6 space-y-3"
              >
                <h2 className="text-xl font-display font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
                  <Coins className="w-5 h-5 text-[#C8A24A]" />
                  Budget &amp; Cashflow Entry
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  <select
                    value={txType}
                    onChange={(e) => setTxType(e.target.value as 'income' | 'expense' | 'savings')}
                    className="rounded-lg border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-[#09090B] px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100"
                  >
                    <option value="income">Income</option>
                    <option value="expense">Expense</option>
                    <option value="savings">Savings</option>
                  </select>
                  <input
                    type="number"
                    min="1"
                    step="any"
                    required
                    value={txAmount}
                    onChange={(e) => setTxAmount(e.target.value)}
                    placeholder="Amount"
                    className="rounded-lg border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-[#09090B] px-3 py-2 text-sm font-mono text-zinc-900 dark:text-zinc-100"
                  />
                </div>
                <input
                  type="text"
                  required
                  maxLength={180}
                  value={txTitle}
                  onChange={(e) => setTxTitle(e.target.value)}
                  placeholder="Description (e.g., Freelance landing page)"
                  className="w-full rounded-lg border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-[#09090B] px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100"
                />
                <input
                  type="text"
                  maxLength={80}
                  value={txCategory}
                  onChange={(e) => setTxCategory(e.target.value)}
                  placeholder="Category"
                  className="w-full rounded-lg border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-[#09090B] px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100"
                />
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-lg bg-[#C8A24A] text-zinc-950 text-xs font-semibold cursor-pointer"
                >
                  Record Transaction
                </button>
              </form>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const target = Number(goalTarget);
                  const current = Number(goalCurrent) || 0;
                  if (!goalTitle.trim() || !target || target <= 0) return;
                  void addThinkerEntry({
                    section: 'savings_goal',
                    title: goalTitle.trim(),
                    amount: current,
                    targetAmount: target,
                    date: todayIsoDate(),
                  });
                  setGoalTitle('');
                  setGoalCurrent('');
                  setGoalTarget('');
                }}
                className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111114] p-6 space-y-3"
              >
                <h3 className="text-lg font-display font-semibold text-zinc-900 dark:text-white">
                  Savings Goal
                </h3>
                <input
                  type="text"
                  required
                  maxLength={180}
                  value={goalTitle}
                  onChange={(e) => setGoalTitle(e.target.value)}
                  placeholder="Goal (e.g., Emergency Fund / Laptop)"
                  className="w-full rounded-lg border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-[#09090B] px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    min="0"
                    value={goalCurrent}
                    onChange={(e) => setGoalCurrent(e.target.value)}
                    placeholder="Saved so far"
                    className="rounded-lg border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-[#09090B] px-3 py-2 text-sm font-mono text-zinc-900 dark:text-zinc-100"
                  />
                  <input
                    type="number"
                    min="1"
                    required
                    value={goalTarget}
                    onChange={(e) => setGoalTarget(e.target.value)}
                    placeholder="Target amount"
                    className="rounded-lg border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-[#09090B] px-3 py-2 text-sm font-mono text-zinc-900 dark:text-zinc-100"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 text-xs font-semibold cursor-pointer"
                >
                  Add Savings Goal
                </button>
              </form>
            </div>

            <div className="lg:col-span-7 space-y-6">
              {/* Financial Principles */}
              <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111114] p-6 space-y-3">
                <h3 className="text-lg font-display font-semibold text-zinc-900 dark:text-white">
                  Stewardship &amp; Wealth Foundations
                </h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  {WEALTH_LESSONS.map((wl) => (
                    <div
                      key={wl.id}
                      className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#18181C] p-3.5 space-y-1"
                    >
                      <p className="text-xs font-semibold text-[#9A7420] dark:text-[#C8A24A]">
                        {wl.title}
                      </p>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                        {wl.body}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Savings Goals & Ledger */}
              <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111114] p-6 space-y-4">
                <h3 className="text-lg font-display font-semibold text-zinc-900 dark:text-white">
                  Savings Goals &amp; Ledger
                </h3>
                {savingsGoals.map((g) => {
                  const pct = g.targetAmount
                    ? Math.min(100, Math.round(((g.amount || 0) / g.targetAmount) * 100))
                    : 0;
                  return (
                    <div key={g.id} className="space-y-1.5 pb-3 border-b border-zinc-200 dark:border-zinc-800">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-zinc-900 dark:text-white">{g.title}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono tabular-nums text-zinc-500">
                            {(g.amount || 0).toLocaleString()} / {(g.targetAmount || 0).toLocaleString()} ({pct}%)
                          </span>
                          <button
                            type="button"
                            onClick={() => void deleteThinkerEntry(g.id)}
                            className="text-zinc-400 hover:text-red-400 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <div className="h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                        <div className="h-full bg-[#C8A24A]" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}

                {transactions.length === 0 ? (
                  <p className="text-sm text-zinc-500">No income or expense entries recorded yet.</p>
                ) : (
                  <div className="divide-y divide-zinc-200 dark:divide-zinc-800 max-h-60 overflow-y-auto">
                    {transactions.map((tx) => (
                      <div key={tx.id} className="py-2.5 flex items-center justify-between gap-2 text-xs">
                        <div>
                          <p className="font-medium text-zinc-900 dark:text-zinc-100">{tx.title}</p>
                          <p className="text-zinc-500">
                            {tx.date} · {tx.category} · {tx.txType}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono tabular-nums font-semibold text-zinc-900 dark:text-zinc-100">
                            {tx.txType === 'expense' ? '-' : '+'}
                            {(tx.amount || 0).toLocaleString()}
                          </span>
                          <button
                            type="button"
                            onClick={() => void deleteThinkerEntry(tx.id)}
                            className="text-zinc-400 hover:text-red-400 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Business Ideas Notebook */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!ideaTitle.trim()) return;
                  void addThinkerEntry({
                    section: 'business_idea',
                    title: ideaTitle.trim(),
                    notes: ideaNotes.trim(),
                    date: todayIsoDate(),
                  });
                  setIdeaTitle('');
                  setIdeaNotes('');
                }}
                className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111114] p-6 space-y-3"
              >
                <h3 className="text-lg font-display font-semibold text-zinc-900 dark:text-white">
                  Business Ideas Notebook
                </h3>
                <input
                  type="text"
                  required
                  maxLength={180}
                  value={ideaTitle}
                  onChange={(e) => setIdeaTitle(e.target.value)}
                  placeholder="Idea / Real problem to solve"
                  className="w-full rounded-lg border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-[#09090B] px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100"
                />
                <textarea
                  rows={2}
                  maxLength={6000}
                  value={ideaNotes}
                  onChange={(e) => setIdeaNotes(e.target.value)}
                  placeholder="Who has this problem? How would you validate it cheaply?"
                  className="w-full rounded-lg border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-[#09090B] px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#C8A24A] text-zinc-950 text-xs font-semibold cursor-pointer"
                >
                  Save Business Idea
                </button>
                {businessIdeas.length > 0 && (
                  <div className="pt-3 space-y-2 border-t border-zinc-200 dark:border-zinc-800">
                    {businessIdeas.map((idea) => (
                      <div key={idea.id} className="flex items-start justify-between gap-2 text-xs">
                        <div>
                          <p className="font-semibold text-zinc-900 dark:text-zinc-100">{idea.title}</p>
                          {idea.notes && <p className="text-zinc-500">{idea.notes}</p>}
                        </div>
                        <button
                          type="button"
                          onClick={() => void deleteThinkerEntry(idea.id)}
                          className="text-zinc-400 hover:text-red-400 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      )}

      {/* SECTION C: DISCOVERING MYSELF */}
      {tab === 'discovery' && (
        <div className="grid lg:grid-cols-12 gap-6">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!discTitle.trim()) return;
              void addThinkerEntry(
                {
                  section: 'discovery',
                  category: discCategory,
                  title: discTitle.trim(),
                  notes: discNotes.trim(),
                  date: todayIsoDate(),
                },
                { amount: 20, source: 'self_discovery', desc: `Discovery note: ${discTitle.trim()}` }
              );
              setDiscTitle('');
              setDiscNotes('');
            }}
            className="lg:col-span-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111114] p-6 space-y-4 h-fit"
          >
            <h2 className="text-xl font-display font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
              <Compass className="w-5 h-5 text-[#C8A24A]" />
              Personal Discovery Journal
            </h2>
            <select
              value={discCategory}
              onChange={(e) => setDiscCategory(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-[#09090B] px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100"
            >
              <option value="New Interests">New Interests</option>
              <option value="Skills Enjoyed">Skills I Enjoy</option>
              <option value="Fulfilling Activities">Activities That Fulfill Me</option>
              <option value="To Investigate">Things I Want to Investigate</option>
              <option value="Strengths & Weaknesses">Strengths &amp; Weaknesses</option>
              <option value="Future Ambitions">Future Ambitions</option>
            </select>
            <input
              type="text"
              required
              maxLength={180}
              value={discTitle}
              onChange={(e) => setDiscTitle(e.target.value)}
              placeholder="Headline or observation"
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-[#09090B] px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100"
            />
            <textarea
              rows={4}
              maxLength={6000}
              value={discNotes}
              onChange={(e) => setDiscNotes(e.target.value)}
              placeholder="Why does this matter? What did you notice when doing it?"
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-[#09090B] px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100"
            />
            <button
              type="submit"
              className="w-full py-2.5 rounded-lg bg-[#C8A24A] text-zinc-950 text-xs font-semibold cursor-pointer"
            >
              Save Discovery Entry
            </button>
          </form>

          <div className="lg:col-span-7 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111114] p-6 space-y-4">
            <h2 className="text-xl font-display font-semibold text-zinc-900 dark:text-white">
              Identity Map
            </h2>
            {discoveryLogs.length === 0 ? (
              <p className="text-sm text-zinc-500">
                Record your interests, strengths, weaknesses, and future ambitions here.
              </p>
            ) : (
              <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {discoveryLogs.map((d) => (
                  <div key={d.id} className="py-3.5 flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs font-mono text-[#9A7420] dark:text-[#C8A24A]">
                        {d.date} · {d.category}
                      </p>
                      <p className="text-sm font-semibold text-zinc-900 dark:text-white">{d.title}</p>
                      {d.notes && (
                        <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">{d.notes}</p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => void deleteThinkerEntry(d.id)}
                      className="text-zinc-400 hover:text-red-400 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECTION D: INDEPENDENCE FROM PEER PRESSURE */}
      {tab === 'peer' && (
        <div className="grid lg:grid-cols-12 gap-6">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const compiled = PEER_PRESSURE_QUESTIONS.map(
                (q, idx) => `${idx + 1}. ${q}\n${peerAnswers[idx]?.trim() || '—'}`
              ).join('\n\n');
              void addThinkerEntry(
                {
                  section: 'peer_pressure',
                  title: `Weekly Independence Audit · ${todayIsoDate()}`,
                  notes: compiled,
                  date: todayIsoDate(),
                },
                { amount: 50, source: 'peer_pressure_audit', desc: 'Completed weekly Peer Pressure Audit' }
              );
              setPeerAnswers({});
            }}
            className="lg:col-span-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111114] p-6 space-y-4"
          >
            <h2 className="text-xl font-display font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#C8A24A]" />
              Weekly Peer Pressure Audit
            </h2>
            {PEER_PRESSURE_QUESTIONS.map((q, idx) => (
              <div key={q}>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  {idx + 1}. {q}
                </label>
                <textarea
                  rows={2}
                  value={peerAnswers[idx] || ''}
                  onChange={(e) => setPeerAnswers((prev) => ({ ...prev, [idx]: e.target.value }))}
                  className="w-full rounded-lg border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-[#09090B] px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100"
                />
              </div>
            ))}
            <button
              type="submit"
              className="w-full py-2.5 rounded-lg bg-[#C8A24A] text-zinc-950 text-xs font-semibold cursor-pointer"
            >
              Save Weekly Audit (+50 XP)
            </button>
          </form>

          <div className="lg:col-span-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111114] p-6 space-y-4">
            <h2 className="text-xl font-display font-semibold text-zinc-900 dark:text-white">
              Past Independence Audits
            </h2>
            {peerLogs.length === 0 ? (
              <p className="text-sm text-zinc-500">No audits logged yet.</p>
            ) : (
              <div className="space-y-4 max-h-[540px] overflow-y-auto">
                {peerLogs.map((log) => (
                  <div
                    key={log.id}
                    className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#18181C] p-4 space-y-2 text-xs"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-mono text-[#9A7420] dark:text-[#C8A24A]">{log.title}</span>
                      <button
                        type="button"
                        onClick={() => void deleteThinkerEntry(log.id)}
                        className="text-zinc-400 hover:text-red-400 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="whitespace-pre-wrap text-zinc-700 dark:text-zinc-300 leading-relaxed">
                      {log.notes}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECTION E: COMMUNICATION & WISDOM */}
      {tab === 'communication' && (
        <div className="grid lg:grid-cols-12 gap-6">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void addThinkerEntry(
                {
                  section: 'communication',
                  title: `Communication Check (${commChecked.length}/${COMMUNICATION_HABITS.length})`,
                  category: commChecked.join(', ') || 'Reflection',
                  notes: commNotes.trim(),
                  date: todayIsoDate(),
                },
                { amount: 25, source: 'communication_check', desc: 'Logged Communication & Wisdom check-in' }
              );
              setCommChecked([]);
              setCommNotes('');
            }}
            className="lg:col-span-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111114] p-6 space-y-4"
          >
            <h2 className="text-xl font-display font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-[#C8A24A]" />
              Communication &amp; Wisdom
            </h2>
            <div className="space-y-2">
              {COMMUNICATION_HABITS.map((habit) => {
                const checked = commChecked.includes(habit);
                return (
                  <button
                    key={habit}
                    type="button"
                    onClick={() =>
                      setCommChecked((prev) =>
                        checked ? prev.filter((x) => x !== habit) : [...prev, habit]
                      )
                    }
                    className={`w-full flex items-center gap-3 p-3 rounded-lg border text-left text-sm cursor-pointer ${
                      checked
                        ? 'border-[#C8A24A] bg-[#C8A24A]/10 text-zinc-900 dark:text-white'
                        : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#18181C] text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    <CheckCircle2
                      className={`w-4 h-4 shrink-0 ${checked ? 'text-[#C8A24A]' : 'text-zinc-400'}`}
                    />
                    <span>{habit}</span>
                  </button>
                );
              })}
            </div>
            <textarea
              rows={3}
              maxLength={6000}
              value={commNotes}
              onChange={(e) => setCommNotes(e.target.value)}
              placeholder="Reflect on a conversation today—did you pause, speak truthfully, and avoid needless arguments?"
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-[#09090B] px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100"
            />
            <button
              type="submit"
              className="w-full py-2.5 rounded-lg bg-[#C8A24A] text-zinc-950 text-xs font-semibold cursor-pointer"
            >
              Log Communication Check-In
            </button>
          </form>

          <div className="lg:col-span-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111114] p-6 space-y-4">
            <h2 className="text-xl font-display font-semibold text-zinc-900 dark:text-white">
              Communication Log
            </h2>
            {commLogs.length === 0 ? (
              <p className="text-sm text-zinc-500">No communication check-ins yet.</p>
            ) : (
              <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {commLogs.map((c) => (
                  <div key={c.id} className="py-3.5 flex items-start justify-between gap-2 text-xs">
                    <div className="space-y-1">
                      <p className="font-mono text-[#9A7420] dark:text-[#C8A24A]">
                        {c.date} · {c.title}
                      </p>
                      {c.category && <p className="text-zinc-500">{c.category}</p>}
                      {c.notes && <p className="text-sm text-zinc-700 dark:text-zinc-300">{c.notes}</p>}
                    </div>
                    <button
                      type="button"
                      onClick={() => void deleteThinkerEntry(c.id)}
                      className="text-zinc-400 hover:text-red-400 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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
