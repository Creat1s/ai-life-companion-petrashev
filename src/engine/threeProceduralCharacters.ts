import * as THREE from 'three';
import { AvatarId } from '../types/companion';

export interface ArticulatedChain {
  root: THREE.Group;
  segments: THREE.Object3D[];
  baseRotX: number;
  baseRotY: number;
  baseRotZ: number;
  phaseOffset: number;
}

export interface Character3DParts {
  root: THREE.Group;
  bodyGroup: THREE.Group;
  headGroup: THREE.Group;
  leftEyeGroup: THREE.Group;
  rightEyeGroup: THREE.Group;
  leftPupilGroup: THREE.Group;
  rightPupilGroup: THREE.Group;
  leftEyelid: THREE.Mesh;
  rightEyelid: THREE.Mesh;
  mouthGroup: THREE.Group;
  wings: THREE.Object3D[];
  tentacles: THREE.Object3D[];
  antennae: THREE.Object3D[];
  tails: THREE.Object3D[];
  ears: THREE.Object3D[];
  articulatedTentacles: ArticulatedChain[];
  articulatedTails: ArticulatedChain[];
  articulatedAntennae: ArticulatedChain[];
  glowMaterials: THREE.MeshStandardMaterial[];
  particles: THREE.Points;
}

/**
 * Generates a high-resolution procedural cosmic skin & forehead spiral texture for Nova (matching 7.jpg)
 */
function createNovaCosmicTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  // Deep indigo-midnight base gradient
  const baseGrad = ctx.createRadialGradient(512, 480, 80, 512, 512, 650);
  baseGrad.addColorStop(0, '#2e2b78');
  baseGrad.addColorStop(0.5, '#1d1a54');
  baseGrad.addColorStop(1, '#110e36');
  ctx.fillStyle = baseGrad;
  ctx.fillRect(0, 0, 1024, 1024);

  // Soft nebula clouds
  for (let i = 0; i < 18; i++) {
    const x = 150 + ((i * 173) % 720);
    const y = 120 + ((i * 229) % 680);
    const r = 70 + ((i * 47) % 130);
    const nebGrad = ctx.createRadialGradient(x, y, 5, x, y, r);
    nebGrad.addColorStop(0, i % 2 === 0 ? 'rgba(139, 92, 246, 0.28)' : 'rgba(99, 102, 241, 0.24)');
    nebGrad.addColorStop(1, 'rgba(29, 26, 84, 0)');
    ctx.fillStyle = nebGrad;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Bioluminescent stardust speckles across the head (concentrated on upper forehead & temples like 7.jpg)
  for (let i = 0; i < 260; i++) {
    const px = (i * 97 + 43) % 1024;
    const py = (i * 61 + 19) % 860;
    const radius = (i % 7 === 0 ? 7.5 : i % 3 === 0 ? 4.2 : 2.0);
    const alpha = 0.35 + ((i % 5) * 0.13);

    const glow = ctx.createRadialGradient(px, py, 0.5, px, py, radius * 2.4);
    glow.addColorStop(0, `rgba(216, 180, 254, ${alpha})`);
    glow.addColorStop(0.45, `rgba(139, 92, 246, ${alpha * 0.7})`);
    glow.addColorStop(1, 'rgba(139, 92, 246, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(px, py, radius * 2.4, 0, Math.PI * 2);
    ctx.fill();
  }

  // Iconic luminous violet S-spiral glyph on upper-right forehead (matching 7.jpg)
  ctx.save();
  ctx.translate(548, 310);
  ctx.strokeStyle = '#a78bfa';
  ctx.shadowColor = '#c084fc';
  ctx.shadowBlur = 22;
  ctx.lineCap = 'round';

  ctx.beginPath();
  for (let t = 0; t <= 5.8 * Math.PI; t += 0.08) {
    const r = 5 + t * 8.2;
    const sx = Math.cos(t) * r;
    const sy = Math.sin(t) * r * 0.88;
    if (t === 0) ctx.moveTo(sx, sy);
    else ctx.lineTo(sx, sy);
  }
  ctx.lineWidth = 14;
  ctx.stroke();

  // Flowing S-tail of the forehead spiral descending between the eyes
  ctx.beginPath();
  ctx.moveTo(-48, -18);
  ctx.bezierCurveTo(-92, 48, -12, 95, 22, 148);
  ctx.bezierCurveTo(44, 182, 16, 225, -8, 252);
  ctx.lineWidth = 18;
  ctx.stroke();
  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

/**
 * Generates iridescent striated wing texture for Lumi (matching 6.jpg)
 */
function createLumiWingTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  const grad = ctx.createLinearGradient(0, 0, 512, 512);
  grad.addColorStop(0, '#ffffff');
  grad.addColorStop(0.32, '#bae6fd');
  grad.addColorStop(0.65, '#7dd3fc');
  grad.addColorStop(0.85, '#f5d0fe');
  grad.addColorStop(1, '#a5f3fc');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  // Delicate fin striations
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
  ctx.lineWidth = 3;
  for (let i = 0; i < 16; i++) {
    ctx.beginPath();
    ctx.moveTo(40, 60 + i * 26);
    ctx.quadraticCurveTo(256, 30 + i * 24, 480, 80 + i * 22);
    ctx.stroke();
  }

  // Sparkle dots
  for (let i = 0; i < 90; i++) {
    const x = (i * 73) % 512;
    const y = (i * 41) % 512;
    const r = 1.5 + (i % 4);
    ctx.fillStyle = i % 3 === 0 ? 'rgba(255,255,255,0.9)' : 'rgba(167,243,208,0.75)';
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

/**
 * Helper to create expressive anime-style 3D eyes with articulated upper eyelids & gaze-tracking pupils
 */
function createExpressiveEye(options: {
  irisOuterColor: number;
  irisInnerColor: number;
  pupilColor: number;
  eyelidColor: number;
  radius?: number;
  isLeft?: boolean;
  slantedAnime?: boolean;
}): {
  eyeGroup: THREE.Group;
  pupilGroup: THREE.Group;
  eyelidMesh: THREE.Mesh;
} {
  const r = options.radius ?? 0.34;
  const eyeGroup = new THREE.Group();

  // Sclera (slightly flattened glossy almond/sphere)
  const scleraGeo = new THREE.SphereGeometry(r, 32, 32);
  scleraGeo.scale(1.04, 0.96, 0.58);
  const scleraMat = new THREE.MeshPhysicalMaterial({
    color: 0xf8fafc,
    roughness: 0.08,
    metalness: 0.0,
    clearcoat: 1.0,
    clearcoatRoughness: 0.05,
  });
  const sclera = new THREE.Mesh(scleraGeo, scleraMat);
  eyeGroup.add(sclera);

  // Pupil + Iris assembly that moves during gaze tracking & micro-saccades
  const pupilGroup = new THREE.Group();
  eyeGroup.add(pupilGroup);

  // Outer Iris Ring
  const irisGeo = new THREE.SphereGeometry(r * 0.78, 32, 32);
  irisGeo.scale(0.95, 1.02, 0.42);
  const irisMat = new THREE.MeshStandardMaterial({
    color: options.irisOuterColor,
    emissive: options.irisOuterColor,
    emissiveIntensity: 0.42,
    roughness: 0.14,
  });
  const iris = new THREE.Mesh(irisGeo, irisMat);
  iris.position.z = r * 0.34;
  pupilGroup.add(iris);

  // Inner Luminous Iris Ring
  const innerGeo = new THREE.SphereGeometry(r * 0.6, 28, 28);
  innerGeo.scale(0.94, 1.0, 0.36);
  const innerMat = new THREE.MeshStandardMaterial({
    color: options.irisInnerColor,
    emissive: options.irisInnerColor,
    emissiveIntensity: 0.75,
    roughness: 0.1,
  });
  const innerIris = new THREE.Mesh(innerGeo, innerMat);
  innerIris.position.z = r * 0.42;
  pupilGroup.add(innerIris);

  // Deep Pupil Core
  const pupilGeo = new THREE.SphereGeometry(r * 0.38, 24, 24);
  pupilGeo.scale(0.92, 0.98, 0.3);
  const pupilMat = new THREE.MeshStandardMaterial({
    color: options.pupilColor,
    roughness: 0.05,
  });
  const pupil = new THREE.Mesh(pupilGeo, pupilMat);
  pupil.position.z = r * 0.49;
  pupilGroup.add(pupil);

  // Main Specular Catchlight
  const hl1Geo = new THREE.SphereGeometry(r * 0.17, 16, 16);
  const hlMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const hl1 = new THREE.Mesh(hl1Geo, hlMat);
  hl1.position.set(options.isLeft ? -r * 0.24 : r * 0.24, r * 0.24, r * 0.59);
  pupilGroup.add(hl1);

  // Secondary Lower Catchlight
  const hl2Geo = new THREE.SphereGeometry(r * 0.085, 12, 12);
  const hl2 = new THREE.Mesh(hl2Geo, hlMat);
  hl2.position.set(options.isLeft ? r * 0.2 : -r * 0.2, -r * 0.22, r * 0.57);
  pupilGroup.add(hl2);

  // Upper Eyelid Hood (rotates on X to blink naturally without squashing the eyeball)
  const eyelidGeo = new THREE.SphereGeometry(
    r * 1.07,
    28,
    20,
    0,
    Math.PI * 2,
    0,
    Math.PI * 0.54
  );
  eyelidGeo.scale(1.04, 0.98, 0.62);
  const eyelidMat = new THREE.MeshPhysicalMaterial({
    color: options.eyelidColor,
    roughness: 0.25,
    clearcoat: 0.6,
    side: THREE.DoubleSide,
  });
  const eyelidMesh = new THREE.Mesh(eyelidGeo, eyelidMat);
  // Rest position: slightly hooding top of the eye
  eyelidMesh.rotation.x = -0.55;
  eyeGroup.add(eyelidMesh);

  // Winged Anime Eyelash Arc (matching 6.jpg, 7.jpg, 8.jpg)
  const lashSign = options.isLeft ? -1 : 1;
  const lashCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-lashSign * r * 0.72, r * 0.12, r * 0.48),
    new THREE.Vector3(0, r * 0.66, r * 0.54),
    new THREE.Vector3(lashSign * r * 0.78, r * 0.34, r * 0.46),
    new THREE.Vector3(lashSign * r * 1.15, r * 0.52, r * 0.32),
  ]);
  const lashGeo = new THREE.TubeGeometry(lashCurve, 20, r * 0.065, 8, false);
  const lashMat = new THREE.MeshStandardMaterial({
    color: 0x090814,
    roughness: 0.2,
  });
  const lashMesh = new THREE.Mesh(lashGeo, lashMat);
  eyeGroup.add(lashMesh);

  if (options.slantedAnime) {
    eyeGroup.rotation.z = options.isLeft ? -0.14 : 0.14;
  }

  return { eyeGroup, pupilGroup, eyelidMesh };
}

/**
 * Creates a floating ambient particle halo around the companion
 */
function createSparkleField(colorHex: number, count = 48): THREE.Points {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 * 3;
    const radius = 1.65 + (i % 7) * 0.24;
    positions[i * 3] = Math.cos(angle) * radius;
    positions[i * 3 + 1] = ((i / count) - 0.5) * 3.2;
    positions[i * 3 + 2] = Math.sin(angle) * radius - 0.4;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const mat = new THREE.PointsMaterial({
    color: colorHex,
    size: 0.085,
    transparent: true,
    opacity: 0.8,
  });
  return new THREE.Points(geo, mat);
}

/**
 * 1. LUMI — 3D Iridescent Sea Angel (Exact 3D Match of Image 6.jpg with Multi-Joint Wings & Ribbon Tails)
 */
