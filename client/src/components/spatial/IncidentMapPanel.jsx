// client/src/components/spatial/IncidentMapPanel.jsx
// Dedicated Glass Panel hosting an Independent Interactive 3D Incident Correlation Map
// - Isolated Three.js Viewport (Drag to Rotate, Wheel to Zoom, Click to Select)
// - Interacting with this map NEVER moves the global page or water camera
// - Real incident objects from API (INC-101 through INC-115) with P1-P4 colors
// - Connected relationship lines, hover tooltips, and bottom operational controls

import React, { useRef, useState, useMemo, useEffect, Suspense } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Html, Line, OrbitControls } from '@react-three/drei';

const INCIDENT_POSITIONS = {
  'INC-101': [-3.8, 1.8, -1.2],
  'INC-102': [-0.8, 2.2, 0.2],
  'INC-103': [2.8, 1.5, -2.0],
  'INC-104': [1.8, 0.6, 1.2],
  'INC-105': [4.2, -0.8, -0.8],
  'INC-106': [-2.8, -1.6, 0.6],
  'INC-107': [-1.2, -0.6, 1.8],
  'INC-108': [0.8, -1.6, -1.8],
  'INC-109': [3.2, -1.8, 0.4],
  'INC-110': [-1.5, 0.4, -1.5],
  'INC-111': [-4.5, 0.0, -2.5],
  'INC-112': [-3.4, 2.5, 0.8],
  'INC-113': [0.4, 2.8, -1.1],
  'INC-114': [3.6, 2.2, 1.5],
  'INC-115': [-2.2, -2.4, -0.9],
};

const PRIORITY_COLORS = {
  P1: '#ff3b4d',
  P2: '#ffb020',
  P3: '#42d6ff',
  P4: '#8b9aaa',
};

function getPriorityColor(prio) {
  if (!prio) return PRIORITY_COLORS.P4;
  const p = prio.slice(0, 2).toUpperCase();
  return PRIORITY_COLORS[p] || PRIORITY_COLORS.P4;
}

/* ============================================================
   3D INCIDENT NODE
   ============================================================ */

function IncidentGraphNode({ incident, isSelected, onSelect, onHover }) {
  const group = useRef();
  const mesh = useRef();
  const [isHovered, setIsHovered] = useState(false);

  const position = INCIDENT_POSITIONS[incident.incident_id || incident.id] || [
    ((parseInt(String(incident.incident_id || incident.id).replace(/\D/g, '') || '0', 10) % 7) - 3) * 1.4,
    (((parseInt(String(incident.incident_id || incident.id).replace(/\D/g, '') || '0', 10) * 3) % 5) - 2) * 1.1,
    (((parseInt(String(incident.incident_id || incident.id).replace(/\D/g, '') || '0', 10) * 2) % 6) - 3) * 0.8,
  ];

  const color = getPriorityColor(incident.priority);
  const risk = Number(incident.risk_score ?? incident.riskScore ?? 50);
  const radius = Math.max(0.12, Math.min(0.26, 0.11 + risk / 600));

  useFrame((state, delta) => {
    if (!group.current) return;
    const targetScale = isSelected ? 1.55 : isHovered ? 1.25 : 1.0;
    group.current.scale.setScalar(
      THREE.MathUtils.damp(group.current.scale.x, targetScale, 8, delta)
    );

    if (mesh.current) {
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 2.5 + position[0]) * 0.05;
      mesh.current.scale.setScalar(isHovered || isSelected ? pulse * 1.1 : pulse);
    }
  });

  return (
    <group
      ref={group}
      position={position}
      onPointerOver={(e) => {
        e.stopPropagation();
        setIsHovered(true);
        onHover(incident);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        setIsHovered(false);
        onHover(null);
        document.body.style.cursor = 'default';
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(incident);
      }}
    >
      {/* Soft halo sphere */}
      <mesh scale={isSelected ? 2.8 : isHovered ? 2.2 : 1.7}>
        <sphereGeometry args={[radius, 16, 16]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={isSelected ? 0.18 : isHovered ? 0.12 : 0.05}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Main glowing core */}
      <mesh ref={mesh}>
        <sphereGeometry args={[radius, 20, 20]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isSelected ? 4.8 : isHovered ? 3.5 : 1.9}
          roughness={0.2}
          metalness={0.4}
        />
      </mesh>

      {/* Point light for selected / hovered nodes */}
      {(isHovered || isSelected) && (
        <pointLight color={color} intensity={isSelected ? 2.2 : 1.0} distance={3.5} />
      )}

      {/* Compact hover tooltip */}
      {isHovered && !isSelected && (
        <Html center distanceFactor={8} position={[0, radius + 0.35, 0]} style={{ pointerEvents: 'none' }}>
          <div className="panel-node-tooltip">
            <strong>{incident.incident_id || incident.id}</strong>
            <span style={{ color }}>{incident.priority} &bull; RISK {Number(risk).toFixed(1)}</span>
            <span>{incident.alert_count || incident.signalsCount || 0} ALERTS</span>
            <span className="tooltip-asset">{incident.asset_name || incident.hostname || incident.asset}</span>
          </div>
        </Html>
      )}

      {/* Persistent label for selected incident */}
      {isSelected && (
        <Html center distanceFactor={8} position={[0, radius + 0.45, 0]}>
          <div className="panel-selected-tag">
            {incident.incident_id || incident.id}
          </div>
        </Html>
      )}
    </group>
  );
}

/* ============================================================
   CORRELATION EDGES (1px subtle relationship hairlines)
   ============================================================ */

