// client/src/components/spatial/DigitalWater.jsx
// 3D Digital Water Surface using Three.js / React Three Fiber ShaderMaterial
// Features:
// - PlaneGeometry (40 x 24, 180 x 120 subdivisions) rotated horizontally
// - 3D wave peaks and valleys with continuous cinematic motion
// - Dynamic pointer disturbance (smoothly interpolated uMouse)
// - Click disturbance (expanding temporary shockwave ripple with uClickPos / uClickTime)
// - Specular highlights, dark navy depth, cyan highlights
// - Incident light reflections (subtle colored shimmering glow projected onto the water)
// - Translucent secondary reflection layer with animated diagonal highlights

import React, { useRef, useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';

/* ============================================================
   SHADERS
   ============================================================ */

const waterVertexShader = /* glsl */ `
  uniform float uTime;
  uniform vec2 uMouse;
  uniform vec2 uClickPos;
  uniform float uClickTime;
  uniform float uClickStrength;

  varying vec3 vWorldPosition;
  varying float vWave;
  varying vec2 vUv;

  float wave(vec2 p, float time) {
    float w = 0.0;

    w += sin(
      p.x * 0.42 +
      time * 0.55
    ) * 0.22;

    w += sin(
      p.y * 0.67 +
      time * 0.38
    ) * 0.16;

    w += sin(
      (p.x + p.y) * 0.31 +
      time * 0.28
    ) * 0.18;

    w += sin(
      length(p) * 0.85 -
      time * 0.48
    ) * 0.10;

    return w;
  }

  void main() {
    vUv = uv;
    vec3 pos = position;

    float baseWave = wave(pos.xy, uTime);

    /* Mouse creates a localized water disturbance */
    vec2 mousePosition = uMouse * 10.0;
    float mouseDistance = distance(pos.xy, mousePosition);

    float ripple = exp(-mouseDistance * 0.45);
    ripple *= sin(mouseDistance * 5.0 - uTime * 3.0) * 0.28;

    /* Click creates a stronger expanding ripple shockwave */
    float clickAge = uTime - uClickTime;
    float clickRipple = 0.0;
    if (clickAge > 0.0 && clickAge < 3.2) {
      vec2 clickPosition = uClickPos * 10.0;
      float clickDist = distance(pos.xy, clickPosition);
      float expandRadius = clickAge * 6.5;
      float ring = exp(-abs(clickDist - expandRadius) * 1.6) * exp(-clickAge * 0.85);
      clickRipple = sin(clickDist * 5.5 - clickAge * 9.0) * ring * uClickStrength * 0.42;
    }

    pos.z = baseWave + ripple + clickRipple;

    vec4 worldPosition = modelMatrix * vec4(pos, 1.0);
    vWorldPosition = worldPosition.xyz;
    vWave = pos.z;

    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;

const waterFragmentShader = /* glsl */ `
  uniform float uTime;
  uniform vec3 uIncidentColors[8];
  uniform vec2 uIncidentPositions[8];
  uniform int uIncidentCount;

  varying vec3 vWorldPosition;
  varying float vWave;
  varying vec2 vUv;

  void main() {
    vec3 deepWater = vec3(0.005, 0.025, 0.045);
    vec3 cyanWater = vec3(0.01, 0.18, 0.28);

    float waveLight = smoothstep(-0.05, 0.35, vWave);
    vec3 color = mix(deepWater, cyanWater, waveLight * 0.45);

    /* Moving highlights across the water */
    float highlight = sin(
      vWorldPosition.x * 1.4 +
      vWorldPosition.z * 0.8 +
      uTime * 0.8
    );
    highlight = smoothstep(0.82, 1.0, highlight);
    color += vec3(0.03, 0.18, 0.25) * highlight;

    /* Crisp specular sheen */
    float sheen = sin(
      (vWorldPosition.x - vWorldPosition.z) * 1.6 +
      uTime * 0.55
    );
    sheen = smoothstep(0.93, 1.0, sheen) * 0.32;
    color += vec3(0.12, 0.30, 0.40) * sheen;

    /* Subtle neon reflections from incident nodes onto the water surface */
    for (int i = 0; i < 8; i++) {
      if (i >= uIncidentCount) break;
      vec2 incPos = uIncidentPositions[i];
      float dist = distance(vWorldPosition.xz, incPos);
      float shimmer = sin(dist * 3.5 - uTime * 2.2 + vWave * 7.0) * 0.5 + 0.5;
      float falloff = exp(-dist * 0.42) * 0.32;
      color += uIncidentColors[i] * falloff * (0.6 + 0.4 * shimmer);
    }

    gl_FragColor = vec4(color, 0.96);
  }
`;

// Secondary reflection layer shader (subtle moving diagonal highlights)
const reflectionLayerVertexShader = /* glsl */ `
  uniform float uTime;
  varying vec2 vUv;
  varying vec3 vWorldPosition;

  void main() {
    vUv = uv;
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;

const reflectionLayerFragmentShader = /* glsl */ `
  uniform float uTime;
  varying vec2 vUv;
  varying vec3 vWorldPosition;

  void main() {
    // Subtle animated diagonal light streaks
    float streak = sin((vUv.x + vUv.y * 1.5) * 18.0 - uTime * 0.7) * 0.5 + 0.5;
    float streak2 = sin((vUv.x * 2.0 - vUv.y) * 12.0 + uTime * 0.5) * 0.5 + 0.5;
    float combined = smoothstep(0.85, 1.0, streak * streak2);

    vec3 sheenColor = vec3(0.15, 0.45, 0.65);
    gl_FragColor = vec4(sheenColor, combined * 0.08);
  }
`;

/* ============================================================
   WATER SURFACE MESH COMPONENT
   ============================================================ */

function WaterSurfaceMesh({ incidents = [] }) {
  const meshRef = useRef();
  const secondaryRef = useRef();
  const { pointer } = useThree();

  // Smooth pointer interpolation targets
  const targetMouse = useRef(new THREE.Vector2(0, 0));
  const currentMouse = useRef(new THREE.Vector2(0, 0));
  const clickData = useRef({ pos: new THREE.Vector2(0, 0), time: -10, strength: 0 });

  // Incident colors & positions for projected water reflections
  const { incidentColors, incidentPositions, incidentCount } = useMemo(() => {
    const colors = [];
    const positions = [];
    const colorMap = {
      P1: new THREE.Vector3(1.0, 0.23, 0.30), // Red
      P2: new THREE.Vector3(1.0, 0.69, 0.12), // Amber
      P3: new THREE.Vector3(0.26, 0.84, 1.00), // Cyan
      P4: new THREE.Vector3(0.55, 0.60, 0.67), // Gray/Blue
    };

    const count = Math.min(incidents.length, 8);
    for (let i = 0; i < 8; i++) {
      if (i < count) {
        const inc = incidents[i];
        const prio = (inc.priority || 'P1').slice(0, 2);
        colors.push(colorMap[prio] || colorMap.P1);
        // Map incident coordinate to 3D water surface XZ
        const x = ((i % 4) - 1.5) * 6.0;
        const z = (Math.floor(i / 4) - 0.5) * 6.0;
        positions.push(new THREE.Vector2(x, z));
      } else {
        colors.push(new THREE.Vector3(0, 0, 0));
        positions.push(new THREE.Vector2(0, 0));
      }
    }

    return {
      incidentColors: colors,
      incidentPositions: positions,
      incidentCount: count,
    };
  }, [incidents]);

  // Custom Shader Material for Water
  const waterMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: waterVertexShader,
      fragmentShader: waterFragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uMouse: { value: new THREE.Vector2(0, 0) },
        uClickPos: { value: new THREE.Vector2(0, 0) },
        uClickTime: { value: -10.0 },
        uClickStrength: { value: 0.0 },
        uIncidentColors: { value: incidentColors },
        uIncidentPositions: { value: incidentPositions },
        uIncidentCount: { value: incidentCount },
      },
      transparent: true,
      depthWrite: true,
      side: THREE.DoubleSide,
      blending: THREE.NormalBlending,
    });
  }, [incidentColors, incidentPositions, incidentCount]);

  // Material for the secondary subtle reflection layer
  const reflectionMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: reflectionLayerVertexShader,
      fragmentShader: reflectionLayerFragmentShader,
      uniforms: {
        uTime: { value: 0 },
      },
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    });
  }, []);

  // Click handler to trigger shockwave ripples
  useEffect(() => {
    const handlePointerDown = (e) => {
      // Normalize to [-1, 1]
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = -(e.clientY / window.innerHeight) * 2 + 1;
      clickData.current = {
        pos: new THREE.Vector2(nx, ny),
        time: waterMaterial.uniforms.uTime.value,
        strength: 1.0,
      };
      waterMaterial.uniforms.uClickPos.value.set(nx, ny);
      waterMaterial.uniforms.uClickTime.value = waterMaterial.uniforms.uTime.value;
      waterMaterial.uniforms.uClickStrength.value = 1.0;
    };

    window.addEventListener('pointerdown', handlePointerDown);
    return () => window.removeEventListener('pointerdown', handlePointerDown);
  }, [waterMaterial]);

  // Animation Loop (60 FPS)
  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;
    waterMaterial.uniforms.uTime.value = time;
    reflectionMaterial.uniforms.uTime.value = time;

    // Smoothly interpolate pointer into uMouse
    targetMouse.current.set(pointer.x, pointer.y);
    currentMouse.current.lerp(targetMouse.current, 0.08);
    waterMaterial.uniforms.uMouse.value.copy(currentMouse.current);
  });

  return (
    <group>
      {/* 1. Main 3D Digital Water Surface (40 x 24, 180 x 120 subdivisions) */}
      <mesh
        ref={meshRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -1.8, 0]}
      >
        <planeGeometry args={[44, 28, 180, 120]} />
        <primitive object={waterMaterial} attach="material" />
      </mesh>

      {/* 2. Secondary Translucent Reflection Layer */}
      <mesh
        ref={secondaryRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -1.74, 0]}
      >
        <planeGeometry args={[44, 28, 20, 20]} />
        <primitive object={reflectionMaterial} attach="material" />
      </mesh>
    </group>
  );
}