function buildLumi3D(): Character3DParts {
  const root = new THREE.Group();
  const bodyGroup = new THREE.Group();
  const headGroup = new THREE.Group();
  root.add(bodyGroup);
  bodyGroup.add(headGroup);

  const glowMaterials: THREE.MeshStandardMaterial[] = [];
  const wings: THREE.Object3D[] = [];
  const tentacles: THREE.Object3D[] = [];
  const antennae: THREE.Object3D[] = [];
  const tails: THREE.Object3D[] = [];
  const ears: THREE.Object3D[] = [];
  const articulatedTentacles: ArticulatedChain[] = [];
  const articulatedTails: ArticulatedChain[] = [];
  const articulatedAntennae: ArticulatedChain[] = [];

  const wingTexture = createLumiWingTexture();

  // Porcelain Pearlescent White Skin
  const skinMat = new THREE.MeshPhysicalMaterial({
    color: 0xf8fbff,
    emissive: 0x38bdf8,
    emissiveIntensity: 0.08,
    roughness: 0.16,
    metalness: 0.02,
    clearcoat: 1.0,
    clearcoatRoughness: 0.08,
    sheen: 0.65,
    sheenColor: new THREE.Color(0xe0f2fe),
  });

  // Iridescent Translucent Wing Material
  const wingMat = new THREE.MeshPhysicalMaterial({
    map: wingTexture,
    color: 0xe0f2fe,
    emissive: 0x38bdf8,
    emissiveMap: wingTexture,
    emissiveIntensity: 0.28,
    roughness: 0.14,
    metalness: 0.05,
    transmission: 0.38,
    transparent: true,
    opacity: 0.93,
    clearcoat: 1.0,
    side: THREE.DoubleSide,
  });
  glowMaterials.push(wingMat);

  // Large Rounded Chibi Head
  const headGeo = new THREE.SphereGeometry(1.12, 48, 48);
  headGeo.scale(1.24, 0.96, 0.98);
  const headMesh = new THREE.Mesh(headGeo, skinMat);
  headGroup.add(headMesh);

  // Soft Pink Blush Cheeks
  const blushMat = new THREE.MeshBasicMaterial({
    color: 0xf472b6,
    transparent: true,
    opacity: 0.34,
  });
  const blushGeo = new THREE.SphereGeometry(0.23, 20, 20);
  blushGeo.scale(1.35, 0.65, 0.3);

  const leftBlush = new THREE.Mesh(blushGeo, blushMat);
  leftBlush.position.set(-0.84, -0.22, 0.86);
  leftBlush.rotation.y = -0.42;
  headGroup.add(leftBlush);

  const rightBlush = new THREE.Mesh(blushGeo, blushMat);
  rightBlush.position.set(0.84, -0.22, 0.86);
  rightBlush.rotation.y = 0.42;
  headGroup.add(rightBlush);

  // Two Curved Bunny-like Sea-Slug Feelers on Top (Articulated)
  [-1, 1].forEach((side, idx) => {
    const feelerRoot = new THREE.Group();
    feelerRoot.position.set(side * 0.46, 0.88, 0.12);
    const baseRotZ = side * -0.24;
    feelerRoot.rotation.z = baseRotZ;

    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(side * 0.06, 0.32, 0.05),
      new THREE.Vector3(-side * 0.08, 0.64, 0.14),
    ]);
    const feelerGeo = new THREE.TubeGeometry(curve, 20, 0.15, 16, false);
    const feelerMesh = new THREE.Mesh(feelerGeo, skinMat);
    feelerRoot.add(feelerMesh);

    const tipBulb = new THREE.Mesh(new THREE.SphereGeometry(0.145, 16, 16), skinMat);
    tipBulb.position.set(-side * 0.08, 0.64, 0.14);
    feelerRoot.add(tipBulb);

    headGroup.add(feelerRoot);
    antennae.push(feelerRoot);
    articulatedAntennae.push({
      root: feelerRoot,
      segments: [feelerRoot],
      baseRotX: 0,
      baseRotY: 0,
      baseRotZ,
      phaseOffset: idx * 1.2,
    });
  });

  // Huge Aqua-Sapphire Eyes (matching 6.jpg)
  const leftEyeBuilt = createExpressiveEye({
    irisOuterColor: 0x0284c7,
    irisInnerColor: 0x38bdf8,
    pupilColor: 0x082f49,
    eyelidColor: 0xf1f5f9,
    radius: 0.38,
    isLeft: true,
    slantedAnime: true,
  });
  leftEyeBuilt.eyeGroup.position.set(-0.52, -0.02, 0.92);
  leftEyeBuilt.eyeGroup.rotation.y = -0.24;
  headGroup.add(leftEyeBuilt.eyeGroup);

  const rightEyeBuilt = createExpressiveEye({
    irisOuterColor: 0x0284c7,
    irisInnerColor: 0x38bdf8,
    pupilColor: 0x082f49,
    eyelidColor: 0xf1f5f9,
    radius: 0.38,
    isLeft: false,
    slantedAnime: true,
  });
  rightEyeBuilt.eyeGroup.position.set(0.52, -0.02, 0.92);
  rightEyeBuilt.eyeGroup.rotation.y = 0.24;
  headGroup.add(rightEyeBuilt.eyeGroup);

  // Cute Pink Smile Mouth
  const mouthGroup = new THREE.Group();
  mouthGroup.position.set(0, -0.28, 1.07);
  const mouthGeo = new THREE.SphereGeometry(0.095, 20, 20);
  mouthGeo.scale(1.45, 0.85, 0.45);
  const mouthMat = new THREE.MeshStandardMaterial({
    color: 0xf43f5e,
    roughness: 0.3,
  });
  mouthGroup.add(new THREE.Mesh(mouthGeo, mouthMat));
  headGroup.add(mouthGroup);

  // Compact Graceful Torso + Paws
  const torsoGeo = new THREE.CylinderGeometry(0.42, 0.22, 0.98, 28);
  const torso = new THREE.Mesh(torsoGeo, skinMat);
  torso.position.set(0, -1.06, -0.04);
  bodyGroup.add(torso);

  const pawGeo = new THREE.CapsuleGeometry(0.11, 0.2, 12, 16);
  const leftPaw = new THREE.Mesh(pawGeo, skinMat);
  leftPaw.position.set(-0.22, -0.94, 0.34);
  leftPaw.rotation.set(0.5, 0.2, 0.3);
  bodyGroup.add(leftPaw);

  const rightPaw = new THREE.Mesh(pawGeo, skinMat);
  rightPaw.position.set(0.22, -0.94, 0.34);
  rightPaw.rotation.set(0.5, -0.2, -0.3);
  bodyGroup.add(rightPaw);

  // Sweeping Manta-Ray Wings with Upward Curled Tips (matching 6.jpg)
  [-1, 1].forEach((side) => {
    const wingPivot = new THREE.Group();
    wingPivot.position.set(side * 0.55, -0.25, -0.15);

    const wingShape = new THREE.Shape();
    wingShape.moveTo(0, 0.45);
    wingShape.bezierCurveTo(side * 0.75, 0.65, side * 1.45, 0.75, side * 1.92, 1.22);
    wingShape.bezierCurveTo(side * 2.05, 0.85, side * 1.75, -0.25, side * 1.15, -0.62);
    wingShape.bezierCurveTo(side * 0.6, -0.78, side * 0.2, -0.58, 0, -0.45);
    wingShape.closePath();

    const extrudeGeo = new THREE.ExtrudeGeometry(wingShape, {
      depth: 0.05,
      bevelEnabled: true,
      bevelThickness: 0.03,
      bevelSize: 0.03,
      bevelSegments: 4,
    });
    const wingMesh = new THREE.Mesh(extrudeGeo, wingMat);
    wingPivot.add(wingMesh);
    bodyGroup.add(wingPivot);
    wings.push(wingPivot);
  });

  // 3 Flowing Articulated Ribbon Tails (Multi-segment chains for wave propagation)
  [-0.38, 0, 0.38].forEach((offsetX, tIdx) => {
    const tailRoot = new THREE.Group();
    tailRoot.position.set(offsetX, -1.42, -0.12);
    const baseRotZ = offsetX * 0.55;
    tailRoot.rotation.z = baseRotZ;
    bodyGroup.add(tailRoot);

    const segments: THREE.Object3D[] = [];
    let parentObj: THREE.Object3D = tailRoot;

    for (let s = 0; s < 4; s++) {
      const segPivot = new THREE.Group();
      segPivot.position.set(0, s === 0 ? 0 : -0.36, 0);

      const segWidth = 0.24 * (1 - s * 0.18);
      const segGeo = new THREE.SphereGeometry(segWidth, 16, 16);
      segGeo.scale(1.1, 1.85, 0.22);
      const segMesh = new THREE.Mesh(segGeo, wingMat);
      segMesh.position.y = -0.18;
      segPivot.add(segMesh);

      parentObj.add(segPivot);
      segments.push(segPivot);
      parentObj = segPivot;
    }

    tails.push(tailRoot);
    articulatedTails.push({
      root: tailRoot,
      segments,
      baseRotX: 0.12,
      baseRotY: 0,
      baseRotZ,
      phaseOffset: tIdx * 1.1,
    });
  });

  const particles = createSparkleField(0x7dd3fc, 52);
  root.add(particles);

  return {
    root,
    bodyGroup,
    headGroup,
    leftEyeGroup: leftEyeBuilt.eyeGroup,
    rightEyeGroup: rightEyeBuilt.eyeGroup,
    leftPupilGroup: leftEyeBuilt.pupilGroup,
    rightPupilGroup: rightEyeBuilt.pupilGroup,
    leftEyelid: leftEyeBuilt.eyelidMesh,
    rightEyelid: rightEyeBuilt.eyelidMesh,
    mouthGroup,
    wings,
    tentacles,
    antennae,
    tails,
    ears,
    articulatedTentacles,
    articulatedTails,
    articulatedAntennae,
    glowMaterials,
    particles,
  };
}

