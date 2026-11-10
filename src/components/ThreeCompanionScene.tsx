import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { AvatarId, CompanionMood, AnimationCue, RoomAtmosphere } from '../types/companion';
import { createProcedural3DCharacter, Character3DParts } from '../engine/threeProceduralCharacters';

interface ThreeCompanionSceneProps {
  avatarId: AvatarId;
  mood: CompanionMood;
  animation: AnimationCue;
  room: RoomAtmosphere;
  batterySaver: boolean;
  onTap?: () => void;
}

export const ThreeCompanionScene: React.FC<ThreeCompanionSceneProps> = ({
  avatarId,
  mood,
  animation,
  room,
  batterySaver,
  onTap,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const characterPartsRef = useRef<Character3DParts>({});
  const rootGroupRef = useRef<THREE.Group | null>(null);
  const tapAnimRef = useRef<{ active: boolean; startTime: number }>({ active: false, startTime: 0 });

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Detect software rendering
    const isSoftwareGl = (() => {
      try {
        const gl = document.createElement('canvas').getContext('webgl2');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return false;
      }
    })();

    // 1. Scene & Camera setup
    const scene = new THREE.Scene();
    const width = container.clientWidth || 320;
    const height = container.clientHeight || 320;
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 50);
    camera.position.set(0, 1.45, 4.6);
    camera.lookAt(0, 1.15, 0);

    // 2. High-Fidelity ACESFilmic Tone-Mapped Renderer
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = room === 'morning' ? 1.3 : room === 'night' ? 1.05 : 1.15;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.replaceChildren(renderer.domElement);

    // 3. Dynamic Room Atmosphere Lighting Rig (Studio / Morning / Night)
    let ambientLight: THREE.AmbientLight;
    let keyLight: THREE.DirectionalLight;
    let fillLight: THREE.DirectionalLight;
    let rimLight: THREE.DirectionalLight;

    if (room === 'morning') {
      // Golden hour sunrise sunbeams
      ambientLight = new THREE.AmbientLight(0xffeedd, 1.25);
      keyLight = new THREE.DirectionalLight(0xf59e0b, 2.5);
      keyLight.position.set(4.5, 3.2, 3.8);

      fillLight = new THREE.DirectionalLight(0xfef08a, 1.1);
      fillLight.position.set(-3.5, 2.2, 2.0);

      rimLight = new THREE.DirectionalLight(0xfbbf24, 2.2);
      rimLight.position.set(0, 3.5, -4);
    } else if (room === 'night') {
      // Midnight moonlit cosmic ambiance
      ambientLight = new THREE.AmbientLight(0x1e1b4b, 0.6);
      keyLight = new THREE.DirectionalLight(0x93c5fd, 1.7);
      keyLight.position.set(-3.5, 5.0, 3.2);

      fillLight = new THREE.DirectionalLight(0x4338ca, 0.7);
      fillLight.position.set(3.5, 2.0, 1.5);

      rimLight = new THREE.DirectionalLight(0x38bdf8, 2.4);
      rimLight.position.set(0, 4.0, -4);
    } else {
      // Clean Studio daylight
      ambientLight = new THREE.AmbientLight(0xffffff, 1.05);
      keyLight = new THREE.DirectionalLight(0xfffaed, 1.6);
      keyLight.position.set(3, 5, 4);

      fillLight = new THREE.DirectionalLight(0xdbeafe, 0.8);
      fillLight.position.set(-4, 3, 2);

      rimLight = new THREE.DirectionalLight(0xffffff, 1.2);
      rimLight.position.set(0, 4, -4);
    }

    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.width = 512;
    keyLight.shadow.mapSize.height = 512;
    keyLight.shadow.bias = -0.0005;

    scene.add(ambientLight, keyLight, fillLight, rimLight);

    // 4. Procedural Atmospheric Particle Systems
    const particlesGroup = new THREE.Group();
    scene.add(particlesGroup);

    // A) Night Fireflies / Stars
    const nightFireflies: { mesh: THREE.Mesh; seed: number; radius: number; speed: number; yBase: number }[] = [];
    if (room === 'night') {
      const fireflyMat1 = new THREE.MeshBasicMaterial({ color: 0x67e8f9 });
      const fireflyMat2 = new THREE.MeshBasicMaterial({ color: 0xfef08a });
      for (let i = 0; i < 24; i++) {
        const geo = new THREE.SphereGeometry(0.025 + Math.random() * 0.025, 8, 8);
        const mesh = new THREE.Mesh(geo, i % 2 === 0 ? fireflyMat1 : fireflyMat2);
        const radius = 1.2 + Math.random() * 1.8;
        const seed = Math.random() * Math.PI * 2;
        const yBase = 0.4 + Math.random() * 1.8;
        mesh.position.set(Math.cos(seed) * radius, yBase, Math.sin(seed) * radius);
        particlesGroup.add(mesh);
        nightFireflies.push({ mesh, seed, radius, speed: 0.4 + Math.random() * 0.6, yBase });
      }
    }

    // B) Morning Golden Sun Dust Motes
    const morningDust: { mesh: THREE.Mesh; speedY: number; baseX: number; baseZ: number }[] = [];
    if (room === 'morning') {
      const dustMat = new THREE.MeshBasicMaterial({
        color: 0xfde047,
        transparent: true,
        opacity: 0.65,
      });
      for (let i = 0; i < 28; i++) {
        const geo = new THREE.SphereGeometry(0.02 + Math.random() * 0.02, 6, 6);
        const mesh = new THREE.Mesh(geo, dustMat);
        const baseX = (Math.random() - 0.5) * 3.2;
        const baseZ = (Math.random() - 0.5) * 2.8;
        mesh.position.set(baseX, Math.random() * 2.5, baseZ);
        particlesGroup.add(mesh);
        morningDust.push({ mesh, speedY: 0.15 + Math.random() * 0.25, baseX, baseZ });
      }
    }

    // C) Sleepy "Z" Floating Bubbles (when mood === 'tired' or animation === 'sleep')
    const sleepBubbles: { mesh: THREE.Group; speedY: number; phase: number }[] = [];
    if (mood === 'tired' || animation === 'sleep') {
      const zMat = new THREE.MeshBasicMaterial({
        color: 0x93c5fd,
        transparent: true,
        opacity: 0.75,
      });

      for (let i = 0; i < 4; i++) {
        const zGroup = new THREE.Group();
        // Construct a cute 3D mini "Z"
        const topBar = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.03, 0.02), zMat);
        const bottomBar = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.03, 0.02), zMat);
        bottomBar.position.y = -0.1;
        const diagBar = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.03, 0.02), zMat);
        diagBar.rotation.z = 0.78;
        diagBar.position.y = -0.05;

        zGroup.add(topBar, bottomBar, diagBar);
        const scale = 0.8 + i * 0.35;
        zGroup.scale.set(scale, scale, scale);
        zGroup.position.set(0.4 + i * 0.15, 1.6 + i * 0.45, 0.5);

        particlesGroup.add(zGroup);
        sleepBubbles.push({ mesh: zGroup, speedY: 0.2 + i * 0.05, phase: i * 1.4 });
      }
    }

    // D) Happy Joyful Heart / Sparkle Particles (when mood === 'happy')
    const happyHearts: { mesh: THREE.Group; phase: number; speed: number; xOff: number }[] = [];
    if (mood === 'happy') {
      const heartMat = new THREE.MeshBasicMaterial({ color: 0xf472b6, transparent: true, opacity: 0.85 });
      for (let i = 0; i < 3; i++) {
        const heartGroup = new THREE.Group();
        // 2 spheres + 1 cone to form a cute mini heart
        const s1 = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), heartMat);
        s1.position.set(-0.035, 0.03, 0);
        const s2 = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), heartMat);
        s2.position.set(0.035, 0.03, 0);
        const tip = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.08, 8), heartMat);
        tip.rotation.z = Math.PI;
        tip.position.set(0, -0.03, 0);

        heartGroup.add(s1, s2, tip);
        heartGroup.scale.set(0.9, 0.9, 0.9);
        particlesGroup.add(heartGroup);
        happyHearts.push({
          mesh: heartGroup,
          phase: i * 2.1,
          speed: 0.35 + i * 0.1,
          xOff: (i - 1) * 0.45,
        });
      }
    }

    // 5. Build Procedural 3D Character
    const { group, parts } = createProcedural3DCharacter(avatarId);
    rootGroupRef.current = group;
    characterPartsRef.current = parts;
    scene.add(group);

    // Mouse / Touch Parallax tracking
    let targetRotY = 0;
    let targetRotX = 0;
    const onPointerMove = (e: MouseEvent | TouchEvent) => {
      const rect = container.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      const x = ((clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((clientY - rect.top) / rect.height) * 2 - 1);
      targetRotY = x * 0.45;
      targetRotX = -y * 0.25;
    };

    container.addEventListener('mousemove', onPointerMove);
    container.addEventListener('touchmove', onPointerMove, { passive: true });

    // Handle Tap gesture
    const handleTapClick = () => {
      tapAnimRef.current = {
        active: true,
        startTime: performance.now() / 1000,
      };
      if (onTap) onTap();
    };

    container.addEventListener('click', handleTapClick);

    // 6. Organic Animation Loop
    let animId = 0;
    const clock = new THREE.Clock();

    const animate = () => {
      const t = clock.getElapsedTime();

      // Animate Room Atmosphere Particles
      if (room === 'night') {
        nightFireflies.forEach((ff) => {
          const angle = ff.seed + t * ff.speed;
          ff.mesh.position.x = Math.cos(angle) * ff.radius;
          ff.mesh.position.z = Math.sin(angle) * ff.radius;
          ff.mesh.position.y = ff.yBase + Math.sin(t * 1.8 + ff.seed) * 0.18;
          const pulse = 0.5 + Math.sin(t * 3.5 + ff.seed) * 0.5;
          ff.mesh.scale.setScalar(0.7 + pulse * 0.5);
        });
      } else if (room === 'morning') {
        morningDust.forEach((d) => {
          d.mesh.position.y = (d.mesh.position.y + 0.005 * d.speedY * 60) % 2.6;
          d.mesh.position.x = d.baseX + Math.sin(t * 1.2 + d.baseZ) * 0.08;
        });
      }

      // Animate Sleep Zzz
      if (sleepBubbles.length > 0) {
        sleepBubbles.forEach((sb, idx) => {
          const localY = ((t * sb.speedY + sb.phase) % 1.5);
          sb.mesh.position.y = 1.35 + localY;
          sb.mesh.position.x = 0.35 + Math.sin(t * 1.6 + idx) * 0.12 + localY * 0.25;
          const alpha = 1.0 - localY / 1.5;
          sb.mesh.scale.setScalar((0.7 + localY * 0.4) * alpha);
        });
      }

      // Animate Happy Hearts
      if (happyHearts.length > 0) {
        happyHearts.forEach((hh) => {
          const progress = ((t * hh.speed + hh.phase) % 2.0) / 2.0;
          hh.mesh.position.y = 1.2 + progress * 1.4;
          hh.mesh.position.x = hh.xOff + Math.sin(t * 3.0 + hh.phase) * 0.15;
          hh.mesh.position.z = 0.6;
          const scale = Math.sin(progress * Math.PI) * 1.2;
          hh.mesh.scale.setScalar(Math.max(0.01, scale));
        });
      }

      if (rootGroupRef.current) {
        // Tap Jump Spin Reaction
        let tapSpin = 0;
        let tapHop = 0;
        if (tapAnimRef.current.active) {
          const elapsed = t - tapAnimRef.current.startTime;
          if (elapsed < 0.85) {
            const p = elapsed / 0.85;
            tapSpin = p * Math.PI * 2;
            tapHop = Math.sin(p * Math.PI) * 0.38;
          } else {
            tapAnimRef.current.active = false;
          }
        }

        // Smooth head turn tracking pointer
        rootGroupRef.current.rotation.y += (targetRotY + tapSpin - rootGroupRef.current.rotation.y) * 0.1;
        rootGroupRef.current.rotation.x += (targetRotX - rootGroupRef.current.rotation.x) * 0.1;

        // Mood-Driven Posture & Idle Rhythms
        if (mood === 'happy') {
          // Bouncy, lively joy
          const breathe = Math.sin(t * 3.6) * 0.045;
          rootGroupRef.current.scale.set(1 + breathe * 0.6, 1 + breathe, 1 + breathe * 0.6);
          const bounce = Math.abs(Math.sin(t * 4.2)) * 0.12;
          rootGroupRef.current.position.y = bounce + tapHop;
          rootGroupRef.current.rotation.z = Math.sin(t * 2.2) * 0.05;
        } else if (mood === 'curious') {
          // Inquisitive head tilt
          const breathe = Math.sin(t * 2.0) * 0.03;
          rootGroupRef.current.scale.set(1 + breathe * 0.5, 1 + breathe, 1 + breathe * 0.5);
          rootGroupRef.current.position.y = Math.sin(t * 1.8) * 0.04 + tapHop;
          rootGroupRef.current.rotation.z = 0.22 + Math.sin(t * 1.5) * 0.04;
        } else if (mood === 'tired' || animation === 'sleep') {
          // Slow deep rhythmic sleep breathing
          if (avatarId === 'bobo') {
            // Bobo melts flat into a cute sleeping mochi puddle on the floor (Reference 3, Pose 4!)
            const breathe = Math.sin(t * 1.0) * 0.04;
            rootGroupRef.current.scale.set(1.4 + breathe, 0.48 - breathe * 0.5, 1.35 + breathe);
            rootGroupRef.current.position.y = -0.22;
            rootGroupRef.current.rotation.x = 0;
            rootGroupRef.current.rotation.z = 0;
            if (characterPartsRef.current.ears && characterPartsRef.current.ears.length === 2) {
              characterPartsRef.current.ears[0].rotation.z = 1.35;
              characterPartsRef.current.ears[1].rotation.z = -1.35;
            }
          } else {
            const breathe = Math.sin(t * 1.2) * 0.06;
            rootGroupRef.current.scale.set(1 + breathe * 0.4, 1 + breathe * 0.8, 1 + breathe * 0.4);
            rootGroupRef.current.position.y = Math.sin(t * 1.2) * 0.03 + tapHop;
            rootGroupRef.current.rotation.x += (0.16 + Math.sin(t * 1.2) * 0.05 - rootGroupRef.current.rotation.x) * 0.08;
            rootGroupRef.current.rotation.z = 0;
          }
        } else {
          // Calm: peaceful steady breathing
          const breathe = Math.sin(t * 1.8) * 0.03;
          rootGroupRef.current.scale.set(1 + breathe * 0.5, 1 + breathe, 1 + breathe * 0.5);
          rootGroupRef.current.position.y = Math.sin(t * 1.5) * 0.04 + tapHop;
          rootGroupRef.current.rotation.z = 0;
        }

        // Additional Animation Cue Overrides
        if (animation === 'play' || animation === 'success') {
          rootGroupRef.current.position.y += Math.abs(Math.sin(t * 6)) * 0.18;
        }

        // Sprout & Flower Prop (Yobao)
        if (characterPartsRef.current.sprout) {
          if (mood === 'happy') {
            characterPartsRef.current.sprout.rotation.z = Math.sin(t * 5.2) * 0.28 - 0.1;
          } else if (mood === 'curious') {
            characterPartsRef.current.sprout.rotation.z = 0.35 + Math.sin(t * 2.0) * 0.08;
          } else if (mood === 'tired') {
            characterPartsRef.current.sprout.rotation.z = -0.32;
          } else {
            characterPartsRef.current.sprout.rotation.z = Math.sin(t * 3.2) * 0.14 - 0.1;
          }
        }
        if (characterPartsRef.current.flowerProp) {
          characterPartsRef.current.flowerProp.rotation.z = Math.sin(t * 2.8) * 0.1;
        }

        // Baseball Bat sway (Pico)
        if (characterPartsRef.current.bat) {
          characterPartsRef.current.bat.rotation.z = -0.65 + Math.sin(t * 2.2) * 0.06;
        }

        // Ray Wings Flapping (Lumi)
        if (characterPartsRef.current.wings && characterPartsRef.current.wings.length === 2) {
          const flapSpeed = mood === 'happy' ? 4.8 : 2.4;
          const wingFlap = Math.sin(t * flapSpeed) * 0.18;
          characterPartsRef.current.wings[0].rotation.z = -0.15 + wingFlap;
          characterPartsRef.current.wings[1].rotation.z = 0.15 - wingFlap;
        }

        // Twin Ribbon Tails & Cat Tail Undulation (Lumi & Shadow)
        if (characterPartsRef.current.tails && characterPartsRef.current.tails.length > 0) {
          characterPartsRef.current.tails.forEach((tail, idx) => {
            tail.rotation.x = 0.2 + Math.sin(t * 2.8 + idx) * 0.12;
            tail.rotation.z = Math.cos(t * 2.2 + idx) * 0.15;
          });
        }

        // Tentacles Undulation (Nova)
        if (characterPartsRef.current.tentacles && characterPartsRef.current.tentacles.length > 0) {
          characterPartsRef.current.tentacles.forEach((tent, i) => {
            const wave = Math.sin(t * 2.5 + i * 0.75) * 0.2;
            tent.rotation.x = wave;
            tent.rotation.z = Math.cos(t * 2.0 + i * 0.75) * 0.15;
          });
        }

        // Antennae gentle sway (Nova & Shadow)
        if (characterPartsRef.current.antennae && characterPartsRef.current.antennae.length === 2) {
          const sway = Math.sin(t * 2.2) * 0.1;
          characterPartsRef.current.antennae[0].rotation.z = 0.55 + sway;
          characterPartsRef.current.antennae[1].rotation.z = -0.55 - sway;
        }

        // Ears animation
        if (characterPartsRef.current.ears && characterPartsRef.current.ears.length === 2) {
          if (mood === 'happy') {
            const earFlap = Math.sin(t * 4.5) * 0.18;
            characterPartsRef.current.ears[0].rotation.z = 0.75 + earFlap;
            characterPartsRef.current.ears[1].rotation.z = -0.75 - earFlap;
          } else if (mood === 'curious') {
            characterPartsRef.current.ears[0].rotation.z = 0.85;
            characterPartsRef.current.ears[1].rotation.z = -0.35;
          } else if (mood === 'tired') {
            characterPartsRef.current.ears[0].rotation.z = 0.35;
            characterPartsRef.current.ears[1].rotation.z = -0.35;
          } else {
            const earWiggle = Math.sin(t * 2.8) * 0.08;
            characterPartsRef.current.ears[0].rotation.z = 0.55 + earWiggle;
            characterPartsRef.current.ears[1].rotation.z = -0.55 - earWiggle;
          }
        }

        // Arms animation
        if (characterPartsRef.current.leftArm && characterPartsRef.current.rightArm) {
          if (mood === 'happy' || animation === 'speak' || animation === 'success') {
            characterPartsRef.current.leftArm.rotation.z = -0.4 + Math.sin(t * 4.8) * 0.22;
            characterPartsRef.current.rightArm.rotation.z = 0.4 - Math.sin(t * 4.8) * 0.22;
          } else if (mood === 'curious') {
            characterPartsRef.current.leftArm.rotation.z = -0.7;
            characterPartsRef.current.rightArm.rotation.z = 0.2;
          } else {
            characterPartsRef.current.leftArm.rotation.z = -0.25;
            characterPartsRef.current.rightArm.rotation.z = 0.25;
          }
        }

        // Eyes animation (Expression & Blinking)
        if (characterPartsRef.current.eyes && characterPartsRef.current.eyes.length > 0) {
          if (mood === 'tired' || animation === 'sleep') {
            // Closed sleepy eyes slit
            characterPartsRef.current.eyes.forEach((eye) => {
              eye.scale.set(1.1, 0.12, 1.1);
            });
          } else if (mood === 'curious') {
            // Wide attentive eyes
            characterPartsRef.current.eyes.forEach((eye) => {
              eye.scale.set(1.22, 1.22, 1.22);
            });
          } else {
            // Natural blink cycle
            const blinkCycle = t % 3.6;
            const isBlinking = blinkCycle > 3.42 && blinkCycle < 3.56;
            const scaleY = isBlinking ? 0.08 : mood === 'happy' ? 0.9 : 1.0;
            characterPartsRef.current.eyes.forEach((eye) => {
              eye.scale.set(1.0, scaleY, 1.0);
            });
          }
        }

        // Mouth animation
        if (characterPartsRef.current.mouth) {
          if (mood === 'happy') {
            characterPartsRef.current.mouth.scale.set(1.25, 1.25, 1.0);
          } else if (mood === 'tired') {
            characterPartsRef.current.mouth.scale.set(0.85, 0.7, 1.0);
          } else {
            characterPartsRef.current.mouth.scale.set(1.0, 1.0, 1.0);
          }
        }
      }

      renderer.render(scene, camera);
      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);

    // Resize handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 320;
      const h = container.clientHeight || 320;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousemove', onPointerMove);
      container.removeEventListener('touchmove', onPointerMove);
      container.removeEventListener('click', handleTapClick);
      renderer.dispose();
      scene.clear();
    };
  }, [avatarId, mood, animation, room, batterySaver, onTap]);

  return (
    <div
      ref={mountRef}
      className="w-full h-full cursor-pointer select-none flex items-center justify-center relative touch-none"
      title="Нажмите на персонажа для интерактивной реакции"
    />
  );
};
