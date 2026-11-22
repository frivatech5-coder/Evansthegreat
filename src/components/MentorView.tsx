import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  MessageSquarePlus,
  RotateCcw,
  Send,
  Shield,
  Trash2,
} from 'lucide-react';
import {
  addDoc,
  collection,
  onSnapshot,
  query,
  serverTimestamp,
  where,
} from 'firebase/firestore';
import { useRebirth } from '../context/RebirthContext';
import { clampStr, db, handleFirestoreError, OperationType } from '../lib/firebase';
import type { MentorMessage, MentorMode } from '../types/rebirth';

const MODES: Array<{ mode: MentorMode; subtitle: string; starter: string }> = [
  { mode: 'CLEAR MY MIND', subtitle: 'Organize scattered thoughts', starter: 'My head feels crowded right now. Help me sort out what actually matters today.' },
  { mode: 'DAILY CHECK-IN', subtitle: 'Review your day honestly', starter: 'Let\'s review how my day went across discipline, study, and character.' },
  { mode: 'ACCOUNTABILITY', subtitle: 'Confront excuses directly', starter: 'I have been procrastinating on a commitment. Ask me hard, honest questions.' },
  { mode: 'FAITH AND WISDOM', subtitle: 'Discuss biblical principles', starter: 'How can I apply biblical wisdom to a challenge I am facing right now?' },
  { mode: 'BUSINESS AND WEALTH', subtitle: 'Think strategically', starter: 'Help me evaluate a skill or project idea for creating real value.' },
  { mode: 'DECISION ROOM', subtitle: 'Analyze a hard choice', starter: 'I have a difficult decision to make and want to think through the consequences.' },
  { mode: 'EMOTIONAL SUPPORT', subtitle: 'Steady perspective', starter: 'I am carrying stress today and need help calming down and seeing clearly.' },
  { mode: 'CODING GUIDE', subtitle: 'Learn without shortcuts', starter: 'Explain a programming concept to me step-by-step and check my reasoning.' },
];

function formatMentorError(raw: string): string {
  let current = raw.trim();
  for (let depth = 0; depth < 3; depth++) {
    if (!current.startsWith('{')) break;
    try {
      const parsed = JSON.parse(current) as {
        error?: { message?: string; status?: string } | string;
        message?: string;
      };
      if (parsed.error && typeof parsed.error === 'object' && typeof parsed.error.message === 'string') {
        current = parsed.error.message.trim();
        continue;
      }
      if (typeof parsed.message === 'string') {
        current = parsed.message.trim();
        continue;
      }
      if (typeof parsed.error === 'string') {
        current = parsed.error.trim();
        continue;
      }
      break;
    } catch {
      break;
    }
  }
  if (
    current.toLowerCase().includes('high demand') ||
    current.toLowerCase().includes('unavailable')
  ) {
    return 'The Mentor AI service is temporarily experiencing high demand. Please retry in a few seconds.';
  }
  return current || 'Could not reach The Mentor. Check your connection and try again.';
}

interface FailedMentorTurn {
  chatId: string;
  userText: string;
  history: Array<{ role: 'user' | 'assistant'; content: string }>;
}

