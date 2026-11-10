import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  showDebugControls?: boolean;
  onTapAvatar?: () => void;
  size?: 'sm' | 'md' | 'lg';
}

const AVATAR_LABELS: Record<AvatarId, string> = {
  lumi: 'Люми (3D Морской ангел)',
  nova: 'Нова (3D Космический осьминог)',
  shadow: 'Шэдоу (3D Теневой кот)',
  yobao: 'Нова (3D Космический осьминог)',
  bobo: 'Люми (3D Морской ангел)',
  pico: 'Шэдоу (3D Теневой кот)',
  kira: 'Кира (3D Облик)',
  orion: 'Орион (3D Облик)',
  mochi: 'Моти (3D Облик)',
  maya: 'Нова (3D Космический осьминог)',
};

const STATE_LABELS_RU: Record<AnimationCue, string> = {
  idle: 'Idle · Парение',
  listen: 'Listen · Слушаю голос',
  think: 'Think · ИИ-анализ',
  speak: 'Speak · Живая речь',
  success: 'Happy · Радость',
  play: 'Happy · Игра',
  eat: 'Happy · Питание',
  sleep: 'Sleep · Сон в невесомости',
  error: 'Внимание',
};

export const CompanionCanvas: React.FC<CompanionCanvasProps> = ({
  avatarId,
  mood,
  animation,
  room,
  batterySaver,
  lowMemoryMode,
  reducedMotion,
  showDebugControls = false,
  onTapAvatar,
  size = 'lg',
}) => {
  const label = AVATAR_LABELS[avatarId] || '3D Компаньон';
  const isSpeaking = animation === 'speak';
  const isSleeping = animation === 'sleep' || mood === 'tired';

  // Unclipped wide stage so tentacles, antennae, and wings never hit a container border
  const stageSizeClass =
    size === 'sm'
      ? 'w-36 h-36 overflow-visible'
      : size === 'md'
        ? 'w-72 h-72 overflow-visible'
        : 'w-full min-h-[370px] sm:min-h-[430px] md:min-h-[460px] overflow-visible';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 220, damping: 24 }}
      className="relative w-full overflow-visible flex flex-col items-center justify-center select-none p-0"
    >
      {/* Dynamic Ambient Room Atmosphere Aura driven by Framer Motion */}
      <motion.div
        animate={{
          scale: room === 'morning' ? 1.12 : room === 'night' ? 1.08 : 1.02,
          opacity: isSleeping ? 0.45 : 0.72,
        }}
        transition={{ duration: 0.9, ease: 'easeInOut' }}
        className={`pointer-events-none absolute inset-0 -z-0 rounded-full blur-3xl ${
          room === 'morning'
            ? 'bg-amber-400/25 dark:bg-amber-500/25'
            : room === 'night'
              ? 'bg-indigo-600/30 dark:bg-indigo-500/30'
              : 'bg-blue-400/15 dark:bg-blue-500/15'
        }`}
        aria-hidden="true"
      />

      {/* Unclipped 3D WebGL Character Stage with Framer Motion Avatar Switching */}
      <div
        className={`relative z-10 flex items-center justify-center focus:outline-none ${stageSizeClass}`}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={avatarId}
            initial={{ opacity: 0, scale: 0.86, rotateY: -18 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            exit={{ opacity: 0, scale: 0.86, rotateY: 18 }}
            transition={{ type: 'spring', stiffness: 240, damping: 22 }}
            className="relative w-full h-full overflow-visible flex items-center justify-center"
          >
            <ThreeCompanionScene
              avatarId={avatarId}
              mood={mood}
              animation={animation}
              room={room}
              batterySaver={batterySaver}
              reducedMotion={reducedMotion || lowMemoryMode}
              size={size}
              isListening={animation === 'listen'}
              isSpeaking={isSpeaking}
              showDebugControls={showDebugControls}
              onTap={onTapAvatar}
            />
          </motion.div>
        </AnimatePresence>

        {/* Framer Motion Equalizer Indicator when Speaking */}
        <AnimatePresence>
          {isSpeaking && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 300, damping: 24 }}
              className="absolute bottom-14 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/85 backdrop-blur-md border border-white/15 pointer-events-none shadow-lg z-30"
            >
              {[0, 1, 2, 3].map((barIdx) => (
                <motion.span
                  key={barIdx}
                  animate={{
                    height: ['8px', '18px', '10px', '20px', '8px'],
                  }}
                  transition={{
                    duration: 0.75,
                    repeat: Infinity,
                    delay: barIdx * 0.12,
                    ease: 'easeInOut',
                  }}
                  className="w-1.5 bg-purple-400 rounded-full block"
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Framer Motion Floating Zzz Indicator when Sleeping */}
        <AnimatePresence>
          {isSleeping && (
            <motion.span
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: [0.4, 1, 0.4], y: [-2, -10, -2] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute top-3 right-4 font-mono text-xs font-semibold text-indigo-400 dark:text-indigo-300 z-30"
            >
              Zzz
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* State Caption with Framer Motion Layout Transition (Shown ONLY in Admin Mode) */}
      {size !== 'sm' && showDebugControls && (
        <motion.div
          layout
          className="relative z-20 mt-1 flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300"
        >
          <span className="font-semibold text-slate-900 dark:text-slate-100">{label}</span>
          <span aria-hidden="true">·</span>
          <motion.span
            key={animation}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-mono text-purple-600 dark:text-purple-400 font-medium"
          >
            {STATE_LABELS_RU[animation] || animation}
          </motion.span>
          {batterySaver && (
            <>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">Eco WebGL</span>
            </>
          )}
        </motion.div>
      )}
    </motion.div>
  );
};
