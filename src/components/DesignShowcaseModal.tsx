import React from 'react';
import {
  Sparkles,
  Sun,
  Moon,
  Check,
  X,
  Palette,
  Eye,
} from 'lucide-react';
import { AvatarId, ThemeMode, CompanionState, UserSettings } from '../types/companion';
import { CompanionCanvas } from './CompanionCanvas';

interface DesignShowcaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAvatar: AvatarId;
  currentTheme: ThemeMode;
  companion: CompanionState;
  settings: UserSettings;
  onSelectDesign: (avatarId: AvatarId, theme: ThemeMode) => void;
}

interface DesignPreset {
  id: string;
  name: string;
  subtitle: string;
  avatarId: AvatarId;
  theme: ThemeMode;
  badge: string;
  description: string;
}

export const DesignShowcaseModal: React.FC<DesignShowcaseModalProps> = ({
  isOpen,
  onClose,
  currentAvatar,
  currentTheme,
  companion,
  settings,
  onSelectDesign,
}) => {
  if (!isOpen) return null;

  const presets: DesignPreset[] = [
    {
      id: 'lumi_dark',
      name: 'Люми · Морской ангел (3D)',
      subtitle: 'Белоснежный скат с лазурными крыльями',
      avatarId: 'lumi',
      theme: 'dark',
      badge: 'Новинка #1 (3D)',
      description: 'Точная 3D копия из референса #6: белоснежное тело, огромные хрустально-аквамариновые глаза, светящиеся крылья ската и развевающиеся ленты.',
    },
    {
      id: 'nova_dark',
      name: 'Нова · Космо-осьминог (3D)',
      subtitle: 'Индиго-квами с галактической спиралью',
      avatarId: 'nova',
      theme: 'dark',
      badge: 'Новинка #2 (3D)',
      description: 'Точная 3D копия из референса #7: глубокий космический индиго-сферный силуэт, светящаяся спираль на лбу, антенны и живые изгибающиеся щупальца.',
    },
    {
      id: 'shadow_dark',
      name: 'Шэдоу · Теневой кот (3D)',
      subtitle: 'Неоновый пантера с медальоном',
      avatarId: 'shadow',
      theme: 'dark',
      badge: 'Новинка #3 (3D)',
      description: 'Точная 3D копия из референса #8: бархатно-чёрная пантера с сияющими неоново-фиолетовыми полосами, антеннами-усиками и светящимся медальоном на груди.',
    },
    {
      id: 'yobao_dark',
      name: 'Йобао · Цветочный маскот',
      subtitle: 'Жёлтая панама-цветок и росток',
      avatarId: 'yobao',
      theme: 'dark',
      badge: 'Коллекция',
      description: 'Очаровательный круглый жёлтый персонаж в шапочке из лепестков с ростком, тёплыми румяными щёчками и цветком рапса.',
    },
    {
      id: 'yobao_light',
      name: 'Йобао · Светлый фестиваль',
      subtitle: 'Цветочное весеннее настроение',
      avatarId: 'yobao',
      theme: 'light',
      badge: 'Светлая версия',
      description: 'Яркий весенний солнечный образ Йобао на светлом фоне для продуктивной дневной работы.',
    },
    {
      id: 'maya_dark',
      name: 'Майя · Тёмный Нео-Студио',
      subtitle: 'Кинематографичный фотореализм',
      avatarId: 'maya',
      theme: 'dark',
      badge: 'Фотореализм',
      description: 'Глубокий тёмный интерфейс с фотореалистичным компаньоном и динамическим звуковым откликом.',
    },
    {
      id: 'kira_dark',
      name: 'Кира · Ночной Студио (Версия А)',
      subtitle: 'Оригинальный стилизованный риг',
      avatarId: 'kira',
      theme: 'dark',
      badge: 'Классика ТЗ',
      description: 'Тёмный интерфейс ТЗ 1.0 с анимированным лисёнком-инженером Кирой и векторными эмоциями.',
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Выбор версии дизайна"
    >
      <div className="w-full max-w-4xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <Palette className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                Каталог версий дизайна
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Выберите готовую комбинацию стиля персонажа и темы оформления
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
            aria-label="Закрыть"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Presets Grid */}
        <div className="p-5 sm:p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4">
          {presets.map((preset) => {
            const isSelected =
              currentAvatar === preset.avatarId && currentTheme === preset.theme;

            return (
              <div
                key={preset.id}
                onClick={() => onSelectDesign(preset.avatarId, preset.theme)}
                className={`relative cursor-pointer rounded-2xl border p-4 sm:p-5 transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 ring-2 ring-blue-600/40'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                      {preset.badge}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-slate-500">
                      {preset.theme === 'dark' ? (
                        <>
                          <Moon className="w-3.5 h-3.5 text-amber-400" /> Тёмный фон
                        </>
                      ) : (
                        <>
                          <Sun className="w-3.5 h-3.5 text-amber-500" /> Светлый фон
                        </>
                      )}
                    </span>
                  </div>

                  <div className="flex items-start gap-4">
                    {/* Mini avatar preview container */}
                    <div className="w-20 h-20 shrink-0 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-900">
                      <CompanionCanvas
                        avatarId={preset.avatarId}
                        mood={companion.mood}
                        animation="idle"
                        room="studio"
                        inventory={[]}
                        batterySaver={false}
                        lowMemoryMode={false}
                        reducedMotion={true}
                        size="sm"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                        {preset.name}
                      </h3>
                      <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mt-0.5">
                        {preset.subtitle}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                        {preset.description}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    {isSelected ? 'Активная версия' : 'Нажмите для применения'}
                  </span>
                  <button
                    type="button"
                    className={`min-h-[36px] px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-blue-600 text-white'
                        : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    {isSelected ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        Выбрано
                      </>
                    ) : (
                      'Применить'
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
