import { useEffect, useState } from 'react';
import {
  useMotionValue,
  useSpring,
  animate,
  MotionValue,
} from 'framer-motion';
import { AnimationCue, CompanionMood } from '../types/companion';

export type Core3DState = 'idle' | 'happy' | 'think' | 'speak';
export type Core3DAnimMode = 'auto' | Core3DState;

export interface Framer3DSpringRig {
  activeState: Core3DState;
  manualMode: Core3DAnimMode;
  setManualMode: (mode: Core3DAnimMode) => void;
  // Framer Motion Spring Weights (0..1) read directly at 60fps in Three.js loop
  idleSpring: MotionValue<number>;
  happySpring: MotionValue<number>;
  thinkSpring: MotionValue<number>;
  speakSpring: MotionValue<number>;
  // Framer Motion 3D Kinematic & Camera Springs
  cameraDistanceSpring: MotionValue<number>;
  squashStretchSpring: MotionValue<number>;
  jumpArcSpring: MotionValue<number>;
  spinYawSpring: MotionValue<number>;
  waveFreqSpring: MotionValue<number>;
  waveAmpSpring: MotionValue<number>;
  pointerXSpring: MotionValue<number>;
  pointerYSpring: MotionValue<number>;
  // Actions
  triggerTapImpulse: () => void;
  setPointerTarget: (nx: number, ny: number) => void;
  liveWeightsSnapshot: Record<Core3DState, number>;
}

export function resolveCore3DState(
  manual: Core3DAnimMode,
  cue: AnimationCue,
  mood: CompanionMood,
  isSpeaking: boolean,
  isListening: boolean
): Core3DState {
  if (manual !== 'auto') return manual;
  if (isSpeaking || cue === 'speak') return 'speak';
  if (isListening || cue === 'think' || cue === 'listen' || mood === 'curious') return 'think';
  if (cue === 'play' || cue === 'success' || cue === 'eat' || mood === 'happy') return 'happy';
  return 'idle';
}

