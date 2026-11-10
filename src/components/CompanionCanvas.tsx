import React from 'react';
import {
  AnimationCue,
  AvatarId,
  CompanionMood,
  InventoryItem,
  RoomAtmosphere,
} from '../types/companion';
import { ThreeCompanionScene } from './ThreeCompanionScene';

interface CompanionCanvasProps {
  avatarId: AvatarId;
  mood: CompanionMood;
  animation: AnimationCue;
  room: RoomAtmosphere;
  inventory: InventoryItem[];
  batterySaver: boolean;
  lowMemoryMode: boolean;
  reducedMotion: boolean;
  onTapAvatar?: () => void;
  size?: 'sm' | 'md' | 'lg';
}

const AVATAR_PALETTES: Record<
  AvatarId,
  {
    primary: string;
    secondary: string;
    accent: string;
    belly: string;
    visor: string;
    label: string;
  }
> = {
  lumi: {
    primary: '#E0F2FE',
    secondary: '#38BDF8',
    accent: '#F472B6',
    belly: '#FFFFFF',
    visor: '#0284C7',
    label: 'Люми (Морской ангел)',
  },
  nova: {
    primary: '#1E1B4B',
    secondary: '#818CF8',
    accent: '#C084FC',
    belly: '#312E81',
    visor: '#A855F7',
    label: 'Нова (Космический осьминог)',
  },
  shadow: {
    primary: '#09090B',
    secondary: '#A855F7',
    accent: '#C084FC',
    belly: '#18181B',
    visor: '#9333EA',
    label: 'Шэдоу (Теневой кот)',
  },
  yobao: {
    primary: '#EAB308',
    secondary: '#FDE047',
    accent: '#713F12',
    belly: '#FEF9C3',
    visor: '#854D0E',
    label: 'Йобао (Цветочный)',
  },
  bobo: {
    primary: '#FACC15',
    secondary: '#FEF08A',
    accent: '#78350F',
    belly: '#FFFBEB',
    visor: '#A16207',
    label: 'Бобо (Птенец)',
  },
  pico: {
    primary: '#10B981',
    secondary: '#6EE7B7',
    accent: '#064E3B',
    belly: '#FFFFFF',
    visor: '#0F172A',
    label: 'Пико (Стритвер)',
  },
  kira: {
    primary: '#E07A5F',
    secondary: '#F4A261',
    accent: '#264653',
    belly: '#FFF8F0',
    visor: '#1E293B',
    label: 'Кира',
  },
  orion: {
    primary: '#3B5BDB',
    secondary: '#748FFC',
    accent: '#1E293B',
    belly: '#EDF2FF',
    visor: '#0F172A',
    label: 'Орион',
  },
  mochi: {
    primary: '#0D9488',
    secondary: '#5EEAD4',
    accent: '#134E4A',
    belly: '#F0FDFA',
    visor: '#115E59',
    label: 'Моти',
  },
  maya: {
    primary: '#475569',
    secondary: '#94A3B8',
    accent: '#0F172A',
    belly: '#F8FAFC',
    visor: '#1E293B',
    label: 'Майя (Реалистичный)',
  },
};

const ROOM_BACKDROPS: Record<RoomAtmosphere, string> = {
  studio:
    'bg-gradient-to-b from-slate-100 via-slate-50 to-slate-200/70 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800/80',
  morning:
    'bg-gradient-to-b from-amber-50 via-orange-50/50 to-stone-100 dark:from-slate-900 dark:via-amber-950/20 dark:to-slate-900',
  night:
    'bg-gradient-to-b from-indigo-950 via-slate-900 to-slate-950 text-white',
};

