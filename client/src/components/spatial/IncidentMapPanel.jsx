// client/src/components/spatial/IncidentMapPanel.jsx
// Dedicated Glass Panel: Real 3D Incident Intelligence Correlation Map
// Features:
// 1. 3-Layer Incident Nodes: Bright Core, Soft Glow, Atmospheric Halo
// 2. Real 3D Spatial Depth (Foreground z > 1, Midground z ~ 0, Background z < -1.5)
// 3. Faint Depth Fog & Secondary Telemetry Background Points (#3A6578)
// 4. Sparse Relationship Lines (Selected: 0.55 opacity, Unrelated: 0.06 opacity)
// 5. Compact Glass Labels: ID (monospace), Priority, Risk score (monospace numeric)
// 6. Smooth Camera Focus on Click + Hover Reactions (1.0 -> 1.12 scale)
// 7. Strictly Isolated Three.js Viewport (Interacting NEVER moves water or page camera)

import React, { useRef, useState, useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Html, Line, OrbitControls } from '@react-three/drei';

/* Spatial Z-coordinates giving actual foreground, midground, and background layers */
const INCIDENT_POSITIONS = {
  'INC-101': [-3.2, 1.6, -1.2],   // Mid-Back
  'INC-102': [-0.6, 1.4, 0.6],    // Foreground-Mid
  'INC-103': [2.8, 1.1, -2.0],    // Background
  'INC-104': [1.6, 0.4, 1.2],     // Foreground
  'INC-105': [3.6, -0.7, 1.5],    // Foreground
  'INC-106': [-2.8, -1.3, -1.5],  // Background
  'INC-107': [-1.0, -0.6, 1.8],   // Foreground
  'INC-108': [0.6, -1.4, 0.0],    // Midground
  'INC-109': [3.0, -1.6, 0.4],    // Midground
  'INC-110': [-1.5, 0.4, -1.6],   // Background
  'INC-111': [-3.8, 0.0, 2.0],    // Foreground
  'INC-112': [-2.9, 2.1, 0.8],    // Midground
  'INC-113': [0.4, 2.4, -1.1],    // Background
  'INC-114': [3.4, 1.8, -2.5],    // Deep Background
  'INC-115': [-1.8, -2.0, -1.0],  // Mid-Back
};

const PRIORITY_THEME = {
  P1: { core: '#FF4655', glow: '#FF4655', halo: 'rgba(255, 70, 85, 0.20)', line: '#ff4655' },
  P2: { core: '#FFB52E', glow: '#FFB52E', halo: 'rgba(255, 181, 46, 0.16)', line: '#ffb52e' },
  P3: { core: '#21D4FF', glow: '#21D4FF', halo: 'rgba(33, 212, 255, 0.16)', line: '#21d4ff' },
  P4: { core: '#B7C5CF', glow: '#B7C5CF', halo: 'rgba(183, 197, 207, 0.10)', line: '#8ba2b0' },
};

function getPriorityTheme(prio) {
  if (!prio) return PRIORITY_THEME.P4;
  const p = prio.slice(0, 2).toUpperCase();
  return PRIORITY_THEME[p] || PRIORITY_THEME.P4;
}

/* ============================================================
   SECONDARY TELEMETRY OBSERVATIONS (Background Depth Points)
   ============================================================ */

function SecondaryTelemetryField({ count = 65 }) {
  const pointsRef = useRef();

  const { positions, drift } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const dr = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      pos[i3] = (Math.random() - 0.5) * 12;
      pos[i3 + 1] = (Math.random() - 0.5) * 8;
      pos[i3 + 2] = (Math.random() - 0.5) * 7 - 0.5;
      dr[i] = 0.05 + Math.random() * 0.1;
    }
    return { positions: pos, drift: dr };
  }, [count]);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;
    const array = pointsRef.current.geometry.attributes.position.array;
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      array[i3 + 1] += Math.sin(state.clock.elapsedTime * 0.3 + i) * 0.001;
      array[i3] += Math.cos(state.clock.elapsedTime * 0.2 + i) * 0.001;
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.032}
        sizeAttenuation
        transparent
        opacity={0.25}
        color="#3A6578"
        depthWrite={false}
      />
    </points>
  );
}

/* ============================================================
   3-LAYER INCIDENT NODE COMPONENT
   ============================================================ */

