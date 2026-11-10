import React from 'react';
import {
  AvatarId,
  CompanionMood,
  CompanionState,
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

const AVATARS: { id: AvatarId; name: string; trait: string }[] = [
  { id: 'lumi', name: 'Люми (Морской ангел)', trait: '3D скат · Лазурные крылья · Референс #6' },
  { id: 'nova', name: 'Нова (Космо-осьминог)', trait: '3D квами · Индиго спираль · Референс #7' },
  { id: 'shadow', name: 'Шэдоу (Теневой кот)', trait: '3D пантера · Неоновый медальон · Референс #8' },
  { id: 'yobao', name: 'Йобао (Цветочный)', trait: 'Цветочная панама · Жёлтый маскот' },
  { id: 'bobo', name: 'Бобо (Птенец)', trait: 'Мягкие ушки · Нежный птенец' },
  { id: 'pico', name: 'Пико (Стритвер)', trait: 'Худи и бита · Стрит-арт' },
  { id: 'maya', name: 'Майя (Фотореализм)', trait: 'AI Studio Human · Фотопортрет' },
];

export const WorldView: React.FC<WorldViewProps> = ({
  companion,
  settings,
  inventory,
  onDispatchCompanion,
  onUnlockOrToggleItem,
}) => {
  const t = translations[settings.locale].world;
  const moodLabels = translations[settings.locale].moods;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          {t.title}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          {t.subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Live Character Stage + Mood + Room */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-5">
          <CompanionCanvas
            avatarId={companion.avatarId}
            mood={companion.mood}
            animation={companion.animation}
            room={companion.room}
            inventory={inventory}
            batterySaver={settings.batterySaver}
            lowMemoryMode={settings.lowMemoryMode}
            reducedMotion={settings.reducedMotion}
            onTapAvatar={() => onDispatchCompanion({ type: 'PET' })}
          />

          {/* Shared Rig Avatar Switcher (CMP-01) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                {t.avatarsTitle}
              </span>
              <span className="text-slate-500 dark:text-slate-400 tabular-nums">
                Lvl {companion.level} · {companion.xp} XP
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {AVATARS.map((av) => (
                <button
                  key={av.id}
                  type="button"
                  onClick={() => onDispatchCompanion({ type: 'SWITCH_AVATAR', avatarId: av.id })}
                  className={`min-h-[44px] px-3 py-2 rounded-xl border text-left transition-colors ${
                    companion.avatarId === av.id
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300'
                      : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="text-xs font-semibold truncate">{av.name}</div>
                  <div className="text-[11px] opacity-75 truncate">{av.trait}</div>
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t.switchNoLoss}
            </p>
          </div>

          {/* Mood & Room Atmosphere */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100 dark:border-slate-800">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="block text-xs font-semibold text-slate-800 dark:text-slate-200">
                  {t.moodTitle}
                </span>
                <span className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">
                  {companion.mood === 'happy'
                    ? '😊 Радостный'
                    : companion.mood === 'calm'
                      ? '🌿 Спокойный'
                      : companion.mood === 'curious'
                        ? '🔍 Любопытный'
                        : '💤 Сонный'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'happy', label: 'Радостный', icon: '😊', desc: 'Прыгает и сияет' },
                  { id: 'calm', label: 'Спокойный', icon: '🌿', desc: 'Плавное дыхание' },
                  { id: 'curious', label: 'Любопытный', icon: '🔍', desc: 'Наклон головы' },
                  { id: 'tired', label: 'Сонный', icon: '💤', desc: 'Спит, пузырьки Zzz' },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      playSound(m.id as CompanionMood);
                      onDispatchCompanion({ type: 'SET_MOOD', mood: m.id as CompanionMood });
                    }}
                    className={`min-h-[46px] px-2.5 py-2 rounded-xl border text-left transition-all ${
                      companion.mood === m.id
                        ? 'border-blue-600 bg-blue-50/80 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 ring-2 ring-blue-500/30 font-semibold shadow-sm scale-[1.02]'
                        : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-xs">
                      <span>{m.icon}</span>
                      <span className="truncate">{m.label}</span>
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {m.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="block text-xs font-semibold text-slate-800 dark:text-slate-200">
                  {t.roomTitle}
                </span>
                <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                  {companion.room === 'morning'
                    ? '☀️ Утро (Золотой свет)'
                    : companion.room === 'night'
                      ? '🌙 Ночь (Луна и светлячки)'
                      : '💡 Студия (Дневной свет)'}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'studio', label: 'Studio', icon: '💡', sub: 'Студия' },
                  { id: 'morning', label: 'Morning', icon: '☀️', sub: 'Утро' },
                  { id: 'night', label: 'Night', icon: '🌙', sub: 'Ночь' },
                ].map((rm) => (
                  <button
                    key={rm.id}
                    type="button"
                    onClick={() => {
                      playSound(rm.id as RoomAtmosphere);
                      onDispatchCompanion({ type: 'SET_ROOM', room: rm.id as RoomAtmosphere });
                    }}
                    className={`min-h-[46px] px-2 py-2 rounded-xl border text-center transition-all ${
                      companion.room === rm.id
                        ? 'border-amber-500 bg-amber-50/80 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 ring-2 ring-amber-500/30 font-semibold shadow-sm scale-[1.02]'
                        : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="text-sm">{rm.icon}</div>
                    <div className="text-xs font-medium truncate">{rm.label}</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{rm.sub}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Wardrobe + Offline Mini-Game */}
        <div className="lg:col-span-7 space-y-6">
          {/* Wardrobe */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6">
            <div className="flex items-center justify-between gap-2 mb-4">
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                {t.wardrobeTitle}
              </h2>
              <span className="text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400">
                {companion.xp} XP available
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {inventory.map((item) => {
                const canAfford = companion.xp >= item.costXp;
                return (
                  <div
                    key={item.itemId}
                    className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 dark:border-slate-800 p-3.5"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                        {item.name[settings.locale]}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                        {item.slot} · {item.owned ? t.owned : `${item.costXp} XP`}
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={!item.owned && !canAfford}
                      onClick={() => onUnlockOrToggleItem(item.itemId)}
                      className={`min-h-[40px] px-3.5 py-1.5 rounded-xl text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                        item.equipped
                          ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                          : item.owned
                            ? 'border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                            : canAfford
                              ? 'bg-blue-600 hover:bg-blue-700 text-white'
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

          {/* Offline Deterministic Mini-Game (CMP-04) */}
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
