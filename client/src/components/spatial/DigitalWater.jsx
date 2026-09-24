// client/src/components/spatial/DigitalWater.jsx
// 3D Digital Water Surface using Three.js / React Three Fiber ShaderMaterial
// Palette:
// Base: #02070B
// Deep Water: #03111A
// Blue: #063047
// Cyan: #087EAD
// Highlight: #62DFFF
// White: #DCEFF5
// ZERO global red, purple, or orange glow.
// Tiny localized reflections strictly under incident nodes.

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
    // Exact Palette:
    // Base: #02070B -> vec3(0.0078, 0.0275, 0.0431)
    // Deep Water: #03111A -> vec3(0.0118, 0.0667, 0.1020)
    // Blue: #063047 -> vec3(0.0235, 0.1882, 0.2784)
    // Cyan: #087EAD -> vec3(0.0314, 0.4941, 0.6784)
    // Highlight: #62DFFF -> vec3(0.3843, 0.8745, 1.0000)
    // White: #DCEFF5 -> vec3(0.8627, 0.9373, 0.9608)

    vec3 baseWater = vec3(0.0078, 0.0275, 0.0431);
    vec3 deepWater = vec3(0.0118, 0.0667, 0.1020);
    vec3 blueWater = vec3(0.0235, 0.1882, 0.2784);
    vec3 cyanWater = vec3(0.0314, 0.4941, 0.6784);
    vec3 highlightCyan = vec3(0.3843, 0.8745, 1.0);
    vec3 specularWhite = vec3(0.8627, 0.9373, 0.9608);

    // Deep water to blue water elevation
    float waveElevation = smoothstep(-0.15, 0.35, vWave);
    vec3 color = mix(deepWater, blueWater, waveElevation * 0.7);

    // Spatial center dampening factor: keeps outer edges active while calming the middle zone
    float centerDist = length(vWorldPosition.xz);
    float centerFactor = smoothstep(2.0, 10.0, centerDist);

    // Moving cyan wave crests (softened in center)
    float crest = smoothstep(0.12, 0.40, vWave);
    float crestIntensity = mix(0.12, 0.40, centerFactor);
    color = mix(color, cyanWater, crest * crestIntensity);

    // Moving moonlight telemetry streaks (cool cyan #62DFFF, softened in center)
    float highlight = sin(
      vWorldPosition.x * 1.35 +
      vWorldPosition.z * 0.75 +
      uTime * 0.65
    );
    highlight = smoothstep(0.85, 1.0, highlight);
    float highlightIntensity = mix(0.06, 0.24, centerFactor);
    color += highlightCyan * (highlight * highlightIntensity);

    // Crisp specular sheen (white #DCEFF5, softened in center)
    float sheen = sin(
      (vWorldPosition.x - vWorldPosition.z) * 1.5 +
      uTime * 0.48
    );
    sheen = smoothstep(0.94, 1.0, sheen);
    float sheenIntensity = mix(0.06, 0.32, centerFactor);
    color += specularWhite * (sheen * sheenIntensity);

    // Strictly localized pinpoint incident reflections:
    // Bounded to radius < 1.0 with steep falloff to ensure ZERO global bleed
    for (int i = 0; i < 8; i++) {
      if (i >= uIncidentCount) break;
      vec2 incPos = uIncidentPositions[i];
      float dist = distance(vWorldPosition.xz, incPos);
      if (dist < 1.0) {
        float localPinpoint = exp(-dist * 5.0) * 0.15;
        color += uIncidentColors[i] * localPinpoint;
      }
    }

    gl_FragColor = vec4(color, 0.98);
  }
`;

// Secondary reflection layer shader (subtle moving diagonal highlights in cool cyan)
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
    float streak = sin((vUv.x + vUv.y * 1.5) * 18.0 - uTime * 0.6) * 0.5 + 0.5;
    float streak2 = sin((vUv.x * 2.0 - vUv.y) * 12.0 + uTime * 0.45) * 0.5 + 0.5;
    float combined = smoothstep(0.88, 1.0, streak * streak2);

    // Subtle cool cyan highlight (#62DFFF) softened in center
    vec3 sheenColor = vec3(0.384, 0.875, 1.0);
    float centerDist = length(vWorldPosition.xz);
    float centerFactor = smoothstep(2.5, 9.5, centerDist);
    gl_FragColor = vec4(sheenColor, combined * 0.05 * centerFactor);
  }
`;