export const MentorView: React.FC = () => {
  const {
    user,
    profile,
    mentorChats,
    createMentorChat,
    updateMentorChatTitle,
    deleteMentorChat,
    mentorDraft,
    clearMentorDraft,
    projects,
    codingLogs,
  } = useRebirth();

  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [selectedMode, setSelectedMode] = useState<MentorMode>('CLEAR MY MIND');
  const [messages, setMessages] = useState<MentorMessage[]>([]);
  const [input, setInput] = useState('');
  const [streamingText, setStreamingText] = useState('');
  const [sending, setSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [failedTurn, setFailedTurn] = useState<FailedMentorTurn | null>(null);
  const [safetyAlert, setSafetyAlert] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const hasAutoSelectedRef = useRef(false);

  // Apply external draft when routed from Pillar One or elsewhere
  useEffect(() => {
    if (mentorDraft) {
      hasAutoSelectedRef.current = true;
      setSelectedMode(mentorDraft.mode);
      setInput(mentorDraft.prompt);
      setActiveChatId(null);
      clearMentorDraft();
    }
  }, [mentorDraft, clearMentorDraft]);

  // Default to latest chat only on initial load if none active and no draft
  useEffect(() => {
    if (!hasAutoSelectedRef.current && !activeChatId && mentorChats.length > 0 && !input) {
      hasAutoSelectedRef.current = true;
      setActiveChatId(mentorChats[0].id);
      setSelectedMode(mentorChats[0].mode);
    }
  }, [mentorChats, activeChatId, input]);

  // Listen to active chat messages (sorted client-side to avoid composite index dependency)
  useEffect(() => {
    if (!user || !activeChatId) {
      setMessages([]);
      return;
    }
    const pathStr = `users/${user.uid}/mentorChats/${activeChatId}/messages`;
    const q = query(
      collection(db, pathStr),
      where('userId', '==', user.uid)
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        const docs = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<MentorMessage, 'id'>),
        }));
        docs.sort((a, b) => {
          const ta =
            a.createdAt && typeof a.createdAt === 'object' && 'toMillis' in a.createdAt
              ? (a.createdAt as { toMillis: () => number }).toMillis()
              : Number.MAX_SAFE_INTEGER;
          const tb =
            b.createdAt && typeof b.createdAt === 'object' && 'toMillis' in b.createdAt
              ? (b.createdAt as { toMillis: () => number }).toMillis()
              : Number.MAX_SAFE_INTEGER;
          return ta - tb;
        });
        setMessages(docs);
      },
      (err) => handleFirestoreError(err, OperationType.LIST, pathStr)
    );
    return () => unsub();
  }, [user, activeChatId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, streamingText, sending]);

  const contextSummary = useMemo(() => {
    const activeProjs = projects.filter((p) => p.status === 'active').length;
    const hours = ((profile?.totalLearningMinutes || 0) / 60).toFixed(1);
    return `Streak: ${profile?.streakDays || 0} days, Learning hours: ${hours}h, Active projects: ${activeProjs}, Coding sessions logged: ${codingLogs.length}`;
  }, [profile, projects, codingLogs.length]);

  const handleNewChat = () => {
    hasAutoSelectedRef.current = true;
    setActiveChatId(null);
    setMessages([]);
    setSafetyAlert(false);
    setErrorMsg(null);
    setFailedTurn(null);
  };

  const handleDeleteChat = async (chatId: string) => {
    await deleteMentorChat(chatId);
    if (activeChatId === chatId) {
      hasAutoSelectedRef.current = true;
      setActiveChatId(null);
      setMessages([]);
      setFailedTurn(null);
      setErrorMsg(null);
    }
  };

  const requestMentorReply = async (
    chatId: string,
    userText: string,
    historyPayload: Array<{ role: 'user' | 'assistant'; content: string }>
  ) => {
    if (!user) return;
    const messagesPath = `users/${user.uid}/mentorChats/${chatId}/messages`;
    setErrorMsg(null);
    setFailedTurn(null);
    setSending(true);
    setStreamingText('');

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 45_000);

    try {
      const idToken = await user.getIdToken();
      const resp = await fetch('/api/mentor/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          mode: selectedMode,
          message: userText,
          history: historyPayload,
          contextSummary,
        }),
        signal: controller.signal,
      });

      if (!resp.ok) {
        const errData = (await resp.json().catch(() => ({}))) as { error?: string };
        throw new Error(
          formatMentorError(errData.error || `Mentor service returned ${resp.status}`)
        );
      }

      const reader = resp.body?.getReader();
      if (!reader) {
        throw new Error('Streaming response unavailable.');
      }

      const decoder = new TextDecoder();
      let buffer = '';
      let accumulated = '';
      let eventType = 'message';

      const processLine = (rawLine: string) => {
        const line = rawLine.trim();
        if (!line) {
          eventType = 'message';
          return;
        }
        if (line.startsWith('event:')) {
          eventType = line.slice(6).trim();
          return;
        }
        if (line.startsWith('data:')) {
          const jsonStr = line.slice(5).trim();
          let parsed: {
            text?: string;
            safetyAlert?: boolean;
            error?: string;
          } | null = null;
          try {
            parsed = JSON.parse(jsonStr) as {
              text?: string;
              safetyAlert?: boolean;
              error?: string;
            };
          } catch {
            // ignore partial json
          }
          if (parsed) {
            if (eventType === 'safety' || parsed.safetyAlert) {
              setSafetyAlert(true);
            }
            if (eventType === 'error' && parsed.error) {
              throw new Error(formatMentorError(parsed.error));
            }
            if (parsed.text) {
              accumulated += parsed.text;
              setStreamingText(accumulated);
            }
          }
        }
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        for (const rawLine of lines) {
          processLine(rawLine);
        }
      }
      if (buffer.trim()) {
        processLine(buffer);
      }

      if (!accumulated.trim()) {
        throw new Error('The Mentor did not return a response. Please click Retry.');
      }

      await addDoc(collection(db, messagesPath), {
        userId: user.uid,
        role: 'assistant',
        content: clampStr(accumulated, 16000),
        createdAt: serverTimestamp(),
      });
      setStreamingText('');
    } catch (err) {
      const isAbort = err instanceof DOMException && err.name === 'AbortError';
      const msg = isAbort
        ? 'The Mentor took too long to respond. Please click Retry.'
        : err instanceof Error
          ? formatMentorError(err.message)
          : 'Could not reach The Mentor. Check your connection and try again.';
      setErrorMsg(msg);
      setFailedTurn({ chatId, userText, history: historyPayload });
      setStreamingText('');
    } finally {
      window.clearTimeout(timeoutId);
      setSending(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !input.trim() || sending) return;

    const userText = clampStr(input, 6000);
    setInput('');
    setErrorMsg(null);
    setFailedTurn(null);
    setSending(true);
    setStreamingText('');

    try {
      let chatId = activeChatId;
      if (!chatId) {
        chatId = await createMentorChat(selectedMode, userText.slice(0, 80));
        setActiveChatId(chatId);
      } else {
        const cur = mentorChats.find((c) => c.id === chatId);
        if (cur && cur.mode !== selectedMode) {
          await updateMentorChatTitle(chatId, cur.title, selectedMode);
        }
      }

      const messagesPath = `users/${user.uid}/mentorChats/${chatId}/messages`;
      await addDoc(collection(db, messagesPath), {
        userId: user.uid,
        role: 'user',
        content: userText,
        createdAt: serverTimestamp(),
      });

      const historyPayload = messages.slice(-12).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      await requestMentorReply(chatId, userText, historyPayload);
    } catch (err) {
      setErrorMsg(
        err instanceof Error
          ? formatMentorError(err.message)
          : 'Could not save your message. Please try again.'
      );
      setSending(false);
    }
  };

  const activeModeDef = MODES.find((m) => m.mode === selectedMode) || MODES[0];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <div>
          <p className="text-xs font-mono uppercase tracking-[0.18em] text-[#9A7420] dark:text-[#C8A24A]">
            Conversational Guidance
          </p>
          <h1 className="text-3xl font-display font-semibold text-zinc-900 dark:text-white mt-1">
            THE MENTOR
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Private, honest conversation to organize thoughts, confront excuses, and plan practical next steps. Not a substitute for God, pastors, counselors, or trusted human friends.
          </p>
        </div>
        <button
          type="button"
          onClick={handleNewChat}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#C8A24A] text-zinc-950 text-xs font-semibold hover:bg-[#d6b25e] whitespace-nowrap shrink-0 cursor-pointer"
        >
          <MessageSquarePlus className="w-4 h-4" />
          New Conversation
        </button>
      </div>

      <div className="grid lg:grid-cols-12 gap-6 items-start">
        {/* Left Thread & Privacy Sidebar */}
        <aside className="lg:col-span-3 space-y-4">
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111114] p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-zinc-900 dark:text-white">
                Private History
              </p>
              <span className="text-xs font-mono text-zinc-500">{mentorChats.length}</span>
            </div>

            {mentorChats.length === 0 ? (
              <p className="text-xs text-zinc-500 py-3">
                No saved conversations yet. Start typing to open a private thread.
              </p>
            ) : (
              <div className="space-y-1.5 max-h-72 overflow-y-auto">
                {mentorChats.map((chat) => (
                  <div
                    key={chat.id}
                    className={`flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-xs transition-colors ${
                      activeChatId === chat.id
                        ? 'border-[#C8A24A] bg-[#C8A24A]/10 text-zinc-900 dark:text-white'
                        : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-[#18181C]'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setActiveChatId(chat.id);
                        setSelectedMode(chat.mode);
                        setSafetyAlert(false);
                        setErrorMsg(null);
                        setFailedTurn(null);
                      }}
                      className="text-left flex-1 min-w-0 cursor-pointer"
                    >
                      <p className="font-medium truncate">{chat.title}</p>
                      <p className="text-[11px] text-zinc-500 truncate">{chat.mode}</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleDeleteChat(chat.id)}
                      aria-label={`Delete conversation ${chat.title}`}
                      className="text-zinc-400 hover:text-red-400 p-1 shrink-0 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-500 flex items-start gap-2">
              <Shield className="w-3.5 h-3.5 text-[#C8A24A] shrink-0 mt-0.5" />
              <span>
                Conversations are stored privately under your authenticated account and can be deleted permanently at any time.
              </span>
            </div>
          </div>
        </aside>

        {/* Main Chat Area */}
        <div className="lg:col-span-9 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111114] flex flex-col min-h-[560px]">
          {/* Mode Selector */}
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 space-y-2">
            <p className="text-[11px] font-mono uppercase tracking-wider text-zinc-500">
              Conversation Mode · {activeModeDef.subtitle}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {MODES.map((m) => (
                <button
                  key={m.mode}
                  type="button"
                  onClick={() => setSelectedMode(m.mode)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    selectedMode === m.mode
                      ? 'bg-[#C8A24A] text-zinc-950 font-semibold'
                      : 'bg-zinc-100 dark:bg-[#18181C] text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800'
                  }`}
                >
                  {m.mode}
                </button>
              ))}
            </div>
          </div>

          {/* Safety Alert Banner */}
          {safetyAlert && (
            <div className="mx-4 mt-4 rounded-lg border border-red-500/50 bg-red-950/30 p-4 text-xs text-red-100 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold text-sm">Immediate Human Support Matters</p>
                <p className="leading-relaxed">
                  If you are experiencing thoughts of self-harm, danger, or abuse, please speak immediately with a trusted parent, guardian, mentor, or contact your local emergency services right now.
                </p>
              </div>
            </div>
          )}

          {/* Messages Stream */}
          <div className="flex-1 p-5 space-y-4 overflow-y-auto max-h-[460px]">
            {messages.length === 0 && !streamingText ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-10 space-y-4">
                <div className="space-y-1 max-w-md">
                  <p className="font-display text-2xl font-semibold text-zinc-900 dark:text-white">
                    Speak honestly. Think clearly.
                  </p>
                  <p className="text-xs text-zinc-500 leading-relaxed">
                    Share what is on your mind—temptation, confusion, faith, school, code, money, or peer pressure. The Mentor will listen first and ask sharp questions.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setInput(activeModeDef.starter)}
                  className="px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 text-xs text-zinc-700 dark:text-zinc-300 hover:border-[#C8A24A] cursor-pointer"
                >
                  Use Starter: &ldquo;{activeModeDef.starter}&rdquo;
                </button>
              </div>
            ) : (
              <>
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                        msg.role === 'user'
                          ? 'bg-[#C8A24A] text-zinc-950 font-medium'
                          : 'border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#18181C] text-zinc-800 dark:text-zinc-100'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
                {streamingText && (
                  <div className="flex justify-start">
                    <div className="max-w-[85%] rounded-xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#18181C] text-zinc-800 dark:text-zinc-100">
                      {streamingText}
                    </div>
                  </div>
                )}
                {sending && !streamingText && (
                  <div className="flex justify-start">
                    <div className="rounded-xl px-4 py-3 text-xs font-mono text-zinc-500 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#18181C]">
                      The Mentor is reflecting...
                    </div>
                  </div>
                )}
              </>
            )}
            <div ref={bottomRef} />
          </div>

          {errorMsg && (
            <div className="mx-4 mb-2 rounded-lg border border-red-500/40 bg-red-950/20 px-3.5 py-2.5 text-xs text-red-400 flex items-center justify-between gap-3">
              <span>{errorMsg}</span>
              {failedTurn && (
                <button
                  type="button"
                  disabled={sending}
                  onClick={() =>
                    void requestMentorReply(
                      failedTurn.chatId,
                      failedTurn.userText,
                      failedTurn.history
                    )
                  }
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-red-400/50 text-red-200 hover:bg-red-500/20 disabled:opacity-50 shrink-0 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Retry
                </button>
              )}
            </div>
          )}

          {/* Input Composer */}
          <form
            onSubmit={(e) => void handleSend(e)}
            className="p-4 border-t border-zinc-200 dark:border-zinc-800 flex items-end gap-3"
          >
            <textarea
              rows={2}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  void handleSend(e);
                }
              }}
              maxLength={6000}
              placeholder={`Message The Mentor (${selectedMode})...`}
              className="flex-1 rounded-lg border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-[#09090B] px-3.5 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-[#C8A24A] resize-none"
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              className="min-h-[44px] px-5 rounded-lg bg-[#C8A24A] text-zinc-950 text-xs font-semibold hover:bg-[#d6b25e] disabled:opacity-50 inline-flex items-center gap-2 shrink-0 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              {sending ? 'Thinking...' : 'Send'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