/**
 * 2. NOVA — 3D Cosmic Octopus Kwami (Exact High-Precision Match of Attached Image 7.jpg / 7_465f8ab9.jpg)
 * Features:
 * - Speckled cosmic galaxy head with glowing purple S-spiral forehead mark
 * - Two long graceful S-curved antennae with translucent glowing teardrop bulbs
 * - Slanted expressive purple anime eyes with winged eyelashes
 * - 8 Multi-joint S-curled tentacles with glowing violet suction cups
 */
function buildNova3D(): Character3DParts {
  const root = new THREE.Group();
  const bodyGroup = new THREE.Group();
  const headGroup = new THREE.Group();
  root.add(bodyGroup);
  bodyGroup.add(headGroup);

  const glowMaterials: THREE.MeshStandardMaterial[] = [];
  const wings: THREE.Object3D[] = [];
  const tentacles: THREE.Object3D[] = [];
  const antennae: THREE.Object3D[] = [];
  const tails: THREE.Object3D[] = [];
  const ears: THREE.Object3D[] = [];
  const articulatedTentacles: ArticulatedChain[] = [];
  const articulatedTails: ArticulatedChain[] = [];
  const articulatedAntennae: ArticulatedChain[] = [];

  const cosmicTexture = createNovaCosmicTexture();

  // Deep Midnight-Indigo Cosmic Skin with Speckled Nebula Texture & Glossy Clearcoat
  const headMat = new THREE.MeshPhysicalMaterial({
    map: cosmicTexture,
    color: 0xffffff,
    emissive: 0x4c1d95,
    emissiveMap: cosmicTexture,
    emissiveIntensity: 0.42,
    roughness: 0.22,
    metalness: 0.08,
    clearcoat: 0.92,
    clearcoatRoughness: 0.14,
    sheen: 0.8,
    sheenColor: new THREE.Color(0xa855f7),
  });
  glowMaterials.push(headMat);

  const tentacleSkinMat = new THREE.MeshPhysicalMaterial({
    color: 0x262168,
    emissive: 0x4c1d95,
    emissiveIntensity: 0.22,
    roughness: 0.24,
    metalness: 0.06,
    clearcoat: 0.88,
    clearcoatRoughness: 0.15,
  });

  // Glowing Lavender-Violet Suction Cups & Antenna Tips
  const suctionMat = new THREE.MeshPhysicalMaterial({
    color: 0xd8b4fe,
    emissive: 0xa855f7,
    emissiveIntensity: 0.95,
    roughness: 0.12,
    transmission: 0.35,
    transparent: true,
    opacity: 0.95,
  });
  glowMaterials.push(suctionMat);

  // Bulbous Octopus Head (Exact proportions of 7.jpg)
  const headGeo = new THREE.SphereGeometry(1.18, 64, 64);
  headGeo.scale(1.06, 1.02, 1.02);
  // Rotate Y slightly so the canvas spiral aligns with the front forehead
  headGeo.rotateY(-Math.PI * 0.5);
  const headMesh = new THREE.Mesh(headGeo, headMat);
  headGroup.add(headMesh);

  // Slanted Expressive Violet Anime Eyes (matching 7.jpg)
  const leftEyeBuilt = createExpressiveEye({
    irisOuterColor: 0x5b21b6,
    irisInnerColor: 0xc084fc,
    pupilColor: 0x0f0728,
    eyelidColor: 0x1e1b4b,
    radius: 0.39,
    isLeft: true,
    slantedAnime: true,
  });
  leftEyeBuilt.eyeGroup.position.set(-0.48, -0.14, 0.98);
  leftEyeBuilt.eyeGroup.rotation.y = -0.22;
  headGroup.add(leftEyeBuilt.eyeGroup);

  const rightEyeBuilt = createExpressiveEye({
    irisOuterColor: 0x5b21b6,
    irisInnerColor: 0xc084fc,
    pupilColor: 0x0f0728,
    eyelidColor: 0x1e1b4b,
    radius: 0.39,
    isLeft: false,
    slantedAnime: true,
  });
  rightEyeBuilt.eyeGroup.position.set(0.48, -0.14, 0.98);
  rightEyeBuilt.eyeGroup.rotation.y = 0.22;
  headGroup.add(rightEyeBuilt.eyeGroup);

  // Subtle Cute Smile
  const mouthGroup = new THREE.Group();
  mouthGroup.position.set(0, -0.44, 1.12);
  const smileCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.12, 0.03, 0),
    new THREE.Vector3(0, -0.025, 0.02),
    new THREE.Vector3(0.12, 0.03, 0),
  ]);
  const smileGeo = new THREE.TubeGeometry(smileCurve, 16, 0.018, 8, false);
  const smileMat = new THREE.MeshStandardMaterial({
    color: 0xc084fc,
    emissive: 0x9333ea,
    emissiveIntensity: 0.5,
  });
  mouthGroup.add(new THREE.Mesh(smileGeo, smileMat));
  headGroup.add(mouthGroup);

  // Two Long Graceful Curved Antennae with Translucent Glowing Teardrop Bulbs (matching 7.jpg)
  [-1, 1].forEach((side, idx) => {
    const antRoot = new THREE.Group();
    antRoot.position.set(side * 0.26, 1.05, 0.05);

    const antCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(side * 0.58, 0.42, 0.08),
      new THREE.Vector3(side * 1.18, 0.05, 0.16),
      new THREE.Vector3(side * 1.48, -0.68, 0.24),
      new THREE.Vector3(side * 1.42, -1.25, 0.32),
    ]);
    const antGeo = new THREE.TubeGeometry(antCurve, 32, 0.045, 14, false);
    const antMesh = new THREE.Mesh(antGeo, tentacleSkinMat);
    antRoot.add(antMesh);

    // Translucent outer teardrop + bright inner core at antenna tip
    const tipGroup = new THREE.Group();
    tipGroup.position.set(side * 1.42, -1.32, 0.32);

    const outerBulbGeo = new THREE.SphereGeometry(0.15, 24, 24);
    outerBulbGeo.scale(0.82, 1.45, 0.82);
    const outerBulb = new THREE.Mesh(outerBulbGeo, suctionMat);
    tipGroup.add(outerBulb);

    const innerCoreGeo = new THREE.SphereGeometry(0.075, 16, 16);
    const innerCoreMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const innerCore = new THREE.Mesh(innerCoreGeo, innerCoreMat);
    innerCore.position.y = -0.04;
    tipGroup.add(innerCore);

    antRoot.add(tipGroup);
    headGroup.add(antRoot);
    antennae.push(antRoot);
    articulatedAntennae.push({
      root: antRoot,
      segments: [antRoot, tipGroup],
      baseRotX: 0,
      baseRotY: 0,
      baseRotZ: 0,
      phaseOffset: idx * Math.PI * 0.6,
    });
  });

  // Compact Neck / Mantle Transition
  const mantleGeo = new THREE.CylinderGeometry(0.28, 0.36, 0.45, 24);
  const mantle = new THREE.Mesh(mantleGeo, tentacleSkinMat);
  mantle.position.set(0, -1.05, 0);
  bodyGroup.add(mantle);

  // 8 Articulated Multi-Joint S-Curled Tentacles with Glowing Suction Cups (Exact match of 7.jpg)
  const numTentacles = 8;
  for (let i = 0; i < numTentacles; i++) {
    const angle = (i / numTentacles) * Math.PI * 2 + 0.22;
    const tentRoot = new THREE.Group();
    tentRoot.position.set(Math.cos(angle) * 0.24, -1.12, Math.sin(angle) * 0.24);

    // Orient tentacle radially outward
    const baseRotY = -angle + Math.PI * 0.5;
    const baseRotX = 0.22;
    const baseRotZ = Math.cos(angle) * 0.25;
    tentRoot.rotation.set(baseRotX, baseRotY, baseRotZ);
    bodyGroup.add(tentRoot);

    // Build 4 articulated segments per tentacle so wave propagation curls the tip organically
    const segments: THREE.Object3D[] = [];
    let parentSegment: THREE.Object3D = tentRoot;

    const segLengths = [0.36, 0.34, 0.3, 0.26];
    const segRadiiTop = [0.13, 0.105, 0.082, 0.058];
    const segRadiiBot = [0.105, 0.082, 0.058, 0.032];
    const restCurlAngles = [0.22, 0.35, -0.48, -0.85]; // Natural S-curve with upward curled tip!

    for (let s = 0; s < 4; s++) {
      const segGroup = new THREE.Group();
      segGroup.position.set(0, s === 0 ? 0 : -segLengths[s - 1] * 0.92, 0);
      segGroup.rotation.x = restCurlAngles[s];

      // Tapered capsule/cylinder segment
      const segGeo = new THREE.CylinderGeometry(
        segRadiiTop[s],
        segRadiiBot[s],
        segLengths[s],
        18
      );
      segGeo.translate(0, -segLengths[s] * 0.5, 0);
      const segMesh = new THREE.Mesh(segGeo, tentacleSkinMat);
      segGroup.add(segMesh);

      // Smooth joint sphere
      const jointSphere = new THREE.Mesh(
        new THREE.SphereGeometry(segRadiiTop[s] * 0.98, 14, 14),
        tentacleSkinMat
      );
      segGroup.add(jointSphere);

      // Glowing violet ring-shaped suction cups along the underside of each segment (matching 7.jpg)
      const numCups = s < 3 ? 2 : 1;
      for (let c = 0; c < numCups; c++) {
        const cupY = -segLengths[s] * (0.3 + c * 0.42);
        const cupRadius = segRadiiBot[s] * 0.68;
        const cupTorus = new THREE.Mesh(
          new THREE.TorusGeometry(cupRadius, cupRadius * 0.38, 10, 16),
          suctionMat
        );
        cupTorus.position.set(0, cupY, segRadiiBot[s] * 0.85);
        segGroup.add(cupTorus);
      }

      // If final segment, add curled glowing tip cap
      if (s === 3) {
        const tipCap = new THREE.Mesh(
          new THREE.SphereGeometry(segRadiiBot[s] * 1.15, 14, 14),
          suctionMat
        );
        tipCap.position.set(0, -segLengths[s], 0.02);
        segGroup.add(tipCap);
      }

      parentSegment.add(segGroup);
      segments.push(segGroup);
      parentSegment = segGroup;
    }

    tentacles.push(tentRoot);
    articulatedTentacles.push({
      root: tentRoot,
      segments,
      baseRotX,
      baseRotY,
      baseRotZ,
      phaseOffset: i * 0.78,
    });
  }

  const particles = createSparkleField(0xc084fc, 56);
  root.add(particles);

  return {
    root,
    bodyGroup,
    headGroup,
    leftEyeGroup: leftEyeBuilt.eyeGroup,
    rightEyeGroup: rightEyeBuilt.eyeGroup,
    leftPupilGroup: leftEyeBuilt.pupilGroup,
    rightPupilGroup: rightEyeBuilt.pupilGroup,
    leftEyelid: leftEyeBuilt.eyelidMesh,
    rightEyelid: rightEyeBuilt.eyelidMesh,
    mouthGroup,
    wings,
    tentacles,
    antennae,
    tails,
    ears,
    articulatedTentacles,
    articulatedTails,
    articulatedAntennae,
    glowMaterials,
    particles,
  };
}

