import { useEffect, useRef } from "react";
import type { Act } from "@/lib/alpen/mascot";

type Gaze = { x: number; y: number };

export function MascotView({ act, gaze, preview = false }: { act: Act; gaze: Gaze; preview?: boolean }) {
  const host = useRef<HTMLDivElement>(null);
  const actRef = useRef(act);
  const gazeRef = useRef(gaze);
  actRef.current = act;
  gazeRef.current = gaze;

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    let stop = false;
    let dispose = () => {};
    void import("three").then((THREE) => {
      if (stop || !host.current) return;
      dispose = mount(THREE, host.current, actRef, gazeRef, preview);
    });
    return () => {
      stop = true;
      dispose();
    };
  }, [preview]);

  return <div ref={host} className="mascot-webgl" />;
}

function mount(
  THREE: typeof import("three"),
  el: HTMLDivElement,
  actRef: { current: Act },
  gazeRef: { current: Gaze },
  preview: boolean,
) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.setSize(el.clientWidth || 180, el.clientHeight || 230);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  el.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 30);
  camera.position.set(0, 0.7, 4.15);
  const lookTarget = new THREE.Vector3(0, 0.42, 0);

  scene.add(new THREE.AmbientLight(0xfff6f4, 0.85));
  const key = new THREE.DirectionalLight(0xfffaf8, 1.8);
  key.position.set(1.2, 2.2, 2.4);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xe7d2d4, 0.45);
  fill.position.set(-1.4, 0.8, 1.2);
  scene.add(fill);

  const fur = new THREE.MeshStandardMaterial({ color: 0xf0cbb8, roughness: 0.62, metalness: 0 });
  const paw = new THREE.MeshStandardMaterial({ color: 0xd9a88f, roughness: 0.7, metalness: 0 });
  const red = new THREE.MeshStandardMaterial({ color: 0xe1062c, roughness: 0.42, metalness: 0.04 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x1a0c10, roughness: 0.4 });
  const wood = new THREE.MeshStandardMaterial({ color: 0x2a1218, roughness: 0.72 });
  const blushMat = new THREE.MeshStandardMaterial({ color: 0xe36b78, roughness: 0.55 });
  const lidMat = new THREE.MeshStandardMaterial({ color: 0xf0cbb8, roughness: 0.6 });
  const mouthMat = new THREE.MeshStandardMaterial({ color: 0x6a0d22, roughness: 0.45 });
  const tongueMat = new THREE.MeshStandardMaterial({ color: 0xe1062c, roughness: 0.35 });
  const bin: { dispose: () => void }[] = [fur, paw, red, dark, wood, blushMat, lidMat, mouthMat, tongueMat];

  const bed = buildBed(THREE, fur, red, wood, bin);
  bed.position.y = -0.85;
  const chair = buildChair(THREE, wood, red, bin);
  chair.position.set(-2.2, -0.2, 0);
  const world = new THREE.Group();
  world.scale.setScalar(0.78);
  scene.add(world);
  world.add(bed, chair);

  const rig = new THREE.Group();
  world.add(rig);
  const pelvis = new THREE.Group();
  rig.add(pelvis);

  const belly = mesh(THREE, new THREE.SphereGeometry(0.2, 24, 18), fur, bin);
  belly.scale.set(1, 1.05, 0.86);
  belly.position.y = 0.28;
  pelvis.add(belly);

  const head = new THREE.Group();
  head.position.set(0, 0.58, 0.02);
  pelvis.add(head);
  const skull = mesh(THREE, new THREE.SphereGeometry(0.29, 28, 22), fur, bin);
  head.add(skull);

  const earL = ear(THREE, fur, red, bin, -1);
  const earR = ear(THREE, fur, red, bin, 1);
  head.add(earL, earR);

  const eyeL = eye(THREE, dark, lidMat, bin, -0.09);
  const eyeR = eye(THREE, dark, lidMat, bin, 0.09);
  head.add(eyeL.group, eyeR.group);

  const nose = mesh(THREE, new THREE.SphereGeometry(0.034, 12, 10), red, bin);
  nose.position.set(0, -0.02, 0.28);
  nose.scale.set(1.15, 0.72, 0.65);
  head.add(nose);

  const muzzle = mesh(THREE, new THREE.SphereGeometry(0.11, 16, 12), paw, bin);
  muzzle.position.set(0, -0.05, 0.2);
  muzzle.scale.set(1.15, 0.72, 0.62);
  head.add(muzzle);

  const smile = mesh(THREE, new THREE.TorusGeometry(0.06, 0.012, 8, 18, Math.PI), dark, bin);
  smile.position.set(0, -0.09, 0.27);
  smile.rotation.x = 0.2;
  smile.rotation.z = Math.PI;
  head.add(smile);

  const mouth = mesh(THREE, new THREE.SphereGeometry(0.055, 16, 12), mouthMat, bin);
  mouth.position.set(0, -0.105, 0.23);
  mouth.scale.set(1.2, 0.2, 0.7);
  const tongue = mesh(THREE, new THREE.SphereGeometry(0.028, 10, 8), tongueMat, bin);
  tongue.position.set(0, -0.01, 0.02);
  mouth.add(tongue);
  head.add(mouth);

  const blushL = mesh(THREE, new THREE.SphereGeometry(0.04, 10, 8), blushMat, bin);
  blushL.position.set(-0.15, -0.03, 0.22);
  blushL.scale.z = 0.35;
  const blushR = blushL.clone();
  blushR.position.x = 0.15;
  head.add(blushL, blushR);

  const scarfWrap = mesh(THREE, new THREE.TorusGeometry(0.15, 0.04, 8, 18), red, bin);
  scarfWrap.position.y = 0.46;
  scarfWrap.rotation.x = Math.PI / 2.2;
  pelvis.add(scarfWrap);
  const scarfTail = new THREE.Group();
  scarfTail.position.set(0.12, 0.4, 0.08);
  pelvis.add(scarfTail);
  for (let i = 0; i < 4; i += 1) {
    const bit = mesh(THREE, new THREE.BoxGeometry(0.07, 0.055, 0.1), red, bin);
    bit.position.y = -i * 0.055;
    scarfTail.add(bit);
  }

  const armL = limb(THREE, fur, paw, bin, -1);
  const armR = limb(THREE, fur, paw, bin, 1);
  pelvis.add(armL.shoulder, armR.shoulder);
  const legL = leg(THREE, fur, paw, bin, -1);
  const legR = leg(THREE, fur, paw, bin, 1);
  pelvis.add(legL.pivot, legR.pivot);

  const zTex = zTexture(THREE);
  bin.push(zTex);
  const zs: { sprite: import("three").Sprite; life: number; vy: number; vx: number }[] = [];
  let nextZ = 0.4;
  const mouthWorld = new THREE.Vector3();

  let yaw = 0.15;
  let drag = false;
  let lastX = 0;
  const onDown = (event: PointerEvent) => {
    if (!preview) return;
    drag = true;
    lastX = event.clientX;
  };
  const onMove = (event: PointerEvent) => {
    if (!drag) return;
    yaw += (event.clientX - lastX) * 0.01;
    lastX = event.clientX;
  };
  const onUp = () => {
    drag = false;
  };
  renderer.domElement.addEventListener("pointerdown", onDown);
  window.addEventListener("pointermove", onMove);
  window.addEventListener("pointerup", onUp);

  const clock = new THREE.Clock();
  let blink = 0;
  let blinkAt = 2.2;
  let frame = 0;

  const tick = () => {
    frame = requestAnimationFrame(tick);
    const delta = Math.min(0.05, clock.getDelta());
    const t = clock.elapsedTime;
    const act = actRef.current;
    const gaze = gazeRef.current;
    if (t > blinkAt) {
      blink = 1;
      blinkAt = t + 2.6 + Math.random() * 3.2;
    }
    blink = Math.max(0, blink - delta * 6.5);

    const asleep = act === "sleep";
    const tired = act === "wake" || act === "yawn";
    const inBed = asleep || act === "wake";
    const pose = poseFor(act, t);
    const eyesShut = asleep ? 1 : act === "pet" ? 1 : tired ? 0.72 : blink;
    const k = Math.min(1, delta * (inBed || act === "walk" ? 1.8 : 4.2));
    const lookX = asleep ? 0 : gaze.x;
    const lookY = asleep ? 0 : gaze.y;

    damp(pelvis.position, "y", pose.rootY + Math.sin(t * 1.6) * (act === "sleep" ? 0.006 : 0.012), delta, k);
    damp(pelvis.position, "x", pose.rootX, delta, k);
    dampRot(pelvis.rotation, pose.hipX, yaw + pose.face, pose.hipZ, k);
    dampRot(head.rotation, pose.headX - lookY * 0.55, pose.headY + lookX * 0.95, pose.headZ, k);
    dampRot(earL.rotation, pose.ear, 0, 0.22, k);
    dampRot(earR.rotation, pose.ear, 0, -0.22, k);
    dampRot(armL.shoulder.rotation, pose.armLX, 0, pose.armLZ, k);
    dampRot(armR.shoulder.rotation, pose.armRX, 0, pose.armRZ, k);
    dampRot(armL.elbow.rotation, pose.elbowL, 0, 0, k);
    const wave = act === "wave" ? Math.sin(t * 8) * 0.95 : 0;
    dampRot(armR.elbow.rotation, pose.elbowR, 0, wave, k);
    dampRot(legL.pivot.rotation, pose.thigh, 0, 0.08, k);
    dampRot(legR.pivot.rotation, pose.thigh, 0, -0.08, k);
    dampRot(legL.knee.rotation, pose.shin, 0, 0, k);
    dampRot(legR.knee.rotation, pose.shin, 0, 0, k);
    const open = Math.max(0.05, pose.mouth);
    mouth.scale.set(1.25, 0.16 + open * 2.4, 0.75);
    tongue.visible = open > 0.28;
    smile.visible = open < 0.28;
    const pupilX = asleep ? 0 : gaze.x * 0.045;
    const pupilY = asleep ? 0 : gaze.y * 0.03;
    eyeL.pupil.position.x = -0.09 + pupilX;
    eyeR.pupil.position.x = 0.09 + pupilX;
    eyeL.pupil.position.y = 0.04 + pupilY;
    eyeR.pupil.position.y = 0.04 + pupilY;
    eyeL.lid.scale.y = 0.05 + eyesShut * 1.2;
    eyeR.lid.scale.y = 0.05 + eyesShut * 1.2;
    scarfTail.rotation.z = 0.15 + Math.sin(t * 1.5) * (act === "scarf" ? 0.35 : 0.07);
    damp(bed.position, "y", inBed ? 0 : -0.15, delta, k);
    damp(bed.position, "x", inBed ? 0 : 2.4, delta, k);
    const seated = act === "sit" || act === "bored";
    damp(chair.position, "y", seated ? 0 : -0.25, delta, k);
    damp(chair.position, "x", seated ? 0 : -2.3, delta, k);

    if (act === "sleep" && t > nextZ) {
      nextZ = t + 0.48;
      mouth.getWorldPosition(mouthWorld);
      const mat = new THREE.SpriteMaterial({ map: zTex, transparent: true, depthWrite: false });
      const sprite = new THREE.Sprite(mat);
      sprite.position.copy(mouthWorld);
      sprite.position.z += 0.08;
      sprite.scale.setScalar(0.07 + Math.random() * 0.04);
      scene.add(sprite);
      zs.push({ sprite, life: 1.7, vy: 0.28 + Math.random() * 0.1, vx: (Math.random() - 0.3) * 0.08 });
    }
    for (let i = zs.length - 1; i >= 0; i -= 1) {
      const item = zs[i];
      if (!item) continue;
      item.life -= delta;
      item.sprite.position.y += item.vy * delta;
      item.sprite.position.x += item.vx * delta;
      item.sprite.material.opacity = Math.max(0, item.life / 1.7);
      item.sprite.scale.setScalar(0.08 + (1.7 - item.life) * 0.06);
      if (item.life <= 0) {
        scene.remove(item.sprite);
        item.sprite.material.dispose();
        zs.splice(i, 1);
      }
    }

    lookTarget.y += ((inBed ? 0.32 : 0.48) - lookTarget.y) * k;
    camera.lookAt(lookTarget);
    rig.position.y = act === "hop" ? Math.abs(Math.sin(t * 8)) * 0.05 : 0;
    renderer.render(scene, camera);
  };
  tick();

  const resize = () => {
    const w = el.clientWidth || 180;
    const h = el.clientHeight || 230;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  };
  resize();
  const observer = new ResizeObserver(resize);
  observer.observe(el);

  return () => {
    cancelAnimationFrame(frame);
    observer.disconnect();
    renderer.domElement.removeEventListener("pointerdown", onDown);
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointerup", onUp);
    zs.forEach((item) => item.sprite.material.dispose());
    bin.forEach((item) => item.dispose());
    renderer.dispose();
    if (renderer.domElement.parentElement === el) el.removeChild(renderer.domElement);
  };
}

