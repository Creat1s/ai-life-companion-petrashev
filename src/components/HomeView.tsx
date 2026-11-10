import React, { useState } from 'react';
import {
  Mic,
  Send,
  Plus,
  CheckCircle2,
  Circle,
  Calendar,
  ShieldAlert,
  Utensils,
  Heart,
  Moon,
  Gamepad2,
  Trash2,
  Sparkles,
  Car,
  PhoneCall,
  MessageCircle,
  Share2,
  HeartPulse,
  Brain,
  HardDriveDownload,
  MapPin,
  Music,
  Radio,
  Search,
  Database,
  Flame,
  Zap,
  Trophy,
  ChevronRight,
  HelpCircle,
} from 'lucide-react';
import { FreeSuiteTab } from './FreeAiSuiteModal';
import {
  ApprovalRequest,
  CalendarEvent,
  CompanionState,
  DesignStyle,
  HealthWellnessState,
  InventoryItem,
  MainTab,
  MessengerThreadItem,
  PersonaTrainingConfig,
  ReminderItem,
  UserSettings,
} from '../types/companion';
import { translations } from '../data/i18n';
import { CompanionEvent } from '../engine/companionReducer';
import { SuperHubTab } from '../engine/intentRouter';
import { CompanionCanvas } from './CompanionCanvas';
import { playSound } from '../engine/audioEffects';