/**
 * 3. SHADOW — 3D Neon-Violet Panther Kwami (Exact 3D Match of Image 8.jpg)
 */
function buildShadow3D(): Character3DParts {
  const root = new THREE.Group();
  const bodyGroup = new THREE.Group();
  const headGroup = new THREE.Group();
  root.add(bodyGroup);
  bodyGroup.add(headGroup);

  const glowMaterials: THREE.MeshStandardMaterial[] = [];
  const wings: THREE.Object3D[] = [];
  const tentacles: THREE.Object3D[] = [];
  const antennae: THREE.Object3D[] = [];
  const tails: THREE.Object3D[] = [];
  const ears: THREE.Object3D[] = [];
  const articulatedTentacles: ArticulatedChain[] = [];
  const articulatedTails: ArticulatedChain[] = [];
  const articulatedAntennae: ArticulatedChain[] = [];

  // Velvet Obsidian Panther Fur Material
  const blackFurMat = new THREE.MeshPhysicalMaterial({
    color: 0x0f0e17,
    roughness: 0.42,
    metalness: 0.08,
    clearcoat: 0.35,
    sheen: 0.9,
    sheenColor: new THREE.Color(0x4c1d95),
  });

  // Glowing Neon-Purple Markings
  const neonPurpleMat = new THREE.MeshStandardMaterial({
    color: 0x9333ea,
    emissive: 0x9333ea,
    emissiveIntensity: 0.92,
    roughness: 0.18,
  });
  glowMaterials.push(neonPurpleMat);

  // Head Sphere
  const headGeo = new THREE.SphereGeometry(1.12, 48, 48);
  headGeo.scale(1.16, 0.97, 0.98);
  const headMesh = new THREE.Mesh(headGeo, blackFurMat);
  headGroup.add(headMesh);

  // Forehead Glowing Diamond Emblem + Tiger Brow Stripes (matching 8.jpg)
  const diamondGeo = new THREE.OctahedronGeometry(0.24, 0);
  diamondGeo.scale(0.75, 1.35, 0.22);
  const diamond = new THREE.Mesh(diamondGeo, neonPurpleMat);
  diamond.position.set(0, 0.44, 1.04);
  diamond.rotation.x = -0.28;
  headGroup.add(diamond);

  [-1, 1].forEach((side) => {
    const browGeo = new THREE.TorusGeometry(0.38, 0.045, 10, 24, Math.PI * 0.65);
    const brow = new THREE.Mesh(browGeo, neonPurpleMat);
    brow.position.set(side * 0.46, 0.36, 0.92);
    brow.rotation.set(-0.22, side * 0.35, side === -1 ? 0.38 : 0.72);
    headGroup.add(brow);

    const cheekStripe = new THREE.Mesh(
      new THREE.TorusGeometry(0.28, 0.032, 8, 18, Math.PI * 0.5),
      neonPurpleMat
    );
    cheekStripe.position.set(side * 0.82, -0.18, 0.72);
    cheekStripe.rotation.set(0, side * 0.6, side * -0.4);
    headGroup.add(cheekStripe);
  });

  // Cat Ears with Glowing Purple Inner Cones
  [-1, 1].forEach((side) => {
    const earGroup = new THREE.Group();
    earGroup.position.set(side * 0.78, 0.76, 0.02);
    earGroup.rotation.z = side * -0.44;

    const outerEar = new THREE.Mesh(new THREE.ConeGeometry(0.38, 0.74, 24), blackFurMat);
    earGroup.add(outerEar);

    const innerEar = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.54, 20), neonPurpleMat);
    innerEar.position.set(0, -0.04, 0.12);
    earGroup.add(innerEar);

    headGroup.add(earGroup);
    ears.push(earGroup);
  });

  // Two Long Thin Glowing Whisker-Feelers Flowing from Behind Ears (matching 8.jpg)
  [-1, 1].forEach((side, idx) => {
    const feelerGroup = new THREE.Group();
    feelerGroup.position.set(side * 0.85, 0.6, -0.1);

    const wCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(side * 0.55, -0.15, 0.08),
      new THREE.Vector3(side * 0.85, -0.68, 0.16),
      new THREE.Vector3(side * 0.65, -1.25, 0.24),
    ]);
    const wGeo = new THREE.TubeGeometry(wCurve, 24, 0.02, 10, false);
    feelerGroup.add(new THREE.Mesh(wGeo, neonPurpleMat));

    const tipDropGeo = new THREE.SphereGeometry(0.09, 16, 16);
    tipDropGeo.scale(0.75, 1.55, 0.75);
    const tipDrop = new THREE.Mesh(tipDropGeo, neonPurpleMat);
    tipDrop.position.set(side * 0.65, -1.28, 0.24);
    feelerGroup.add(tipDrop);

    headGroup.add(feelerGroup);
    antennae.push(feelerGroup);
    articulatedAntennae.push({
      root: feelerGroup,
      segments: [feelerGroup, tipDrop],
      baseRotX: 0,
      baseRotY: 0,
      baseRotZ: 0,
      phaseOffset: idx * 1.4,
    });
  });

  // Expressive Violet Panther Eyes
  const leftEyeBuilt = createExpressiveEye({
    irisOuterColor: 0x6d28d9,
    irisInnerColor: 0xc084fc,
    pupilColor: 0x090514,
    eyelidColor: 0x0f0e17,
    radius: 0.36,
    isLeft: true,
    slantedAnime: true,
  });
  leftEyeBuilt.eyeGroup.position.set(-0.48, -0.06, 0.94);
  leftEyeBuilt.eyeGroup.rotation.y = -0.22;
  headGroup.add(leftEyeBuilt.eyeGroup);

  const rightEyeBuilt = createExpressiveEye({
    irisOuterColor: 0x6d28d9,
    irisInnerColor: 0xc084fc,
    pupilColor: 0x090514,
    eyelidColor: 0x0f0e17,
    radius: 0.36,
    isLeft: false,
    slantedAnime: true,
  });
  rightEyeBuilt.eyeGroup.position.set(0.48, -0.06, 0.94);
  rightEyeBuilt.eyeGroup.rotation.y = 0.22;
  headGroup.add(rightEyeBuilt.eyeGroup);

  // Cute Cat Nose & Mouth
  const mouthGroup = new THREE.Group();
  mouthGroup.position.set(0, -0.28, 1.08);
  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.065, 0.06, 3), blackFurMat);
  nose.rotation.x = Math.PI;
  mouthGroup.add(nose);
  headGroup.add(mouthGroup);

  // Sleek Agile Cat Body + Glowing Paw Chest Medallion (matching 8.jpg)
  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.34, 0.56, 20, 28), blackFurMat);
  torso.position.set(0, -1.12, 0);
  bodyGroup.add(torso);

  const badgeRing = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.028, 12, 24), neonPurpleMat);
  badgeRing.position.set(0, -0.88, 0.33);
  bodyGroup.add(badgeRing);

  const badgeCore = new THREE.Mesh(
    new THREE.SphereGeometry(0.08, 16, 16),
    new THREE.MeshBasicMaterial({ color: 0xf3e8ff })
  );
  badgeCore.position.set(0, -0.88, 0.35);
  bodyGroup.add(badgeCore);

  // Arms & Legs with Purple Stripes
  [-1, 1].forEach((side) => {
    const arm = new THREE.Mesh(new THREE.CapsuleGeometry(0.095, 0.34, 12, 16), blackFurMat);
    arm.position.set(side * 0.38, -1.04, 0.08);
    arm.rotation.z = side * 0.42;
    bodyGroup.add(arm);

    const leg = new THREE.Mesh(new THREE.CapsuleGeometry(0.105, 0.36, 12, 16), blackFurMat);
    leg.position.set(side * 0.19, -1.58, 0.05);
    leg.rotation.z = side * 0.12;
    bodyGroup.add(leg);
  });

  // Articulated 5-Segment Striped Panther Tail
  const tailRoot = new THREE.Group();
  tailRoot.position.set(0, -1.46, -0.22);
  bodyGroup.add(tailRoot);

  const tailSegments: THREE.Object3D[] = [];
  let parentTail: THREE.Object3D = tailRoot;
  for (let s = 0; s < 5; s++) {
    const segGroup = new THREE.Group();
    segGroup.position.set(0, s === 0 ? 0 : -0.26, 0);
    segGroup.rotation.z = s < 2 ? -0.18 : 0.28;

    const segCyl = new THREE.Mesh(
      new THREE.CylinderGeometry(0.075, 0.07, 0.28, 14),
      s % 2 === 0 ? blackFurMat : neonPurpleMat
    );
    segCyl.position.y = -0.14;
    segGroup.add(segCyl);

    parentTail.add(segGroup);
    tailSegments.push(segGroup);
    parentTail = segGroup;
  }

  tails.push(tailRoot);
  articulatedTails.push({
    root: tailRoot,
    segments: tailSegments,
    baseRotX: 0.25,
    baseRotY: 0,
    baseRotZ: 0,
    phaseOffset: 0,
  });

  const particles = createSparkleField(0xa855f7, 48);
  root.add(particles);

  return {
    root,
    bodyGroup,
    headGroup,
    leftEyeGroup: leftEyeBuilt.eyeGroup,
    rightEyeGroup: rightEyeBuilt.eyeGroup,
    leftPupilGroup: leftEyeBuilt.pupilGroup,
    rightPupilGroup: rightEyeBuilt.pupilGroup,
    leftEyelid: leftEyeBuilt.eyelidMesh,
    rightEyelid: rightEyeBuilt.eyelidMesh,
    mouthGroup,
    wings,
    tentacles,
    antennae,
    tails,
    ears,
    articulatedTentacles,
    articulatedTails,
    articulatedAntennae,
    glowMaterials,
    particles,
  };
}