function poseFor(act: Act, t: number) {
  const base = {
    rootX: 0,
    rootY: 0.42,
    hipX: 0,
    hipZ: 0,
    headX: Math.sin(t * 0.55) * 0.05,
    headY: Math.sin(t * 0.33) * 0.1,
    headZ: 0,
    face: 0,
    ear: Math.sin(t * 0.7) * 0.05,
    armLX: 0.15,
    armLZ: 0.55,
    armRX: 0.15,
    armRZ: -0.55,
    elbowL: 0.35,
    elbowR: 0.35,
    thigh: 0.04,
    shin: -0.05,
    mouth: 0.08,
  };
  if (act === "sit" || act === "bored") {
    return { ...base, rootY: 0.34, hipX: -0.18, thigh: -1.45, shin: 1.55, armLX: 0.55, armRX: 0.55, armLZ: 0.2, armRZ: -0.2, elbowL: 0.9, elbowR: 0.9 };
  }
  if (act === "sleep") {
    return {
      ...base,
      rootX: 0.18,
      rootY: 0.4,
      hipZ: 1.15,
      hipX: 0.05,
      headX: 0.12,
      headY: 0,
      thigh: -0.4,
      shin: 0.7,
      armLX: 0.3,
      armRX: 0.22,
      armLZ: 0.15,
      armRZ: -0.12,
      elbowL: 0.55,
      elbowR: 0.5,
      mouth: 0.16,
      ear: 0.02,
    };
  }
  if (act === "wake") {
    return {
      ...base,
      rootX: 0.05,
      rootY: 0.36,
      hipZ: 0.55,
      hipX: -0.45,
      headX: 0.42,
      thigh: -1.05,
      shin: 1.2,
      armLX: 0.4,
      armRX: -0.6,
      armLZ: 0.2,
      armRZ: -0.35,
      elbowL: 0.9,
      elbowR: 0.5,
      mouth: 1.15,
      ear: 0.08,
    };
  }
  if (act === "walk") {
    const step = Math.sin(t * 7);
    const dir = Math.sin(t * 1.15);
    return {
      ...base,
      rootX: dir * 0.55,
      face: dir > 0 ? -0.45 : 0.45,
      thigh: step * 0.65,
      shin: Math.max(0, -step) * 0.4,
      headX: 0.08,
      armLX: step * 0.35,
      armRX: -step * 0.35,
    };
  }
  if (act === "yawn") {
    return { ...base, mouth: 1.2, headX: 0.35, armLX: -0.2, armRX: -0.2, armLZ: 1.05, armRZ: -1.05, ear: 0.12 };
  }
  if (act === "stretch") {
    return { ...base, armLX: -0.55, armRX: -0.55, armLZ: 1.45, armRZ: -1.45, elbowL: 0.1, elbowR: 0.1, headX: -0.28 };
  }
  if (act === "wave") {
    return { ...base, armRX: -2.45, armRZ: -0.25, elbowR: 0.15, headY: 0.22, headZ: -0.06 };
  }
  if (act === "scratch") {
    return { ...base, armRX: -2.1, armRZ: -0.55, elbowR: 1.1, headZ: 0.16 };
  }
  if (act === "look") return { ...base, headY: Math.sin(t * 1.3) * 0.5 };
  if (act === "up") return { ...base, headX: -0.38 };
  if (act === "pet") return { ...base, headZ: 0.2, headX: 0.08, mouth: 0.05 };
  if (act === "surprise") return { ...base, headX: -0.12, ear: -0.2, mouth: 0.45, armLZ: 0.95, armRZ: -0.95 };
  if (act === "stumble") return { ...base, hipZ: Math.sin(t * 9) * 0.16 };
  if (act === "scarf") return { ...base, armRX: -0.7, headY: -0.2 };
  return base;
}

