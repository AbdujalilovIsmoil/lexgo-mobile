// The LexGo robot (ported from law-main/components/lexgo/robot) as a self-contained three.js scene.
// Bundled with esbuild into assets/robot/robot.html (scripts/robot/build.mjs) and shown in a WebView.
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const CAMERA = { fov: 28, position: [0, 0.2, 2.05], target: [0, 0.17, 0] };
const MODEL_SCALE = 0.7;
const REST_ROT_Y = -0.54;
const CLIPS = { wave: "wave_goodbye_01.001", swagger: "swagger.001", box: "box_02.001", complain: "complain_02.001", frustrated: "frustrated_01.001", sit: "sit.001", dive: "dive.001" };
const RANDOM = ["wave", "wave", "swagger"];
const post = (m) => window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify(m));

const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5)); // 1.5 keeps it crisp but ~45% cheaper than 2x on phones
renderer.setClearColor(0x000000, 0);
document.body.appendChild(renderer.domElement);
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(CAMERA.fov, 1, 0.1, 10);
camera.position.set(...CAMERA.position);
camera.lookAt(...CAMERA.target);
scene.add(new THREE.AmbientLight(0xffffff, 0.85 * Math.PI));
const key = new THREE.DirectionalLight(0xffffff, 1.1 * Math.PI); key.position.set(1.2, 2.4, 1.6); scene.add(key);
const rim = new THREE.DirectionalLight(0xffffff, 0.3 * Math.PI); rim.position.set(-1.4, 0.6, -0.8); scene.add(rim);

function resize() {
  const w = window.innerWidth, h = window.innerHeight;
  renderer.setSize(w, h);
  camera.aspect = w / h; camera.updateProjectionMatrix();
}
window.addEventListener("resize", resize); resize();

// ── side pods: whole shells that sit in a thin plate on both sides of the head are dropped ──
const POD_PAD = [0.055, 0.075, 0.075];
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const FIXED = [{ sign: 1, min: V(0.1, -0.07, -0.24), max: V(0.34, 0.35, 0.27) }, { sign: -1, min: V(-0.34, -0.07, -0.24), max: V(-0.1, 0.35, 0.27) }];
const isPod = (s) => s.count >= 40 && s.count <= 400 && Math.abs(s.center.x) >= 0.17 && s.size.x <= 0.08 && s.size.y >= 0.18 && s.size.z >= 0.25;
function removeEars(root, head) {
  root.updateWorldMatrix(true, true); head.updateWorldMatrix(true, false);
  const inv = head.matrixWorld.clone().invert();
  root.traverse((mesh) => {
    const g = mesh.geometry, index = g && g.index, pos = g && g.getAttribute("position");
    if (!mesh.isSkinnedMesh || !index || !pos) return;
    mesh.updateWorldMatrix(true, false); mesh.skeleton.update();
    const bind = new Array(pos.count), p = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) { p.fromBufferAttribute(pos, i); mesh.applyBoneTransform(i, p); p.applyMatrix4(mesh.matrixWorld).applyMatrix4(inv); bind[i] = p.clone(); }
    const par = new Int32Array(pos.count).map((_, i) => i);
    const find = (v) => { let r = v; while (par[r] !== r) r = par[r]; while (par[v] !== v) { const n = par[v]; par[v] = r; v = n; } return r; };
    for (let i = 0; i < index.count; i += 3) { const a = find(index.getX(i)), b = find(index.getX(i + 1)), c = find(index.getX(i + 2)); par[b] = a; par[find(c)] = find(a); }
    const shells = new Map();
    bind.forEach((q, i) => { const r = find(i); const s = shells.get(r); if (s) { s.count++; s.min.min(q); s.max.max(q); } else shells.set(r, { root: r, count: 1, min: q.clone(), max: q.clone(), center: V(0, 0, 0), size: V(0, 0, 0) }); });
    for (const s of shells.values()) { s.size.copy(s.max).sub(s.min); s.center.copy(s.min).add(s.max).multiplyScalar(0.5); }
    const pad = V(...POD_PAD);
    const zones = [...[...shells.values()].filter(isPod).map((s) => ({ sign: Math.sign(s.center.x), min: s.min.clone().sub(pad), max: s.max.clone().add(pad) })), ...FIXED];
    const doomed = new Set();
    for (const s of shells.values()) for (const z of zones) {
      if (Math.sign(s.center.x) === z.sign && s.min.x >= z.min.x && s.max.x <= z.max.x && s.min.y >= z.min.y && s.max.y <= z.max.y && s.min.z >= z.min.z && s.max.z <= z.max.z) { doomed.add(s.root); break; }
    }
    if (!doomed.size) return;
    const out = [];
    for (let i = 0; i < index.count; i += 3) { const a = index.getX(i); if (!doomed.has(find(a))) out.push(a, index.getX(i + 1), index.getX(i + 2)); }
    g.setIndex(new THREE.BufferAttribute(index.array instanceof Uint32Array ? new Uint32Array(out) : new Uint16Array(out), 1));
    g.computeBoundingBox(); g.computeBoundingSphere();
  });
}

