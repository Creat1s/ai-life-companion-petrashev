import React, { useState } from 'react';
import {
  PhoneCall,
  MessageCircle,
  Car,
  ShieldAlert,
  Music,
  Share2,
  MapPin,
  Search,
  Radio,
  Mic,
  HeartPulse,
  Brain,
  BarChart2,
  Calendar,
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  Sparkles,
  ChevronRight,
  Layers,
  Gamepad2,
} from 'lucide-react';
import {
  ActivitySummary,
  CalendarEvent,
  CompanionState,
  DesignStyle,
  HealthWellnessState,
  MainTab,
  MessengerThreadItem,
  PersonaTrainingConfig,
  ReminderItem,
  UserSettings,
} from '../types/companion';
import { SuperHubTab } from '../engine/intentRouter';
import { FreeSuiteTab } from './FreeAiSuiteModal';

interface UserModulesHubViewProps {
  settings: UserSettings;
  companion: CompanionState;
  reminders: ReminderItem[];
  calendar: CalendarEvent[];
  calendarAllowed: boolean;
  activity: ActivitySummary;
  usageAllowed: boolean;
  messengerThreads: MessengerThreadItem[];
  health: HealthWellnessState;
  persona: PersonaTrainingConfig;
  onUpdateSettings: (patch: Partial<UserSettings>) => void;
  onNavigate: (tab: MainTab) => void;
  onOpenSuperHub: (tab: SuperHubTab) => void;
  onOpenFreeSuite: (tab: FreeSuiteTab) => void;
  onOpenKzModal: (tab: 'emergency' | 'taxi') => void;
  onCreateReminderForm: (title: string, timeStr: string) => void;
  onToggleReminder: (id: string) => void;
  onDeleteReminder: (id: string) => void;
  onGenerateDailyPlan: () => void;
}

type SectionKey = 'communication' | 'creative' | 'navigation' | 'wellness';

