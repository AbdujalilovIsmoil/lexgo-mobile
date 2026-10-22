import { useEffect, useRef } from "react";
import { PixelRatio, StyleSheet } from "react-native";
import { GLView, type ExpoWebGLRenderingContext } from "expo-gl";
import * as THREE from "three";
import Animated, { useAnimatedStyle, type SharedValue } from "react-native-reanimated";

type Props = { size: number; t: SharedValue<number>; calm?: boolean };

const clamp = (v: number) => { "worklet"; return Math.min(1, Math.max(0, v)); };

// The three.js part of the AI mark: a small glass crystal (an icosahedron — white edges over faint additive faces) turning slowly in the
// core of the neuron spark. It is drawn on a transparent GL surface above the Skia canvas, appears with the core and fades with the
// mark. `t` is the mark's timeline. `calm` renders one still frame.
export function AiCore3D({ size, t, calm = false }: Props) {
  const stop = useRef<(() => void) | null>(null);
  useEffect(() => () => stop.current?.(), []);

  const style = useAnimatedStyle(() => {
    const p = clamp((t.value - 0.26) / 0.06) * (1 - clamp((t.value - 0.9) / 0.08));
    return { opacity: p, transform: [{ scale: 0.6 + 0.4 * p }] };
  });

  const onContext = (gl: ExpoWebGLRenderingContext) => {
    const w = gl.drawingBufferWidth, h = gl.drawingBufferHeight;
    const canvas = { width: w, height: h, clientWidth: w, clientHeight: h, style: {}, addEventListener() {}, removeEventListener() {}, getContext: () => gl } as unknown as HTMLCanvasElement;
    (gl as unknown as { canvas: unknown }).canvas = canvas;
    const renderer = new THREE.WebGLRenderer({ canvas, context: gl as unknown as WebGL2RenderingContext, alpha: true, antialias: true });
    renderer.setPixelRatio(1);
    renderer.setSize(w, h, false);
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 10);
    camera.position.z = 3.2;
    const crystal = new THREE.Group();
    const geo = new THREE.IcosahedronGeometry(1, 0);
    crystal.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo), new THREE.LineBasicMaterial({ color: 0xffffff })));
    crystal.add(new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: 0x9fe8ff, transparent: true, opacity: 0.22, blending: THREE.AdditiveBlending, depthWrite: false })));
    const inner = new THREE.Mesh(new THREE.OctahedronGeometry(0.42), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    crystal.add(inner);
    scene.add(crystal);

    const draw = (time: number) => {
      crystal.rotation.set(0.45 + time * 0.0004, time * 0.0009, 0.2);
      inner.rotation.set(time * 0.0012, -time * 0.0007, 0);
      renderer.render(scene, camera);
      gl.endFrameEXP();
    };
    if (calm) { draw(900); return; }
    let raf = 0, last = 0, alive = true;
    const loop = (time: number) => {
      if (!alive) return;
      raf = requestAnimationFrame(loop);
      if (time - last < 33) return; // ~30 fps is plenty for a 24 pt crystal
      last = time;
      draw(time);
    };
    raf = requestAnimationFrame(loop);
    stop.current = () => { alive = false; cancelAnimationFrame(raf); renderer.dispose(); geo.dispose(); };
  };

  return (
    <Animated.View pointerEvents="none" style={[s.wrap, { width: size, height: size, left: "50%", top: "50%", marginLeft: -size / 2, marginTop: -size / 2 }, style]}>
      <GLView style={{ width: size, height: size }} onContextCreate={onContext} msaaSamples={PixelRatio.get() > 2 ? 0 : 4} />
    </Animated.View>
  );
}

const s = StyleSheet.create({ wrap: { position: "absolute" } });
