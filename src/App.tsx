import React, { useState } from 'react';
import {
  BarChart3,
  BookMarked,
  BookOpen,
  Calendar,
  Code2,
  Compass,
  LayoutDashboard,
  Menu,
  MessageSquare,
  Settings,
  ShieldAlert,
  Swords,
  Trophy,
  X,
} from 'lucide-react';
import { RebirthProvider, useRebirth } from './context/RebirthContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AuthScreen } from './components/AuthScreen';
import { EmergencyHelpModal } from './components/EmergencyHelpModal';
import { OfflineIndicator, PWAInstallButton } from './components/PWAComponents';
import { DashboardView } from './components/DashboardView';
import { BuilderPillarView } from './components/BuilderPillarView';
import { FaithPillarView } from './components/FaithPillarView';
import { ThinkerPillarView } from './components/ThinkerPillarView';
import { MentorView } from './components/MentorView';
import { BattleRoomView } from './components/BattleRoomView';
import { PlannerView } from './components/PlannerView';
import { AnalyticsView } from './components/AnalyticsView';
import { VaultView } from './components/VaultView';
import { GamificationView } from './components/GamificationView';
import { SettingsView } from './components/SettingsView';
import { getRankForXp, type AppView } from './types/rebirth';

const NAV_ITEMS: Array<{ id: AppView; label: string; icon: React.ComponentType<{ className?: string }> }> = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'builder', label: 'The Builder', icon: Code2 },
  { id: 'faith', label: 'Man of God', icon: BookOpen },
  { id: 'thinker', label: 'The Thinker', icon: Compass },
  { id: 'mentor', label: 'The Mentor', icon: MessageSquare },
  { id: 'battle', label: 'Battle Room', icon: Swords },
  { id: 'planner', label: 'Daily Planner', icon: Calendar },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'vault', label: 'Knowledge Vault', icon: BookMarked },
  { id: 'ranks', label: 'Ranks & XP', icon: Trophy },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const Shell: React.FC = () => {
  const {
    user,
    authReady,
    emailVerified,
    profile,
    activeView,
    setActiveView,
    setEmergencyOpen,
  } = useRebirth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!authReady) {
    return (
      <div className="min-h-screen bg-[#09090B] text-zinc-300 flex items-center justify-center">
        <div className="text-center space-y-2">
          <p className="font-display text-2xl text-white">PROJECT REBIRTH</p>
          <p className="text-xs font-mono text-[#C8A24A] tracking-widest uppercase">
            Jishinde Ushinde
          </p>
        </div>
      </div>
    );
  }

  if (!user || !emailVerified) {
    return <AuthScreen />;
  }

  const rank = getRankForXp(profile?.xp ?? 0);
  const currentTitle = NAV_ITEMS.find((n) => n.id === activeView)?.label || 'Dashboard';

  const navigateTo = (view: AppView) => {
    setActiveView(view);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#F8F7F4] dark:bg-[#09090B] text-zinc-900 dark:text-zinc-100 flex flex-col lg:flex-row">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:shrink-0 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0C0C0F] min-h-screen sticky top-0 h-screen">
        <div className="px-6 py-5 border-b border-zinc-200 dark:border-zinc-800">
          <button
            type="button"
            onClick={() => navigateTo('dashboard')}
            className="text-left cursor-pointer"
          >
            <p className="font-display text-xl font-semibold tracking-wide text-zinc-900 dark:text-white whitespace-nowrap">
              PROJECT REBIRTH
            </p>
            <p className="text-[11px] font-mono text-[#9A7420] dark:text-[#C8A24A] mt-0.5">
              JISHINDE USHINDE
            </p>
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto" aria-label="Main navigation">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = activeView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => navigateTo(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                  active
                    ? 'bg-[#C8A24A]/15 text-[#9A7420] dark:text-[#C8A24A] font-semibold'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-[#18181C]'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 space-y-3">
          <button
            type="button"
            onClick={() => setEmergencyOpen(true)}
            className="w-full inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-red-600/15 border border-red-500/40 text-red-500 dark:text-red-400 text-xs font-semibold hover:bg-red-600/25 transition-colors cursor-pointer"
          >
            <ShieldAlert className="w-4 h-4" />
            I Need Help Right Now
          </button>
          <div className="text-xs space-y-0.5">
            <p className="font-medium text-zinc-900 dark:text-zinc-200 truncate">
              {profile?.displayName || 'Evans'}
            </p>
            <p className="font-mono text-[11px] text-zinc-500 tabular-nums">
              L{rank.current.level} · {(profile?.xp ?? 0).toLocaleString()} XP
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar (Desktop & Mobile) */}
        <header className="sticky top-0 z-30 h-14 px-4 sm:px-6 border-b border-zinc-200 dark:border-zinc-800 bg-white/90 dark:bg-[#09090B]/90 backdrop-blur-md flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation menu"
              className="lg:hidden min-h-[44px] min-w-[44px] -ml-2 flex items-center justify-center text-zinc-700 dark:text-zinc-200 cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
              {currentTitle}
            </span>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <PWAInstallButton compact />
            <button
              type="button"
              onClick={() => setEmergencyOpen(true)}
              className="lg:hidden inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-semibold whitespace-nowrap cursor-pointer"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              Help Now
            </button>
          </div>
        </header>

        {/* Active View Viewport */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 lg:pb-10">
          {activeView === 'dashboard' && <DashboardView />}
          {activeView === 'builder' && <BuilderPillarView />}
          {activeView === 'faith' && <FaithPillarView />}
          {activeView === 'thinker' && <ThinkerPillarView />}
          {activeView === 'mentor' && <MentorView />}
          {activeView === 'battle' && <BattleRoomView />}
          {activeView === 'planner' && <PlannerView />}
          {activeView === 'analytics' && <AnalyticsView />}
          {activeView === 'vault' && <VaultView />}
          {activeView === 'ranks' && <GamificationView />}
          {activeView === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Mobile Bottom Tab Bar (5 Core Destinations) */}
      <nav
        aria-label="Mobile navigation"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-[#0C0C0F]/95 backdrop-blur-md grid grid-cols-5 h-16 pb-safe"
      >
        {(
          [
            { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
            { id: 'builder', label: 'Builder', icon: Code2 },
            { id: 'mentor', label: 'Mentor', icon: MessageSquare },
            { id: 'battle', label: 'Battle', icon: Swords },
            { id: 'planner', label: 'Planner', icon: Calendar },
          ] as const
        ).map((tab) => {
          const Icon = tab.icon;
          const active = activeView === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => navigateTo(tab.id)}
              className={`flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium cursor-pointer ${
                active ? 'text-[#9A7420] dark:text-[#C8A24A]' : 'text-zinc-500'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Mobile Full Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex">
          <div className="w-72 bg-white dark:bg-[#0C0C0F] h-full border-r border-zinc-200 dark:border-zinc-800 flex flex-col">
            <div className="px-5 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <p className="font-display text-lg font-semibold text-zinc-900 dark:text-white">
                  PROJECT REBIRTH
                </p>
                <p className="text-[10px] font-mono text-[#C8A24A]">JISHINDE USHINDE</p>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close navigation menu"
                className="min-h-[44px] min-w-[44px] flex items-center justify-center text-zinc-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 p-3 space-y-1 overflow-y-auto">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const active = activeView === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => navigateTo(item.id)}
                    className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-lg text-sm font-medium cursor-pointer ${
                      active
                        ? 'bg-[#C8A24A]/15 text-[#9A7420] dark:text-[#C8A24A]'
                        : 'text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
        </div>
      )}

      <EmergencyHelpModal />
      <OfflineIndicator />
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <RebirthProvider>
        <Shell />
      </RebirthProvider>
    </ErrorBoundary>
  );
}
