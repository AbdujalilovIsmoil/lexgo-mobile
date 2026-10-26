import { useEffect, useRef } from "react";
import { StyleSheet } from "react-native";
import { requireOptionalNativeModule } from "expo";
import type { ExpoWebGLRenderingContext } from "expo-gl";
import * as THREE from "three";
import Animated, { useAnimatedStyle, type SharedValue } from "react-native-reanimated";

type Props = { size: number; t: SharedValue<number>; calm?: boolean; paused?: boolean; playMs?: number }; // playMs: how long it turns after each wake

// expo-gl is a native module: a build made before it was added does not have it, and importing it up front would crash every screen that
// reaches this file. Ask the module registry first, load it on use, and draw no crystal when it is missing.
type GL = typeof import("expo-gl");
let gl3d: GL | null | undefined;
function loadGL(): GL | null {
  if (gl3d !== undefined) return gl3d;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    gl3d = requireOptionalNativeModule("ExpoGL") ? (require("expo-gl") as GL) : null;
  } catch {
    gl3d = null;
  }
  return gl3d;
}

const clamp = (v: number) => { "worklet"; return Math.min(1, Math.max(0, v)); };

// The three.js part of the AI mark: a lit 3D gem (a stretched bipyramid with a ring and orbiting points) turning in front of the neuron web. It is drawn on a transparent GL surface above the Skia canvas, appears with the core and fades with the
// mark. `t` is the mark's timeline. `calm` renders one still frame. After `playMs` of turning it stops asking for frames and the last one
// stays on screen, until it is paused and woken again.
export function AiCore3D({ size, t, calm = false, paused = false, playMs = Infinity }: Props) {
  const stop = useRef<(() => void) | null>(null);
  const wake = useRef<(() => void) | null>(null);
  const idle = useRef(paused); // while true no frame is asked for at all, and the GL context stays: coming back needs no new context or shaders
  useEffect(() => {
    idle.current = paused;
    if (!paused) wake.current?.();
  }, [paused]);
  useEffect(() => () => stop.current?.(), []);

  const style = useAnimatedStyle(() => {
    const p = clamp((t.value - 0.2) / 0.08) * (1 - clamp((t.value - 0.9) / 0.08));
    return { opacity: p, transform: [{ scale: 0.6 + 0.4 * p }] };
  });

  const onContext = (gl: ExpoWebGLRenderingContext) => {
    const w = gl.drawingBufferWidth, h = gl.drawingBufferHeight;
    const canvas = { width: w, height: h, clientWidth: w, clientHeight: h, style: {}, addEventListener() {}, removeEventListener() {}, getContext: () => gl } as unknown as HTMLCanvasElement;
    (gl as unknown as { canvas: unknown }).canvas = canvas;
    // expo-gl's context is WebGL2, but its class also passes three's `instanceof WebGLRenderingContext` test (which rejects WebGL 1):
    // hide that global while the renderer is made.
    const g = globalThis as { WebGLRenderingContext?: unknown };
    const webgl1 = g.WebGLRenderingContext;
    g.WebGLRenderingContext = undefined;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, context: gl as unknown as WebGL2RenderingContext, alpha: true, antialias: true });
    } finally {
      g.WebGLRenderingContext = webgl1;
    }
    renderer.setPixelRatio(1);
    renderer.setSize(w, h, false);
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 12);
    camera.position.z = 5;
    // a lit 3D gem — a stretched bipyramid with flat facets that flash as it turns — with a ring tilted around it and a few points
    // orbiting: the neuron mark's spark, now in space.
    const spark = new THREE.Group();
    const geo = new THREE.OctahedronGeometry(1, 0);
    geo.scale(0.8, 1.25, 0.8);
    spark.add(new THREE.Mesh(geo, new THREE.MeshPhongMaterial({ color: 0xd6f2ff, emissive: 0x1b63d8, specular: 0xffffff, shininess: 110, flatShading: true, transparent: true, opacity: 0.93 })));
    spark.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo), new THREE.LineBasicMaterial({ color: 0xffffff })));
    const ring = new THREE.Mesh(new THREE.TorusGeometry(1.3, 0.022, 8, 80), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    const bead = new THREE.SphereGeometry(0.075, 12, 12);
    const beadMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const dots = new THREE.Group();
    for (let i = 0; i < 8; i++) {
      const m = new THREE.Mesh(bead, beadMat);
      m.position.set(Math.cos((i / 8) * Math.PI * 2) * 1.3, 0, Math.sin((i / 8) * Math.PI * 2) * 1.3);
      dots.add(m);
    }
    const orbit = new THREE.Group();
    orbit.add(ring, dots);
    scene.add(spark, orbit, new THREE.AmbientLight(0x7fbfff, 0.9));
    const sun = new THREE.DirectionalLight(0xffffff, 2.2);
    sun.position.set(2.5, 3, 4);
    scene.add(sun);

    const draw = (time: number) => {
      spark.rotation.set(0.28, time * 0.0017, 0);
      orbit.rotation.set(1.15, 0.35, time * 0.0011);
      dots.rotation.y = time * 0.0022;
      renderer.render(scene, camera);
      gl.endFrameEXP();
    };
    if (calm) { draw(900); return; }
    let raf = 0, last = 0, from = 0, alive = true;
    // The loop runs on the JS thread: paused or played out, it stops asking for frames (no wake-up 60–120 times a second), and `wake`
    // starts it again.
    const loop = (time: number) => {
      raf = 0;
      if (!alive || idle.current) return;
      from ||= time;
      if (time - from > playMs) return;
      raf = requestAnimationFrame(loop);
      if (time - last < 33) return; // ~30 fps is plenty for a 24 pt crystal
      last = time;
      draw(time);
    };
    wake.current = () => { if (alive && !raf) { from = 0; raf = requestAnimationFrame(loop); } };
    if (!idle.current) raf = requestAnimationFrame(loop);
    stop.current = () => { alive = false; if (raf) cancelAnimationFrame(raf); renderer.dispose(); geo.dispose(); ring.geometry.dispose(); bead.dispose(); };
  };

  const GL = loadGL();
  if (!GL) return null;
  return (
    <Animated.View pointerEvents="none" style={[s.wrap, { width: size, height: size, left: "50%", top: "50%", marginLeft: -size / 2, marginTop: -size / 2 }, style]}>
      <GL.GLView style={{ width: size, height: size }} onContextCreate={onContext} msaaSamples={2} />
    </Animated.View>
  );
}

const s = StyleSheet.create({ wrap: { position: "absolute" } });
