import * as THREE from 'three';
import { AvatarId } from '../types/companion';

export interface Character3DParts {
  head?: THREE.Object3D;
  eyes?: THREE.Object3D[];
  pupils?: THREE.Object3D[];
  mouth?: THREE.Object3D;
  leftArm?: THREE.Object3D;
  rightArm?: THREE.Object3D;
  ears?: THREE.Object3D[];
  sprout?: THREE.Object3D;
  cheeks?: THREE.Object3D[];
  body?: THREE.Object3D;
  wings?: THREE.Object3D[];
  tails?: THREE.Object3D[];
  tentacles?: THREE.Object3D[];
  antennae?: THREE.Object3D[];
  bat?: THREE.Object3D;
  flowerProp?: THREE.Object3D;
}

export function createProcedural3DCharacter(avatarId: AvatarId): {
  group: THREE.Group;
  parts: Character3DParts;
} {
  const root = new THREE.Group();
  const parts: Character3DParts = {
    eyes: [],
    pupils: [],
    ears: [],
    cheeks: [],
    wings: [],
    tails: [],
    tentacles: [],
    antennae: [],
  };

  // Reusable PBR Materials
  const pureWhite = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    roughness: 0.22,
    metalness: 0.04,
  });

  const eyeGlossBlack = new THREE.MeshStandardMaterial({
    color: 0x050508,
    roughness: 0.05,
    metalness: 0.9,
  });
  const eyeWhite = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const cheekPink = new THREE.MeshStandardMaterial({
    color: 0xfb7185,
    roughness: 0.8,
    transparent: true,
    opacity: 0.65,
  });

  if (avatarId === 'lumi') {
    // =========================================================================
    // 1. LUMI - Bioluminescent Sea-Ray / Angel Fairy (Ref 6.jpg)
    // =========================================================================
    // Pearlescent baby body & rounded head
    const headGeo = new THREE.SphereGeometry(1.08, 32, 28);
    headGeo.scale(1.12, 1.05, 1.0);
    const headMesh = new THREE.Mesh(headGeo, pureWhite);
    headMesh.position.y = 1.45;
    headMesh.castShadow = true;
    root.add(headMesh);
    parts.head = headMesh;

    // Cute tiny torso
    const torsoGeo = new THREE.SphereGeometry(0.55, 24, 20);
    torsoGeo.scale(0.85, 1.25, 0.75);
    const torsoMesh = new THREE.Mesh(torsoGeo, pureWhite);
    torsoMesh.position.set(0, 0.65, -0.05);
    root.add(torsoMesh);
    parts.body = torsoMesh;

    // Two cute curved head antennae / horns (Ref 6.jpg)
    const hornGeo = new THREE.CylinderGeometry(0.09, 0.14, 0.52, 16);
    const hornL = new THREE.Mesh(hornGeo, pureWhite);
    hornL.position.set(-0.45, 2.45, -0.05);
    hornL.rotation.set(-0.15, 0, 0.25);

    const hornR = new THREE.Mesh(hornGeo, pureWhite);
    hornR.position.set(0.45, 2.45, -0.05);
    hornR.rotation.set(-0.15, 0, -0.25);
    root.add(hornL, hornR);

    // Glowing Aqua-Cyan Ray Wings with Iridescent Lavender Rim (Ref 6.jpg)
    const wingMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.45,
      roughness: 0.25,
      metalness: 0.1,
      transparent: true,
      opacity: 0.88,
    });
    const wingRimMat = new THREE.MeshBasicMaterial({
      color: 0xf472b6,
      transparent: true,
      opacity: 0.75,
    });

    // Left Wing
    const wingLGroup = new THREE.Group();
    wingLGroup.position.set(-0.75, 1.25, -0.15);
    const wingLGeo = new THREE.SphereGeometry(1.35, 24, 16);
    wingLGeo.scale(1.35, 0.18, 0.75);
    const wingL = new THREE.Mesh(wingLGeo, wingMat);
    wingL.rotation.set(0.1, 0.25, -0.42);
    const rimL = new THREE.Mesh(new THREE.TorusGeometry(1.2, 0.05, 8, 24, Math.PI * 0.7), wingRimMat);
    rimL.rotation.set(0, 0, 0.8);
    rimL.position.set(-0.6, 0.35, 0);
    wingLGroup.add(wingL, rimL);

    // Right Wing
    const wingRGroup = new THREE.Group();
    wingRGroup.position.set(0.75, 1.25, -0.15);
    const wingRGeo = new THREE.SphereGeometry(1.35, 24, 16);
    wingRGeo.scale(1.35, 0.18, 0.75);
    const wingR = new THREE.Mesh(wingRGeo, wingMat);
    wingR.rotation.set(0.1, -0.25, 0.42);
    const rimR = new THREE.Mesh(new THREE.TorusGeometry(1.2, 0.05, 8, 24, Math.PI * 0.7), wingRimMat);
    rimR.rotation.set(0, 0, -0.8);
    rimR.position.set(0.6, 0.35, 0);
    wingRGroup.add(wingR, rimR);

    root.add(wingLGroup, wingRGroup);
    parts.wings = [wingLGroup, wingRGroup];

    // Flowing Twin Ribbon Tails underneath (Ref 6.jpg)
    const tailMat = new THREE.MeshStandardMaterial({
      color: 0x7dd3fc,
      emissive: 0x0284c7,
      emissiveIntensity: 0.35,
      transparent: true,
      opacity: 0.78,
      roughness: 0.3,
    });
    const tailL = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.08, 1.4, 12), tailMat);
    tailL.position.set(-0.25, -0.2, -0.15);
    tailL.rotation.set(0.2, 0, 0.28);

    const tailR = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.08, 1.4, 12), tailMat);
    tailR.position.set(0.25, -0.2, -0.15);
    tailR.rotation.set(0.2, 0, -0.28);
    root.add(tailL, tailR);
    parts.tails = [tailL, tailR];

    // Tiny cute hands rested at chest
    const handGeo = new THREE.SphereGeometry(0.15, 12, 12);
    handGeo.scale(1.2, 0.8, 0.8);
    const handL = new THREE.Mesh(handGeo, pureWhite);
    handL.position.set(-0.2, 0.78, 0.42);
    const handR = new THREE.Mesh(handGeo, pureWhite);
    handR.position.set(0.2, 0.78, 0.42);
    root.add(handL, handR);
    parts.leftArm = handL;
    parts.rightArm = handR;

    // Huge Crystal Aqua-Blue Anime Eyes (Ref 6.jpg)
    const irisMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      emissive: 0x38bdf8,
      emissiveIntensity: 0.4,
      roughness: 0.1,
      metalness: 0.3,
    });
    const eyeGeo = new THREE.SphereGeometry(0.28, 20, 20);
    eyeGeo.scale(1.0, 1.25, 0.5);

    // Left Eye
    const eyeL = new THREE.Mesh(eyeGeo, irisMat);
    eyeL.position.set(-0.45, 1.42, 0.86);
    eyeL.rotation.set(0.05, 0.2, 0);
    const pupL = new THREE.Mesh(new THREE.SphereGeometry(0.14, 14, 14), eyeGlossBlack);
    pupL.position.set(-0.45, 1.44, 0.98);
    const catchL1 = new THREE.Mesh(new THREE.SphereGeometry(0.065, 8, 8), eyeWhite);
    catchL1.position.set(-0.4, 1.52, 1.02);
    const catchL2 = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 8), eyeWhite);
    catchL2.position.set(-0.48, 1.36, 1.02);

    // Right Eye
    const eyeR = new THREE.Mesh(eyeGeo, irisMat);
    eyeR.position.set(0.45, 1.42, 0.86);
    eyeR.rotation.set(0.05, -0.2, 0);
    const pupR = new THREE.Mesh(new THREE.SphereGeometry(0.14, 14, 14), eyeGlossBlack);
    pupR.position.set(0.45, 1.44, 0.98);
    const catchR1 = new THREE.Mesh(new THREE.SphereGeometry(0.065, 8, 8), eyeWhite);
    catchR1.position.set(0.4, 1.52, 1.02);
    const catchR2 = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 8), eyeWhite);
    catchR2.position.set(0.48, 1.36, 1.02);

    root.add(eyeL, pupL, catchL1, catchL2, eyeR, pupR, catchR1, catchR2);
    parts.eyes = [eyeL, eyeR];
    parts.pupils = [pupL, pupR];

    // Cheeks & Mouth
    const cheekL = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 8), cheekPink);
    cheekL.scale.set(1.2, 0.65, 0.3);
    cheekL.position.set(-0.62, 1.25, 0.82);
    const cheekR = cheekL.clone();
    cheekR.position.x = 0.62;
    root.add(cheekL, cheekR);
    parts.cheeks = [cheekL, cheekR];

    // Cute smiling mouth
    const mouth = new THREE.Mesh(
      new THREE.TorusGeometry(0.09, 0.022, 8, 16, Math.PI),
      eyeGlossBlack
    );
    mouth.rotation.set(Math.PI, 0, 0);
    mouth.position.set(0, 1.28, 0.98);
    root.add(mouth);
    parts.mouth = mouth;
  } else if (avatarId === 'nova') {
    // =========================================================================
    // 2. NOVA - Cosmic Octopus / Kwami (Ref 7.jpg)
    // =========================================================================
    const cosmicMat = new THREE.MeshStandardMaterial({
      color: 0x1e1b4b,
      roughness: 0.16,
      metalness: 0.35,
    });
    const glowVioletMat = new THREE.MeshStandardMaterial({
      color: 0xc084fc,
      emissive: 0xa855f7,
      emissiveIntensity: 0.9,
      roughness: 0.2,
    });
    const suckerMat = new THREE.MeshStandardMaterial({
      color: 0xe9d5ff,
      emissive: 0xc084fc,
      emissiveIntensity: 0.5,
      roughness: 0.3,
    });

    // Large spherical cosmic head
    const headGeo = new THREE.SphereGeometry(1.25, 32, 28);
    const headMesh = new THREE.Mesh(headGeo, cosmicMat);
    headMesh.position.y = 1.5;
    headMesh.castShadow = true;
    root.add(headMesh);
    parts.head = headMesh;
    parts.body = headMesh;

    // Luminous Spiral Galaxy Swirl on forehead (Ref 7.jpg)
    const swirlGeo = new THREE.TorusGeometry(0.24, 0.05, 10, 24, Math.PI * 1.8);
    const swirlMesh = new THREE.Mesh(swirlGeo, glowVioletMat);
    swirlMesh.position.set(0.2, 2.15, 0.95);
    swirlMesh.rotation.set(-0.35, 0.2, -0.6);
    root.add(swirlMesh);

    // Two Long Curved Antennae with Glowing Bulbs (Ref 7.jpg)
    const antCurveL = new THREE.CylinderGeometry(0.04, 0.04, 1.5, 12);
    const antL = new THREE.Mesh(antCurveL, cosmicMat);
    antL.position.set(-1.05, 1.85, 0.1);
    antL.rotation.set(0.2, 0, 0.55);
    const bulbL = new THREE.Mesh(new THREE.SphereGeometry(0.14, 14, 14), glowVioletMat);
    bulbL.position.set(-1.45, 1.15, 0.15);

    const antR = new THREE.Mesh(antCurveL, cosmicMat);
    antR.position.set(1.05, 1.85, 0.1);
    antR.rotation.set(0.2, 0, -0.55);
    const bulbR = new THREE.Mesh(new THREE.SphereGeometry(0.14, 14, 14), glowVioletMat);
    bulbR.position.set(1.45, 1.15, 0.15);

    root.add(antL, bulbL, antR, bulbR);
    parts.antennae = [antL, antR];

    // 8 Curled Cosmic Tentacles underneath with Suction Cups (Ref 7.jpg)
    const tentacleList: THREE.Object3D[] = [];
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const tentGroup = new THREE.Group();
      tentGroup.position.set(Math.cos(angle) * 0.45, 0.65, Math.sin(angle) * 0.45);

      const tentGeo = new THREE.CylinderGeometry(0.06, 0.14, 1.1, 10);
      const tentMesh = new THREE.Mesh(tentGeo, glowVioletMat);
      tentMesh.rotation.set(0.35 * Math.sin(angle), 0, 0.35 * Math.cos(angle));
      tentGroup.add(tentMesh);

      // Suction cups
      for (let s = 0; s < 3; s++) {
        const sucker = new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.02, 6, 12), suckerMat);
        sucker.position.set(0, -0.2 - s * 0.25, 0.09);
        sucker.rotation.x = Math.PI * 0.5;
        tentGroup.add(sucker);
      }

      root.add(tentGroup);
      tentacleList.push(tentGroup);
    }
    parts.tentacles = tentacleList;

    // Glowing Purple Anime Eyes with Eyelashes (Ref 7.jpg)
    const eyeGeo = new THREE.SphereGeometry(0.3, 20, 20);
    eyeGeo.scale(1.0, 1.25, 0.5);
    const eyeL = new THREE.Mesh(eyeGeo, glowVioletMat);
    eyeL.position.set(-0.48, 1.45, 1.05);
    eyeL.rotation.set(0.05, 0.22, 0);
    const pupL = new THREE.Mesh(new THREE.SphereGeometry(0.16, 14, 14), eyeGlossBlack);
    pupL.position.set(-0.48, 1.48, 1.18);
    const shineL = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 8), eyeWhite);
    shineL.position.set(-0.42, 1.58, 1.22);

    const eyeR = new THREE.Mesh(eyeGeo, glowVioletMat);
    eyeR.position.set(0.48, 1.45, 1.05);
    eyeR.rotation.set(0.05, -0.22, 0);
    const pupR = new THREE.Mesh(new THREE.SphereGeometry(0.16, 14, 14), eyeGlossBlack);
    pupR.position.set(0.48, 1.48, 1.18);
    const shineR = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 8), eyeWhite);
    shineR.position.set(0.42, 1.58, 1.22);

    root.add(eyeL, pupL, shineL, eyeR, pupR, shineR);
    parts.eyes = [eyeL, eyeR];
    parts.pupils = [pupL, pupR];

    // Subtle gentle smirk mouth
    const mouth = new THREE.Mesh(
      new THREE.TorusGeometry(0.08, 0.02, 8, 16, Math.PI),
      eyeGlossBlack
    );
    mouth.rotation.set(Math.PI, 0, 0);
    mouth.position.set(0, 1.25, 1.22);
    root.add(mouth);
    parts.mouth = mouth;
  } else if (avatarId === 'shadow') {
    // =========================================================================
    // 3. SHADOW - Neon Purple Shadow Cat / Panther (Ref 8.jpg)
    // =========================================================================
    const stealthBlack = new THREE.MeshStandardMaterial({
      color: 0x09090b,
      roughness: 0.65,
      metalness: 0.1,
    });
    const neonPurple = new THREE.MeshStandardMaterial({
      color: 0xa855f7,
      emissive: 0x9333ea,
      emissiveIntensity: 1.4,
      roughness: 0.2,
    });

    // Sleek black cat head
    const headGeo = new THREE.SphereGeometry(1.15, 32, 28);
    headGeo.scale(1.15, 1.02, 1.02);
    const headMesh = new THREE.Mesh(headGeo, stealthBlack);
    headMesh.position.y = 1.45;
    headMesh.castShadow = true;
    root.add(headMesh);
    parts.head = headMesh;

    // Cat Body
    const bodyGeo = new THREE.CylinderGeometry(0.55, 0.65, 1.05, 20);
    const bodyMesh = new THREE.Mesh(bodyGeo, stealthBlack);
    bodyMesh.position.set(0, 0.72, -0.05);
    root.add(bodyMesh);
    parts.body = bodyMesh;

    // Pointed Cat Ears with Neon Purple Inner Glow
    const earGeo = new THREE.ConeGeometry(0.35, 0.68, 12);
    const earL = new THREE.Mesh(earGeo, stealthBlack);
    earL.position.set(-0.72, 2.38, 0);
    earL.rotation.set(-0.2, 0, 0.45);
    const earLInner = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.52, 10), neonPurple);
    earLInner.position.set(-0.72, 2.38, 0.08);
    earLInner.rotation.set(-0.2, 0, 0.45);

    const earR = new THREE.Mesh(earGeo, stealthBlack);
    earR.position.set(0.72, 2.38, 0);
    earR.rotation.set(-0.2, 0, -0.45);
    const earRInner = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.52, 10), neonPurple);
    earRInner.position.set(0.72, 2.38, 0.08);
    earRInner.rotation.set(-0.2, 0, -0.45);

    root.add(earL, earLInner, earR, earRInner);
    parts.ears = [earL, earR];

    // Neon Purple Forehead Diamond & Tiger Markings (Ref 8.jpg)
    const diamond = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.28, 0.06), neonPurple);
    diamond.position.set(0, 2.05, 1.0);
    diamond.rotation.z = Math.PI * 0.25;

    const stripeL = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.04, 6, 16, Math.PI * 0.4), neonPurple);
    stripeL.position.set(-0.45, 1.95, 0.88);
    stripeL.rotation.set(0, 0, -0.5);

    const stripeR = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.04, 6, 16, Math.PI * 0.4), neonPurple);
    stripeR.position.set(0.45, 1.95, 0.88);
    stripeR.rotation.set(0, 0, 0.5);

    root.add(diamond, stripeL, stripeR);

    // Two Long Whisker Antennae with Glowing Bulb Tips (Ref 8.jpg)
    const whiskerGeo = new THREE.CylinderGeometry(0.025, 0.025, 1.6, 10);
    const whiskerL = new THREE.Mesh(whiskerGeo, neonPurple);
    whiskerL.position.set(-1.15, 1.65, -0.1);
    whiskerL.rotation.set(0.3, 0.2, 0.65);
    const wBulbL = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 12), neonPurple);
    wBulbL.position.set(-1.65, 0.95, 0.1);

    const whiskerR = new THREE.Mesh(whiskerGeo, neonPurple);
    whiskerR.position.set(1.15, 1.65, -0.1);
    whiskerR.rotation.set(0.3, -0.2, -0.65);
    const wBulbR = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 12), neonPurple);
    wBulbR.position.set(1.65, 0.95, 0.1);

    root.add(whiskerL, wBulbL, whiskerR, wBulbR);
    parts.antennae = [whiskerL, whiskerR];

    // Glowing Cat Paw Medallion on Chest (Ref 8.jpg)
    const medCollar = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.06, 16), stealthBlack);
    medCollar.rotateX(Math.PI * 0.5);
    medCollar.position.set(0, 0.88, 0.52);
    const pawGlow = new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 12), neonPurple);
    pawGlow.position.set(0, 0.88, 0.56);
    root.add(medCollar, pawGlow);

    // Luminous Feline Purple Eyes (Ref 8.jpg)
    const eyeGeo = new THREE.SphereGeometry(0.24, 20, 20);
    eyeGeo.scale(0.9, 1.2, 0.5);
    const eyeL = new THREE.Mesh(eyeGeo, neonPurple);
    eyeL.position.set(-0.44, 1.42, 0.95);
    const pupL = new THREE.Mesh(new THREE.SphereGeometry(0.13, 14, 14), eyeGlossBlack);
    pupL.position.set(-0.44, 1.44, 1.05);

    const eyeR = new THREE.Mesh(eyeGeo, neonPurple);
    eyeR.position.set(0.44, 1.42, 0.95);
    const pupR = new THREE.Mesh(new THREE.SphereGeometry(0.13, 14, 14), eyeGlossBlack);
    pupR.position.set(0.44, 1.44, 1.05);

    root.add(eyeL, pupL, eyeR, pupR);
    parts.eyes = [eyeL, eyeR];
    parts.pupils = [pupL, pupR];

    // Long Striped Cat Tail (Ref 8.jpg)
    const tailGroup = new THREE.Group();
    tailGroup.position.set(0, 0.35, -0.4);
    const tailStem = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.35, 12), stealthBlack);
    tailStem.rotation.set(-0.5, 0, 0.3);
    const tailTip = new THREE.Mesh(new THREE.SphereGeometry(0.1, 10, 10), neonPurple);
    tailTip.position.set(0.35, -0.6, -0.3);
    tailGroup.add(tailStem, tailTip);
    root.add(tailGroup);
    parts.tails = [tailGroup];
  } else {
    // Fallback for earlier legacy avatars
    const headGeo = new THREE.SphereGeometry(1.0, 24, 20);
    const headMesh = new THREE.Mesh(headGeo, pureWhite);
    headMesh.position.y = 1.1;
    root.add(headMesh);
    parts.head = headMesh;
  }

  // Soft Contact Ground Shadow Plane
  const shadowGeo = new THREE.PlaneGeometry(2.8, 2.8);
  const shadowMat = new THREE.MeshBasicMaterial({
    color: 0x000000,
    transparent: true,
    opacity: 0.28,
  });
  const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
  shadowMesh.rotation.x = -Math.PI * 0.5;
  shadowMesh.position.y = 0.01;
  root.add(shadowMesh);

  return { group: root, parts };
}
