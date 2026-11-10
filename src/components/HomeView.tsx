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
} from 'lucide-react';
import { FreeSuiteTab } from './FreeAiSuiteModal';
import {
  ApprovalRequest,
  CalendarEvent,
  CompanionState,
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
  partialTranscript,
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
  const pendingMessagesCount = messengerThreads.filter((m) => m.status === 'pending_confirm').length;

  return (
    <div className="space-y-6">
      {/* Pending Approval Callout (if any) */}
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

      {/* Primary Hero Split: Dominant Companion Anchor + Command Bar & State */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch overflow-visible">
        {/* Left: Companion Hero Stage (Unboxed, Unclipped, Central Spotlight) */}
        <div className="lg:col-span-6 flex flex-col justify-between items-center text-center p-2 sm:p-4 relative overflow-visible">
          <div className="w-full flex items-center justify-between gap-4 mb-1 z-20">
            <div className="text-left">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
                {companion.avatarId === 'lumi'
                  ? 'Люми'
                  : companion.avatarId === 'nova'
                    ? 'Нова'
                    : companion.avatarId === 'shadow'
                      ? 'Шэдоу'
                      : companion.avatarId === 'yobao'
                        ? 'Йобао'
                        : companion.avatarId === 'bobo'
                          ? 'Бобо'
                          : companion.avatarId === 'pico'
                            ? 'Пико'
                            : 'Майя'}
                <span className="text-sm font-medium text-blue-600 dark:text-blue-400 tabular-nums">
                  · Lvl {companion.level}
                </span>
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1.5 flex-wrap">
                <span>{moodLabels[companion.mood]}</span>
                <span>·</span>
                <span className="text-amber-600 dark:text-amber-400 font-medium">
                  {companion.room === 'morning' ? '☀️ Утро' : companion.room === 'night' ? '🌙 Ночь' : '💡 Студия'}
                </span>
                <span>·</span>
                <span>{companion.xp} XP</span>
                <span>·</span>
                <span>
                  Манера речи: {persona?.allowProfanity ? '18+ Без цензуры' : persona?.stylePreset === 'bro' ? 'Свой бро' : 'Дружеский'}
                </span>
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

          {/* Freely Floating Unclipped 3D Companion Centerpiece */}
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
              onTapAvatar={() => {
                playSound('tap');
                onDispatchCompanion({ type: 'PET' });
              }}
            />
          </div>

          {/* Companion Quick Care Controls (Soft pill-free floating bar) */}
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

        {/* Right: Quick Action Bar + Super-Phone Deck + Today's Agenda */}
        <div className="lg:col-span-6 flex flex-col gap-5">
          {/* Voice & Text Command Launcher */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {t.heroSubtitle}
              </p>
              <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                {settings.airplaneMode ? 'Офлайн-ядро активно (Без интернета)' : 'Online · Gemini 4 Argon'}
              </span>
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

            {/* Quick Voice & Gemini 4 Argon Actions */}
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
                <span>Такси KZ</span>
              </button>
              <button
                type="button"
                onClick={() => onRunCommand('Вызови скорую помощь 103', 'voice')}
                className="min-h-[38px] inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-500/40 bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 dark:text-rose-300 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>112 / 103 KZ</span>
              </button>
            </div>
          </div>

          {/* NEW: Super-Functions of Phone & AI Companion Control Deck */}
          {onOpenSuperHub && (
            <div className="rounded-2xl border border-blue-500/30 bg-white dark:bg-slate-900 p-5 space-y-3.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Функции телефона с согласия владельца (Онлайн и Офлайн)
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Нажмите на любой модуль для управления голосом или кнопками:
                  </p>
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
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    Голосовой вызов и приём звонка голосовым согласием
                  </p>
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
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    ИИ готовит ответ ➔ подтверждение или диктовка
                  </p>
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
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    Генерация поста, подбор фото/видео и разрешение на публикацию
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => onOpenSuperHub('health')}
                  className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-teal-500 bg-slate-50/70 dark:bg-slate-950/60 text-left transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between text-teal-600 dark:text-teal-400 font-bold text-xs">
                    <span className="flex items-center gap-1.5">
                      <HeartPulse className="w-4 h-4 shrink-0" />
                      <span>Здоровье и Психология</span>
                    </span>
                    <span className="font-mono">{health?.heartRateBpm ?? 72} BPM</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    Следит за состоянием, подбадривает и помогает 24/7
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => onOpenSuperHub('persona')}
                  className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-purple-500 bg-slate-50/70 dark:bg-slate-950/60 text-left transition-all cursor-pointer sm:col-span-2"
                >
                  <div className="flex items-center justify-between text-purple-600 dark:text-purple-400 font-bold text-xs">
                    <span className="flex items-center gap-1.5">
                      <Brain className="w-4 h-4 shrink-0" />
                      <span>Обучение манере общения (Персона, Сленг, Режим 18+ без цензуры)</span>
                    </span>
                    <span className="font-mono">
                      {persona?.allowProfanity ? '18+ ВКЛ' : persona?.ownerAddress || 'Шеф'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    Прививайте помощнику свой характер, сленг и крепкие выражения + полный доступ к телефону
                  </p>
                </button>
              </div>

              {/* 100% Free Add-ons Deck (Google Maps, Music Studio, Live Voice, Audio Transcribe, Search, Cloud DB) */}
              {onOpenFreeSuite && (
                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Новые подключённые дополнения (100% Бесплатные версии · $0):
                    </span>
                    <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                      Free Tier Active
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => onOpenFreeSuite('maps')}
                      className="p-2.5 rounded-xl border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 text-left transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-1.5 text-purple-700 dark:text-purple-300 font-bold text-xs">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">Google Карты ($0)</span>
                      </div>
                      <p className="text-[10px] text-slate-600 dark:text-slate-400 mt-0.5 truncate">
                        Интерактивная карта + Поиск мест
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => onOpenFreeSuite('music')}
                      className="p-2.5 rounded-xl border border-fuchsia-500/30 bg-fuchsia-500/10 hover:bg-fuchsia-500/20 text-left transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-1.5 text-fuchsia-700 dark:text-fuchsia-300 font-bold text-xs">
                        <Music className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">Музыка Lyria ($0)</span>
                      </div>
                      <p className="text-[10px] text-slate-600 dark:text-slate-400 mt-0.5 truncate">
                        Генератор треков и стихов .WAV
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => onOpenFreeSuite('live_voice')}
                      className="p-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-left transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 font-bold text-xs">
                        <Radio className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">Gemini Live ($0)</span>
                      </div>
                      <p className="text-[10px] text-slate-600 dark:text-slate-400 mt-0.5 truncate">
                        Живой голосовой звонок
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => onOpenFreeSuite('transcribe')}
                      className="p-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-left transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-1.5 text-rose-700 dark:text-rose-300 font-bold text-xs">
                        <Mic className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">Транскрибация ($0)</span>
                      </div>
                      <p className="text-[10px] text-slate-600 dark:text-slate-400 mt-0.5 truncate">
                        Gemini 3.5 Transcribe в текст
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => onOpenFreeSuite('search')}
                      className="p-2.5 rounded-xl border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 text-left transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-1.5 text-blue-700 dark:text-blue-300 font-bold text-xs">
                        <Search className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">Google Поиск ($0)</span>
                      </div>
                      <p className="text-[10px] text-slate-600 dark:text-slate-400 mt-0.5 truncate">
                        Свежие факты со ссылками
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => onOpenFreeSuite('cloud_db')}
                      className="p-2.5 rounded-xl border border-teal-500/30 bg-teal-500/10 hover:bg-teal-500/20 text-left transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-1.5 text-teal-700 dark:text-teal-300 font-bold text-xs">
                        <Database className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">Бесплатная БД ($0)</span>
                      </div>
                      <p className="text-[10px] text-slate-600 dark:text-slate-400 mt-0.5 truncate">
                        Облако + Авто-бэкап GitHub
                      </p>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Smart Cards Row: Offline Reminders Form (PRD-01) + Calendar */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
            {/* Local Reminders Card (PRD-01: Works without mic & network) */}
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
                    className="flex-1 min-w-0 min-h-[40px] px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                  <input
                    type="time"
                    value={remTime}
                    onChange={(e) => setRemTime(e.target.value)}
                    aria-label="Time"
                    className="min-h-[40px] px-2 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-mono tabular-nums text-slate-900 dark:text-slate-100"
                  />
                  <button
                    type="submit"
                    aria-label={t.addReminder}
                    className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 transition-opacity shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </form>

                <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                  {reminders.slice(0, 4).map((r) => (
                    <li key={r.id} className="py-2.5 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => onToggleReminder(r.id)}
                        className="flex items-center gap-2.5 text-left min-w-0 flex-1"
                      >
                        {r.completed ? (
                          <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                        ) : (
                          <Circle className="w-4 h-4 text-slate-400 shrink-0" />
                        )}
                        <span
                          className={`text-sm truncate ${
                            r.completed
                              ? 'line-through text-slate-400'
                              : 'text-slate-800 dark:text-slate-200'
                          }`}
                        >
                          {r.title}
                        </span>
                      </button>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400">
                          {new Date(r.at).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        <button
                          type="button"
                          onClick={() => onDeleteReminder(r.id)}
                          aria-label="Delete reminder"
                          className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              <p className="mt-3 text-xs text-slate-400 dark:text-slate-500">
                {t.createOffline} · Опыт: {xpIntoLevel}/100 XP
              </p>
            </div>

            {/* Device Calendar Card (Respects ConsentStore) */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                    {t.calendarTitle}
                  </h2>
                  <Calendar className="w-4 h-4 text-slate-400" />
                </div>

                {!calendarAllowed ? (
                  <div className="py-6 text-center space-y-3">
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      {t.noAccessCalendar}
                    </p>
                    <button
                      type="button"
                      onClick={() => onNavigate('profile')}
                      className="min-h-[40px] px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      {t.grantInProfile}
                    </button>
                  </div>
                ) : (
                  <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                    {calendar.map((ev) => (
                      <li key={ev.id} className="py-2.5 flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                            {ev.title}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                            {ev.participant || ev.location || 'Local'}
                          </p>
                        </div>
                        <span className="text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400 shrink-0">
                          {ev.start}–{ev.end}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <p className="mt-3 text-xs text-slate-400 dark:text-slate-500">
                calendar.read · {calendarAllowed ? 'Granted' : 'Revoked'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