interface HomeViewProps {
  companion: CompanionState;
  settings: UserSettings;
  inventory: InventoryItem[];
  reminders: ReminderItem[];
  calendar: CalendarEvent[];
  calendarAllowed: boolean;
  approvals: ApprovalRequest[];
  isListening: boolean;
  partialTranscript: string;
  messengerThreads?: MessengerThreadItem[];
  health?: HealthWellnessState;
  persona?: PersonaTrainingConfig;
  onDispatchCompanion: (event: CompanionEvent) => void;
  onRunCommand: (text: string, source: 'text' | 'voice') => void;
  onToggleVoice: () => void;
  onCreateReminderForm: (title: string, timeStr: string) => void;
  onToggleReminder: (id: string) => void;
  onDeleteReminder: (id: string) => void;
  onNavigate: (tab: MainTab) => void;
  onOpenApprovals: () => void;
  onGenerateDailyPlan?: () => void;
  onOpenSuperHub?: (tab: SuperHubTab) => void;
  onOpenSourceDownload?: () => void;
  onOpenFreeSuite?: (tab: FreeSuiteTab) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  companion,
  settings,
  inventory,
  reminders,
  calendar,
  calendarAllowed,
  approvals,
  isListening,
  messengerThreads = [],
  health,
  persona,
  onDispatchCompanion,
  onRunCommand,
  onToggleVoice,
  onCreateReminderForm,
  onToggleReminder,
  onDeleteReminder,
  onNavigate,
  onOpenApprovals,
  onGenerateDailyPlan,
  onOpenSuperHub,
  onOpenSourceDownload,
  onOpenFreeSuite,
}) => {
  const t = translations[settings.locale].home;
  const moodLabels = translations[settings.locale].moods;

  const isAdmin = settings.uiMode === 'admin';
  const style: DesignStyle = settings.designStyle || 'game';
  const isGame = style === 'game';

  const [cmdText, setCmdText] = useState('');
  const [remTitle, setRemTitle] = useState('');
  const [remTime, setRemTime] = useState('09:00');

  const handleCmdSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cmdText.trim()) return;
    onRunCommand(cmdText, 'text');
    setCmdText('');
  };

  const handleReminderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!remTitle.trim()) return;
    onCreateReminderForm(remTitle.trim(), remTime);
    setRemTitle('');
  };

  const xpIntoLevel = companion.xp % 100;
  const pendingMessagesCount = messengerThreads.filter(
    (m) => m.status === 'pending_confirm'
  ).length;
  const completedRemindersCount = reminders.filter((r) => r.completed).length;

  const companionDisplayName =
    companion.avatarId === 'lumi'
      ? 'Люми'
      : companion.avatarId === 'shadow'
        ? 'Шэдоу'
        : 'Нова';

  // Friendly Duolingo-style conversational greeting bubble
  const companionSpeechBubble =
    companion.animation === 'listen'
      ? 'Внимательно слушаю тебя! Скажи любую команду...'
      : companion.animation === 'speak'
        ? 'Выполняю твоё поручение и делюсь ответом!'
        : companion.mood === 'tired'
          ? 'Немного хочется отдохнуть... Нажми «Отдых» или давай составим спокойный план дня!'
          : pendingMessagesCount > 0
            ? `Привет! Я подготовил ${pendingMessagesCount} черновика ответов в мессенджерах и готов помочь с делами.`
            : 'Привет! Рад тебя видеть. Чем займёмся сейчас: задачами, звонками или музыкой?';

  // ============================================================================
  // USER MODE: CLEAN DUOLINGO GAME DESIGN & WEB 3.0 SPATIAL EXPERIENCE
  // ============================================================================
  if (!isAdmin) {
    const surfaceCardClass = isGame
      ? 'rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 border-b-4 border-b-slate-300 dark:border-b-slate-950 shadow-sm'
      : 'rounded-3xl bg-white/80 dark:bg-slate-900/65 backdrop-blur-xl border border-indigo-500/20 dark:border-cyan-400/20 shadow-[0_12px_36px_-12px_rgba(79,70,229,0.22)]';

    const careBtnClass = isGame
      ? 'min-h-[54px] flex flex-col items-center justify-center gap-1 px-2.5 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 border-b-4 border-b-slate-300 dark:border-b-slate-950 hover:border-[#1CB0F6] active:border-b-2 active:translate-y-0.5 text-xs font-extrabold text-slate-800 dark:text-slate-100 transition-all cursor-pointer'
      : 'min-h-[54px] flex flex-col items-center justify-center gap-1 px-2.5 py-2.5 rounded-2xl bg-white/75 dark:bg-slate-900/70 backdrop-blur-lg border border-indigo-500/20 dark:border-cyan-400/25 hover:border-cyan-400/60 text-xs font-bold text-slate-800 dark:text-slate-100 shadow-sm transition-all cursor-pointer';

    return (
      <div className="space-y-6 pb-8">
        {/* Pending Approval Banner (if any action needs user confirmation) */}
        {approvals.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border-2 border-amber-400 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 px-5 py-3.5">
            <div className="flex items-center gap-3">
              <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {t.pendingApprovalBanner} ({approvals.length})
              </p>
            </div>
            <button
              type="button"
              onClick={onOpenApprovals}
              className="min-h-[40px] px-4 py-2 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-extrabold transition-colors cursor-pointer"
            >
              {t.reviewNow}
            </button>
          </div>
        )}

        {/* Main Hero Split: 3D Companion Stage (Left) + Clean Structured Modules & Quests (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch overflow-visible">
          {/* LEFT: 3D Companion Stage with Speech Bubble & Tactile Care Dock */}
          <div
            className={`lg:col-span-6 ${surfaceCardClass} p-5 sm:p-6 flex flex-col justify-between items-center relative overflow-visible`}
          >
            {/* Top Companion Identity & Progress Pill */}
            <div className="w-full flex items-center justify-between gap-3 z-20">
              <div className="flex items-center gap-2.5">
                <span
                  className={`px-3.5 py-1.5 rounded-2xl text-sm font-extrabold ${
                    isGame
                      ? 'bg-[#58CC02]/15 text-[#46A302] dark:text-[#58CC02]'
                      : 'bg-indigo-500/15 text-indigo-600 dark:text-cyan-300 border border-indigo-500/20'
                  }`}
                >
                  {companionDisplayName}
                </span>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span>Уровень {companion.level}</span>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onNavigate('world')}
                  className={`min-h-[38px] px-3.5 py-1.5 rounded-2xl text-xs font-extrabold transition-all cursor-pointer ${
                    isGame
                      ? 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 border-b-2 border-slate-300 dark:border-slate-950'
                      : 'bg-white/10 dark:bg-white/5 border border-indigo-500/30 text-indigo-600 dark:text-cyan-300 hover:bg-indigo-500/10'
                  }`}
                >
                  Герой и Комната
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('help')}
                  aria-label="Помощь"
                  title="Открыть раздел Помощь"
                  className="w-9 h-9 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-emerald-500 transition-colors cursor-pointer"
                >
                  <HelpCircle className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Duolingo / Web3 Conversational Speech Bubble */}
            <div
              className={`w-full mt-4 px-4 py-3 rounded-2xl text-xs sm:text-sm font-semibold text-left relative z-20 ${
                isGame
                  ? 'bg-slate-50 dark:bg-slate-950/90 border-2 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100'
                  : 'bg-indigo-950/30 dark:bg-slate-950/75 border border-cyan-400/25 text-slate-800 dark:text-slate-100 backdrop-blur-md'
              }`}
            >
              {companionSpeechBubble}
            </div>

            {/* Unclipped 3D Character Viewport (No debug bars or technical captions!) */}
            <div className="w-full flex-1 flex items-center justify-center my-1 overflow-visible">
              <CompanionCanvas
                avatarId={companion.avatarId}
                mood={companion.mood}
                animation={companion.animation}
                room={companion.room}
                inventory={inventory}
                batterySaver={settings.batterySaver}
                lowMemoryMode={settings.lowMemoryMode}
                reducedMotion={settings.reducedMotion}
                showDebugControls={false}
                onTapAvatar={() => {
                  playSound('tap');
                  onDispatchCompanion({ type: 'PET' });
                }}
              />
            </div>

            {/* 4 Tactile Companion Care Actions */}
            <div className="grid grid-cols-4 gap-2.5 w-full mt-2 z-20">
              <button
                type="button"
                onClick={() => {
                  playSound('happy');
                  onDispatchCompanion({ type: 'FEED' });
                }}
                className={careBtnClass}
              >
                <Utensils className="w-4 h-4 text-amber-500" />
                <span className="truncate">{t.feed}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  playSound('tap');
                  onDispatchCompanion({ type: 'PET' });
                }}
                className={careBtnClass}
              >
                <Heart className="w-4 h-4 text-rose-500" />
                <span className="truncate">{t.pet}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  playSound('tired');
                  onDispatchCompanion({ type: 'SLEEP' });
                }}
                className={careBtnClass}
              >
                <Moon className="w-4 h-4 text-indigo-500" />
                <span className="truncate">{t.sleep}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  playSound('curious');
                  onDispatchCompanion({ type: 'PLAY_START' });
                  onNavigate('world');
                }}
                className={careBtnClass}
              >
                <Gamepad2 className="w-4 h-4 text-emerald-500" />
                <span className="truncate">{t.play}</span>
              </button>
            </div>
          </div>

          {/* RIGHT: Clean Command Input + 4 Logical Section Blocks + Daily Quests */}
          <div className="lg:col-span-6 flex flex-col gap-5">
            {/* Block 1: Single Clean Voice & Text Command Launcher */}
            <div className={`${surfaceCardClass} p-5 sm:p-6 space-y-3.5`}>
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Скажите или напишите поручение
                </h2>
                {onGenerateDailyPlan && (
                  <button
                    type="button"
                    onClick={onGenerateDailyPlan}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                      isGame
                        ? 'bg-[#CE82FF] hover:bg-[#B865F0] text-white border-b-2 border-[#9A42D1]'
                        : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-sm'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>План дня</span>
                  </button>
                )}
              </div>

              <form onSubmit={handleCmdSubmit} className="flex flex-col sm:flex-row gap-2.5">
                <input
                  type="text"
                  value={cmdText}
                  onChange={(e) => setCmdText(e.target.value)}
                  placeholder="Напр.: Напомни позвонить маме, создай мелодию..."
                  className="flex-1 min-h-[46px] px-4 py-2.5 rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#1CB0F6]"
                />
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="submit"
                    className={`min-h-[46px] flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl text-white text-sm font-extrabold transition-all cursor-pointer ${
                      isGame
                        ? 'bg-[#58CC02] hover:bg-[#46A302] border-b-4 border-[#46A302] active:border-b-0 active:translate-y-0.5'
                        : 'bg-gradient-to-r from-indigo-600 to-cyan-500 shadow-lg shadow-indigo-500/25'
                    }`}
                  >
                    <Send className="w-4 h-4" />
                    <span>{t.send}</span>
                  </button>
                  <button
                    type="button"
                    onClick={onToggleVoice}
                    aria-pressed={isListening}
                    className={`min-h-[46px] inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-extrabold transition-all cursor-pointer ${
                      isListening
                        ? 'bg-rose-600 text-white animate-pulse'
                        : isGame
                          ? 'bg-[#1CB0F6] hover:bg-[#0098DB] text-white border-b-4 border-[#0088CC] active:border-b-0 active:translate-y-0.5'
                          : 'bg-slate-900 dark:bg-white/10 text-white border border-cyan-400/30 hover:bg-white/15'
                    }`}
                  >
                    <Mic className="w-4 h-4" />
                    <span className="hidden sm:inline">
                      {isListening ? t.listening : t.voiceCta}
                    </span>
                  </button>
                </div>
              </form>
            </div>

            {/* Block 2: 4 Clean Modular Section Cards (Replacing the 15-button clutter) */}
            <div className={`${surfaceCardClass} p-5 sm:p-6 space-y-4`}>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Основные разделы приложения
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Все функции сгруппированы по 4 тематическим направлениям
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate('insights')}
                  className="text-xs font-extrabold text-[#1CB0F6] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Все модули</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Module 1: Communication */}
                <button
                  type="button"
                  onClick={() =>
                    onOpenSuperHub ? onOpenSuperHub('calls') : onNavigate('insights')
                  }
                  className={`p-4 rounded-2xl text-left transition-all cursor-pointer flex items-start gap-3.5 ${
                    isGame
                      ? 'bg-emerald-500/10 hover:bg-emerald-500/15 border-2 border-emerald-500/30 border-b-4'
                      : 'bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-400/25'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
                    <PhoneCall className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white truncate">
                      Связь и Мессенджеры
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                      Звонки, автоответы ({pendingMessagesCount}), такси
                    </p>
                  </div>
                </button>

                {/* Module 2: Creative & Music */}
                <button
                  type="button"
                  onClick={() =>
                    onOpenFreeSuite ? onOpenFreeSuite('music') : onNavigate('insights')
                  }
                  className={`p-4 rounded-2xl text-left transition-all cursor-pointer flex items-start gap-3.5 ${
                    isGame
                      ? 'bg-fuchsia-500/10 hover:bg-fuchsia-500/15 border-2 border-fuchsia-500/30 border-b-4'
                      : 'bg-fuchsia-500/10 hover:bg-fuchsia-500/20 border border-fuchsia-400/25'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-fuchsia-500 text-white flex items-center justify-center shrink-0">
                    <Music className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white truncate">
                      Музыка и Творчество
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                      Генератор треков .WAV, Reels и Посты
                    </p>
                  </div>
                </button>

                {/* Module 3: Maps & Search */}
                <button
                  type="button"
                  onClick={() =>
                    onOpenFreeSuite ? onOpenFreeSuite('maps') : onNavigate('insights')
                  }
                  className={`p-4 rounded-2xl text-left transition-all cursor-pointer flex items-start gap-3.5 ${
                    isGame
                      ? 'bg-sky-500/10 hover:bg-sky-500/15 border-2 border-sky-500/30 border-b-4'
                      : 'bg-sky-500/10 hover:bg-sky-500/20 border border-sky-400/25'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-sky-500 text-white flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white truncate">
                      Карта и Поиск мест
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                      Google Карты, локации рядом и факты
                    </p>
                  </div>
                </button>

                {/* Module 4: Health & Persona */}
                <button
                  type="button"
                  onClick={() =>
                    onOpenSuperHub ? onOpenSuperHub('health') : onNavigate('insights')
                  }
                  className={`p-4 rounded-2xl text-left transition-all cursor-pointer flex items-start gap-3.5 ${
                    isGame
                      ? 'bg-amber-500/10 hover:bg-amber-500/15 border-2 border-amber-500/30 border-b-4'
                      : 'bg-amber-500/10 hover:bg-amber-500/20 border border-amber-400/25'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
                    <HeartPulse className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white truncate">
                      Здоровье и Характер
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                      Пульс {health?.heartRateBpm ?? 72} BPM, поддержка и стиль
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* Block 3: Duolingo-Style Daily Goals & Tasks Card */}
            <div className={`${surfaceCardClass} p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4`}>
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-amber-500" />
                    <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                      Цели и задачи на сегодня
                    </h2>
                  </div>
                  <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 tabular-nums">
                    {completedRemindersCount}/{reminders.length} выполнено · {xpIntoLevel}/100 XP
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="h-3 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden p-0.5">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isGame
                        ? 'bg-[#58CC02]'
                        : 'bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400'
                    }`}
                    style={{ width: `${Math.max(12, xpIntoLevel)}%` }}
                  />
                </div>

                {/* Quick Task Add Form */}
                <form onSubmit={handleReminderSubmit} className="flex gap-2 pt-1">
                  <input
                    type="text"
                    value={remTitle}
                    onChange={(e) => setRemTitle(e.target.value)}
                    placeholder={t.reminderTitlePlaceholder}
                    className="flex-1 min-w-0 min-h-[40px] px-3.5 py-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#1CB0F6]"
                  />
                  <input
                    type="time"
                    value={remTime}
                    onChange={(e) => setRemTime(e.target.value)}
                    aria-label="Время"
                    className="min-h-[40px] px-2.5 py-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-mono text-slate-900 dark:text-white"
                  />
                  <button
                    type="submit"
                    aria-label={t.addReminder}
                    className={`min-h-[40px] min-w-[40px] flex items-center justify-center rounded-2xl text-white shrink-0 cursor-pointer ${
                      isGame
                        ? 'bg-[#58CC02] border-b-2 border-[#46A302]'
                        : 'bg-indigo-600 hover:bg-indigo-500'
                    }`}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </form>

                {/* Tasks List */}
                <ul className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {reminders.slice(0, 3).map((r) => (
                    <li key={r.id} className="py-2.5 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => onToggleReminder(r.id)}
                        className="flex items-center gap-2.5 text-left min-w-0 flex-1 cursor-pointer"
                      >
                        {r.completed ? (
                          <CheckCircle2 className="w-4 h-4 text-[#58CC02] shrink-0" />
                        ) : (
                          <Circle className="w-4 h-4 text-slate-400 shrink-0" />
                        )}
                        <span
                          className={`text-xs sm:text-sm truncate ${
                            r.completed
                              ? 'line-through text-slate-400'
                              : 'text-slate-800 dark:text-slate-100 font-semibold'
                          }`}
                        >
                          {r.title}
                        </span>
                      </button>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs font-mono tabular-nums text-slate-400">
                          {new Date(r.at).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        <button
                          type="button"
                          onClick={() => onDeleteReminder(r.id)}
                          aria-label="Удалить"
                          className="p-1 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                <span className="flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  <span>Энергия спутника: {companion.energy}%</span>
                </span>
                {calendarAllowed && calendar.length > 0 && (
                  <button
                    type="button"
                    onClick={() => onNavigate('insights')}
                    className="font-bold text-indigo-600 dark:text-cyan-400 hover:underline cursor-pointer"
                  >
                    Встреч сегодня: {calendar.length}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // ADMIN MODE (CREATOR DASHBOARD)
  // ============================================================================
  return (
    <div className="space-y-6">
      {approvals.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-amber-300 dark:border-amber-800 bg-amber-50/70 dark:bg-amber-950/30 px-5 py-3.5">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-700 dark:text-amber-400 shrink-0" />
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
              {t.pendingApprovalBanner} ({approvals.length})
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenApprovals}
            className="min-h-[40px] px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-medium hover:opacity-90 transition-opacity whitespace-nowrap shrink-0"
          >
            {t.reviewNow}
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch overflow-visible">
        <div className="lg:col-span-6 flex flex-col justify-between items-center text-center p-2 sm:p-4 relative overflow-visible">
          <div className="w-full flex items-center justify-between gap-4 mb-1 z-20">
            <div className="text-left">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
                {companionDisplayName}
                <span className="text-sm font-medium text-blue-600 dark:text-blue-400 tabular-nums">
                  · Lvl {companion.level}
                </span>
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1.5 flex-wrap">
                <span>{moodLabels[companion.mood]}</span>
                <span>·</span>
                <span className="text-amber-600 dark:text-amber-400 font-medium">
                  {companion.room === 'morning'
                    ? '☀️ Утро'
                    : companion.room === 'night'
                      ? '🌙 Ночь'
                      : '💡 Студия'}
                </span>
                <span>·</span>
                <span>{companion.xp} XP</span>
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('world')}
              className="min-h-[40px] px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 whitespace-nowrap shrink-0 transition-colors"
            >
              Сменить облик
            </button>
          </div>

          <div className="w-full flex-1 flex items-center justify-center my-0 overflow-visible">
            <CompanionCanvas
              avatarId={companion.avatarId}
              mood={companion.mood}
              animation={companion.animation}
              room={companion.room}
              inventory={inventory}
              batterySaver={settings.batterySaver}
              lowMemoryMode={settings.lowMemoryMode}
              reducedMotion={settings.reducedMotion}
              showDebugControls={true}
              onTapAvatar={() => {
                playSound('tap');
                onDispatchCompanion({ type: 'PET' });
              }}
            />
          </div>

          <div className="grid grid-cols-4 gap-2.5 w-full max-w-md mt-2">
            <button
              type="button"
              onClick={() => {
                playSound('happy');
                onDispatchCompanion({ type: 'FEED' });
              }}
              className="min-h-[44px] flex flex-col sm:flex-row items-center justify-center gap-1.5 px-2 py-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 transition-colors"
            >
              <Utensils className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span className="truncate">{t.feed}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                playSound('tap');
                onDispatchCompanion({ type: 'PET' });
              }}
              className="min-h-[44px] flex flex-col sm:flex-row items-center justify-center gap-1.5 px-2 py-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 transition-colors"
            >
              <Heart className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              <span className="truncate">{t.pet}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                playSound('tired');
                onDispatchCompanion({ type: 'SLEEP' });
              }}
              className="min-h-[44px] flex flex-col sm:flex-row items-center justify-center gap-1.5 px-2 py-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 transition-colors"
            >
              <Moon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span className="truncate">{t.sleep}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                playSound('curious');
                onDispatchCompanion({ type: 'PLAY_START' });
                onNavigate('world');
              }}
              className="min-h-[44px] flex flex-col sm:flex-row items-center justify-center gap-1.5 px-2 py-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 transition-colors"
            >
              <Gamepad2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="truncate">{t.play}</span>
            </button>
          </div>
        </div>

        <div className="lg:col-span-6 flex flex-col gap-5">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {t.heroSubtitle}
              </p>
            </div>

            <form onSubmit={handleCmdSubmit} className="flex flex-col sm:flex-row gap-2.5">
              <input
                type="text"
                value={cmdText}
                onChange={(e) => setCmdText(e.target.value)}
                placeholder="Напр.: Позвони Маме, Ответь в мессенджере, Создай Reels..."
                className="flex-1 min-h-[44px] px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="submit"
                  className="min-h-[44px] flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  {t.send}
                </button>
                <button
                  type="button"
                  onClick={onToggleVoice}
                  aria-pressed={isListening}
                  className={`min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    isListening
                      ? 'bg-rose-600 border-rose-600 text-white'
                      : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <Mic className="w-4 h-4" />
                  <span className="hidden sm:inline">{isListening ? t.listening : t.voiceCta}</span>
                </button>
              </div>
            </form>

            <div className="flex flex-wrap items-center gap-2 mt-3.5 pt-3.5 border-t border-slate-100 dark:border-slate-800">
              {onGenerateDailyPlan && (
                <button
                  type="button"
                  onClick={onGenerateDailyPlan}
                  className="min-h-[38px] inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI-план дня</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => onRunCommand('Позвони Маме', 'voice')}
                className="min-h-[38px] inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Голосом: Позвонить</span>
              </button>
              <button
                type="button"
                onClick={() => onRunCommand('Вызови такси', 'voice')}
                className="min-h-[38px] inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Car className="w-3.5 h-3.5" />
                <span>Такси</span>
              </button>
            </div>
          </div>

          {onOpenSuperHub && (
            <div className="rounded-2xl border border-blue-500/30 bg-white dark:bg-slate-900 p-5 space-y-3.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Панель управления модулями (Режим Создателя)
                  </h2>
                </div>
                {onOpenSourceDownload && (
                  <button
                    type="button"
                    onClick={onOpenSourceDownload}
                    className="min-h-[36px] inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer shrink-0"
                  >
                    <HardDriveDownload className="w-3.5 h-3.5" />
                    <span>Скачать код и проект на ПК (.ZIP)</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => onOpenSuperHub('calls')}
                  className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 bg-slate-50/70 dark:bg-slate-950/60 text-left transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                    <PhoneCall className="w-4 h-4 shrink-0" />
                    <span>Звонки и Контакты</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => onOpenSuperHub('messengers')}
                  className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 bg-slate-50/70 dark:bg-slate-950/60 text-left transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between text-blue-600 dark:text-blue-400 font-bold text-xs">
                    <span className="flex items-center gap-1.5">
                      <MessageCircle className="w-4 h-4 shrink-0" />
                      <span>Мессенджеры</span>
                    </span>
                    <span className="font-mono">{pendingMessagesCount} черн.</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => onOpenSuperHub('social')}
                  className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-pink-500 bg-slate-50/70 dark:bg-slate-950/60 text-left transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-2 text-pink-600 dark:text-pink-400 font-bold text-xs">
                    <Share2 className="w-4 h-4 shrink-0" />
                    <span>Посты / Сторис / Reels</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => onOpenSuperHub('health')}
                  className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-teal-500 bg-slate-50/70 dark:bg-slate-950/60 text-left transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between text-teal-600 dark:text-teal-400 font-bold text-xs">
                    <span className="flex items-center gap-1.5">
                      <HeartPulse className="w-4 h-4 shrink-0" />
                      <span>Здоровье</span>
                    </span>
                    <span className="font-mono">{health?.heartRateBpm ?? 72} BPM</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => onOpenSuperHub('persona')}
                  className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-purple-500 bg-slate-50/70 dark:bg-slate-950/60 text-left transition-all cursor-pointer sm:col-span-2"
                >
                  <div className="flex items-center justify-between text-purple-600 dark:text-purple-400 font-bold text-xs">
                    <span className="flex items-center gap-1.5">
                      <Brain className="w-4 h-4 shrink-0" />
                      <span>Обучение манере общения</span>
                    </span>
                    <span className="font-mono">{persona?.ownerAddress || 'Шеф'}</span>
                  </div>
                </button>
              </div>

              {onOpenFreeSuite && (
                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => onOpenFreeSuite('maps')}
                    className="p-2.5 rounded-xl border border-purple-500/30 bg-purple-500/10 text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-1.5 text-purple-700 dark:text-purple-300 font-bold text-xs">
                      <MapPin className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">Google Карты ($0)</span>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenFreeSuite('music')}
                    className="p-2.5 rounded-xl border border-fuchsia-500/30 bg-fuchsia-500/10 text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-1.5 text-fuchsia-700 dark:text-fuchsia-300 font-bold text-xs">
                      <Music className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">Музыка Lyria ($0)</span>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenFreeSuite('live_voice')}
                    className="p-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 font-bold text-xs">
                      <Radio className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">Gemini Live ($0)</span>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenFreeSuite('transcribe')}
                    className="p-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-1.5 text-rose-700 dark:text-rose-300 font-bold text-xs">
                      <Mic className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">Транскрибация ($0)</span>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenFreeSuite('search')}
                    className="p-2.5 rounded-xl border border-blue-500/30 bg-blue-500/10 text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-1.5 text-blue-700 dark:text-blue-300 font-bold text-xs">
                      <Search className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">Google Поиск ($0)</span>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenFreeSuite('cloud_db')}
                    className="p-2.5 rounded-xl border border-teal-500/30 bg-teal-500/10 text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-1.5 text-teal-700 dark:text-teal-300 font-bold text-xs">
                      <Database className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">Бесплатная БД ($0)</span>
                    </div>
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                    {t.remindersTitle}
                  </h2>
                  <span className="text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400">
                    {reminders.length}
                  </span>
                </div>
                <form onSubmit={handleReminderSubmit} className="flex gap-2 mb-4">
                  <input
                    type="text"
                    value={remTitle}
                    onChange={(e) => setRemTitle(e.target.value)}
                    placeholder={t.reminderTitlePlaceholder}
                    className="flex-1 min-w-0 min-h-[40px] px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100"
                  />
                  <button
                    type="submit"
                    aria-label={t.addReminder}
                    className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between gap-2 mb-3">
                <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  {t.calendarTitle}
                </h2>
                <Calendar className="w-4 h-4 text-slate-400" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