function buildBed(
  THREE: typeof import("three"),
  cream: import("three").Material,
  red: import("three").Material,
  wood: import("three").Material,
  bin: { dispose: () => void }[],
) {
  const bed = new THREE.Group();
  const frame = mesh(THREE, new THREE.BoxGeometry(1.15, 0.08, 0.58), wood, bin);
  frame.position.y = 0.1;
  const mattress = mesh(THREE, new THREE.BoxGeometry(1.02, 0.1, 0.48), cream, bin);
  mattress.position.y = 0.18;
  const pillow = mesh(THREE, new THREE.BoxGeometry(0.26, 0.08, 0.28), cream, bin);
  pillow.position.set(-0.32, 0.28, 0);
  const blanket = mesh(THREE, new THREE.BoxGeometry(0.55, 0.045, 0.46), red, bin);
  blanket.position.set(0.18, 0.25, 0);
  bed.add(frame, mattress, pillow, blanket);
  for (const x of [-0.48, 0.48]) {
    for (const z of [-0.22, 0.22]) {
      const foot = mesh(THREE, new THREE.BoxGeometry(0.06, 0.1, 0.06), wood, bin);
      foot.position.set(x, 0.04, z);
      bed.add(foot);
    }
  }
  return bed;
}

function buildChair(
  THREE: typeof import("three"),
  wood: import("three").Material,
  red: import("three").Material,
  bin: { dispose: () => void }[],
) {
  const chair = new THREE.Group();
  const seat = mesh(THREE, new THREE.BoxGeometry(0.46, 0.06, 0.42), wood, bin);
  seat.position.y = 0.28;
  const cushion = mesh(THREE, new THREE.BoxGeometry(0.4, 0.04, 0.36), red, bin);
  cushion.position.y = 0.33;
  const back = mesh(THREE, new THREE.BoxGeometry(0.46, 0.42, 0.06), wood, bin);
  back.position.set(0, 0.52, -0.18);
  chair.add(seat, cushion, back);
  for (const x of [-0.18, 0.18]) {
    for (const z of [-0.14, 0.14]) {
      const foot = mesh(THREE, new THREE.BoxGeometry(0.05, 0.28, 0.05), wood, bin);
      foot.position.set(x, 0.14, z);
      chair.add(foot);
    }
  }
  return chair;
}

