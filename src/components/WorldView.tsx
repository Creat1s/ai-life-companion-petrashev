import React from 'react';
import {
  AvatarId,
  CompanionMood,
  CompanionState,
  DesignStyle,
  InventoryItem,
  RoomAtmosphere,
  UserSettings,
} from '../types/companion';
import { translations } from '../data/i18n';
import { CompanionEvent } from '../engine/companionReducer';
import { CompanionCanvas } from './CompanionCanvas';
import { MiniGame } from './MiniGame';
import { playSound } from '../engine/audioEffects';

interface WorldViewProps {
  companion: CompanionState;
  settings: UserSettings;
  inventory: InventoryItem[];
  onDispatchCompanion: (event: CompanionEvent) => void;
  onUnlockOrToggleItem: (itemId: string) => void;
}

const AVATARS_3D: { id: AvatarId; name: string; trait: string }[] = [
  { id: 'nova', name: 'Нова', trait: 'Космический осьминог · Индиго' },
  { id: 'lumi', name: 'Люми', trait: 'Морской ангел · Лазурные крылья' },
  { id: 'shadow', name: 'Шэдоу', trait: 'Теневой кот · Неоновый медальон' },
];

export const WorldView: React.FC<WorldViewProps> = ({
  companion,
  settings,
  inventory,
  onDispatchCompanion,
  onUnlockOrToggleItem,
}) => {
  const t = translations[settings.locale].world;
  const isAdmin = settings.uiMode === 'admin';
  const style: DesignStyle = settings.designStyle || 'game';
  const isGame = style === 'game';

  const cardSurfaceClass = isGame
    ? 'rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 border-b-4 border-b-slate-300 dark:border-b-slate-950 shadow-sm'
    : 'rounded-3xl bg-white/80 dark:bg-slate-900/65 backdrop-blur-xl border border-indigo-500/20 dark:border-cyan-400/20 shadow-[0_12px_36px_-12px_rgba(79,70,229,0.22)]';

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
          {t.title}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          {t.subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Live 3D Character Stage + 3 Hero Switcher + Room Atmosphere */}
        <div className={`lg:col-span-5 ${cardSurfaceClass} p-5 sm:p-6 space-y-5`}>
          <CompanionCanvas
            avatarId={companion.avatarId}
            mood={companion.mood}
            animation={companion.animation}
            room={companion.room}
            inventory={inventory}
            batterySaver={settings.batterySaver}
            lowMemoryMode={settings.lowMemoryMode}
            reducedMotion={settings.reducedMotion}
            showDebugControls={isAdmin}
            onTapAvatar={() => onDispatchCompanion({ type: 'PET' })}
          />

          {/* 3 Flagship 3D Heroes Switcher (Screenshot 3 cleaned up) */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-extrabold text-slate-900 dark:text-slate-100">
                {t.avatarsTitle}
              </span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                Уровень {companion.level} · {companion.xp} XP
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {AVATARS_3D.map((av) => {
                const isSelected = companion.avatarId === av.id;
                return (
                  <button
                    key={av.id}
                    type="button"
                    onClick={() =>
                      onDispatchCompanion({ type: 'SWITCH_AVATAR', avatarId: av.id })
                    }
                    className={`min-h-[52px] px-3.5 py-2.5 rounded-2xl text-left transition-all cursor-pointer ${
                      isSelected
                        ? isGame
                          ? 'bg-[#1CB0F6] text-white border-b-4 border-[#0088CC] font-extrabold'
                          : 'bg-gradient-to-r from-indigo-600 to-cyan-500 text-white shadow-md font-bold'
                        : 'border-2 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="text-xs font-extrabold truncate">{av.name}</div>
                    <div
                      className={`text-[10px] truncate mt-0.5 ${
                        isSelected ? 'text-white/90' : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {av.trait}
                    </div>
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t.switchNoLoss}
            </p>
          </div>

          {/* Room Atmosphere Selector (Mood debug selector hidden in User Mode per Screenshot 4) */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <span className="block text-xs font-extrabold text-slate-800 dark:text-slate-200">
                  {t.roomTitle}
                </span>
                <span className="text-[11px] text-amber-600 dark:text-amber-400 font-bold">
                  {companion.room === 'morning'
                    ? '☀️ Утро (Золотой свет)'
                    : companion.room === 'night'
                      ? '🌙 Ночь (Звёздное свечение)'
                      : '💡 Студия (Дневной свет)'}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { id: 'studio', label: 'Студия', icon: '💡', sub: 'Дневной' },
                  { id: 'morning', label: 'Утро', icon: '☀️', sub: 'Рассвет' },
                  { id: 'night', label: 'Ночь', icon: '🌙', sub: 'Уютный' },
                ].map((rm) => {
                  const active = companion.room === rm.id;
                  return (
                    <button
                      key={rm.id}
                      type="button"
                      onClick={() => {
                        playSound(rm.id as RoomAtmosphere);
                        onDispatchCompanion({
                          type: 'SET_ROOM',
                          room: rm.id as RoomAtmosphere,
                        });
                      }}
                      className={`min-h-[54px] px-2.5 py-2 rounded-2xl text-center transition-all cursor-pointer ${
                        active
                          ? isGame
                            ? 'bg-amber-500 text-slate-950 border-b-4 border-amber-700 font-extrabold'
                            : 'bg-gradient-to-br from-amber-500 to-orange-500 text-slate-950 font-bold shadow-md'
                          : 'border-2 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="text-sm">{rm.icon}</div>
                      <div className="text-xs font-extrabold truncate">{rm.label}</div>
                      <div
                        className={`text-[10px] truncate ${
                          active ? 'text-slate-900/80' : 'text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        {rm.sub}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Admin-only manual mood override */}
            {isAdmin && (
              <div>
                <span className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-2">
                  {t.moodTitle} (Режим создателя)
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'happy', label: 'Радостный', icon: '😊' },
                    { id: 'calm', label: 'Спокойный', icon: '🌿' },
                    { id: 'curious', label: 'Любопытный', icon: '🔍' },
                    { id: 'tired', label: 'Сонный', icon: '💤' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => {
                        playSound(m.id as CompanionMood);
                        onDispatchCompanion({
                          type: 'SET_MOOD',
                          mood: m.id as CompanionMood,
                        });
                      }}
                      className={`min-h-[40px] px-2.5 py-1.5 rounded-xl border text-left text-xs ${
                        companion.mood === m.id
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/60 font-semibold'
                          : 'border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      {m.icon} {m.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Wardrobe + Mini-Game */}
        <div className="lg:col-span-7 space-y-6">
          <div className={`${cardSurfaceClass} p-5 sm:p-6`}>
            <div className="flex items-center justify-between gap-2 mb-4">
              <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                {t.wardrobeTitle}
              </h2>
              <span className="text-xs font-extrabold px-3 py-1 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 tabular-nums">
                Доступно: {companion.xp} XP
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {inventory.map((item) => {
                const canAfford = companion.xp >= item.costXp;
                return (
                  <div
                    key={item.itemId}
                    className="flex items-center justify-between gap-3 rounded-2xl border-2 border-slate-200/80 dark:border-slate-800 p-3.5"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                        {item.name[settings.locale]}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                        {item.owned ? t.owned : `Стоимость: ${item.costXp} XP`}
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={!item.owned && !canAfford}
                      onClick={() => onUnlockOrToggleItem(item.itemId)}
                      className={`min-h-[40px] px-4 py-1.5 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                        item.equipped
                          ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                          : item.owned
                            ? 'border-2 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                            : canAfford
                              ? isGame
                                ? 'bg-[#58CC02] text-white border-b-2 border-[#46A302]'
                                : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                              : 'border border-slate-200 dark:border-slate-800 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      {item.equipped ? t.unequip : item.owned ? t.equip : t.unlock}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <MiniGame
            locale={settings.locale}
            highScore={companion.highScoreMiniGame}
            batterySaver={settings.batterySaver}
            onComplete={(score) => onDispatchCompanion({ type: 'PLAY_FINISH', score })}
          />
        </div>
      </div>
    </div>
  );
};