/* ============================================================
   WATER SURFACE MESH COMPONENT
   ============================================================ */

function WaterSurfaceMesh({ incidents = [] }) {
  const meshRef = useRef();
  const secondaryRef = useRef();
  const { pointer } = useThree();

  const targetMouse = useRef(new THREE.Vector2(0, 0));
  const currentMouse = useRef(new THREE.Vector2(0, 0));
  const clickData = useRef({ pos: new THREE.Vector2(0, 0), time: -10, strength: 0 });

  // Incident colors strictly reserved for local pinpoints
  const { incidentColors, incidentPositions, incidentCount } = useMemo(() => {
    const colors = [];
    const positions = [];
    const colorMap = {
      P1: new THREE.Vector3(1.0, 0.274, 0.333), // #FF4655
      P2: new THREE.Vector3(1.0, 0.710, 0.180), // #FFB52E
      P3: new THREE.Vector3(0.129, 0.831, 1.000), // #21D4FF
      P4: new THREE.Vector3(0.718, 0.773, 0.812), // #B7C5CF
    };

    const count = Math.min(incidents.length, 8);
    for (let i = 0; i < 8; i++) {
      if (i < count) {
        const inc = incidents[i];
        const prio = (inc.priority || 'P1').slice(0, 2);
        colors.push(colorMap[prio] || colorMap.P1);
        const x = ((i % 4) - 1.5) * 7.0;
        const z = (Math.floor(i / 4) - 0.5) * 7.0;
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

  useEffect(() => {
    const handlePointerDown = (e) => {
      const target = e.target;
      if (target && (target.closest('.incident-intelligence-panel') || target.closest('.sentinel-inspector') || target.closest('.modal-body-scroll'))) {
        return;
      }
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

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    waterMaterial.uniforms.uTime.value = time;
    reflectionMaterial.uniforms.uTime.value = time;

    targetMouse.current.set(pointer.x, pointer.y);
    currentMouse.current.lerp(targetMouse.current, 0.08);
    waterMaterial.uniforms.uMouse.value.copy(currentMouse.current);
  });

  return (
    <group>
      <mesh
        ref={meshRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -1.8, 0]}
      >
        <planeGeometry args={[48, 30, 180, 120]} />
        <primitive object={waterMaterial} attach="material" />
      </mesh>

      <mesh
        ref={secondaryRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -1.74, 0]}
      >
        <planeGeometry args={[48, 30, 20, 20]} />
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
    const targetX = basePos.x + pointer.x * 0.75;
    const targetY = basePos.y + pointer.y * 0.35;
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
          gl.setClearColor(new THREE.Color('#02070B'), 1);
        }}
      >
        <color attach="background" args={['#02070B']} />
        <fog attach="fog" args={['#02070B', 14, 40]} />

        {/* Deep ocean ambient & moonlight cyan directional lighting */}
        <ambientLight intensity={0.35} color="#063047" />
        <directionalLight position={[6, 14, 8]} intensity={0.55} color="#62DFFF" />

        <WaterSurfaceMesh incidents={incidents} />
        <WaterCameraController />
      </Canvas>

      {/* Soft Center Readability Mask: Calms middle ripple, preserves atmospheric edges */}
      <div className="sentinel-center-soften" />

      {/* Dark Readability Overlay between 3D water and application UI */}
      <div className="water-readability-overlay" />

      <style>{`
        .digital-water-container {
          position: fixed;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          overflow: hidden;
          background: #02070B;
        }

        .digital-water-container canvas {
          display: block;
          width: 100% !important;
          height: 100% !important;
          pointer-events: none;
        }

        .sentinel-center-soften {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: radial-gradient(
            ellipse 55% 48% at 50% 50%,
            rgba(8, 12, 15, 0.78) 0%,
            rgba(8, 12, 15, 0.58) 32%,
            rgba(8, 12, 15, 0.25) 58%,
            transparent 78%
          );
          z-index: 2;
        }

        .water-readability-overlay {
          position: absolute;
          inset: 0;
          background: radial-gradient(
            ellipse 85% 70% at 50% 40%,
            rgba(2, 7, 11, 0.15) 0%,
            rgba(2, 7, 11, 0.50) 100%
          );
          pointer-events: none;
          z-index: 1;
        }
      `}</style>
    </div>
  );
}

export const SentinelAtmosphere = DigitalWater;
export default DigitalWater;