function mesh(
  THREE: typeof import("three"),
  geometry: import("three").BufferGeometry,
  material: import("three").Material,
  bin: { dispose: () => void }[],
) {
  bin.push(geometry);
  return new THREE.Mesh(geometry, material);
}

function ear(THREE: typeof import("three"), fur: import("three").Material, red: import("three").Material, bin: { dispose: () => void }[], side: number) {
  const group = new THREE.Group();
  const outer = mesh(THREE, new THREE.CapsuleGeometry(0.05, 0.28, 6, 12), fur, bin);
  outer.position.y = 0.2;
  const inner = mesh(THREE, new THREE.CapsuleGeometry(0.024, 0.16, 4, 8), red, bin);
  inner.position.set(0, 0.18, 0.02);
  group.add(outer, inner);
  group.position.set(0.1 * side, 0.18, 0);
  group.rotation.z = -0.16 * side;
  return group;
}

function eye(THREE: typeof import("three"), dark: import("three").Material, lidMat: import("three").Material, bin: { dispose: () => void }[], x: number) {
  const group = new THREE.Group();
  const scleraMat = new THREE.MeshStandardMaterial({ color: 0xfff7f4, roughness: 0.22 });
  const irisMat = new THREE.MeshStandardMaterial({ color: 0xe1062c, roughness: 0.3 });
  const shineMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  bin.push(scleraMat, irisMat, shineMat);
  const ball = mesh(THREE, new THREE.SphereGeometry(0.072, 18, 14), scleraMat, bin);
  ball.position.set(x, 0.045, 0.22);
  const iris = mesh(THREE, new THREE.SphereGeometry(0.04, 14, 12), irisMat, bin);
  iris.position.set(x, 0.045, 0.265);
  const pupil = mesh(THREE, new THREE.SphereGeometry(0.022, 12, 10), dark, bin);
  pupil.position.set(x, 0.045, 0.292);
  const shine = mesh(THREE, new THREE.SphereGeometry(0.012, 8, 8), shineMat, bin);
  shine.position.set(x + 0.016, 0.062, 0.31);
  const lid = mesh(THREE, new THREE.SphereGeometry(0.078, 14, 10), lidMat, bin);
  lid.position.set(x, 0.07, 0.24);
  lid.scale.y = 0.05;
  group.add(ball, iris, pupil, shine, lid);
  return { group, pupil, lid };
}