export function useFramer3DAnimationStateMachine(params: {
  animation: AnimationCue;
  mood: CompanionMood;
  isSpeaking: boolean;
  isListening: boolean;
}): Framer3DSpringRig {
  const { animation, mood, isSpeaking, isListening } = params;
  const [manualMode, setManualMode] = useState<Core3DAnimMode>('auto');

  const activeState = resolveCore3DState(
    manualMode,
    animation,
    mood,
    isSpeaking,
    isListening
  );

  // 1. Raw target MotionValues for the 4 core states (Idle, Happy, Think, Speak)
  const idleTarget = useMotionValue(activeState === 'idle' ? 1 : 0);
  const happyTarget = useMotionValue(activeState === 'happy' ? 1 : 0);
  const thinkTarget = useMotionValue(activeState === 'think' ? 1 : 0);
  const speakTarget = useMotionValue(activeState === 'speak' ? 1 : 0);

  // 2. Framer Motion Physics Springs for seamless cross-fading between 3D states
  const idleSpring = useSpring(idleTarget, {
    stiffness: 115,
    damping: 20,
    mass: 0.95,
  });
  const happySpring = useSpring(happyTarget, {
    stiffness: 145,
    damping: 16,
    mass: 0.85,
  });
  const thinkSpring = useSpring(thinkTarget, {
    stiffness: 105,
    damping: 22,
    mass: 1.0,
  });
  const speakSpring = useSpring(speakTarget, {
    stiffness: 165,
    damping: 19,
    mass: 0.8,
  });

  // 3. Framer Motion 3D Camera & Kinematic Springs
  const cameraDistanceTarget = useMotionValue(8.65);
  const cameraDistanceSpring = useSpring(cameraDistanceTarget, {
    stiffness: 90,
    damping: 22,
    mass: 1.1,
  });

  const squashStretchTarget = useMotionValue(1.0);
  const squashStretchSpring = useSpring(squashStretchTarget, {
    stiffness: 340,
    damping: 13,
    mass: 0.65,
  });

  const jumpArcSpring = useMotionValue(0);
  const spinYawSpring = useMotionValue(0);

  const waveFreqTarget = useMotionValue(2.6);
  const waveFreqSpring = useSpring(waveFreqTarget, {
    stiffness: 100,
    damping: 20,
  });

  const waveAmpTarget = useMotionValue(0.17);
  const waveAmpSpring = useSpring(waveAmpTarget, {
    stiffness: 100,
    damping: 20,
  });

  // 4. Framer Motion Pointer Gaze Tracking Springs
  const pointerXTarget = useMotionValue(0);
  const pointerYTarget = useMotionValue(0);
  const pointerXSpring = useSpring(pointerXTarget, { stiffness: 150, damping: 22 });
  const pointerYSpring = useSpring(pointerYTarget, { stiffness: 150, damping: 22 });

  const [liveWeightsSnapshot, setLiveWeightsSnapshot] = useState<Record<Core3DState, number>>({
    idle: 1,
    happy: 0,
    think: 0,
    speak: 0,
  });

  // Update Framer Motion targets whenever activeState changes
  useEffect(() => {
    idleTarget.set(activeState === 'idle' ? 1 : 0);
    happyTarget.set(activeState === 'happy' ? 1 : 0);
    thinkTarget.set(activeState === 'think' ? 1 : 0);
    speakTarget.set(activeState === 'speak' ? 1 : 0);

    // State-specific 3D camera distance (keeps generous unclipped margin in all states)
    if (activeState === 'speak') {
      cameraDistanceTarget.set(8.35);
      waveFreqTarget.set(4.3);
      waveAmpTarget.set(0.24);
    } else if (activeState === 'think') {
      cameraDistanceTarget.set(8.5);
      waveFreqTarget.set(2.1);
      waveAmpTarget.set(0.14);
    } else if (activeState === 'happy') {
      cameraDistanceTarget.set(8.85);
      waveFreqTarget.set(5.1);
      waveAmpTarget.set(0.3);
    } else {
      cameraDistanceTarget.set(8.65);
      waveFreqTarget.set(2.6);
      waveAmpTarget.set(0.17);
    }

    // Trigger subtle anticipation Squash-and-Stretch pulse on every state transition via Framer Motion animate()
    animate(squashStretchTarget, [1.0, 0.91, 1.07, 1.0], {
      duration: 0.48,
      ease: 'easeInOut',
    });

    if (activeState === 'happy') {
      animate(jumpArcSpring, [0, 0.45, 0], {
        duration: 0.68,
        ease: [0.22, 1, 0.36, 1],
      });
      animate(spinYawSpring, [0, Math.PI * 2], {
        duration: 0.78,
        ease: [0.34, 1.56, 0.64, 1],
      }).then(() => {
        spinYawSpring.set(0);
      });
    }
  }, [
    activeState,
    idleTarget,
    happyTarget,
    thinkTarget,
    speakTarget,
    cameraDistanceTarget,
    waveFreqTarget,
    waveAmpTarget,
    squashStretchTarget,
    jumpArcSpring,
    spinYawSpring,
  ]);

  // Periodically sync snapshot for the interactive Framer Motion HUD bars
  useEffect(() => {
    const timer = window.setInterval(() => {
      setLiveWeightsSnapshot({
        idle: Math.round(idleSpring.get() * 100),
        happy: Math.round(happySpring.get() * 100),
        think: Math.round(thinkSpring.get() * 100),
        speak: Math.round(speakSpring.get() * 100),
      });
    }, 90);
    return () => window.clearInterval(timer);
  }, [idleSpring, happySpring, thinkSpring, speakSpring]);

  const triggerTapImpulse = () => {
    animate(squashStretchTarget, [1.0, 0.84, 1.16, 0.96, 1.0], {
      duration: 0.62,
      ease: 'easeOut',
    });
    animate(jumpArcSpring, [0, 0.52, 0], {
      duration: 0.65,
      ease: [0.22, 1, 0.36, 1],
    });
    animate(spinYawSpring, [0, Math.PI * 2], {
      duration: 0.75,
      ease: [0.34, 1.56, 0.64, 1],
    }).then(() => {
      spinYawSpring.set(0);
    });
  };

  const setPointerTarget = (nx: number, ny: number) => {
    pointerXTarget.set(nx);
    pointerYTarget.set(ny);
  };

  return {
    activeState,
    manualMode,
    setManualMode,
    idleSpring,
    happySpring,
    thinkSpring,
    speakSpring,
    cameraDistanceSpring,
    squashStretchSpring,
    jumpArcSpring,
    spinYawSpring,
    waveFreqSpring,
    waveAmpSpring,
    pointerXSpring,
    pointerYSpring,
    triggerTapImpulse,
    setPointerTarget,
    liveWeightsSnapshot,
  };
}
