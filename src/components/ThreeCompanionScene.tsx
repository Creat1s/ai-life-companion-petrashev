import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { AvatarId, CompanionMood, AnimationCue, RoomAtmosphere } from '../types/companion';
import { buildCharacter3D, Character3DParts } from '../engine/threeProceduralCharacters';
import { Sparkles, Play, Eye, Waves, Zap } from 'lucide-react';

export type GameAnimPreset =
  | 'auto'
  | 'lissajous_float'
  | 'joy_flip'
  | 'attentive_listen'
  | 'cosmic_think'
  | 'sleep_zero_g';

interface ThreeCompanionSceneProps {
  avatarId: AvatarId;
  mood: CompanionMood;
  energy?: number;
  animation?: AnimationCue;
  room?: RoomAtmosphere;
  batterySaver?: boolean;
  isListening?: boolean;
  isSpeaking?: boolean;
  onTap?: () => void;
  onTapCompanion?: () => void;
}

export const ThreeCompanionScene: React.FC<ThreeCompanionSceneProps> = ({
  avatarId,
  mood,
  energy = 90,
  animation = 'idle',
  isListening = false,
  isSpeaking = false,
  onTap,
  onTapCompanion,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const partsRef = useRef<Character3DParts | null>(null);
  const pointerRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const jumpImpulseRef = useRef<number>(0);
  const spinImpulseRef = useRef<number>(0);

  const [animPreset, setAnimPreset] = useState<GameAnimPreset>('auto');
  const animPresetRef = useRef<GameAnimPreset>('auto');

  const effectiveListening = isListening || animation === 'listen';
  const effectiveSpeaking = isSpeaking || animation === 'speak';

  const moodRef = useRef(mood);
  const energyRef = useRef(energy);
  const animationRef = useRef<AnimationCue>(animation);
  const listeningRef = useRef(effectiveListening);
  const speakingRef = useRef(effectiveSpeaking);

  useEffect(() => {
    moodRef.current = mood;
    energyRef.current = energy;
    animationRef.current = animation;
    listeningRef.current = effectiveListening;
    speakingRef.current = effectiveSpeaking;
    if (animation === 'play' || animation === 'success') {
      jumpImpulseRef.current = 1.0;
      spinImpulseRef.current = 1.0;
    }
  }, [mood, energy, animation, effectiveListening, effectiveSpeaking]);

  useEffect(() => {
    animPresetRef.current = animPreset;
  }, [animPreset]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 380;
    const height = container.clientHeight || 400;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 100);
    camera.position.set(0, -0.1, 6.7);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.22;
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    // Studio PBR Environment Lighting (RoomEnvironment + PMREMGenerator)
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const roomEnv = new RoomEnvironment();
    const envTarget = pmremGenerator.fromScene(roomEnv, 0.04);
    scene.environment = envTarget.texture;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Three-point cinematic game lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.9);
    keyLight.position.set(3.4, 4.8, 5.2);
    scene.add(keyLight);

    const rimLight = new THREE.PointLight(
      avatarId === 'lumi' ? 0x38bdf8 : avatarId === 'nova' ? 0xc084fc : 0xa855f7,
      3.2,
      14
    );
    rimLight.position.set(-3.2, 2.2, -2.5);
    scene.add(rimLight);

    const bottomFill = new THREE.PointLight(
      avatarId === 'lumi' ? 0xf472b6 : 0x6366f1,
      1.6,
      10
    );
    bottomFill.position.set(2.2, -3.2, 3.0);
    scene.add(bottomFill);

    // Build High-Precision Articulated 3D Character Rig
    const characterParts = buildCharacter3D(avatarId);
    partsRef.current = characterParts;
    scene.add(characterParts.root);

    // Animation State Variables (Second-Order Spring + Eye Saccades + Blinking)
    const clock = new THREE.Clock();
    let frameId = 0;
    let blinkTimer = 0;
    let isBlinking = false;
    let saccadeTimer = 0;
    let saccadeOffset = { x: 0, y: 0 };
    let prevPos = new THREE.Vector3(0, 0, 0);

    // Spring physics state for volume-preserving squash & stretch
    let springScaleY = 1.0;
    let springVelY = 0.0;

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const dt = Math.min(clock.getDelta(), 0.05);
      const t = clock.getElapsedTime();

      const parts = partsRef.current;
      if (!parts) return;

      const curMood = moodRef.current;
      const curListening = listeningRef.current;
      const curSpeaking = speakingRef.current;
      const preset = animPresetRef.current;

      // Determine active animation behavior (either manual preset or AI context-driven)
      const isSleep =
        preset === 'sleep_zero_g' || (preset === 'auto' && curMood === 'tired');
      const isListenMode =
        preset === 'attentive_listen' || (preset === 'auto' && curListening);
      const isThinkMode =
        preset === 'cosmic_think' || (preset === 'auto' && curMood === 'curious');
      const isJoyMode =
        preset === 'joy_flip' || (preset === 'auto' && curMood === 'happy');

      // ---------------------------------------------------------------------------
      // LAYER 1: LISSAJOUS FIGURE-8 LEVITATION & INERTIAL VELOCITY BANKING (DRAG)
      // Professional game companions trace a 3D Figure-8 (Lissajous curve) instead of a linear Y sine wave.
      // ---------------------------------------------------------------------------
      const speedMult = isSleep ? 0.55 : isJoyMode ? 1.35 : isThinkMode ? 1.15 : 1.0;
      const phase = t * speedMult;

      let targetX = Math.sin(phase * 1.15) * (isListenMode ? 0.06 : 0.22);
      let targetY =
        Math.sin(phase * 2.3) * (isSleep ? 0.09 : 0.16) +
        Math.cos(phase * 1.15) * 0.06;
      let targetZ = isListenMode
        ? 0.42 // Lean forward attentively toward the owner when listening!
        : Math.cos(phase * 1.15) * 0.14;

      if (isThinkMode) {
        // Cosmic Orbit path when analyzing context
        targetX = Math.cos(phase * 1.6) * 0.28;
        targetY = Math.sin(phase * 3.2) * 0.14 + 0.08;
      }

      // Add tap jump impulse with gravity arc
      if (jumpImpulseRef.current > 0.001) {
        targetY += Math.sin(jumpImpulseRef.current * Math.PI) * 0.58;
        jumpImpulseRef.current = Math.max(0, jumpImpulseRef.current - dt * 2.1);
      }

      parts.root.position.x = THREE.MathUtils.damp(parts.root.position.x, targetX, 6, dt);
      parts.root.position.y = THREE.MathUtils.damp(parts.root.position.y, targetY, 6, dt);
      parts.root.position.z = THREE.MathUtils.damp(parts.root.position.z, targetZ, 5, dt);

      // Compute velocity for inertial body pitch/roll banking (Principle of Drag / Secondary Motion)
      const velX = (parts.root.position.x - prevPos.x) / Math.max(dt, 0.001);
      const velY = (parts.root.position.y - prevPos.y) / Math.max(dt, 0.001);
      prevPos.copy(parts.root.position);

      // Spin impulse on tap or Joy preset
      if (spinImpulseRef.current > 0.001) {
        spinImpulseRef.current = Math.max(0, spinImpulseRef.current - dt * 2.4);
      }
      const spinAngle =
        spinImpulseRef.current > 0
          ? (1 - spinImpulseRef.current) * Math.PI * 2
          : 0;

      // Body banks into horizontal movement and pitches with vertical ascent/descent
      parts.bodyGroup.rotation.z = THREE.MathUtils.damp(
        parts.bodyGroup.rotation.z,
        -velX * 0.22 + (isListenMode ? 0.08 : 0),
        7,
        dt
      );
      parts.bodyGroup.rotation.x = THREE.MathUtils.damp(
        parts.bodyGroup.rotation.x,
        velY * 0.16 + (isListenMode ? 0.14 : isSleep ? 0.22 : 0),
        7,
        dt
      );
      parts.bodyGroup.rotation.y =
        spinAngle +
        THREE.MathUtils.damp(
          parts.bodyGroup.rotation.y - spinAngle,
          pointerRef.current.x * 0.28 + Math.sin(phase * 0.8) * 0.12,
          5,
          dt
        );

      // Head leads the gaze with subtle counter-tilt (Appeal & Anticipation)
      const headTargetYaw = pointerRef.current.x * 0.34;
      const headTargetPitch =
        -pointerRef.current.y * 0.24 +
        (curSpeaking ? Math.sin(t * 15) * 0.06 : 0) +
        (isListenMode ? -0.08 : 0);
      const headTargetRoll =
        isThinkMode
          ? Math.sin(t * 2.2) * 0.18
          : isListenMode
            ? -0.14 // Expressive curious head tilt when listening to user's voice
            : -velX * 0.12;

      parts.headGroup.rotation.y = THREE.MathUtils.damp(
        parts.headGroup.rotation.y,
        headTargetYaw,
        8,
        dt
      );
      parts.headGroup.rotation.x = THREE.MathUtils.damp(
        parts.headGroup.rotation.x,
        headTargetPitch,
        8,
        dt
      );
      parts.headGroup.rotation.z = THREE.MathUtils.damp(
        parts.headGroup.rotation.z,
        headTargetRoll,
        7,
        dt
      );

      // ---------------------------------------------------------------------------
      // LAYER 2: VOLUME-PRESERVING SQUASH & STRETCH + SECOND-ORDER SPRING PHYSICS
      // Sx * Sy * Sz = 1 => Sx = Sz = 1 / sqrt(Sy)
      // ---------------------------------------------------------------------------
      const breathTargetY =
        1.0 +
        Math.sin(t * (isSleep ? 1.5 : 2.8)) * 0.028 +
        (curSpeaking ? Math.sin(t * 18) * 0.025 : 0);

      const stiffness = 140;
      const damping = 12;
      const springForce = (breathTargetY - springScaleY) * stiffness;
      springVelY += springForce * dt;
      springVelY *= Math.exp(-damping * dt);
      springScaleY += springVelY * dt;

      const clampedSy = THREE.MathUtils.clamp(springScaleY, 0.78, 1.28);
      const invSqrtSy = 1 / Math.sqrt(clampedSy);
      parts.bodyGroup.scale.set(invSqrtSy, clampedSy, invSqrtSy);

      // ---------------------------------------------------------------------------
      // LAYER 3: MULTI-JOINT KINEMATIC WAVE PROPAGATION (FOLLOW-THROUGH & OVERLAPPING ACTION)
      // Each joint i lags behind its parent by phase delay Δφ, creating real underwater/cosmic waves.
      // ---------------------------------------------------------------------------
      const waveFreq = isSleep ? 1.8 : isJoyMode ? 4.4 : curSpeaking ? 5.0 : 2.8;
      const waveAmp = isSleep ? 0.1 : isJoyMode ? 0.26 : 0.18;

      // 3A. Nova's 8 Multi-Joint Tentacles
      parts.articulatedTentacles.forEach((chain) => {
        // Root flare responds to vertical velocity (flares out when descending, trails down when rising)
        chain.root.rotation.x =
          chain.baseRotX +
          Math.sin(t * waveFreq + chain.phaseOffset) * (waveAmp * 0.65) -
          velY * 0.22;
        chain.root.rotation.z =
          chain.baseRotZ +
          Math.cos(t * waveFreq * 0.85 + chain.phaseOffset) * (waveAmp * 0.5);

        const restCurl = [0.22, 0.35, -0.48, -0.85];
        chain.segments.forEach((seg, segIdx) => {
          const phaseDelay = segIdx * 0.65;
          const progressiveAmp = waveAmp * (0.55 + segIdx * 0.25);
          seg.rotation.x =
            (restCurl[segIdx] ?? 0) +
            Math.sin(t * waveFreq - phaseDelay + chain.phaseOffset) * progressiveAmp;
          seg.rotation.z =
            Math.cos(t * waveFreq * 0.9 - phaseDelay + chain.phaseOffset) *
            (progressiveAmp * 0.45);
        });
      });

      // 3B. Lumi's & Shadow's Multi-Joint Tails
      parts.articulatedTails.forEach((chain) => {
        chain.segments.forEach((seg, segIdx) => {
          const phaseDelay = segIdx * 0.6;
          const amp = (0.14 + segIdx * 0.06) * (isJoyMode ? 1.45 : 1.0);
          seg.rotation.z =
            Math.sin(t * waveFreq - phaseDelay + chain.phaseOffset) * amp;
          seg.rotation.x =
            Math.cos(t * waveFreq * 0.75 - phaseDelay + chain.phaseOffset) *
            (amp * 0.55);
        });
      });

      // 3C. Antennae & Feelers (Secondary Follow-Through with Head Inertial Drag)
      parts.articulatedAntennae.forEach((chain, idx) => {
        const side = idx === 0 ? -1 : 1;
        const dragZ = -velX * 0.26 + Math.sin(t * 2.4 + chain.phaseOffset) * 0.11;
        const dragX = -velY * 0.22 + Math.cos(t * 2.0 + chain.phaseOffset) * 0.09;
        chain.root.rotation.z = THREE.MathUtils.damp(
          chain.root.rotation.z,
          chain.baseRotZ + dragZ * side,
          6,
          dt
        );
        chain.root.rotation.x = THREE.MathUtils.damp(
          chain.root.rotation.x,
          chain.baseRotX + dragX,
          6,
          dt
        );
      });

      // 3D. Lumi's Sweeping Manta Wings (Graceful Figure-8 Fin Undulation)
      parts.wings.forEach((wing, i) => {
        const side = i === 0 ? -1 : 1;
        const flapSpeed = isJoyMode ? 4.8 : isSleep ? 1.6 : 2.7;
        const flapAngle = Math.sin(t * flapSpeed) * 0.34;
        const featherPitch = Math.cos(t * flapSpeed) * 0.16;
        wing.rotation.y = side * flapAngle;
        wing.rotation.z = side * (flapAngle * 0.42);
        wing.rotation.x = featherPitch;
      });

      // 3E. Shadow's Expressive Cat Ears
      parts.ears.forEach((ear, i) => {
        const side = i === 0 ? -1 : 1;
        const earPerk = isListenMode ? 0.12 : isSleep ? -0.18 : 0;
        const twitch =
          Math.sin(t * 3.6 + i) > 0.93 ? Math.sin(t * 28) * 0.16 : 0;
        ear.rotation.z = side * (-0.44 + earPerk + twitch);
      });

      // ---------------------------------------------------------------------------
      // LAYER 4: EYE GAZE TRACKING, MICRO-SACCADES & CURVED EYELID BLINKING
      // Eyes look alive because pupils make tiny micro-saccades and eyelids sweep over the cornea.
      // ---------------------------------------------------------------------------
      saccadeTimer += dt;
      if (saccadeTimer > 1.8 + (Math.sin(t) * 0.5 + 0.5)) {
        saccadeTimer = 0;
        saccadeOffset = {
          x: (Math.random() - 0.5) * 0.045,
          y: (Math.random() - 0.5) * 0.035,
        };
      }

      const gazeTargetX =
        THREE.MathUtils.clamp(pointerRef.current.x * 0.095 + saccadeOffset.x, -0.11, 0.11);
      const gazeTargetY =
        THREE.MathUtils.clamp(pointerRef.current.y * 0.075 + saccadeOffset.y, -0.08, 0.08);

      parts.leftPupilGroup.position.x = THREE.MathUtils.damp(
        parts.leftPupilGroup.position.x,
        gazeTargetX,
        14,
        dt
      );
      parts.leftPupilGroup.position.y = THREE.MathUtils.damp(
        parts.leftPupilGroup.position.y,
        gazeTargetY,
        14,
        dt
      );
      parts.rightPupilGroup.position.x = THREE.MathUtils.damp(
        parts.rightPupilGroup.position.x,
        gazeTargetX,
        14,
        dt
      );
      parts.rightPupilGroup.position.y = THREE.MathUtils.damp(
        parts.rightPupilGroup.position.y,
        gazeTargetY,
        14,
        dt
      );

      // Pupil dilation when excited or listening!
      const pupilDilation = isListenMode || isJoyMode ? 1.12 : 1.0;
      parts.leftPupilGroup.scale.setScalar(
        THREE.MathUtils.damp(parts.leftPupilGroup.scale.x, pupilDilation, 8, dt)
      );
      parts.rightPupilGroup.scale.setScalar(
        THREE.MathUtils.damp(parts.rightPupilGroup.scale.x, pupilDilation, 8, dt)
      );

      // Curved Upper Eyelid Blinking
      blinkTimer += dt;
      if (!isBlinking && blinkTimer > 3.1 + (t % 1.4)) {
        isBlinking = true;
        blinkTimer = 0;
      }
      if (isBlinking && blinkTimer > 0.15) {
        isBlinking = false;
        blinkTimer = 0;
      }

      // Eyelid rotation on X: -0.62 is wide open, +0.35 is fully closed
      const restLidRot = isSleep
        ? 0.26
        : isListenMode || isJoyMode
          ? -0.68
          : -0.54;
      const targetLidRot = isBlinking ? 0.34 : restLidRot;

      parts.leftEyelid.rotation.x = THREE.MathUtils.damp(
        parts.leftEyelid.rotation.x,
        targetLidRot,
        isBlinking ? 35 : 18,
        dt
      );
      parts.rightEyelid.rotation.x = THREE.MathUtils.damp(
        parts.rightEyelid.rotation.x,
        targetLidRot,
        isBlinking ? 35 : 18,
        dt
      );

      // ---------------------------------------------------------------------------
      // LAYER 5: LIP-SYNC PHONEME ENVELOPE & BIOLUMINESCENT PULSE
      // ---------------------------------------------------------------------------
      if (curSpeaking) {
        const syllableWave =
          Math.abs(Math.sin(t * 16)) * 0.65 + Math.abs(Math.cos(t * 25)) * 0.45;
        parts.mouthGroup.scale.set(
          1 + syllableWave * 0.32,
          0.85 + syllableWave * 1.35,
          1
        );
      } else {
        const smileScale = isJoyMode ? 1.18 : 1.0;
        parts.mouthGroup.scale.set(smileScale, 1, 1);
      }

      const glowBoost =
        curListening || curSpeaking || isThinkMode
          ? 0.72 + Math.sin(t * 7) * 0.32
          : 0.45 + Math.sin(t * 2.4) * 0.15;
      parts.glowMaterials.forEach((mat) => {
        mat.emissiveIntensity = glowBoost;
      });

      parts.particles.rotation.y = t * (isThinkMode ? 0.55 : 0.22);
      parts.particles.position.y = Math.sin(t * 1.4) * 0.14;

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 380;
      const h = container.clientHeight || 400;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(frameId);
      envTarget.dispose();
      pmremGenerator.dispose();
      renderer.dispose();
    };
  }, [avatarId]);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    pointerRef.current = { x: nx, y: ny };
  };

  const handlePointerLeave = () => {
    pointerRef.current = { x: 0, y: 0 };
  };

  const handleClick = () => {
    // Anticipation squash followed by spring launch & 360 spin!
    jumpImpulseRef.current = 1.0;
    spinImpulseRef.current = 1.0;
    if (onTap) onTap();
    if (onTapCompanion) onTapCompanion();
  };

  return (
    <div className="relative w-full h-full min-h-[340px] sm:min-h-[410px] flex flex-col items-center justify-center select-none">
      {/* Interactive 3D WebGL Canvas */}
      <div
        ref={containerRef}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        onClick={handleClick}
        className="w-full flex-1 min-h-[310px] sm:min-h-[370px] cursor-pointer flex items-center justify-center"
        title="Нажмите на 3D-персонажа для акробатического прыжка с сохранением объёма (Squash & Stretch)"
      />

      {/* Compact AAA Game Animation Switcher Bar */}
      <div className="z-20 -mt-2 flex flex-wrap items-center justify-center gap-1.5 px-3 py-1.5 rounded-2xl bg-slate-900/75 border border-white/10 backdrop-blur-md shadow-xl">
        {[
          { id: 'auto', label: 'Авто ИИ', icon: Sparkles },
          { id: 'lissajous_float', label: 'Парение 8-кой', icon: Waves },
          { id: 'joy_flip', label: 'Кульбит радости', icon: Zap },
          { id: 'attentive_listen', label: 'Слушаю (Взгляд)', icon: Eye },
          { id: 'cosmic_think', label: 'Космо-анализ', icon: Play },
        ].map((item) => {
          const Icon = item.icon;
          const active = animPreset === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setAnimPreset(item.id as GameAnimPreset);
                if (item.id === 'joy_flip') {
                  jumpImpulseRef.current = 1.0;
                  spinImpulseRef.current = 1.0;
                }
              }}
              className={`min-h-[28px] inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-semibold transition-all cursor-pointer ${
                active
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Icon className="w-3 h-3" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