/**
 * 4. SPRITES — 3D Glossy Jelly Creature Trio (Image 9.jpg)
 */
function buildSprites3D(): Character3DParts {
  const root = new THREE.Group();
  const bodyGroup = new THREE.Group();
  const headGroup = new THREE.Group();
  root.add(bodyGroup);
  bodyGroup.add(headGroup);

  const glowMaterials: THREE.MeshStandardMaterial[] = [];
  const wings: THREE.Object3D[] = [];
  const tentacles: THREE.Object3D[] = [];
  const antennae: THREE.Object3D[] = [];
  const tails: THREE.Object3D[] = [];
  const ears: THREE.Object3D[] = [];

  const starMat = new THREE.MeshPhysicalMaterial({
    color: 0x2563eb,
    emissive: 0x1d4ed8,
    emissiveIntensity: 0.25,
    roughness: 0.14,
    clearcoat: 1.0,
  });
  glowMaterials.push(starMat);

  const coreMesh = new THREE.Mesh(new THREE.SphereGeometry(0.96, 40, 40), starMat);
  coreMesh.scale.set(1.08, 1.02, 0.88);
  headGroup.add(coreMesh);

  for (let i = 0; i < 5; i++) {
    const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
    const arm = new THREE.Mesh(new THREE.ConeGeometry(0.46, 0.72, 24), starMat);
    arm.position.set(Math.cos(angle) * 0.86, Math.sin(angle) * 0.86, 0);
    arm.rotation.z = angle - Math.PI / 2;
    headGroup.add(arm);
  }

  const leftEyeBuilt = createExpressiveEye({
    irisOuterColor: 0x1d4ed8,
    irisInnerColor: 0x60a5fa,
    pupilColor: 0x0f172a,
    eyelidColor: 0x2563eb,
    radius: 0.28,
    isLeft: true,
  });
  leftEyeBuilt.eyeGroup.position.set(-0.34, 0.18, 0.78);
  headGroup.add(leftEyeBuilt.eyeGroup);

  const rightEyeBuilt = createExpressiveEye({
    irisOuterColor: 0x1d4ed8,
    irisInnerColor: 0x60a5fa,
    pupilColor: 0x0f172a,
    eyelidColor: 0x2563eb,
    radius: 0.28,
    isLeft: false,
  });
  rightEyeBuilt.eyeGroup.position.set(0.34, 0.18, 0.78);
  headGroup.add(rightEyeBuilt.eyeGroup);

  const mouthGroup = new THREE.Group();
  mouthGroup.position.set(0, -0.26, 0.84);
  const mouthMesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.26, 20, 20),
    new THREE.MeshBasicMaterial({ color: 0x0f172a })
  );
  mouthMesh.scale.set(1.3, 0.85, 0.3);
  mouthGroup.add(mouthMesh);
  headGroup.add(mouthGroup);

  const particles = createSparkleField(0x60a5fa, 48);
  root.add(particles);

  return {
    root,
    bodyGroup,
    headGroup,
    leftEyeGroup: leftEyeBuilt.eyeGroup,
    rightEyeGroup: rightEyeBuilt.eyeGroup,
    leftPupilGroup: leftEyeBuilt.pupilGroup,
    rightPupilGroup: rightEyeBuilt.pupilGroup,
    leftEyelid: leftEyeBuilt.eyelidMesh,
    rightEyelid: rightEyeBuilt.eyelidMesh,
    mouthGroup,
    wings,
    tentacles,
    antennae,
    tails,
    ears,
    articulatedTentacles: [],
    articulatedTails: [],
    articulatedAntennae: [],
    glowMaterials,
    particles,
  };
}

export function buildCharacter3D(avatarId: AvatarId): Character3DParts {
  switch (avatarId) {
    case 'lumi':
      return buildLumi3D();
    case 'nova':
      return buildNova3D();
    case 'shadow':
      return buildShadow3D();
    case 'yobao':
    case 'bobo':
    case 'pico':
    default:
      return buildSprites3D();
  }
}