export const CompanionCanvas: React.FC<CompanionCanvasProps> = ({
  avatarId,
  mood,
  animation,
  room,
  inventory,
  batterySaver,
  lowMemoryMode,
  reducedMotion,
  onTapAvatar,
  size = 'lg',
}) => {
  const palette = AVATAR_PALETTES[avatarId];
  const equipped = new Set(
    inventory
      .filter((i) => i.equipped && i.compatibleAvatars.includes(avatarId))
      .map((i) => i.slot)
  );

  const isStatic = lowMemoryMode || reducedMotion;
  const floatClass = isStatic
    ? ''
    : animation === 'play' || animation === 'success'
      ? 'animate-companion-bounce'
      : batterySaver
        ? 'animate-companion-float-30fps'
        : 'animate-companion-float';

  const dims =
    size === 'sm'
      ? 'w-28 h-28'
      : size === 'md'
        ? 'w-44 h-44'
        : 'w-56 h-56 sm:w-64 sm:h-64';

  const isSleeping = animation === 'sleep' || mood === 'tired';
  const isListening = animation === 'listen';
  const isThinking = animation === 'think';
  const isSpeaking = animation === 'speak';
  const isEating = animation === 'eat';
  const isError = animation === 'error';

  return (
    <div
      className={`relative flex flex-col items-center justify-center select-none transition-colors duration-200 ${
        size === 'sm' ? 'p-1' : 'p-2 sm:p-4'
      }`}
    >

      {/* Dynamic Ambient Room Atmosphere Aura */}
      <div
        className={`pointer-events-none absolute inset-0 -z-0 rounded-full blur-3xl transition-all duration-700 opacity-70 ${
          room === 'morning'
            ? 'bg-amber-400/25 dark:bg-amber-500/25 scale-110'
            : room === 'night'
              ? 'bg-indigo-600/30 dark:bg-indigo-500/30 scale-105'
              : 'bg-blue-400/10 dark:bg-blue-500/10 scale-95'
        }`}
        aria-hidden="true"
      />

      {/* Listening acoustic ring */}
      {isListening && !isStatic && (
        <div
          className="pointer-events-none absolute w-40 h-40 rounded-full border-2 border-blue-500/50 animate-companion-ring"
          aria-hidden="true"
        />
      )}

      {/* Thinking orbital indicator */}
      {isThinking && !isStatic && (
        <div
          className="pointer-events-none absolute w-48 h-48 animate-companion-orbit"
          aria-hidden="true"
        >
          <span className="block w-3 h-3 rounded-full bg-blue-600 dark:bg-blue-400 shadow-sm" />
        </div>
      )}

      <div
        className={`relative z-10 flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
          size === 'sm' ? 'w-28 h-28' : 'w-72 h-72 sm:w-84 sm:h-84 md:w-96 md:h-96'
        } ${floatClass}`}
      >
        {avatarId === 'lumi' || avatarId === 'nova' || avatarId === 'shadow' || avatarId === 'yobao' || avatarId === 'bobo' || avatarId === 'pico' ? (
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Seamless Borderless Real-Time Three.js WebGL Scene */}
            <ThreeCompanionScene
              avatarId={avatarId}
              mood={mood}
              animation={animation}
              room={room}
              batterySaver={batterySaver}
              onTap={onTapAvatar}
            />

            {/* Audio wave / speech indicator */}
            {isSpeaking && (
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md border border-white/20 pointer-events-none shadow-lg">
                <span className="w-1.5 h-3.5 bg-amber-400 rounded-full animate-bounce" />
                <span className="w-1.5 h-5 bg-amber-300 rounded-full animate-bounce [animation-delay:0.15s]" />
                <span className="w-1.5 h-3 bg-amber-400 rounded-full animate-bounce [animation-delay:0.3s]" />
              </div>
            )}
          </div>
        ) : avatarId === 'maya' ? (
          <div
            onClick={onTapAvatar}
            className="cursor-pointer relative w-56 h-56 sm:w-64 sm:h-64 rounded-full overflow-hidden shadow-2xl ring-4 ring-white/10 group"
          >
            <img
              src="/src/assets/images/realistic_ai_companion_portrait_1794326420714.jpg"
              alt={palette.label}
              referrerPolicy="no-referrer"
              className={`w-full h-full object-cover transition-transform duration-500 ${
                isThinking ? 'scale-105 filter brightness-105' : 'scale-100'
              } ${isSleeping ? 'filter brightness-75 contrast-90' : ''}`}
            />
            {/* Ambient status glow on neckline/rim */}
            <div
              className={`absolute inset-0 pointer-events-none transition-opacity duration-300 ${
                isListening
                  ? 'bg-blue-500/20 shadow-[inset_0_0_24px_rgba(59,130,246,0.6)]'
                  : isSpeaking
                    ? 'bg-teal-500/15 shadow-[inset_0_0_20px_rgba(20,184,166,0.5)]'
                    : isError
                      ? 'bg-rose-500/20 shadow-[inset_0_0_20px_rgba(244,63,94,0.5)]'
                      : 'bg-transparent'
              }`}
            />
            {/* Audio wave / speech indicator */}
            {isSpeaking && (
              <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20">
                <span className="w-1 h-3 bg-teal-400 rounded-full animate-bounce" />
                <span className="w-1 h-4 bg-teal-300 rounded-full animate-bounce [animation-delay:0.15s]" />
                <span className="w-1 h-2.5 bg-teal-400 rounded-full animate-bounce [animation-delay:0.3s]" />
              </div>
            )}
            {/* Subtle mood tag badge */}
            <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-black/50 backdrop-blur-sm border border-white/10 text-[10px] font-medium text-white/90">
              {mood === 'happy' ? 'Светлое' : mood === 'calm' ? 'Спокойное' : mood === 'curious' ? 'Фокус' : 'Отдых'}
            </div>
          </div>
        ) : (
          <svg
            viewBox="0 0 240 240"
            className="w-full h-full drop-shadow-sm cursor-pointer"
            onClick={onTapAvatar}
            role="img"
            aria-label={palette.label}
          >
          {/* Soft ground shadow */}
          <ellipse
            cx="120"
            cy="214"
            rx="56"
            ry="10"
            fill="currentColor"
            className="text-slate-900/10 dark:text-black/35"
          />

          {/* Avatar-specific ears / silhouette behind head */}
          {avatarId === 'kira' && (
            <g>
              <path
                d="M66 94 L54 44 L96 74 Z"
                fill={palette.primary}
                stroke={palette.accent}
                strokeWidth="3"
                strokeLinejoin="round"
              />
              <path d="M68 84 L61 56 L86 74 Z" fill={palette.belly} />
              <path
                d="M174 94 L186 44 L144 74 Z"
                fill={palette.primary}
                stroke={palette.accent}
                strokeWidth="3"
                strokeLinejoin="round"
              />
              <path d="M172 84 L179 56 L154 74 Z" fill={palette.belly} />
            </g>
          )}

          {avatarId === 'orion' && (
            <g>
              {/* Antenna */}
              <line
                x1="120"
                y1="62"
                x2="120"
                y2="34"
                stroke={palette.accent}
                strokeWidth="4"
                strokeLinecap="round"
              />
              <circle
                cx="120"
                cy="30"
                r="8"
                fill={isListening ? '#2563EB' : isError ? '#DC2626' : palette.secondary}
                stroke={palette.accent}
                strokeWidth="3"
              />
            </g>
          )}

          {avatarId === 'mochi' && (
            <g>
              <circle cx="82" cy="76" r="22" fill={palette.primary} />
              <circle cx="158" cy="76" r="22" fill={palette.primary} />
            </g>
          )}

          {/* Shared Rig Body */}
          <rect
            x="64"
            y="128"
            width="112"
            height="76"
            rx="38"
            fill={palette.primary}
            stroke={palette.accent}
            strokeWidth="3"
          />
          <ellipse cx="120" cy="172" rx="34" ry="26" fill={palette.belly} />

          {/* Arms */}
          <ellipse
            cx="56"
            cy={animation === 'success' || animation === 'play' ? '140' : '162'}
            rx="14"
            ry="22"
            transform={
              animation === 'success' || animation === 'play'
                ? 'rotate(-24 56 140)'
                : 'rotate(12 56 162)'
            }
            fill={palette.secondary}
            stroke={palette.accent}
            strokeWidth="3"
          />
          <ellipse
            cx="184"
            cy={animation === 'success' || animation === 'play' ? '140' : '162'}
            rx="14"
            ry="22"
            transform={
              animation === 'success' || animation === 'play'
                ? 'rotate(24 184 140)'
                : 'rotate(-12 184 162)'
            }
            fill={palette.secondary}
            stroke={palette.accent}
            strokeWidth="3"
          />

          {/* Shared Rig Head */}
          <rect
            x="56"
            y="60"
            width="128"
            height="92"
            rx="44"
            fill={palette.primary}
            stroke={palette.accent}
            strokeWidth="3"
          />

          {/* Face Plate */}
          <rect
            x="70"
            y="76"
            width="100"
            height="62"
            rx="28"
            fill={avatarId === 'orion' ? palette.visor : palette.belly}
          />

          {/* Eyes */}
          {isSleeping ? (
            <g
              stroke={avatarId === 'orion' ? '#93C5FD' : palette.accent}
              strokeWidth="3.5"
              strokeLinecap="round"
              fill="none"
            >
              <path d="M88 104 Q96 110 104 104" />
              <path d="M136 104 Q144 110 152 104" />
            </g>
          ) : isError ? (
            <g
              stroke={avatarId === 'orion' ? '#FCA5A5' : '#DC2626'}
              strokeWidth="3.5"
              strokeLinecap="round"
            >
              <line x1="90" y1="98" x2="102" y2="108" />
              <line x1="102" y1="98" x2="90" y2="108" />
              <line x1="138" y1="98" x2="150" y2="108" />
              <line x1="150" y1="98" x2="138" y2="108" />
            </g>
          ) : mood === 'happy' || animation === 'success' ? (
            <g
              stroke={avatarId === 'orion' ? '#93C5FD' : palette.accent}
              strokeWidth="3.5"
              strokeLinecap="round"
              fill="none"
            >
              <path d="M88 106 Q96 96 104 106" />
              <path d="M136 106 Q144 96 152 106" />
            </g>
          ) : (
            <g>
              <circle
                cx="96"
                cy="103"
                r={mood === 'curious' ? 8 : 6.5}
                fill={avatarId === 'orion' ? '#60A5FA' : palette.accent}
              />
              <circle
                cx="144"
                cy="103"
                r={mood === 'curious' ? 6 : 6.5}
                fill={avatarId === 'orion' ? '#60A5FA' : palette.accent}
              />
              <circle cx="98.5" cy="100.5" r="2.2" fill="#FFFFFF" />
              <circle cx="146.5" cy="100.5" r="2.2" fill="#FFFFFF" />
            </g>
          )}

          {/* Mouth */}
          {isSpeaking ? (
            <ellipse
              cx="120"
              cy="122"
              rx="10"
              ry="6"
              fill={avatarId === 'orion' ? '#60A5FA' : palette.accent}
            />
          ) : isEating ? (
            <g>
              <circle cx="120" cy="122" r="7" fill={palette.accent} />
              <circle cx="136" cy="124" r="5" fill="#F59E0B" />
            </g>
          ) : isError ? (
            <path
              d="M110 124 Q120 118 130 124"
              stroke={avatarId === 'orion' ? '#FCA5A5' : palette.accent}
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
            />
          ) : (
            <path
              d="M111 119 Q120 126 129 119"
              stroke={avatarId === 'orion' ? '#93C5FD' : palette.accent}
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
            />
          )}

          {/* Wardrobe Slot: Scarf */}
          {equipped.has('scarf') && (
            <g>
              <rect
                x="78"
                y="144"
                width="84"
                height="14"
                rx="7"
                fill="#D97706"
                stroke="#78350F"
                strokeWidth="2.5"
              />
              <rect
                x="136"
                y="150"
                width="16"
                height="26"
                rx="6"
                fill="#B45309"
                stroke="#78350F"
                strokeWidth="2.5"
              />
            </g>
          )}

          {/* Wardrobe Slot: Glasses */}
          {equipped.has('glasses') && (
            <g stroke="#0F172A" strokeWidth="3" fill="rgba(255,255,255,0.18)">
              <rect x="80" y="92" width="32" height="22" rx="6" />
              <rect x="128" y="92" width="32" height="22" rx="6" />
              <line x1="112" y1="102" x2="128" y2="102" />
            </g>
          )}

          {/* Wardrobe Slot: Headphones */}
          {equipped.has('headphones') && (
            <g>
              <path
                d="M52 104 C52 50, 188 50, 188 104"
                fill="none"
                stroke="#1E293B"
                strokeWidth="7"
                strokeLinecap="round"
              />
              <rect
                x="44"
                y="90"
                width="16"
                height="34"
                rx="8"
                fill="#2563EB"
                stroke="#1E293B"
                strokeWidth="2.5"
              />
              <rect
                x="180"
                y="90"
                width="16"
                height="34"
                rx="8"
                fill="#2563EB"
                stroke="#1E293B"
                strokeWidth="2.5"
              />
            </g>
          )}

          {/* Wardrobe Slot: Focus Sprout Hat */}
          {equipped.has('hat') && (
            <g>
              <path
                d="M120 60 C120 44, 120 40, 120 38"
                stroke="#15803D"
                strokeWidth="4"
                strokeLinecap="round"
              />
              <ellipse
                cx="110"
                cy="36"
                rx="11"
                ry="6"
                transform="rotate(-20 110 36)"
                fill="#22C55E"
                stroke="#14532D"
                strokeWidth="2"
              />
              <ellipse
                cx="130"
                cy="36"
                rx="11"
                ry="6"
                transform="rotate(20 130 36)"
                fill="#4ADE80"
                stroke="#14532D"
                strokeWidth="2"
              />
            </g>
          )}
        </svg>
        )}

        {/* Sleep Zzz caption */}
        {isSleeping && (
          <span className="absolute top-3 right-4 font-mono text-xs font-semibold text-slate-500 dark:text-slate-300">
            Zzz
          </span>
        )}
      </div>

      {/* Clean unboxed state caption below avatar */}
      {size !== 'sm' && (
        <div className="relative z-10 mt-2 flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
          <span className="font-medium text-slate-900 dark:text-slate-100">{palette.label}</span>
          <span aria-hidden="true">·</span>
          <span>{animation}</span>
          {lowMemoryMode && (
            <>
              <span aria-hidden="true">·</span>
              <span>Static (Low RAM)</span>
            </>
          )}
          {!lowMemoryMode && batterySaver && (
            <>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">30 FPS</span>
            </>
          )}
        </div>
      )}
    </div>
  );
};
