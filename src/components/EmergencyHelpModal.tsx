import React, { useEffect, useState } from 'react';
import { Phone, ShieldAlert, Timer, Wind, X, CheckCircle2 } from 'lucide-react';
import { EMERGENCY_ALTERNATIVES } from '../data/curriculum';
import { useRebirth } from '../context/RebirthContext';

const BREATH_PHASES = [
  { label: 'Inhale Slowly', seconds: 4, hint: 'Breathe in deeply through your nose' },
  { label: 'Hold Steady', seconds: 7, hint: 'Calm your nervous system' },
  { label: 'Exhale Completely', seconds: 8, hint: 'Release tension through your mouth' },
];

export const EmergencyHelpModal: React.FC = () => {
  const { emergencyOpen, setEmergencyOpen, profile, addBattleLog, setActiveView } = useRebirth();
  const [breathingActive, setBreathingActive] = useState(false);
  const [breathState, setBreathState] = useState({
    phaseIdx: 0,
    counter: BREATH_PHASES[0].seconds,
  });

  const [activityTimerActive, setActivityTimerActive] = useState(false);
  const [activitySecondsLeft, setActivitySecondsLeft] = useState(15 * 60);
  const [selectedAlternative, setSelectedAlternative] = useState(EMERGENCY_ALTERNATIVES[0].title);
  const [reflectionText, setReflectionText] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (!breathingActive) return;
    const id = window.setInterval(() => {
      setBreathState((prev) => {
        if (prev.counter > 1) {
          return { ...prev, counter: prev.counter - 1 };
        }
        const nextPhaseIdx = (prev.phaseIdx + 1) % BREATH_PHASES.length;
        return {
          phaseIdx: nextPhaseIdx,
          counter: BREATH_PHASES[nextPhaseIdx].seconds,
        };
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [breathingActive]);

  useEffect(() => {
    if (!activityTimerActive) return;
    const id = window.setInterval(() => {
      setActivitySecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => window.clearInterval(id);
  }, [activityTimerActive]);

  if (!emergencyOpen) return null;

  const mins = String(Math.floor(activitySecondsLeft / 60)).padStart(2, '0');
  const secs = String(activitySecondsLeft % 60).padStart(2, '0');
  const currentPhase = BREATH_PHASES[breathState.phaseIdx];

  const handleSaveReset = async (e: React.FormEvent) => {
    e.preventDefault();
    await addBattleLog({
      entryType: 'emergency_reset',
      habitName: 'Emergency Grounding Reset',
      alternativeAction: selectedAlternative,
      lesson: reflectionText.trim() || 'Used Battle Room emergency protocol to step back and regain clarity.',
    });
    setSavedSuccess(true);
    setReflectionText('');
    setTimeout(() => {
      setSavedSuccess(false);
      setEmergencyOpen(false);
    }, 1400);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="emergency-title"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
    >
      <div className="w-full max-w-2xl rounded-xl border border-zinc-700 bg-[#111114] text-zinc-100 shadow-2xl my-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-5 h-5 text-[#C8A24A]" />
            <h2 id="emergency-title" className="text-xl font-display font-semibold text-white">
              Battle Room Emergency Reset
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setEmergencyOpen(false)}
            aria-label="Close emergency reset"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[82vh] overflow-y-auto">
          <div className="rounded-lg border border-[#C8A24A]/30 bg-[#C8A24A]/5 p-4 text-sm text-zinc-200 leading-relaxed">
            <strong>Pause. No shame.</strong> An urge is a temporary wave, not a command. Your worth is never defined by a streak or temptation. Follow these five steps slowly.
          </div>

          {/* Step 1: Leave triggering environment */}
          <div className="rounded-lg border border-zinc-800 bg-[#18181C] p-4 space-y-1.5">
            <p className="text-xs font-mono text-[#C8A24A] uppercase tracking-wider">
              Step 1 · Change Your Physical Environment
            </p>
            <p className="text-sm text-zinc-200">
              Stand up right now. Put your phone down or carry it into an open shared space. Open a window, walk outside, or step away from the room where the urge started.
            </p>
          </div>

          {/* Step 2: Breathing Exercise */}
          <div className="rounded-lg border border-zinc-800 bg-[#18181C] p-4 space-y-3">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-mono text-[#C8A24A] uppercase tracking-wider flex items-center gap-1.5">
                  <Wind className="w-3.5 h-3.5" />
                  Step 2 · 4-7-8 Calming Breath
                </p>
                <p className="text-sm text-zinc-300 mt-1">
                  {breathingActive ? `${currentPhase.label} — ${currentPhase.hint}` : 'Slow your heart rate for 60 seconds before making any decision.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setBreathingActive((b) => !b);
                  setBreathState({
                    phaseIdx: 0,
                    counter: BREATH_PHASES[0].seconds,
                  });
                }}
                className="px-4 py-2 rounded-lg bg-[#C8A24A] text-zinc-950 text-xs font-semibold hover:bg-[#d6b25e] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                {breathingActive ? 'Pause Breath' : 'Start Breathing'}
              </button>
            </div>
            {breathingActive && (
              <div className="flex items-center gap-4 pt-2">
                <div className="w-16 h-16 rounded-full border-2 border-[#C8A24A] flex items-center justify-center font-mono text-2xl font-semibold text-white tabular-nums">
                  {breathState.counter}
                </div>
                <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#C8A24A] transition-all duration-500"
                    style={{
                      width: `${Math.round(((currentPhase.seconds - breathState.counter + 1) / currentPhase.seconds) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Step 3: 15-Minute Alternative Activity */}
          <div className="rounded-lg border border-zinc-800 bg-[#18181C] p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-mono text-[#C8A24A] uppercase tracking-wider flex items-center gap-1.5">
                  <Timer className="w-3.5 h-3.5" />
                  Step 3 · 15-Minute Alternative Action
                </p>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Commit to waiting 15 minutes while doing one intentional replacement activity.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-lg font-semibold text-white tabular-nums">
                  {mins}:{secs}
                </span>
                <button
                  type="button"
                  onClick={() => setActivityTimerActive((a) => !a)}
                  className="px-3 py-1.5 rounded-lg border border-zinc-700 text-xs font-medium text-zinc-200 hover:bg-zinc-800 cursor-pointer"
                >
                  {activityTimerActive ? 'Pause' : 'Start 15m'}
                </button>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-2">
              {EMERGENCY_ALTERNATIVES.map((alt) => (
                <button
                  key={alt.title}
                  type="button"
                  onClick={() => setSelectedAlternative(alt.title)}
                  className={`text-left p-3 rounded-lg border text-xs transition-colors cursor-pointer ${
                    selectedAlternative === alt.title
                      ? 'border-[#C8A24A] bg-[#C8A24A]/10 text-white'
                      : 'border-zinc-800 bg-[#111114] text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <p className="font-semibold text-zinc-100">{alt.title}</p>
                  <p className="mt-1 leading-relaxed">{alt.detail}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Step 4: Contact a trusted person */}
          <div className="rounded-lg border border-zinc-800 bg-[#18181C] p-4 flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-xs font-mono text-[#C8A24A] uppercase tracking-wider flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5" />
                Step 4 · Reach Out to a Trusted Person
              </p>
              {profile?.trustedContactName ? (
                <p className="text-sm text-zinc-200">
                  Trusted contact: <strong>{profile.trustedContactName}</strong>{' '}
                  {profile.trustedContactPhone ? `(${profile.trustedContactPhone})` : ''}
                </p>
              ) : (
                <p className="text-sm text-zinc-400">
                  Call a parent, pastor, mentor, or close friend—or add a trusted contact in Settings.
                </p>
              )}
            </div>
            {profile?.trustedContactPhone ? (
              <a
                href={`tel:${profile.trustedContactPhone}`}
                className="px-4 py-2 rounded-lg border border-[#C8A24A]/60 text-xs font-semibold text-[#C8A24A] hover:bg-[#C8A24A]/10 whitespace-nowrap"
              >
                Call {profile.trustedContactName || 'Contact'}
              </a>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setEmergencyOpen(false);
                  setActiveView('settings');
                }}
                className="px-4 py-2 rounded-lg border border-zinc-700 text-xs font-medium text-zinc-200 hover:bg-zinc-800 whitespace-nowrap cursor-pointer"
              >
                Set Trusted Contact
              </button>
            )}
          </div>

          {/* Step 5: Private Reflection Space */}
          <form onSubmit={(e) => void handleSaveReset(e)} className="space-y-3">
            <label className="block text-xs font-mono text-[#C8A24A] uppercase tracking-wider">
              Step 5 · Private Reflection (Stored Securely)
            </label>
            <textarea
              value={reflectionText}
              onChange={(e) => setReflectionText(e.target.value)}
              rows={3}
              maxLength={2000}
              placeholder="What triggered this moment? What am I feeling right now, and what is the honest next step?"
              className="w-full rounded-lg border border-zinc-800 bg-[#09090B] px-3.5 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-[#C8A24A]"
            />
            <div className="flex items-center justify-between gap-3">
              {savedSuccess ? (
                <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                  <CheckCircle2 className="w-4 h-4" />
                  Recorded privately. Stay steady.
                </span>
              ) : (
                <span className="text-xs text-zinc-500">
                  If you are in danger or crisis, contact a trusted adult or local emergency services immediately.
                </span>
              )}
              <button
                type="submit"
                className="px-5 py-2.5 rounded-lg bg-[#C8A24A] text-zinc-950 text-xs font-semibold hover:bg-[#d6b25e] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Save & Log Victory
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