/* ============================================================
   CINEMATIC CAMERA CONTROLLER
   ============================================================ */

function WaterCameraController() {
  const { camera, pointer } = useThree();
  const basePos = useMemo(() => new THREE.Vector3(0, 8.5, 14), []);

  useFrame((_, delta) => {
    // Subtle, restrained pointer parallax on global water camera
    const targetX = basePos.x + pointer.x * 0.85;
    const targetY = basePos.y + pointer.y * 0.45;
    const targetZ = basePos.z;

    camera.position.x = THREE.MathUtils.damp(camera.position.x, targetX, 3.0, delta);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, targetY, 3.0, delta);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, targetZ, 3.0, delta);

    camera.lookAt(0, -1.5, 0);
  });

  return null;
}

/* ============================================================
   ROOT DIGITAL WATER CANVAS
   ============================================================ */

export function DigitalWater({ incidents = [] }) {
  return (
    <div className="digital-water-container" aria-hidden="true">
      <Canvas
        dpr={[1, 1.75]}
        camera={{
          position: [0, 8.5, 14],
          fov: 45,
          near: 0.1,
          far: 100,
        }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
        onCreated={({ gl }) => {
          gl.setClearColor(new THREE.Color('#030609'), 1);
        }}
      >
        <color attach="background" args={['#030609']} />
        <fog attach="fog" args={['#030609', 14, 38]} />

        {/* Ambient & Directional Lighting */}
        <ambientLight intensity={0.25} />
        <directionalLight position={[6, 12, 8]} intensity={0.45} color="#42d6ff" />

        {/* The 3D Digital Water Surface */}
        <WaterSurfaceMesh incidents={incidents} />

        {/* Subtle, restrained telemetry sparkles */}
        <WaterCameraController />
      </Canvas>

      <style>{`
        .digital-water-container {
          position: fixed;
          inset: 0;
          z-index: 0;
          pointer-events: auto;
          overflow: hidden;
          background: #030609;
        }

        .digital-water-container canvas {
          display: block;
          width: 100% !important;
          height: 100% !important;
        }
      `}</style>
    </div>
  );
}

export default DigitalWater;
