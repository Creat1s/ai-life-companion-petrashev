import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { motion, AnimatePresence } from 'motion/react';
import { AvatarId, CompanionMood, AnimationCue, RoomAtmosphere } from '../types/companion';
import { buildCharacter3D, Character3DParts } from '../engine/threeProceduralCharacters';
import { Sparkles, Smile, Brain, Volume2, Waves } from 'lucide-react';

export type Core3DAnimState = 'auto' | 'idle' | 'happy' | 'think' | 'speak';

interface ThreeCompanionSceneProps {
  avatarId: AvatarId;
  mood: CompanionMood;
  energy?: number;
  animation?: AnimationCue;
  room?: RoomAtmosphere;
  batterySaver?: boolean;
  reducedMotion?: boolean;
  size?: 'sm' | 'md' | 'lg';
  isListening?: boolean;
  isSpeaking?: boolean;
  onTap?: () => void;
  onTapCompanion?: () => void;
}

interface BlendWeights {
  idle: number;
  happy: number;
  think: number;
  speak: number;
}

export const ThreeCompanionScene: React.FC<ThreeCompanionSceneProps> = ({
  avatarId,
  mood,
  energy = 90,
  animation = 'idle',
  room = 'studio',
  batterySaver = false,
  reducedMotion = false,
  size = 'lg',
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

  const [manualState, setManualState] = useState<Core3DAnimState>('auto');
  const manualStateRef = useRef<Core3DAnimState>('auto');

  const effectiveListening = isListening || animation === 'listen';
  const effectiveSpeaking = isSpeaking || animation === 'speak';

  const moodRef = useRef(mood);
  const energyRef = useRef(energy);
  const animationRef = useRef<AnimationCue>(animation);
  const listeningRef = useRef(effectiveListening);
  const speakingRef = useRef(effectiveSpeaking);
  const reducedMotionRef = useRef(reducedMotion);

  // Determine the resolved active 3D state for UI badge & Framer Motion aura
  const resolveTarget3DState = (
    manual: Core3DAnimState,
    cue: AnimationCue,
    curMood: CompanionMood,
    speaking: boolean
  ): 'idle' | 'happy' | 'think' | 'speak' => {
    if (manual !== 'auto') return manual;
    if (speaking || cue === 'speak') return 'speak';
    if (cue === 'think' || cue === 'listen' || curMood === 'curious') return 'think';
    if (cue === 'play' || cue === 'success' || curMood === 'happy') return 'happy';
    return 'idle';
  };

  const activeResolvedState = resolveTarget3DState(
    manualState,
    animation,
    mood,
    effectiveSpeaking
  );

  useEffect(() => {
    moodRef.current = mood;
    energyRef.current = energy;
    animationRef.current = animation;
    listeningRef.current = effectiveListening;
    speakingRef.current = effectiveSpeaking;
    reducedMotionRef.current = reducedMotion;

    if (animation === 'play' || animation === 'success') {
      jumpImpulseRef.current = 1.0;
      spinImpulseRef.current = 1.0;
    }
  }, [mood, energy, animation, effectiveListening, effectiveSpeaking, reducedMotion]);

  useEffect(() => {
    manualStateRef.current = manualState;
    if (manualState === 'happy') {
      jumpImpulseRef.current = 1.0;
      spinImpulseRef.current = 1.0;
    }
  }, [manualState]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || (size === 'sm' ? 150 : 480);
    const height = container.clientHeight || (size === 'sm' ? 150 : 440);

    const scene = new THREE.Scene();
    // Generous wide-angle frustum (FOV 40, z = 8.65) so tentacles, long antennae, wings, and jump arcs NEVER clip against the canvas boundary
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, -0.04, 8.65);

    const renderer = new THREE.WebGLRenderer({
      antialias: !batterySaver,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, batterySaver ? 1.25 : 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.24;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.overflow = 'visible';

    // Studio PBR Environment Lighting (RoomEnvironment + PMREMGenerator)
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const roomEnv = new RoomEnvironment();
    const envTarget = pmremGenerator.fromScene(roomEnv, 0.04);
    scene.environment = envTarget.texture;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Three-point cinematic game lighting tailored to room atmosphere
    const ambientLight = new THREE.AmbientLight(
      room === 'morning' ? 0xfffbeb : room === 'night' ? 0xe0e7ff : 0xffffff,
      0.88
    );
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.95);
    keyLight.position.set(3.4, 4.8, 5.2);
    scene.add(keyLight);

    const rimColor =
      avatarId === 'lumi' ? 0x38bdf8 : avatarId === 'nova' ? 0xc084fc : 0xa855f7;
    const rimLight = new THREE.PointLight(rimColor, 3.4, 14);
    rimLight.position.set(-3.2, 2.2, -2.5);
    scene.add(rimLight);

    const bottomFill = new THREE.PointLight(
      avatarId === 'lumi' ? 0xf472b6 : 0x6366f1,
      1.65,
      10
    );
    bottomFill.position.set(2.2, -3.2, 3.0);
    scene.add(bottomFill);

    // Build High-Precision Articulated 3D Character Rig
    const characterParts = buildCharacter3D(avatarId);
    partsRef.current = characterParts;
    scene.add(characterParts.root);

    // 3D Acoustic / Thought Halo Ring inside WebGL (replaces legacy CSS ring/orbit)
    const haloRingGeo = new THREE.TorusGeometry(1.55, 0.022, 16, 64);
    const haloRingMat = new THREE.MeshBasicMaterial({
      color: rimColor,
      transparent: true,
      opacity: 0.0,
    });
    const haloRingMesh = new THREE.Mesh(haloRingGeo, haloRingMat);
    haloRingMesh.rotation.x = Math.PI * 0.42;
    characterParts.root.add(haloRingMesh);

    // Continuous State Blending Weights (Smoothly interpolated every frame via MathUtils.damp)
    const weights: BlendWeights = {
      idle: 1.0,
      happy: 0.0,
      think: 0.0,
      speak: 0.0,
    };

    const clock = new THREE.Clock();
    let frameId = 0;
    let blinkTimer = 0;
    let isBlinking = false;
    let saccadeTimer = 0;
    let saccadeOffset = { x: 0, y: 0 };
    const prevPos = new THREE.Vector3(0, 0, 0);

    // Second-order damped spring physics state for volume-preserving Squash & Stretch
    let springScaleY = 1.0;
    let springVelY = 0.0;

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const dt = Math.min(clock.getDelta(), 0.05);
      const t = reducedMotionRef.current ? 0 : clock.getElapsedTime();

      const parts = partsRef.current;
      if (!parts) return;

      const targetState = resolveTarget3DState(
        manualStateRef.current,
        animationRef.current,
        moodRef.current,
        speakingRef.current
      );

      // ---------------------------------------------------------------------------
      // 1. CONTINUOUS 3D STATE-MACHINE WEIGHT BLENDING (Idle <-> Happy <-> Think <-> Speak)
      // Smooth exponential damping ensures zero snapping when transitioning between states.
      // ---------------------------------------------------------------------------
      const blendSpeed = 5.5;
      weights.idle = THREE.MathUtils.damp(
        weights.idle,
        targetState === 'idle' ? 1 : 0,
        blendSpeed,
        dt
      );
      weights.happy = THREE.MathUtils.damp(
        weights.happy,
        targetState === 'happy' ? 1 : 0,
        blendSpeed,
        dt
      );
      weights.think = THREE.MathUtils.damp(
        weights.think,
        targetState === 'think' ? 1 : 0,
        blendSpeed,
        dt
      );
      weights.speak = THREE.MathUtils.damp(
        weights.speak,
        targetState === 'speak' ? 1 : 0,
        blendSpeed,
        dt
      );

      // ---------------------------------------------------------------------------
      // 2. BLENDED 3D ROOT TRAJECTORY & INERTIAL BANKING (DRAG)
      // Each state defines its own 3D spatial curve; the active position is their weighted sum.
      // ---------------------------------------------------------------------------
      // Idle: Calm 3D Lissajous Figure-8 levitation
      const idleX = Math.sin(t * 1.15) * 0.2;
      const idleY = Math.sin(t * 2.3) * 0.14 + Math.cos(t * 1.15) * 0.05;
      const idleZ = Math.cos(t * 1.15) * 0.12;

      // Happy: Joyful rhythmic hop arc + elevated buoyancy
      const happyX = Math.sin(t * 2.4) * 0.28;
      const happyY = Math.abs(Math.sin(t * 3.8)) * 0.34 + 0.08;
      const happyZ = 0.22 + Math.sin(t * 2.4) * 0.12;

      // Think: Contemplative orbital spiral in 3D space
      const thinkX = Math.cos(t * 1.65) * 0.26;
      const thinkY = Math.sin(t * 3.3) * 0.12 + 0.1;
      const thinkZ = Math.sin(t * 1.65) * 0.18;

      // Speak: Attentive forward lean toward the user with conversational micro-sway
      const speakX = Math.sin(t * 1.9) * 0.1;
      const speakY = Math.sin(t * 3.8) * 0.09 + 0.04;
      const speakZ = 0.38;

      let targetX =
        idleX * weights.idle +
        happyX * weights.happy +
        thinkX * weights.think +
        speakX * weights.speak;
      let targetY =
        idleY * weights.idle +
        happyY * weights.happy +
        thinkY * weights.think +
        speakY * weights.speak;
      const targetZ =
        idleZ * weights.idle +
        happyZ * weights.happy +
        thinkZ * weights.think +
        speakZ * weights.speak;

      // Add interactive tap jump impulse arc
      if (jumpImpulseRef.current > 0.001) {
        targetY += Math.sin(jumpImpulseRef.current * Math.PI) * 0.56;
        jumpImpulseRef.current = Math.max(0, jumpImpulseRef.current - dt * 2.1);
      }

      parts.root.position.x = THREE.MathUtils.damp(parts.root.position.x, targetX, 6.5, dt);
      parts.root.position.y = THREE.MathUtils.damp(parts.root.position.y, targetY, 6.5, dt);
      parts.root.position.z = THREE.MathUtils.damp(parts.root.position.z, targetZ, 5.5, dt);

      // Velocity-driven inertial pitch/roll banking
      const velX = (parts.root.position.x - prevPos.x) / Math.max(dt, 0.001);
      const velY = (parts.root.position.y - prevPos.y) / Math.max(dt, 0.001);
      prevPos.copy(parts.root.position);

      if (spinImpulseRef.current > 0.001) {
        spinImpulseRef.current = Math.max(0, spinImpulseRef.current - dt * 2.3);
      }
      const spinAngle =
        spinImpulseRef.current > 0
          ? (1 - spinImpulseRef.current) * Math.PI * 2
          : 0;

      parts.bodyGroup.rotation.z = THREE.MathUtils.damp(
        parts.bodyGroup.rotation.z,
        -velX * 0.22 + weights.happy * Math.sin(t * 4.5) * 0.12,
        7,
        dt
      );
      parts.bodyGroup.rotation.x = THREE.MathUtils.damp(
        parts.bodyGroup.rotation.x,
        velY * 0.16 + weights.speak * 0.1 + weights.think * -0.06,
        7,
        dt
      );
      parts.bodyGroup.rotation.y =
        spinAngle +
        THREE.MathUtils.damp(
          parts.bodyGroup.rotation.y - spinAngle,
          pointerRef.current.x * 0.28 +
            weights.idle * Math.sin(t * 0.9) * 0.12 +
            weights.speak * Math.sin(t * 2.8) * 0.14,
          5.5,
          dt
        );

      // ---------------------------------------------------------------------------
      // 3. BLENDED 3D HEAD POSE (Idle Gaze vs Happy Nod vs Think Tilt vs Speak Cadence)
      // ---------------------------------------------------------------------------
      const headYaw =
        pointerRef.current.x * 0.34 +
        weights.think * 0.18 +
        weights.speak * Math.sin(t * 5.2) * 0.09;
      const headPitch =
        -pointerRef.current.y * 0.24 +
        weights.think * -0.15 +
        weights.happy * Math.sin(t * 7.6) * 0.08 +
        weights.speak * (Math.sin(t * 11.0) * 0.065 - 0.04);
      const headRoll =
        -velX * 0.12 +
        weights.think * (0.24 + Math.sin(t * 2.0) * 0.06) +
        weights.happy * Math.sin(t * 3.8) * 0.14 +
        weights.speak * Math.cos(t * 4.4) * 0.08;

      parts.headGroup.rotation.y = THREE.MathUtils.damp(parts.headGroup.rotation.y, headYaw, 8, dt);
      parts.headGroup.rotation.x = THREE.MathUtils.damp(parts.headGroup.rotation.x, headPitch, 8, dt);
      parts.headGroup.rotation.z = THREE.MathUtils.damp(parts.headGroup.rotation.z, headRoll, 7, dt);

      // ---------------------------------------------------------------------------
      // 4. SECOND-ORDER SPRING SQUASH & STRETCH (Volume-Preserving: Sx = Sz = 1 / sqrt(Sy))
      // ---------------------------------------------------------------------------
      const breathTargetY =
        1.0 +
        weights.idle * Math.sin(t * 2.6) * 0.026 +
        weights.happy * Math.sin(t * 7.6) * 0.065 +
        weights.think * Math.sin(t * 2.0) * 0.02 +
        weights.speak * Math.sin(t * 14.0) * 0.032;

      const stiffness = 145;
      const damping = 12;
      const springForce = (breathTargetY - springScaleY) * stiffness;
      springVelY += springForce * dt;
      springVelY *= Math.exp(-damping * dt);
      springScaleY += springVelY * dt;

      const clampedSy = THREE.MathUtils.clamp(springScaleY, 0.78, 1.28);
      const invSqrtSy = 1 / Math.sqrt(clampedSy);
      parts.bodyGroup.scale.set(invSqrtSy, clampedSy, invSqrtSy);

      // ---------------------------------------------------------------------------
      // 5. MULTI-JOINT KINEMATIC WAVE PROPAGATION FOR 3D LIMBS (Tentacles / Wings / Tails)
      // Frequency and amplitude smoothly morph according to Idle / Happy / Think / Speak weights.
      // ---------------------------------------------------------------------------
      const waveFreq =
        2.6 * weights.idle +
        5.2 * weights.happy +
        2.1 * weights.think +
        4.4 * weights.speak;
      const waveAmp =
        0.17 * weights.idle +
        0.31 * weights.happy +
        0.14 * weights.think +
        0.24 * weights.speak;

      // 5A. Nova's 8 Articulated Multi-Joint S-Curled Tentacles
      parts.articulatedTentacles.forEach((chain, tIdx) => {
        // In Speak or Think mode, the front 2 tentacles gesture expressively upward!
        const isFrontTentacle = tIdx === 1 || tIdx === 2;
        const gestureLift =
          isFrontTentacle
            ? weights.speak * (-0.35 + Math.sin(t * 6.5 + tIdx) * 0.18) +
              weights.think * -0.28
            : 0;

        chain.root.rotation.x =
          chain.baseRotX +
          gestureLift +
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

      // 5B. Lumi's & Shadow's Articulated Multi-Joint Tails
      parts.articulatedTails.forEach((chain) => {
        chain.segments.forEach((seg, segIdx) => {
          const phaseDelay = segIdx * 0.6;
          const amp = (0.14 + segIdx * 0.06) * (1 + weights.happy * 0.55 + weights.speak * 0.3);
          seg.rotation.z =
            Math.sin(t * waveFreq - phaseDelay + chain.phaseOffset) * amp;
          seg.rotation.x =
            Math.cos(t * waveFreq * 0.75 - phaseDelay + chain.phaseOffset) *
            (amp * 0.55);
        });
      });

      // 5C. Antennae & Feelers (Secondary Follow-Through)
      parts.articulatedAntennae.forEach((chain, idx) => {
        const side = idx === 0 ? -1 : 1;
        const dragZ =
          -velX * 0.26 +
          Math.sin(t * (2.2 + weights.happy * 2.0) + chain.phaseOffset) *
            (0.11 + weights.happy * 0.08);
        const dragX =
          -velY * 0.22 +
          Math.cos(t * 2.0 + chain.phaseOffset) * 0.09 +
          weights.think * 0.14;
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

      // 5D. Lumi's Sweeping Manta-Ray Wings
      parts.wings.forEach((wing, i) => {
        const side = i === 0 ? -1 : 1;
        const flapAngle = Math.sin(t * waveFreq) * (0.32 + weights.happy * 0.16);
        const featherPitch =
          Math.cos(t * waveFreq) * 0.16 + weights.speak * Math.sin(t * 6) * 0.1;
        wing.rotation.y = side * flapAngle;
        wing.rotation.z = side * (flapAngle * 0.42);
        wing.rotation.x = featherPitch;
      });

      // 5E. Shadow's Cat Ears
      parts.ears.forEach((ear, i) => {
        const side = i === 0 ? -1 : 1;
        const earPerk = weights.happy * 0.14 + weights.speak * 0.1 - weights.think * 0.08;
        const twitch =
          Math.sin(t * 3.6 + i) > 0.92 ? Math.sin(t * 28) * 0.16 : 0;
        ear.rotation.z = side * (-0.44 + earPerk + twitch);
      });

      // ---------------------------------------------------------------------------
      // 6. GAZE TRACKING, MICRO-SACCADES & CURVED EYELID EXPRESSIONS
      // ---------------------------------------------------------------------------
      saccadeTimer += dt;
      if (saccadeTimer > 1.7 + (Math.sin(t) * 0.4 + 0.4)) {
        saccadeTimer = 0;
        saccadeOffset = {
          x: (Math.random() - 0.5) * 0.045,
          y: (Math.random() - 0.5) * 0.035,
        };
      }

      // In Think state, eyes naturally ponder upward and to the side
      const thinkGazeX = weights.think * (0.065 * Math.cos(t * 0.9));
      const thinkGazeY = weights.think * 0.055;

      const gazeTargetX = THREE.MathUtils.clamp(
        pointerRef.current.x * 0.095 + saccadeOffset.x + thinkGazeX,
        -0.11,
        0.11
      );
      const gazeTargetY = THREE.MathUtils.clamp(
        pointerRef.current.y * 0.075 + saccadeOffset.y + thinkGazeY,
        -0.085,
        0.085
      );

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

      // Pupil dilation responds to Happy & Speak states
      const pupilDilation = 1.0 + weights.happy * 0.15 + weights.speak * 0.08;
      parts.leftPupilGroup.scale.setScalar(
        THREE.MathUtils.damp(parts.leftPupilGroup.scale.x, pupilDilation, 8, dt)
      );
      parts.rightPupilGroup.scale.setScalar(
        THREE.MathUtils.damp(parts.rightPupilGroup.scale.x, pupilDilation, 8, dt)
      );

      // Natural Blinking + Expressive Eyelid Pose per State
      blinkTimer += dt;
      if (!isBlinking && blinkTimer > 3.1 + (t % 1.4)) {
        isBlinking = true;
        blinkTimer = 0;
      }
      if (isBlinking && blinkTimer > 0.14) {
        isBlinking = false;
        blinkTimer = 0;
      }

      const restLidRot =
        -0.55 * weights.idle +
        -0.72 * weights.happy +
        -0.36 * weights.think + // Ponderous half-hooded focus in Think mode
        -0.64 * weights.speak;
      const targetLidRot = isBlinking ? 0.34 : restLidRot;

      parts.leftEyelid.rotation.x = THREE.MathUtils.damp(
        parts.leftEyelid.rotation.x,
        targetLidRot,
        isBlinking ? 36 : 16,
        dt
      );
      parts.rightEyelid.rotation.x = THREE.MathUtils.damp(
        parts.rightEyelid.rotation.x,
        targetLidRot,
        isBlinking ? 36 : 16,
        dt
      );

      // ---------------------------------------------------------------------------
      // 7. PHONEME LIP-SYNC (SPEAK) & 3D HALO / BIOLUMINESCENCE
      // ---------------------------------------------------------------------------
      const syllableWave =
        Math.abs(Math.sin(t * 16)) * 0.65 + Math.abs(Math.cos(t * 25)) * 0.45;
      const mouthScaleX =
        1.0 + weights.happy * 0.24 + weights.speak * syllableWave * 0.36;
      const mouthScaleY =
        1.0 + weights.happy * 0.15 + weights.speak * syllableWave * 1.45;

      parts.mouthGroup.scale.x = THREE.MathUtils.damp(parts.mouthGroup.scale.x, mouthScaleX, 18, dt);
      parts.mouthGroup.scale.y = THREE.MathUtils.damp(parts.mouthGroup.scale.y, mouthScaleY, 18, dt);

      const glowBoost =
        0.42 * weights.idle +
        (0.75 + Math.sin(t * 6) * 0.22) * weights.happy +
        (0.82 + Math.sin(t * 8) * 0.28) * weights.think +
        (0.78 + syllableWave * 0.3) * weights.speak;
      parts.glowMaterials.forEach((mat) => {
        mat.emissiveIntensity = glowBoost;
      });

      // 3D Halo Ring expands and rotates in Think / Speak states (replacing CSS rings)
      const haloOpacity = Math.max(weights.think * 0.55, weights.speak * 0.45);
      haloRingMat.opacity = THREE.MathUtils.damp(haloRingMat.opacity, haloOpacity, 8, dt);
      haloRingMesh.rotation.z = t * (1.2 + weights.think * 2.4);
      const haloPulse = 1.0 + Math.sin(t * 6) * 0.06 * (weights.speak + weights.think);
      haloRingMesh.scale.setScalar(haloPulse);

      parts.particles.rotation.y =
        t * (0.22 + weights.think * 0.65 + weights.happy * 0.45);
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
  }, [avatarId, batterySaver, room, size]);

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
    jumpImpulseRef.current = 1.0;
    spinImpulseRef.current = 1.0;
    if (onTap) onTap();
    if (onTapCompanion) onTapCompanion();
  };

  const stateTabs: {
    id: Core3DAnimState;
    label: string;
    icon: React.FC<{ className?: string }>;
  }[] = [
    { id: 'auto', label: 'Авто ИИ', icon: Sparkles },
    { id: 'idle', label: 'Idle (Парение)', icon: Waves },
    { id: 'happy', label: 'Happy (Радость)', icon: Smile },
    { id: 'think', label: 'Think (Мысль)', icon: Brain },
    { id: 'speak', label: 'Speak (Речь)', icon: Volume2 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 220, damping: 22 }}
      className="relative w-full h-full min-h-[280px] sm:min-h-[390px] flex flex-col items-center justify-center select-none"
    >
      {/* Framer Motion Reactive State Aura Behind 3D Model */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeResolvedState}
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{
            opacity: activeResolvedState === 'idle' ? 0.35 : 0.65,
            scale:
              activeResolvedState === 'happy'
                ? 1.12
                : activeResolvedState === 'speak'
                  ? 1.08
                  : 1.0,
          }}
          exit={{ opacity: 0, scale: 0.85 }}
          transition={{ type: 'spring', stiffness: 160, damping: 20 }}
          className={`pointer-events-none absolute w-64 h-64 sm:w-80 sm:h-80 rounded-full blur-3xl -z-10 ${
            activeResolvedState === 'happy'
              ? 'bg-fuchsia-500/30 dark:bg-purple-500/35'
              : activeResolvedState === 'think'
                ? 'bg-indigo-500/35 dark:bg-indigo-400/35'
                : activeResolvedState === 'speak'
                  ? 'bg-cyan-400/30 dark:bg-sky-500/35'
                  : 'bg-blue-500/20 dark:bg-violet-500/20'
          }`}
        />
      </AnimatePresence>

      {/* Interactive Three.js WebGL 3D Viewport */}
      <div
        ref={containerRef}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        onClick={handleClick}
        className="w-full flex-1 min-h-[260px] sm:min-h-[350px] cursor-pointer flex items-center justify-center"
        title="Нажмите на 3D-персонажа для акробатического прыжка (Three.js Spring Physics)"
      />

      {/* Framer Motion Interactive 3D State Switcher (Idle / Happy / Think / Speak) */}
      {size !== 'sm' && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 24, delay: 0.05 }}
          className="z-20 -mt-2 flex flex-wrap items-center justify-center gap-1 p-1.5 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-md shadow-xl"
        >
          {stateTabs.map((item) => {
            const Icon = item.icon;
            const isSelected = manualState === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setManualState(item.id);
                }}
                className={`relative min-h-[30px] inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-semibold transition-colors cursor-pointer ${
                  isSelected ? 'text-white' : 'text-slate-300 hover:text-white'
                }`}
              >
                {isSelected && (
                  <motion.span
                    layoutId="active3DStatePill"
                    transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 shadow-sm -z-10"
                  />
                )}
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </motion.div>
      )}
    </motion.div>
  );
};