function GraphEdges({ incidents, selectedIncident }) {
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
        if (dist < 4.8) {
          list.push({ idA, idB, pa, pb });
        }
      }
    }
    return list;
  }, [incidents]);

  return (
    <group>
      {edges.map((edge) => {
        const selId = selectedIncident?.incident_id || selectedIncident?.id;
        const isHighlighted = selId && (edge.idA === selId || edge.idB === selId);
        return (
          <Line
            key={`${edge.idA}-${edge.idB}`}
            points={[edge.pa, edge.pb]}
            color={isHighlighted ? '#38bdf8' : '#334155'}
            transparent
            opacity={isHighlighted ? 0.85 : 0.18}
            lineWidth={isHighlighted ? 1.2 : 0.6}
          />
        );
      })}
    </group>
  );
}

/* ============================================================
   PANEL CAMERA CONTROLLER (Focus smoothly on selected node)
   ============================================================ */

function PanelCameraController({ selectedIncident, controlsRef }) {
  const { camera } = useThree();
  const baseTarget = useMemo(() => new THREE.Vector3(0, 0, 0), []);
  const basePos = useMemo(() => new THREE.Vector3(0, 0.5, 9.5), []);

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
   MAIN INCIDENT MAP PANEL COMPONENT
   ============================================================ */

export function IncidentMapPanel({ incidents = [], selectedIncident, onSelectIncident }) {
  const [hoveredNode, setHoveredNode] = useState(null);
  const controlsRef = useRef();

  return (
    <div className="incident-intelligence-panel" aria-label="Incident Intelligence Map">
      {/* Panel Top Glass Header */}
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

      {/* 3D WebGL Canvas strictly isolated inside this panel */}
      <div className="map-viewport-stage">
        <Canvas
          dpr={[1, 1.5]}
          camera={{
            position: [0, 0.5, 9.5],
            fov: 42,
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
          <ambientLight intensity={0.35} />
          <directionalLight position={[4, 6, 8]} intensity={0.65} color="#38bdf8" />
          <pointLight position={[-4, -3, 2]} intensity={0.4} color="#ff3b4d" />

          {/* Edges */}
          <GraphEdges incidents={incidents} selectedIncident={selectedIncident} />

          {/* Nodes */}
          {incidents.map((inc) => {
            const id = inc.incident_id || inc.id;
            const isSel = (selectedIncident?.incident_id || selectedIncident?.id) === id;
            return (
              <IncidentGraphNode
                key={id}
                incident={inc}
                isSelected={isSel}
                onSelect={onSelectIncident}
                onHover={setHoveredNode}
              />
            );
          })}

          {/* Camera Controller & Orbit Controls isolated strictly to this canvas */}
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
          background: rgba(7, 12, 18, 0.55);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(56, 189, 248, 0.22);
          box-shadow: 0 24px 80px rgba(0, 0, 0, 0.65), 0 0 40px rgba(56, 189, 248, 0.08);
          border-radius: 8px;
          display: flex;
          flex-direction: column;
          z-index: 10;
          overflow: hidden;
          pointer-events: auto;
        }

        .map-panel-header {
          padding: 1rem 1.4rem;
          background: rgba(5, 9, 14, 0.7);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          align-items: center;
        }

        .map-eyebrow-tag {
          font-size: 0.64rem;
          font-weight: 700;
          letter-spacing: 0.16em;
          color: #38bdf8;
        }

        .map-sub-title {
          font-size: 0.88rem;
          font-weight: 600;
          color: #f8fafc;
          letter-spacing: -0.01em;
          margin-top: 0.15rem;
        }

        .map-badge-count {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.65rem;
          background: rgba(56, 189, 248, 0.08);
          border: 1px solid rgba(56, 189, 248, 0.25);
          padding: 0.25rem 0.65rem;
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
          background: radial-gradient(circle at center, rgba(14, 25, 38, 0.45) 0%, rgba(3, 6, 9, 0.85) 100%);
        }

        .map-viewport-stage canvas {
          display: block;
          width: 100% !important;
          height: 100% !important;
        }

        .map-panel-footer {
          padding: 0.65rem 1.25rem;
          background: rgba(5, 9, 14, 0.75);
          border-top: 1px solid rgba(255, 255, 255, 0.07);
          font-size: 0.62rem;
          color: #64748b;
        }

        .map-hints {
          gap: 0.6rem;
        }

        .hint-chip b {
          color: #94a3b8;
          font-weight: 600;
        }

        .hint-sep {
          opacity: 0.4;
        }

        .map-prio-legend {
          gap: 0.85rem;
        }

        .prio-dot-label {
          gap: 0.35rem;
          color: #94a3b8;
        }

        .dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
        }
        .dot.p1 { background: #ff3b4d; box-shadow: 0 0 6px #ff3b4d; }
        .dot.p2 { background: #ffb020; box-shadow: 0 0 6px #ffb020; }
        .dot.p3 { background: #42d6ff; box-shadow: 0 0 6px #42d6ff; }
        .dot.p4 { background: #8b9aaa; }

        /* Tooltip inside panel */
        .panel-node-tooltip {
          background: rgba(7, 12, 18, 0.95);
          border: 1px solid rgba(56, 189, 248, 0.35);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.6);
          padding: 0.6rem 0.85rem;
          border-radius: 4px;
          color: #f8fafc;
          font-size: 0.66rem;
          font-family: monospace;
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
          white-space: nowrap;
          pointer-events: none;
        }

        .panel-node-tooltip strong {
          color: #38bdf8;
          font-size: 0.76rem;
        }

        .tooltip-asset {
          color: #94a3b8;
          font-size: 0.60rem;
        }

        .panel-selected-tag {
          background: #38bdf8;
          color: #030609;
          font-weight: 700;
          font-size: 0.65rem;
          font-family: monospace;
          padding: 0.15rem 0.45rem;
          border-radius: 3px;
          white-space: nowrap;
        }

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
