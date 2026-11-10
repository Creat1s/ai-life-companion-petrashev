import React, { useState } from 'react';
import {
  HelpCircle,
  Sparkles,
  PhoneCall,
  Music,
  ShieldCheck,
  Gamepad2,
  Layers,
  Mic,
  MapPin,
  HeartPulse,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Wrench,
  BookOpen,
  Compass,
} from 'lucide-react';
import { DesignStyle, MainTab, UIMode, UserSettings } from '../types/companion';
import { SuperHubTab } from '../engine/intentRouter';
import { FreeSuiteTab } from './FreeAiSuiteModal';

interface HelpAndGuideViewProps {
  settings: UserSettings;
  onUpdateSettings: (patch: Partial<UserSettings>) => void;
  onNavigate: (tab: MainTab) => void;
  onOpenSuperHub: (tab: SuperHubTab) => void;
  onOpenFreeSuite: (tab: FreeSuiteTab) => void;
}

interface HelpTopic {
  id: string;
  category: 'companion' | 'voice_phone' | 'creative_maps' | 'privacy_style';
  title: string;
  summary: string;
  steps: string[];
  actionLabel?: string;
  onAction?: () => void;
}

export const HelpAndGuideView: React.FC<HelpAndGuideViewProps> = ({
  settings,
  onUpdateSettings,
  onNavigate,
  onOpenSuperHub,
  onOpenFreeSuite,
}) => {
  const style: DesignStyle = settings.designStyle || 'game';
  const isGame = style === 'game';

  const [activeCategory, setActiveCategory] = useState<
    'all' | 'companion' | 'voice_phone' | 'creative_maps' | 'privacy_style'
  >('all');
  const [expandedId, setExpandedId] = useState<string | null>('care-3d');

  const categories = [
    { id: 'all', label: 'Все разделы', icon: BookOpen },
    { id: 'companion', label: '3D-Компаньон и Игра', icon: Sparkles },
    { id: 'voice_phone', label: 'Голос, Звонки и Связь', icon: PhoneCall },
    { id: 'creative_maps', label: 'Музыка, Карты и Медиа', icon: Compass },
    { id: 'privacy_style', label: 'Характер и Настройки', icon: ShieldCheck },
  ] as const;

  const topics: HelpTopic[] = [
    {
      id: 'care-3d',
      category: 'companion',
      title: 'Как ухаживать за 3D-компаньоном и повышать уровень?',
      summary:
        'Ваш 3D-спутник (Нова, Люми или Шэдоу) живёт на главном экране, реагирует на прикосновения, голос и выполнение задач.',
      steps: [
        'Нажмите прямо на 3D-персонажа на Главной, чтобы погладить его и увидеть радостную 3D-реакцию.',
        'Используйте кнопки быстрого ухода («Покормить», «Погладить», «Отдых», «Играть»), чтобы восстанавливать энергию и получать очки опыта (XP).',
        'В разделе «Мир 3D» вы можете свободно переключаться между 3 героями (Нова, Люми, Шэдоу), менять освещение комнаты и открывать аксессуары за XP.',
        'Никаких штрафов за перерывы: если вы не заходили несколько дней, ваш прогресс и серия бережно сохраняются.',
      ],
      actionLabel: 'Перейти в Мир 3D',
      onAction: () => onNavigate('world'),
    },
    {
      id: 'voice-commands',
      category: 'voice_phone',
      title: 'Как управлять приложением голосом и текстом?',
      summary:
        'Вы можете давать поручения обычной живой речью или писать их в строку команд на Главной и во вкладке «Диалог».',
      steps: [
        'Нажмите кнопку «Голосом» с иконкой микрофона на Главной или в разделе «Диалог».',
        'Произнесите команду, например: «Создай напоминание позвонить маме в 18:00», «Составь план дня» или «Открой сообщения».',
        'Для живого непрерывного разговора в реальном времени откройте модуль «Живой голосовой звонок» в разделе «Разделы».',
      ],
      actionLabel: 'Открыть Диалог с помощником',
      onAction: () => onNavigate('ai'),
    },
    {
      id: 'calls-messengers',
      category: 'voice_phone',
      title: 'Как работают звонки по контактам и ответы в мессенджерах?',
      summary:
        'Помощник бережно готовит черновики ответов для WhatsApp, Telegram и Instagram Direct и совершает вызовы только с вашего согласия.',
      steps: [
        'Откройте вкладку «Разделы» на нижней панели и выберите блок «Связь и Телефон».',
        'В подразделе «Звонки и Контакты» выберите нужный контакт или добавьте свой номер для быстрого вызова.',
        'В подразделе «Мессенджеры» просмотрите подготовленный помощником ответ, отредактируйте его при желании и нажмите «Подтвердить и отправить».',
      ],
      actionLabel: 'Открыть Звонки и Мессенджеры',
      onAction: () => onOpenSuperHub('calls'),
    },
    {
      id: 'music-social',
      category: 'creative_maps',
      title: 'Как создавать музыку (.WAV) и посты для соцсетей?',
      summary:
        'Встроенная творческая студия позволяет генерировать мелодии и готовить сценарии для Reels, Сторис и Постов.',
      steps: [
        'Перейдите во вкладку «Разделы» ➔ блок «Творчество и Медиа».',
        'Откройте «Музыкальную студию», выберите жанр и настроение — помощник напишет куплет и синтезирует многодорожечный аудиофайл .WAV, который можно прослушать и скачать.',
        'В модуле «Посты / Сторис / Reels» укажите тему публикации, выберите визуальную обложку и сохраните готовый пост с хэштегами.',
      ],
      actionLabel: 'Открыть Музыкальную студию',
      onAction: () => onOpenFreeSuite('music'),
    },
    {
      id: 'maps-search',
      category: 'creative_maps',
      title: 'Как пользоваться интерактивной 3D-картой и поиском мест?',
      summary:
        'Находите кофейни, парки, аптеки и проверяйте актуальные факты с прямыми ссылками на источники.',
      steps: [
        'Во вкладке «Разделы» выберите блок «Карты и Навигация».',
        'Нажмите «Интерактивная Google Карта», чтобы увидеть карту города и найти интересные места рядом с вами.',
        'Используйте «Живой поиск фактов» для быстрой проверки новостей, погоды и расписаний.',
      ],
      actionLabel: 'Открыть Карту и Поиск',
      onAction: () => onOpenFreeSuite('maps'),
    },
    {
      id: 'persona-privacy',
      category: 'privacy_style',
      title: 'Как настроить характер помощника, память и дизайн?',
      summary:
        'Помощник адаптируется под ваш стиль общения — от вежливого ассистента до лучшего друга.',
      steps: [
        'В подразделе «Характер и Манера речи» выберите комфортный стиль общения, обращение к вам и любимые фразы.',
        'В разделе «Профиль и Память» вы всегда видите список фактов, которые запомнил помощник, и можете удалить любой из них в один клик.',
        'Вы можете в любой момент переключаться между двумя визуальными стилями: игровой «Game Design (Duolingo)» и футуристичный «Web 3.0 Glass».',
      ],
      actionLabel: 'Настроить характер помощника',
      onAction: () => onOpenSuperHub('persona'),
    },
  ];

  const filteredTopics =
    activeCategory === 'all'
      ? topics
      : topics.filter((item) => item.category === activeCategory);

  const cardSurfaceClass = isGame
    ? 'rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 border-b-4 border-b-slate-300 dark:border-b-slate-950 shadow-sm'
    : 'rounded-3xl bg-white/80 dark:bg-slate-900/65 backdrop-blur-xl border border-indigo-500/20 dark:border-cyan-400/20 shadow-[0_12px_36px_-12px_rgba(79,70,229,0.22)]';

  const primaryBtnClass = isGame
    ? 'px-4 py-2.5 rounded-2xl bg-[#58CC02] hover:bg-[#46A302] text-white font-extrabold text-xs border-b-4 border-[#46A302] active:border-b-0 active:translate-y-0.5 transition-all cursor-pointer'
    : 'px-4 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 hover:opacity-95 text-white font-bold text-xs shadow-lg shadow-indigo-500/25 transition-all cursor-pointer';

  return (
    <div className="space-y-6 pb-8">
      {/* Top Hero Banner of Help Center */}
      <div className={`${cardSurfaceClass} p-6 sm:p-7`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-extrabold">
              <HelpCircle className="w-4 h-4" />
              <span>Справочник и поддержка пользователя</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Помощь и Руководство по функциям
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Все возможности вашего 3D-компаньона разделены на понятные блоки. Здесь вы можете узнать, как пользоваться любой функцией, и выбрать любимый стиль оформления.
            </p>
          </div>

          {/* Instant Design Style Switcher: Game Design (Duolingo) vs Web 3.0 */}
          <div className="flex flex-col gap-2.5 shrink-0">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              Стиль пользовательского дизайна:
            </span>
            <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => onUpdateSettings({ designStyle: 'game' })}
                className={`flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  isGame
                    ? 'bg-[#58CC02] text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Gamepad2 className="w-4 h-4" />
                <span>Game Design</span>
              </button>
              <button
                type="button"
                onClick={() => onUpdateSettings({ designStyle: 'web3' })}
                className={`flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  !isGame
                    ? 'bg-gradient-to-r from-indigo-600 to-cyan-500 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>Web 3.0</span>
              </button>
            </div>
          </div>
        </div>

        {/* Quick 4-Card Feature Tour */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800/80">
          <button
            type="button"
            onClick={() => onNavigate('home')}
            className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800 text-left hover:border-emerald-500/50 transition-all cursor-pointer"
          >
            <Mic className="w-5 h-5 text-emerald-500 mb-1.5" />
            <div className="text-xs font-extrabold text-slate-900 dark:text-white">
              Голос и Команды
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Поручения в 1 касание
            </div>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('insights')}
            className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800 text-left hover:border-blue-500/50 transition-all cursor-pointer"
          >
            <MessageCircle className="w-5 h-5 text-blue-500 mb-1.5" />
            <div className="text-xs font-extrabold text-slate-900 dark:text-white">
              Все Разделы
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Звонки, музыка, карты
            </div>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('world')}
            className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800 text-left hover:border-purple-500/50 transition-all cursor-pointer"
          >
            <Sparkles className="w-5 h-5 text-purple-500 mb-1.5" />
            <div className="text-xs font-extrabold text-slate-900 dark:text-white">
              3 Героя в 3D
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Нова, Люми и Шэдоу
            </div>
          </button>

          <button
            type="button"
            onClick={() => onOpenSuperHub('health')}
            className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800 text-left hover:border-rose-500/50 transition-all cursor-pointer"
          >
            <HeartPulse className="w-5 h-5 text-rose-500 mb-1.5" />
            <div className="text-xs font-extrabold text-slate-900 dark:text-white">
              Тонус и Баланс
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Поддержка и привычки
            </div>
          </button>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const active = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`min-h-[42px] inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-extrabold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                active
                  ? isGame
                    ? 'bg-[#1CB0F6] text-white border-b-4 border-[#0088CC]'
                    : 'bg-gradient-to-r from-indigo-600 to-cyan-500 text-white shadow-md'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Accordion Guide Cards */}
      <div className="space-y-3.5">
        {filteredTopics.map((topic) => {
          const isOpen = expandedId === topic.id;
          return (
            <div key={topic.id} className={`${cardSurfaceClass} overflow-hidden transition-all`}>
              <button
                type="button"
                onClick={() => setExpandedId(isOpen ? null : topic.id)}
                className="w-full p-5 sm:p-6 flex items-center justify-between gap-4 text-left cursor-pointer"
              >
                <div className="space-y-1">
                  <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                    {topic.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                    {topic.summary}
                  </p>
                </div>
                <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 text-slate-600 dark:text-slate-300">
                  {isOpen ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </div>
              </button>

              {isOpen && (
                <div className="px-5 sm:px-6 pb-6 pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-4">
                  <ul className="space-y-2.5">
                    {topic.steps.map((step, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-3 text-xs sm:text-sm text-slate-700 dark:text-slate-200"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>

                  {topic.actionLabel && topic.onAction && (
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={topic.onAction}
                        className={primaryBtnClass}
                      >
                        {topic.actionLabel}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Link to User Profile Settings & Discreet Admin Mode Switch for Creator */}
      <div className={`${cardSurfaceClass} p-5 sm:p-6 flex flex-wrap items-center justify-between gap-4`}>
        <div className="space-y-1">
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
            Настройки памяти, языка и разрешений
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Управляйте фактами о вас, офлайн-пакетами и доступом к функциям устройства.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => onNavigate('profile')}
            className="min-h-[40px] px-4 py-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            Открыть настройки профиля
          </button>

          <button
            type="button"
            onClick={() =>
              onUpdateSettings({
                uiMode: (settings.uiMode === 'admin' ? 'user' : 'admin') as UIMode,
              })
            }
            className="min-h-[40px] inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
            title="Переключить в инженерную панель администратора"
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>
              {settings.uiMode === 'admin'
                ? 'Вернуться в режим Пользователя'
                : 'Режим Создателя (Админка)'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