export const UserModulesHubView: React.FC<UserModulesHubViewProps> = ({
  settings,
  companion,
  reminders,
  calendar,
  calendarAllowed,
  activity,
  usageAllowed,
  messengerThreads,
  health,
  persona,
  onUpdateSettings,
  onNavigate,
  onOpenSuperHub,
  onOpenFreeSuite,
  onOpenKzModal,
  onCreateReminderForm,
  onToggleReminder,
  onDeleteReminder,
  onGenerateDailyPlan,
}) => {
  const style: DesignStyle = settings.designStyle || 'game';
  const isGame = style === 'game';

  const [activeSection, setActiveSection] = useState<SectionKey>('communication');
  const [remTitle, setRemTitle] = useState('');
  const [remTime, setRemTime] = useState('09:00');

  const pendingDraftsCount = messengerThreads.filter(
    (m) => m.status === 'pending_confirm'
  ).length;
  const completedReminders = reminders.filter((r) => r.completed).length;
  const totalTodayMinutes = activity.categories.reduce(
    (acc, c) => acc + c.minutesToday,
    0
  );

  const handleReminderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!remTitle.trim()) return;
    onCreateReminderForm(remTitle.trim(), remTime);
    setRemTitle('');
  };

  const sections: {
    id: SectionKey;
    title: string;
    subtitle: string;
    badge: string;
    icon: React.ComponentType<{ className?: string }>;
    gameAccent: string;
    web3Accent: string;
  }[] = [
    {
      id: 'communication',
      title: '1. Связь и Помощь',
      subtitle: 'Звонки, мессенджеры, живой эфир и транспорт',
      badge: pendingDraftsCount > 0 ? `${pendingDraftsCount} новых` : 'Активно',
      icon: PhoneCall,
      gameAccent: 'bg-[#58CC02] border-[#46A302] text-white',
      web3Accent: 'from-emerald-500 to-teal-500 text-white',
    },
    {
      id: 'creative',
      title: '2. Творчество и Медиа',
      subtitle: 'Музыкальная студия, Reels, Сторис и характер',
      badge: 'Студия',
      icon: Music,
      gameAccent: 'bg-[#CE82FF] border-[#A558D6] text-white',
      web3Accent: 'from-fuchsia-500 to-purple-600 text-white',
    },
    {
      id: 'navigation',
      title: '3. Карты и Поиск',
      subtitle: 'Интерактивная карта города, места и факты',
      badge: 'Навигация',
      icon: MapPin,
      gameAccent: 'bg-[#1CB0F6] border-[#0088CC] text-white',
      web3Accent: 'from-cyan-500 to-blue-600 text-white',
    },
    {
      id: 'wellness',
      title: '4. Здоровье и Планер',
      subtitle: 'Тонус, задачи, расписание и баланс времени',
      badge: `${completedReminders}/${reminders.length} задач`,
      icon: HeartPulse,
      gameAccent: 'bg-[#FF9600] border-[#CC7800] text-white',
      web3Accent: 'from-amber-500 to-rose-500 text-white',
    },
  ];

  const cardSurfaceClass = isGame
    ? 'rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 border-b-4 border-b-slate-300 dark:border-b-slate-950 shadow-sm'
    : 'rounded-3xl bg-white/80 dark:bg-slate-900/65 backdrop-blur-xl border border-indigo-500/20 dark:border-cyan-400/20 shadow-[0_12px_36px_-12px_rgba(79,70,229,0.22)]';

  const moduleBtnClass = isGame
    ? 'group w-full p-5 rounded-3xl bg-slate-50/90 dark:bg-slate-950/75 border-2 border-slate-200 dark:border-slate-800 border-b-4 border-b-slate-300 dark:border-b-slate-900 hover:border-[#1CB0F6] active:border-b-2 active:translate-y-0.5 text-left transition-all cursor-pointer flex flex-col justify-between gap-4'
    : 'group w-full p-5 rounded-3xl bg-white/60 dark:bg-slate-950/55 backdrop-blur-md border border-slate-200/80 dark:border-white/10 hover:border-cyan-400/50 hover:shadow-[0_10px_30px_-10px_rgba(34,211,238,0.25)] text-left transition-all cursor-pointer flex flex-col justify-between gap-4';

  return (
    <div className="space-y-6 pb-8">
      {/* Header with Clean Section Overview & Style Switcher */}
      <div className={`${cardSurfaceClass} p-5 sm:p-6`}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Разделы и Модули Помощника
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Выберите нужный раздел ниже — все инструменты упорядочены по категориям без лишнего шума.
            </p>
          </div>

          <div className="inline-flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => onUpdateSettings({ designStyle: 'game' })}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                isGame
                  ? 'bg-[#58CC02] text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <Gamepad2 className="w-3.5 h-3.5" />
              <span>Game Design</span>
            </button>
            <button
              type="button"
              onClick={() => onUpdateSettings({ designStyle: 'web3' })}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                !isGame
                  ? 'bg-gradient-to-r from-indigo-600 to-cyan-500 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Web 3.0</span>
            </button>
          </div>
        </div>

        {/* 4 Logical Master Sections Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-5">
          {sections.map((sec) => {
            const Icon = sec.icon;
            const isSelected = activeSection === sec.id;
            return (
              <button
                key={sec.id}
                type="button"
                onClick={() => setActiveSection(sec.id)}
                className={`p-4 rounded-2xl text-left transition-all cursor-pointer ${
                  isSelected
                    ? isGame
                      ? `${sec.gameAccent} border-b-4 shadow-sm scale-[1.01]`
                      : `bg-gradient-to-br ${sec.web3Accent} shadow-lg shadow-indigo-500/20 scale-[1.01]`
                    : 'bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span
                    className={`text-[11px] font-bold px-2.5 py-0.5 rounded-lg ${
                      isSelected
                        ? 'bg-black/20 text-white'
                        : 'bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {sec.badge}
                  </span>
                </div>
                <div className="text-sm font-extrabold">{sec.title}</div>
                <div
                  className={`text-xs mt-0.5 line-clamp-1 ${
                    isSelected ? 'text-white/90' : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {sec.subtitle}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* SECTION 1: COMMUNICATION & ASSISTANCE */}
      {activeSection === 'communication' && (
        <div className="space-y-6">
          {/* Subsection 1.1: Phone Calls & Messengers */}
          <div className={`${cardSurfaceClass} p-5 sm:p-6 space-y-4`}>
            <div className="flex items-center justify-between gap-2">
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Подраздел 1.1 · Голос и переписка
                </span>
                <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                  Звонки, Мессенджеры и Живое Общение
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                type="button"
                onClick={() => onOpenSuperHub('calls')}
                className={moduleBtnClass}
              >
                <div className="space-y-2">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <PhoneCall className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Звонки и Контакты
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Быстрый набор избранных номеров и приём входящих звонков голосовым согласием.
                  </p>
                </div>
                <div className="flex items-center justify-between text-xs font-extrabold text-emerald-600 dark:text-emerald-400 pt-2 border-t border-slate-200/60 dark:border-slate-800/80 w-full">
                  <span>Открыть телефонную книгу</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>

              <button
                type="button"
                onClick={() => onOpenSuperHub('messengers')}
                className={moduleBtnClass}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="w-11 h-11 rounded-2xl bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                      <MessageCircle className="w-5 h-5" />
                    </div>
                    {pendingDraftsCount > 0 && (
                      <span className="px-2.5 py-1 rounded-xl bg-blue-600 text-white text-xs font-extrabold">
                        {pendingDraftsCount} черновика
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Ответы в Мессенджерах
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Помощник готовит ответы для WhatsApp, Telegram и Direct — вы только подтверждаете отправку.
                  </p>
                </div>
                <div className="flex items-center justify-between text-xs font-extrabold text-blue-600 dark:text-blue-400 pt-2 border-t border-slate-200/60 dark:border-slate-800/80 w-full">
                  <span>Проверить сообщения</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>

              <button
                type="button"
                onClick={() => onOpenFreeSuite('live_voice')}
                className={moduleBtnClass}
              >
                <div className="space-y-2">
                  <div className="w-11 h-11 rounded-2xl bg-teal-500/15 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                    <Radio className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Живой Голосовой Эфир
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Непрерывный разговор голосом в реальном времени с синхронной 3D-мимикой персонажа.
                  </p>
                </div>
                <div className="flex items-center justify-between text-xs font-extrabold text-teal-600 dark:text-teal-400 pt-2 border-t border-slate-200/60 dark:border-slate-800/80 w-full">
                  <span>Начать голосовой эфир</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>
            </div>
          </div>

          {/* Subsection 1.2: Transport & Emergency Assistance */}
          <div className={`${cardSurfaceClass} p-5 sm:p-6 space-y-4`}>
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Подраздел 1.2 · Поездки и безопасность
              </span>
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                Заказ Такси и Экстренная Помощь
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => onOpenKzModal('taxi')}
                className={moduleBtnClass}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                    <Car className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                      Быстрый вызов Такси
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Быстрое открытие маршрута в Яндекс Go, InDrive или 2ГИС в один клик.
                    </p>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => onOpenKzModal('emergency')}
                className={moduleBtnClass}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                    <ShieldAlert className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                      Экстренные службы (112 / 103)
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Мгновенный доступ к номерам скорой помощи, спасателей и полиции.
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: CREATIVE & MEDIA STUDIO */}
      {activeSection === 'creative' && (
        <div className="space-y-6">
          <div className={`${cardSurfaceClass} p-5 sm:p-6 space-y-4`}>
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-fuchsia-600 dark:text-fuchsia-400">
                Подраздел 2.1 · Аудио и Контент
              </span>
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                Музыкальная Студия, Посты и Аудиозаметки
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                type="button"
                onClick={() => onOpenFreeSuite('music')}
                className={moduleBtnClass}
              >
                <div className="space-y-2">
                  <div className="w-11 h-11 rounded-2xl bg-fuchsia-500/15 text-fuchsia-600 dark:text-fuchsia-400 flex items-center justify-center">
                    <Music className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Генератор Музыки (.WAV)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Создание мелодий, ритмов и текстов песен по вашему настроению с возможностью скачивания.
                  </p>
                </div>
                <div className="flex items-center justify-between text-xs font-extrabold text-fuchsia-600 dark:text-fuchsia-400 pt-2 border-t border-slate-200/60 dark:border-slate-800/80 w-full">
                  <span>Создать трек</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </button>

              <button
                type="button"
                onClick={() => onOpenSuperHub('social')}
                className={moduleBtnClass}
              >
                <div className="space-y-2">
                  <div className="w-11 h-11 rounded-2xl bg-pink-500/15 text-pink-600 dark:text-pink-400 flex items-center justify-center">
                    <Share2 className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Посты, Сторис и Reels
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Подбор сценариев, описаний, хэштегов и медиа-обложек для ваших социальных сетей.
                  </p>
                </div>
                <div className="flex items-center justify-between text-xs font-extrabold text-pink-600 dark:text-pink-400 pt-2 border-t border-slate-200/60 dark:border-slate-800/80 w-full">
                  <span>Открыть медиа-студию</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </button>

              <button
                type="button"
                onClick={() => onOpenFreeSuite('transcribe')}
                className={moduleBtnClass}
              >
                <div className="space-y-2">
                  <div className="w-11 h-11 rounded-2xl bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                    <Mic className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Голос в Текст (Заметки)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Запишите голосовую мысль с микрофона — помощник мгновенно превратит её в чистый текст.
                  </p>
                </div>
                <div className="flex items-center justify-between text-xs font-extrabold text-rose-600 dark:text-rose-400 pt-2 border-t border-slate-200/60 dark:border-slate-800/80 w-full">
                  <span>Записать аудиозаметку</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </button>
            </div>
          </div>

          {/* Subsection 2.2: Character Persona & Style */}
          <div className={`${cardSurfaceClass} p-5 sm:p-6 space-y-4`}>
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                Подраздел 2.2 · Индивидуальность
              </span>
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                Характер Помощника и 3D-Гардероб
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => onOpenSuperHub('persona')}
                className={moduleBtnClass}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                    <Brain className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                        Обучение манере общения
                      </h3>
                      <span className="px-2 py-0.5 rounded-lg bg-purple-500/15 text-purple-600 dark:text-purple-300 text-[11px] font-bold">
                        Обращение: {persona.ownerAddress || 'Друг'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Настройте тон диалога, любимые выражения и собственные правила ответов на фразы.
                    </p>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('world')}
                className={moduleBtnClass}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                      Комната, Герои и Аксессуары ({companion.xp} XP)
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Переключайтесь между Новой, Люми и Шэдоу, примеряйте аксессуары и меняйте время суток.
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: MAPS & SEARCH */}
      {activeSection === 'navigation' && (
        <div className="space-y-6">
          <div className={`${cardSurfaceClass} p-5 sm:p-6 space-y-4`}>
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-sky-600 dark:text-sky-400">
                Подраздел 3.1 · Карта и Поиск информации
              </span>
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                Интерактивная Карта Города и Живой Поиск
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => onOpenFreeSuite('maps')}
                className={moduleBtnClass}
              >
                <div className="space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-sky-500/15 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                    Интерактивная Google Карта и Места
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                    Исследуйте карту в реальном времени, находите уютные кофейни, парки, коворкинги и аптеки с рекомендациями помощника.
                  </p>
                </div>
                <div className="flex items-center justify-between text-xs font-extrabold text-sky-600 dark:text-sky-400 pt-2 border-t border-slate-200/60 dark:border-slate-800/80 w-full">
                  <span>Открыть интерактивную карту</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </button>

              <button
                type="button"
                onClick={() => onOpenFreeSuite('search')}
                className={moduleBtnClass}
              >
                <div className="space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <Search className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                    Живой Поиск Фактов и Новостей
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                    Задайте любой вопрос о событиях, технологиях или погоде — помощник найдёт проверенные ответы и покажет источники.
                  </p>
                </div>
                <div className="flex items-center justify-between text-xs font-extrabold text-indigo-600 dark:text-indigo-400 pt-2 border-t border-slate-200/60 dark:border-slate-800/80 w-full">
                  <span>Перейти к поиску</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 4: WELLNESS, PLANNER & TIME BALANCE */}
      {activeSection === 'wellness' && (
        <div className="space-y-6">
          {/* Subsection 4.1: Health & Daily AI Plan */}
          <div className={`${cardSurfaceClass} p-5 sm:p-6 space-y-4`}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                  Подраздел 4.1 · Самочувствие и ритм дня
                </span>
                <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                  Здоровье, Энергия и Умный План Дня
                </h2>
              </div>
              <button
                type="button"
                onClick={onGenerateDailyPlan}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-extrabold transition-colors cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Составить AI-план дня</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800">
                <div className="text-xs text-slate-500 dark:text-slate-400">Пульс</div>
                <div className="text-xl font-extrabold text-rose-600 dark:text-rose-400 mt-1 tabular-nums">
                  {health.heartRateBpm} BPM
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800">
                <div className="text-xs text-slate-500 dark:text-slate-400">Сон</div>
                <div className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-1 tabular-nums">
                  {health.sleepHours} ч
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800">
                <div className="text-xs text-slate-500 dark:text-slate-400">Водный баланс</div>
                <div className="text-xl font-extrabold text-sky-600 dark:text-sky-400 mt-1 tabular-nums">
                  {health.waterGlasses} стак.
                </div>
              </div>
              <button
                type="button"
                onClick={() => onOpenSuperHub('health')}
                className="p-4 rounded-2xl bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 text-left transition-all cursor-pointer flex flex-col justify-between"
              >
                <span className="text-xs font-extrabold text-teal-700 dark:text-teal-300">
                  Дневник самочувствия
                </span>
                <span className="text-[11px] text-teal-600 dark:text-teal-400 font-bold flex items-center gap-1 mt-1">
                  Открыть поддержку <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </button>
            </div>
          </div>

          {/* Subsection 4.2: Tasks, Calendar & Time Balance */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Reminders & Tasks Module */}
            <div className={`lg:col-span-6 ${cardSurfaceClass} p-5 sm:p-6 space-y-4`}>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    Подраздел 4.2 · Планер
                  </span>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Задачи и Напоминания ({reminders.length})
                  </h3>
                </div>
              </div>

              <form onSubmit={handleReminderSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={remTitle}
                  onChange={(e) => setRemTitle(e.target.value)}
                  placeholder="Новая задача..."
                  className="flex-1 min-w-0 min-h-[42px] px-3.5 py-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white"
                />
                <input
                  type="time"
                  value={remTime}
                  onChange={(e) => setRemTime(e.target.value)}
                  aria-label="Время"
                  className="min-h-[42px] px-2.5 py-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-mono text-slate-900 dark:text-white"
                />
                <button
                  type="submit"
                  className="min-h-[42px] px-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold cursor-pointer shrink-0 flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  <span>Добавить</span>
                </button>
              </form>

              <ul className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {reminders.map((r) => (
                  <li key={r.id} className="py-2.5 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => onToggleReminder(r.id)}
                      className="flex items-center gap-2.5 text-left min-w-0 flex-1 cursor-pointer"
                    >
                      {r.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 text-slate-400 shrink-0" />
                      )}
                      <span
                        className={`text-sm truncate ${
                          r.completed
                            ? 'line-through text-slate-400'
                            : 'text-slate-800 dark:text-slate-100 font-medium'
                        }`}
                      >
                        {r.title}
                      </span>
                    </button>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-mono text-slate-400">
                        {new Date(r.at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      <button
                        type="button"
                        onClick={() => onDeleteReminder(r.id)}
                        className="p-1 text-slate-400 hover:text-rose-500 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Calendar & Screen Time Balance Module */}
            <div className={`lg:col-span-6 ${cardSurfaceClass} p-5 sm:p-6 space-y-5`}>
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                      Подраздел 4.3 · Расписание и Баланс
                    </span>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                      Встречи сегодня и экранное время
                    </h3>
                  </div>
                  <Calendar className="w-4 h-4 text-slate-400" />
                </div>

                {calendarAllowed ? (
                  <ul className="divide-y divide-slate-100 dark:divide-slate-800/80">
                    {calendar.map((ev) => (
                      <li key={ev.id} className="py-2 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                            {ev.title}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                            {ev.participant || ev.location}
                          </p>
                        </div>
                        <span className="text-xs font-mono text-slate-500 dark:text-slate-400 shrink-0">
                          {ev.start}–{ev.end}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-slate-500">Доступ к календарю отключён в настройках.</p>
                )}
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <BarChart2 className="w-4 h-4 text-indigo-500" />
                    <span>Экранное время за сегодня</span>
                  </span>
                  <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400 tabular-nums">
                    {usageAllowed ? `${totalTodayMinutes} мин` : 'Скрыто'}
                  </span>
                </div>
                {usageAllowed && (
                  <div className="space-y-2">
                    {activity.categories.map((cat) => (
                      <div key={cat.id} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-600 dark:text-slate-300">
                            {cat.label[settings.locale]}
                          </span>
                          <span className="font-mono text-slate-500">{cat.minutesToday} мин</span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${Math.min(100, (cat.minutesToday / Math.max(1, totalTodayMinutes)) * 100)}%`,
                              backgroundColor: cat.color,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