function limb(THREE: typeof import("three"), fur: import("three").Material, paw: import("three").Material, bin: { dispose: () => void }[], side: number) {
  const shoulder = new THREE.Group();
  shoulder.position.set(0.2 * side, 0.36, 0);
  const upper = mesh(THREE, new THREE.CapsuleGeometry(0.04, 0.1, 5, 8), fur, bin);
  upper.position.y = -0.09;
  const elbow = new THREE.Group();
  elbow.position.y = -0.18;
  const fore = mesh(THREE, new THREE.CapsuleGeometry(0.034, 0.08, 5, 8), fur, bin);
  fore.position.y = -0.07;
  const pawMesh = mesh(THREE, new THREE.SphereGeometry(0.048, 12, 10), paw, bin);
  pawMesh.position.y = -0.15;
  elbow.add(fore, pawMesh);
  shoulder.add(upper, elbow);
  return { shoulder, elbow };
}

function leg(THREE: typeof import("three"), fur: import("three").Material, paw: import("three").Material, bin: { dispose: () => void }[], side: number) {
  const pivot = new THREE.Group();
  pivot.position.set(0.08 * side, 0.08, 0);
  const thigh = mesh(THREE, new THREE.CapsuleGeometry(0.05, 0.08, 5, 8), fur, bin);
  thigh.position.y = -0.08;
  const knee = new THREE.Group();
  knee.position.y = -0.16;
  const shin = mesh(THREE, new THREE.CapsuleGeometry(0.04, 0.07, 5, 8), fur, bin);
  shin.position.y = -0.07;
  const foot = mesh(THREE, new THREE.SphereGeometry(0.06, 12, 10), paw, bin);
  foot.scale.set(1.1, 0.5, 1.35);
  foot.position.set(0, -0.14, 0.03);
  knee.add(shin, foot);
  pivot.add(thigh, knee);
  return { pivot, knee };
}

function zTexture(THREE: typeof import("three")) {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.clearRect(0, 0, 64, 64);
    ctx.fillStyle = "#fff6f6";
    ctx.font = "700 46px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("z", 32, 34);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function damp(target: import("three").Vector3, key: "x" | "y", value: number, _dt: number, k: number) {
  target[key] += (value - target[key]) * k;
}

function dampRot(rot: import("three").Euler, x: number, y: number, z: number, k: number) {
  rot.x += (x - rot.x) * k;
  rot.y += (y - rot.y) * k;
  rot.z += (z - rot.z) * k;
}