// ── the LED face on the head bone: dark visor, two eyes, brows, mouth; blinks every few seconds ──
function makeFace(head) {
  const g = new THREE.Group(); g.position.set(0, 0.17, 0.23); g.renderOrder = 20; g.frustumCulled = false;
  const mat = (c, o) => new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: o, depthWrite: false });
  const add = (geo, m, x, y, z, ro) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.renderOrder = ro; g.add(o); return o; };
  add(new THREE.PlaneGeometry(0.2, 0.14), mat("#07111e", 0.92), 0, 0, 0, 20);
  const eyeGeo = new THREE.SphereGeometry(0.027, 16, 10);
  const eyes = [add(eyeGeo, mat("#73dcff", 0.98), -0.052, 0.028, 0.018, 21), add(eyeGeo, mat("#73dcff", 0.98), 0.052, 0.028, 0.018, 21)];
  const pupils = [-0.052, 0.052].map((x) => { const p = add(eyeGeo, mat("#73dcff", 0.88), x, 0.028, 0.024, 22); p.scale.set(0.44, 0.44, 0.2); return p; });
  [-0.052, 0.052].forEach((x) => { const b = add(new THREE.PlaneGeometry(0.047, 0.008), mat("#b8efff", 0.9), x, 0.073, 0.02, 21); b.scale.x = 0.86; });
  add(new THREE.PlaneGeometry(0.058, 0.008), mat("#a9efff", 0.94), 0, -0.051, 0.025, 22);
  head.add(g);
  let blink = 0, next = 3.1;
  return (dt) => {
    if (blink > 0) { blink = Math.min(1, blink + dt / 0.22); if (blink >= 1) { blink = 0; next = 3.5 + Math.random() * 4.5; } } else { next -= dt; if (next <= 0) blink = 0.001; }
    const k = Math.max(0.08, 1 - Math.sin(blink * Math.PI));
    eyes.forEach((e) => (e.scale.y = k)); pupils.forEach((p) => (p.scale.y = Math.max(0.15, k) * 1));
  };
}

let root, head, mixer, faceTick, current = null, paused = false, ready = false, lastGesture = 0, every = 30;
const clock = new THREE.Clock();

function play(name) {
  if (!ready) return;
  const clip = THREE.AnimationClip.findByName(mixer._clips, CLIPS[name] || name);
  if (!clip) return;
  const next = mixer.clipAction(clip).reset().setLoop(THREE.LoopOnce, 1);
  next.clampWhenFinished = true; next.fadeIn(0.2);
  if (current && current !== next) current.fadeOut(0.25);
  next.play(); current = next; lastGesture = clock.elapsedTime;
  const done = (e) => { if (e.action !== next) return; mixer.removeEventListener("finished", done); setTimeout(() => { next.fadeOut(0.3); if (current === next) current = null; lastGesture = clock.elapsedTime; post({ type: "done", name }); }, 400); };
  mixer.addEventListener("finished", done);
}

function load(base64) {
  try {
    const bin = atob(base64), buf = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
    new GLTFLoader().parse(buf.buffer, "", (gltf) => {
      root = new THREE.Group(); root.scale.setScalar(MODEL_SCALE); root.rotation.y = REST_ROT_Y; root.add(gltf.scene); scene.add(root);
      head = gltf.scene.getObjectByName("mixamorigHead");
      if (head) { removeEars(gltf.scene, head); faceTick = makeFace(head); }
      mixer = new THREE.AnimationMixer(gltf.scene); mixer._clips = gltf.animations;
      ready = true; post({ type: "ready" }); play("wave");
    }, (e) => post({ type: "error", message: String(e && e.message || e) }));
  } catch (e) { post({ type: "error", message: String(e && e.message || e) }); }
}

let acc = 0;
function frame() {
  requestAnimationFrame(frame);
  const dt = Math.min(clock.getDelta(), 0.1); acc += dt;
  if (paused || document.hidden || !ready || acc < 1 / 30) return;
  const step = acc; acc = 0; const t = clock.elapsedTime;
  mixer.update(step);
  if (!current) {
    root.position.y = Math.sin((t / 4.2) * Math.PI * 2) * 0.006;
    if (head) head.rotation.y += Math.sin(t * 0.55) * THREE.MathUtils.degToRad(3.5) * 0.02;
    if (t - lastGesture > every) play(RANDOM[Math.floor(Math.random() * RANDOM.length)]);
  }
  if (faceTick) faceTick(step);
  renderer.render(scene, camera);
}
frame();

window.__robot = { load, play, pause: (v) => { paused = !!v; }, rhythm: (sec) => { every = sec; } };
post({ type: "boot" });