function IncidentGraphNode({ incident, isSelected, isHovered, onSelect, onHover }) {
  const group = useRef();
  const theme = getPriorityTheme(incident.priority);
  const risk = Number(incident.risk_score ?? incident.riskScore ?? 50);

  // Dynamic importance sizing: Higher risk = slightly larger; Lower risk = smaller
  const baseRadius = Math.max(0.10, Math.min(0.22, 0.09 + (risk / 600)));

  const id = incident.incident_id || incident.id;
  const position = INCIDENT_POSITIONS[id] || [0, 0, 0];

  // Foreground indicator: Z > 0.5
  const isForeground = position[2] > 0.5;
  const isKeyIncident = ['INC-101', 'INC-102', 'INC-103', 'INC-108'].includes(id);

  useFrame((state, delta) => {
    if (!group.current) return;
    const targetScale = isSelected ? 1.35 : isHovered ? 1.12 : 1.0;
    group.current.scale.setScalar(
      THREE.MathUtils.damp(group.current.scale.x, targetScale, 10, delta)
    );
  });

  return (
    <group
      ref={group}
      position={position}
      onPointerOver={(e) => {
        e.stopPropagation();
        onHover(incident);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        onHover(null);
        document.body.style.cursor = 'default';
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(incident);
      }}
    >
      {/* LAYER 3: Very Subtle Surrounding Atmospheric Halo */}
      <mesh scale={isSelected ? 3.0 : isHovered ? 2.3 : 1.75}>
        <sphereGeometry args={[baseRadius, 16, 16]} />
        <meshBasicMaterial
          color={theme.halo}
          transparent
          opacity={isSelected ? 0.28 : isHovered ? 0.20 : 0.10}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* LAYER 2: Soft Colored Glow */}
      <mesh scale={isSelected ? 1.8 : isHovered ? 1.45 : 1.25}>
        <sphereGeometry args={[baseRadius, 18, 18]} />
        <meshBasicMaterial
          color={theme.glow}
          transparent
          opacity={isSelected ? 0.45 : isHovered ? 0.35 : 0.22}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* LAYER 1: Small Bright Core */}
      <mesh>
        <sphereGeometry args={[baseRadius, 20, 20]} />
        <meshStandardMaterial
          color={theme.core}
          emissive={theme.core}
          emissiveIntensity={isSelected ? 4.5 : isHovered ? 3.2 : 2.0}
          roughness={0.25}
          metalness={0.3}
        />
      </mesh>

      {/* Local Point Light strictly under hovered/selected node */}
      {(isHovered || isSelected) && (
        <pointLight color={theme.core} intensity={isSelected ? 1.6 : 0.8} distance={2.5} />
      )}

      {/* Compact Professional Glass Label */}
      {(isHovered || isSelected || (isKeyIncident && isForeground)) && (
        <Html
          center
          distanceFactor={9}
          position={[0, baseRadius + 0.36, 0]}
          style={{ pointerEvents: 'none' }}
        >
          <div className={`compact-glass-node-label ${isSelected ? 'selected' : ''} ${isHovered ? 'hovered' : ''}`}>
            <div className="node-label-id mono">{id}</div>
            <div className="node-label-meta">
              <span className={`prio-tag-text ${incident.priority?.slice(0, 2).toLowerCase()}`}>
                {incident.priority?.slice(0, 2)}
              </span>
              <span className="dot-sep">&bull;</span>
              <span className="risk-tag-text mono">{Number(risk).toFixed(1)}</span>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}

/* ============================================================
   RELATIONSHIP LINES (Thin Cyan/Blue, Sparse & Elegant)
   ============================================================ */

function SparseGraphEdges({ incidents, selectedIncident }) {
  const edges = useMemo(() => {
    const list = [];
    for (let i = 0; i < incidents.length; i++) {
      for (let j = i + 1; j < incidents.length; j++) {
        const a = incidents[i];
        const b = incidents[j];
        const idA = a.incident_id || a.id;
        const idB = b.incident_id || b.id;

        const pa = INCIDENT_POSITIONS[idA];
        const pb = INCIDENT_POSITIONS[idB];
        if (!pa || !pb) continue;

        const dist = new THREE.Vector3(...pa).distanceTo(new THREE.Vector3(...pb));
        // Sparse threshold: only connect close correlation entities
        if (dist < 4.2) {
          list.push({ idA, idB, pa, pb, dist });
        }
      }
    }
    return list;
  }, [incidents]);

  return (
    <group>
      {edges.map((edge) => {
        const selId = selectedIncident?.incident_id || selectedIncident?.id;
        const isSelectedEdge = selId && (edge.idA === selId || edge.idB === selId);

        // Opacity specs: Selected: 0.55, Default: 0.10 - 0.22, Unrelated when selection active: 0.06
        const opacity = isSelectedEdge ? 0.55 : selId ? 0.06 : THREE.MathUtils.lerp(0.22, 0.10, edge.dist / 4.2);
        const color = isSelectedEdge ? '#21D4FF' : '#38bdf8';
        const lineWidth = isSelectedEdge ? 1.2 : 0.6;

        return (
          <Line
            key={`${edge.idA}-${edge.idB}`}
            points={[edge.pa, edge.pb]}
            color={color}
            transparent
            opacity={opacity}
            lineWidth={lineWidth}
          />
        );
      })}
    </group>
  );
}

/* ============================================================
   CAMERA CONTROLLER (Focus on Selected Incident)
   ============================================================ */

function PanelCameraController({ selectedIncident, controlsRef }) {
  const { camera } = useThree();
  const baseTarget = useMemo(() => new THREE.Vector3(0, 0, 0), []);
  const basePosition = useMemo(() => new THREE.Vector3(0, 0.4, 9.5), []);

  useEffect(() => {
    if (!controlsRef.current) return;
    if (selectedIncident) {
      const id = selectedIncident.incident_id || selectedIncident.id;
      const p = INCIDENT_POSITIONS[id] || [0, 0, 0];
      controlsRef.current.target.set(p[0], p[1], p[2]);
    } else {
      controlsRef.current.target.copy(baseTarget);
    }
  }, [selectedIncident, controlsRef, baseTarget]);

  return null;
}

/* ============================================================
   MAIN INCIDENT MAP PANEL
   ============================================================ */

export function IncidentMapPanel({ incidents = [], selectedIncident, onSelectIncident }) {
  const [hoveredNode, setHoveredNode] = useState(null);
  const controlsRef = useRef();

  return (
    <div className="incident-intelligence-panel" aria-label="Incident Intelligence Map">
      {/* Header: Clean Enterprise Typography */}
      <div className="map-panel-header flex-between">
        <div className="map-title-group">
          <div className="map-eyebrow-tag mono">INCIDENT INTELLIGENCE MAP</div>
          <div className="map-sub-title">3D CORRELATION VIEW</div>
        </div>
        <div className="map-badge-count mono">
          <span className="live-dot-green" />
          <span>{incidents.length || 15} INCIDENTS</span>
        </div>
      </div>

      {/* 3D WebGL Canvas: Isolated to this panel */}
      <div className="map-viewport-stage">
        <Canvas
          dpr={[1, 1.5]}
          camera={{
            position: [0, 0.4, 9.5],
            fov: 40,
            near: 0.1,
            far: 50,
          }}
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance',
          }}
          onPointerMissed={() => onSelectIncident(null)}
        >
          {/* Faint Depth Fog (Pure Cold Dark Blue-Black #02070B) */}
          <fog attach="fog" args={['#02070B', 8, 22]} />

          {/* Clean cool ambient & directional lighting (Zero red/orange glow) */}
          <ambientLight intensity={0.4} color="#063047" />
          <directionalLight position={[4, 8, 6]} intensity={0.65} color="#21D4FF" />

          {/* Secondary Telemetry Background Points */}
          <SecondaryTelemetryField count={65} />

          {/* Sparse Relationship Lines */}
          <SparseGraphEdges incidents={incidents} selectedIncident={selectedIncident} />

          {/* 3-Layer Incident Nodes */}
          {incidents.map((inc) => {
            const id = inc.incident_id || inc.id;
            const isSel = (selectedIncident?.incident_id || selectedIncident?.id) === id;
            const isHov = (hoveredNode?.incident_id || hoveredNode?.id) === id;
            return (
              <IncidentGraphNode
                key={id}
                incident={inc}
                isSelected={isSel}
                isHovered={isHov}
                onSelect={onSelectIncident}
                onHover={setHoveredNode}
              />
            );
          })}

          <PanelCameraController selectedIncident={selectedIncident} controlsRef={controlsRef} />
          <OrbitControls
            ref={controlsRef}
            enableDamping
            dampingFactor={0.08}
            rotateSpeed={0.6}
            zoomSpeed={0.8}
            minDistance={4}
            maxDistance={18}
          />
        </Canvas>
      </div>

      {/* Panel Bottom Controls & Priority Legend */}
      <div className="map-panel-footer flex-between mono">
        <div className="map-hints align-center">
          <span className="hint-chip">DRAG <b>ROTATE</b></span>
          <span className="hint-sep">&bull;</span>
          <span className="hint-chip">SCROLL <b>ZOOM</b></span>
          <span className="hint-sep">&bull;</span>
          <span className="hint-chip">CLICK <b>INVESTIGATE</b></span>
        </div>

        <div className="map-prio-legend align-center">
          <span className="prio-dot-label align-center">
            <span className="dot p1" /> P1
          </span>
          <span className="prio-dot-label align-center">
            <span className="dot p2" /> P2
          </span>
          <span className="prio-dot-label align-center">
            <span className="dot p3" /> P3
          </span>
          <span className="prio-dot-label align-center">
            <span className="dot p4" /> P4
          </span>
        </div>
      </div>

      <style>{`
        .incident-intelligence-panel {
          position: absolute;
          right: 3.5vw;
          top: 13vh;
          width: clamp(480px, 42vw, 680px);
          height: clamp(400px, 55vh, 560px);
          background: rgba(3, 10, 16, 0.68);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(48, 184, 230, 0.24);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.35), 0 0 30px rgba(48, 184, 230, 0.08);
          border-radius: 8px;
          display: flex;
          flex-direction: column;
          z-index: 10;
          overflow: hidden;
          pointer-events: auto;
          transition: border-color 220ms ease, box-shadow 220ms ease;
        }

        .incident-intelligence-panel:hover {
          border-color: rgba(48, 184, 230, 0.4);
          box-shadow: 0 24px 80px rgba(0, 0, 0, 0.5), 0 0 40px rgba(48, 184, 230, 0.14);
        }

        .map-panel-header {
          padding: 0.95rem 1.25rem;
          background: rgba(3, 10, 16, 0.82);
          border-bottom: 1px solid rgba(110, 190, 220, 0.16);
          align-items: center;
        }

        .map-eyebrow-tag {
          font-size: 0.64rem;
          font-weight: 700;
          letter-spacing: 0.18em;
          color: #21D4FF;
        }

        .map-sub-title {
          font-size: 0.85rem;
          font-weight: 600;
          color: #f8fafc;
          letter-spacing: -0.01em;
          margin-top: 0.15rem;
        }

        .map-badge-count {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          font-size: 0.65rem;
          background: rgba(33, 212, 255, 0.08);
          border: 1px solid rgba(33, 212, 255, 0.25);
          padding: 0.25rem 0.6rem;
          border-radius: 999px;
          color: #e2e8f0;
        }

        .live-dot-green {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #10b981;
          box-shadow: 0 0 8px #10b981;
        }

        .map-viewport-stage {
          flex: 1;
          position: relative;
          width: 100%;
          height: 100%;
          background: radial-gradient(circle at center, rgba(6, 48, 71, 0.18) 0%, rgba(2, 7, 11, 0.85) 100%);
        }

        .map-viewport-stage canvas {
          display: block;
          width: 100% !important;
          height: 100% !important;
        }

        .map-panel-footer {
          padding: 0.65rem 1.25rem;
          background: rgba(3, 10, 16, 0.85);
          border-top: 1px solid rgba(110, 190, 220, 0.14);
          font-size: 0.62rem;
          color: #64748b;
        }

        .map-hints { gap: 0.6rem; }
        .hint-chip b { color: #94a3b8; font-weight: 600; }
        .hint-sep { opacity: 0.4; }
        .map-prio-legend { gap: 0.85rem; }
        .prio-dot-label { gap: 0.35rem; color: #94a3b8; }

        .dot { width: 6px; height: 6px; border-radius: 50%; }
        .dot.p1 { background: #FF4655; box-shadow: 0 0 6px #FF4655; }
        .dot.p2 { background: #FFB52E; box-shadow: 0 0 6px #FFB52E; }
        .dot.p3 { background: #21D4FF; box-shadow: 0 0 6px #21D4FF; }
        .dot.p4 { background: #B7C5CF; }

        /* Compact Professional Glass Node Labels */
        .compact-glass-node-label {
          background: rgba(3, 10, 16, 0.84);
          border: 1px solid rgba(100, 180, 210, 0.22);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          display: flex;
          flex-direction: column;
          gap: 0.1rem;
          white-space: nowrap;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
          transition: border-color 160ms ease;
        }

        .compact-glass-node-label.hovered {
          border-color: rgba(33, 212, 255, 0.55);
          box-shadow: 0 0 16px rgba(33, 212, 255, 0.25);
        }

        .compact-glass-node-label.selected {
          border-color: #21D4FF;
          background: rgba(4, 18, 30, 0.92);
          box-shadow: 0 0 20px rgba(33, 212, 255, 0.35);
        }

        .node-label-id {
          font-size: 0.68rem;
          font-weight: 700;
          color: #f8fafc;
          letter-spacing: 0.05em;
        }

        .node-label-meta {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.58rem;
        }

        .prio-tag-text.p1 { color: #FF4655; font-weight: 700; }
        .prio-tag-text.p2 { color: #FFB52E; font-weight: 700; }
        .prio-tag-text.p3 { color: #21D4FF; font-weight: 700; }
        .prio-tag-text.p4 { color: #B7C5CF; }

        .dot-sep { opacity: 0.4; }
        .risk-tag-text { color: #e2e8f0; font-weight: 600; }

        @media (max-width: 1024px) {
          .incident-intelligence-panel {
            position: relative;
            top: auto;
            right: auto;
            width: 100%;
            height: 440px;
            margin-top: 2rem;
          }
        }
      `}</style>
    </div>
  );
}

export default IncidentMapPanel;
