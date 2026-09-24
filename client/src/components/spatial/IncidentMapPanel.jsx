// client/src/components/spatial/IncidentMapPanel.jsx
// Dedicated Glass Panel: Real 3D Incident Intelligence Correlation Space
// Features:
// 1. Three Spatial Depth Planes: FOREGROUND (P1), MIDGROUND (P2), BACKGROUND (P3/P4) derived dynamically from risk/priority
// 2. Real 3D Meshes: Physically based MeshStandardMaterial Core + Inner Glow + Soft Translucent Halo
// 3. 3D Curved Relationship Arcs with depth curvature
// 4. Moving Evidence Telemetry Particles traveling along correlated relationships
// 5. Subtle Camera Parallax via pointer damping + Atmospheric Depth Fog (#020A10)
// 6. Restrained Label System (uncluttered, expanding on hover/selection)
import React, { useRef, useState, useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Html, Line, OrbitControls } from '@react-three/drei';
import { CorrelationReviewModal } from './CorrelationReviewModal';

/* Base XY coordinate anchors (layout stability) */
const BASE_XY_COORDINATES = {
  'INC-101': [-3.2, 1.4],
  'INC-102': [-0.7, 1.1],
  'INC-103': [2.7, 0.9],
  'INC-104': [1.7, 0.2],
  'INC-105': [3.5, -0.6],
  'INC-106': [-2.8, -1.3],
  'INC-107': [-0.9, -0.6],
  'INC-108': [0.7, -1.4],
  'INC-109': [2.7, -1.7],
  'INC-110': [-1.7, 0.4],
  'INC-111': [-3.7, -0.2],
  'INC-112': [-2.6, 2.3],
  'INC-113': [0.6, 2.3],
  'INC-114': [3.4, 2.0],
  'INC-115': [-1.5, -2.1],
};

function hashString(str) {
  let hash = 0;
  const s = String(str || 'INC');
  for (let i = 0; i < s.length; i++) {
    hash = (hash << 5) - hash + s.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function getIncident3DPosition(incident) {
  const id = incident.incident_id || incident.id || 'INC';
  const risk = Number(incident.risk_score ?? 50);
  const prio = String(incident.priority || 'P3').slice(0, 2).toUpperCase();

  // 1. Stable X & Y base position
  let x = 0;
  let y = 0;
  if (BASE_XY_COORDINATES[id]) {
    [x, y] = BASE_XY_COORDINATES[id];
  } else {
    const h = hashString(id);
    x = ((h % 1000) / 1000 - 0.5) * 7.5;
    y = (((h >> 3) % 1000) / 1000 - 0.5) * 4.5;
  }

  // 2. Dynamic Spatial Depth Plane (Z-axis derived directly from risk & priority)
  // FOREGROUND: P1/Critical (Z: +0.8 to +1.8)
  // MIDGROUND: P2/High (Z: -0.2 to +0.4)
  // BACKGROUND: P3/P4 (Z: -1.6 to -2.6)
  let z = 0;
  if (prio === 'P1' || risk >= 75) {
    z = 0.8 + (Math.min(risk - 75, 25) / 25) * 1.0;
  } else if (prio === 'P2' || risk >= 55) {
    z = -0.2 + ((risk - 55) / 20) * 0.6;
  } else {
    z = -2.6 + (Math.min(risk, 55) / 55) * 1.0;
  }

  // Slight deterministic stagger to prevent exact planar collision
  const jitterZ = ((hashString(id + '-z') % 100) / 100 - 0.5) * 0.25;

  return [x, y, z + jitterZ];
}

const PRIORITY_THEME = {
  P1: { core: '#B64A5F', glow: '#B64A5F', halo: '#B64A5F', line: '#B64A5F' },
  P2: { core: '#C58A52', glow: '#C58A52', halo: '#C58A52', line: '#C58A52' },
  P3: { core: '#5F9480', glow: '#5F9480', halo: '#5F9480', line: '#5F9480' },
  P4: { core: '#78828A', glow: '#78828A', halo: '#78828A', line: '#78828A' },
};

function getPriorityTheme(prio) {
  if (!prio) return PRIORITY_THEME.P4;
  const p = String(prio).slice(0, 2).toUpperCase();
  return PRIORITY_THEME[p] || PRIORITY_THEME.P4;
}

/* Secondary Background Depth Particles */
function SecondaryTelemetryField({ count = 55 }) {
  const pointsRef = useRef();

  const { positions } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      pos[i3] = (Math.random() - 0.5) * 12;
      pos[i3 + 1] = (Math.random() - 0.5) * 8;
      pos[i3 + 2] = (Math.random() - 0.5) * 7 - 1.0;
    }
    return { positions: pos };
  }, [count]);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const array = pointsRef.current.geometry.attributes.position.array;
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      array[i3 + 1] += Math.sin(state.clock.elapsedTime * 0.25 + i) * 0.0008;
      array[i3] += Math.cos(state.clock.elapsedTime * 0.18 + i) * 0.0008;
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
        size={0.03}
        sizeAttenuation
        transparent
        opacity={0.22}
        color="#2D5B72"
        depthWrite={false}
      />
    </points>
  );
}

/* 3-Layer Physically Based Incident Node */
function IncidentGraphNode({
  incident,
  position,
  isSelected,
  isHovered,
  isDimmed,
  isTopAnchor,
  onSelect,
  onHover,
}) {
  const group = useRef();
  const theme = getPriorityTheme(incident.priority);
  const risk = Number(incident.risk_score ?? incident.riskScore ?? 50);

  // Smooth risk scale: 0.55 -> 1.35 based on normalized risk
  const riskNormalized = Math.min(risk / 100, 1);
  const riskScale = THREE.MathUtils.lerp(0.55, 1.35, riskNormalized);
  const baseRadius = 0.12 * riskScale;

  const id = incident.incident_id || incident.id;
  const prioShort = String(incident.priority || 'P1').slice(0, 2).toUpperCase();
  const assetLabel = incident.asset_name || incident.hostname || incident.asset || 'CORP-HOST';

  useFrame((_, delta) => {
    if (!group.current) return;
    const targetScale = isSelected ? 1.25 : isHovered ? 1.10 : 1.0;
    group.current.scale.setScalar(
      THREE.MathUtils.damp(group.current.scale.x, targetScale, 10, delta)
    );
  });

  const showLabel = isHovered || isSelected || isTopAnchor;

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
      {/* Subtle Halo ONLY when Hovered or Selected */}
      {(isSelected || isHovered) && (
        <mesh scale={isSelected ? 1.75 : 1.35}>
          <sphereGeometry args={[baseRadius, 18, 18]} />
          <meshBasicMaterial
            color={theme.core}
            transparent
            opacity={isSelected ? 0.22 : 0.12}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* Crisp Solid Enterprise Node Core */}
      <mesh>
        <sphereGeometry args={[baseRadius, 24, 24]} />
        <meshStandardMaterial
          color={theme.core}
          emissive={theme.core}
          emissiveIntensity={isSelected ? 0.85 : isHovered ? 0.65 : 0.40}
          roughness={0.35}
          metalness={0.20}
        />
      </mesh>

      {/* Focused Accent Light on Selected only */}
      {isSelected && (
        <pointLight color={theme.core} intensity={0.9} distance={2.2} />
      )}


      {/* Monospace Spatial Label: Restrained, shown only on hover/select/top-anchor */}
      {showLabel && (
        <Html
          center
          distanceFactor={8.8}
          position={[0, baseRadius + 0.36, 0]}
          style={{ pointerEvents: 'none' }}
        >
          <div
            className={`spatial-node-label mono ${isSelected ? 'selected' : ''} ${
              isHovered ? 'hovered' : ''
            }`}
          >
            <div className="label-id-line">
              <span className="label-id">{id}</span>
              <span className="label-sep">&bull;</span>
              <span className={`label-prio ${prioShort.toLowerCase()}`}>{prioShort}</span>
              <span className="label-sep">&bull;</span>
              <span className="label-risk">{risk.toFixed(1)}</span>
            </div>
            {isSelected && (
              <div className="label-asset-line">{assetLabel}</div>
            )}
          </div>
        </Html>
      )}
    </group>
  );
}

/* Drilldown overlay: Displays underlying alert signals and entity pivots around selected incident */
function IncidentDrilldownOverlay({ drilldown, selectedIncident }) {
  if (!selectedIncident) return null;

  // Center coordinate for focused forensic drilldown
  const cx = 0;
  const cy = 0;
  const cz = 0;

  const entityNodes = useMemo(() => {
    if (drilldown?.nodes && drilldown.nodes.length > 0) {
      return drilldown.nodes.filter((n) => n.type && n.type.startsWith('ENTITY_'));
    }
    // Fallback: extract from selectedIncident directly
    const nodes = [];
    const host = selectedIncident.hostname || selectedIncident.primary_asset || selectedIncident.asset;
    if (host) {
      nodes.push({ id: `HOST:${host}`, type: 'ENTITY_HOST', title: 'Host', label: host });
    }
    const user = selectedIncident.user;
    if (user) {
      nodes.push({ id: `USER:${user}`, type: 'ENTITY_USER', title: 'User Account', label: user });
    }
    const ip = selectedIncident.source_ip || selectedIncident.external_ip || selectedIncident.destination_ip;
    if (ip) {
      nodes.push({ id: `IP:${ip}`, type: 'ENTITY_IP', title: 'Threat IP', label: ip });
    }
    return nodes;
  }, [drilldown, selectedIncident]);

  const alertNodes = useMemo(() => {
    if (drilldown?.nodes && drilldown.nodes.length > 0) {
      return drilldown.nodes.filter((n) => n.type === 'ALERT');
    }
    if (Array.isArray(selectedIncident.alerts)) {
      return selectedIncident.alerts.slice(0, 8).map((a) => ({
        id: a.alert_id || a.id,
        type: 'ALERT',
        severity: a.severity || 'Medium',
      }));
    }
    return [];
  }, [drilldown, selectedIncident]);

  return (
    <group>
      {/* 1. Entity Pivot Nodes (Hosts, Users, Threat IPs) */}
      {entityNodes.map((ent, idx) => {
        const angle = (idx / Math.max(entityNodes.length, 1)) * Math.PI * 2;
        const x = cx + Math.cos(angle) * 1.5;
        const y = cy + Math.sin(angle) * 1.1;
        const z = cz + 0.15;

        const isUser = ent.type === 'ENTITY_USER';
        const isIp = ent.type === 'ENTITY_IP';
        const color = isUser ? '#C18A4A' : isIp ? '#B84D61' : '#57CFEF';

        return (
          <group key={ent.id} position={[x, y, z]}>
            <mesh>
              <sphereGeometry args={[0.075, 16, 16]} />
              <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} />
            </mesh>
            <Line
              points={[[cx, cy, cz], [x, y, z]]}
              color={color}
              transparent
              opacity={0.55}
              lineWidth={1.2}
            />
            <Html distanceFactor={14} center>
              <div className="drilldown-entity-badge mono" style={{ borderColor: color }}>
                <span className="entity-type-lbl">{ent.title}:</span>
                <span className="entity-val-lbl">{ent.label}</span>
              </div>
            </Html>
          </group>
        );
      })}

      {/* 2. Alert Telemetry Signal Nodes */}
      {alertNodes.map((alt, idx) => {
        const angle = (idx / Math.max(alertNodes.length, 1)) * Math.PI * 2 + 0.25;
        const x = cx + Math.cos(angle) * 2.5;
        const y = cy + Math.sin(angle) * 1.8;
        const z = cz - 0.2;

        const sev = String(alt.severity || 'Medium').toLowerCase();
        const sevColor =
          sev === 'critical'
            ? '#B84D61'
            : sev === 'high'
            ? '#C18A4A'
            : sev === 'low'
            ? '#77818A'
            : '#5C9480';

        return (
          <group key={alt.id} position={[x, y, z]}>
            <mesh>
              <sphereGeometry args={[0.045, 12, 12]} />
              <meshStandardMaterial color={sevColor} emissive={sevColor} emissiveIntensity={0.5} />
            </mesh>
            <Line
              points={[[cx, cy, cz], [x, y, z]]}
              color="#B9B3AA"
              transparent
              opacity={0.18}
              lineWidth={0.6}
            />
            <Html distanceFactor={14} center>
              <div className="drilldown-alert-badge mono">
                <span className="alt-id-lbl">{alt.id}</span>
                <span className={`alt-sev-pill ${sev}`}>{alt.severity}</span>
              </div>
            </Html>
          </group>
        );
      })}
    </group>
  );
}

/* Observable Correlation Entity Extractor */
function getIncidentEntities(inc) {
  const hosts = new Set();
  const users = new Set();
  const externalIps = new Set();

  if (inc.primary_asset) {
    const rawHost = inc.primary_asset.split(' ')[0].trim();
    if (rawHost && !rawHost.includes('AST-') && rawHost.length > 2) {
      hosts.add(rawHost);
    }
  }
  if (inc.hostname) hosts.add(inc.hostname.trim());

  if (inc.user && !inc.user.toUpperCase().includes('SYSTEM') && !inc.user.includes('Automated')) {
    users.add(inc.user.trim());
  }

  // Extract from nested alerts if present
  if (Array.isArray(inc.alerts)) {
    inc.alerts.forEach((alert) => {
      if (alert.hostname) hosts.add(alert.hostname.trim());
      if (alert.user && !alert.user.toUpperCase().includes('SYSTEM') && !alert.user.includes('Automated')) {
        users.add(alert.user.trim());
      }
      [alert.source_ip, alert.destination_ip].forEach((ip) => {
        if (!ip) return;
        const clean = ip.trim();
        if (
          !clean.startsWith('10.') &&
          !clean.startsWith('192.168.') &&
          !clean.startsWith('127.') &&
          !clean.startsWith('172.16.')
        ) {
          externalIps.add(clean);
        }
      });
    });
  }

  return {
    hosts: Array.from(hosts),
    users: Array.from(users),
    externalIps: Array.from(externalIps),
    scenarioId: inc.scenario_id || null,
  };
}

/* Pairwise Observable Correlation Evidence Finder */
function findCorrelationEvidence(incA, incB) {
  const entA = getIncidentEntities(incA);
  const entB = getIncidentEntities(incB);

  // 1. Shared User (Identity pivot)
  for (const u of entA.users) {
    if (entB.users.includes(u)) {
      return {
        type: 'USER',
        title: 'Shared user',
        label: u,
        color: '#C58A52', // Warm copper
      };
    }
  }

  // 2. Shared Host (Infrastructure pivot)
  for (const h of entA.hosts) {
    if (entB.hosts.includes(h)) {
      return {
        type: 'HOST',
        title: 'Shared host',
        label: h,
        color: '#57CFEF', // Cyan / Slate
      };
    }
  }

  // 3. Shared External IP (Adversary infrastructure pivot)
  for (const ip of entA.externalIps) {
    if (entB.externalIps.includes(ip)) {
      return {
        type: 'EXTERNAL IP',
        title: 'Shared external IP',
        label: ip,
        color: '#B64A5F', // Burgundy / P1
      };
    }
  }

  // 4. Shared Attack Campaign Scenario
  if (entA.scenarioId && entA.scenarioId === entB.scenarioId) {
    return {
      type: 'CAMPAIGN',
      title: 'Shared attack campaign',
      label: entA.scenarioId,
      color: '#E0A854', // Muted Gold
    };
  }

  return null;
}

/* 3D Curved Relationship Arcs strictly powered by AUTHORITATIVE backend correlation evidence */
function CurvedGraphRelationships({
  incidents,
  authoritativeEdges = [],
  selectedIncident,
  hoveredIncident,
  edgeCurvesRef,
  onReviewEdge,
}) {
  const [hoveredEdgeId, setHoveredEdgeId] = useState(null);

  const edges = useMemo(() => {
    const list = [];
    const positionsMap = {};
    incidents.forEach((inc) => {
      const id = inc.incident_id || inc.id;
      positionsMap[id] = new THREE.Vector3(...getIncident3DPosition(inc));
    });

    // Authoritative edges sourced directly from backend /api/graph
    if (Array.isArray(authoritativeEdges) && authoritativeEdges.length > 0) {
      authoritativeEdges.forEach((e) => {
        const pA = positionsMap[e.source];
        const pB = positionsMap[e.target];
        if (!pA || !pB) return;

        const dist = pA.distanceTo(pB);
        const mid = new THREE.Vector3().addVectors(pA, pB).multiplyScalar(0.5);
        // Subtle depth bow outward toward camera
        mid.z += Math.min(dist * 0.12, 0.45);
        const curve = new THREE.QuadraticBezierCurve3(pA, mid, pB);
        const curvePoints = curve.getPoints(20);

        list.push({
          id: e.id || `${e.source}--${e.target}`,
          idA: e.source,
          idB: e.target,
          pA,
          pB,
          mid,
          curve,
          curvePoints,
          dist,
          evidence: e.evidence || [],
          primaryType: e.primary_evidence_type || 'HOST',
        });
      });
    }

    if (edgeCurvesRef) {
      edgeCurvesRef.current = list;
    }
    return list;
  }, [incidents, authoritativeEdges, edgeCurvesRef]);

  const activeId = selectedIncident?.incident_id || selectedIncident?.id;
  const hoverId = hoveredIncident?.incident_id || hoveredIncident?.id;

  const getEdgeColor = (type, isHighlighted) => {
    if (isHighlighted) {
      return '#5EA8BF'; // Refined slightly brighter restrained blue-teal on hover
    }
    // Restrained blue/teal/slate at rest (clearly visible, subtle)
    switch (type) {
      case 'USER':
        return '#4E7E8E'; // Restrained soft blue-teal
      case 'EXTERNAL IP':
        return '#456B7D'; // Restrained slate-teal
      case 'TIME WINDOW':
        return '#385360'; // Subtle dark slate-blue
      case 'HOST':
      default:
        return '#3E687A'; // Restrained deep blue/teal/slate
    }
  };

  return (
    <group>
      {edges.map((edge) => {
        const isSelectedEdge = activeId && (edge.idA === activeId || edge.idB === activeId);
        const isHoveredIncidentEdge = hoverId && (edge.idA === hoverId || edge.idB === hoverId);
        const isDirectlyHovered = hoveredEdgeId === edge.id;

        const isHighlighted = isSelectedEdge || isHoveredIncidentEdge || isDirectlyHovered;

        let opacity = 0.28;
        let color = getEdgeColor(edge.primaryType, isHighlighted);
        let lineWidth = 0.85;

        if (isHighlighted) {
          opacity = 0.75;
          lineWidth = 1.5;
        } else if (activeId) {
          opacity = 0.04;
        }

        return (
          <group key={edge.id}>
            {/* The visible curved correlation line */}
            <Line
              points={edge.curvePoints}
              color={color}
              transparent
              opacity={opacity}
              lineWidth={lineWidth}
            />

            {/* Invisible hover hit-zone sphere at midpoint */}
            <mesh
              position={[edge.mid.x, edge.mid.y, edge.mid.z]}
              onPointerOver={(e) => {
                e.stopPropagation();
                setHoveredEdgeId(edge.id);
              }}
              onPointerOut={(e) => {
                e.stopPropagation();
                setHoveredEdgeId(null);
              }}
            >
              <sphereGeometry args={[0.35, 8, 8]} />
              <meshBasicMaterial transparent opacity={0} depthWrite={false} />
            </mesh>

            {/* Compact Observable Correlation Evidence Card on Hover/Selection */}
            {(isDirectlyHovered || (isSelectedEdge && edge.dist < 6.0)) && (
              <Html position={[edge.mid.x, edge.mid.y, edge.mid.z]} center distanceFactor={14}>
                <div className="edge-evidence-tooltip mono">
                  <div className="tooltip-eyebrow">CORRELATION EVIDENCE</div>
                  {edge.evidence && edge.evidence.length > 0 ? (
                    edge.evidence.map((ev, i) => (
                      <div key={i} className="tooltip-entry">
                        <span className="tooltip-type">{ev.title || ev.type}:</span>
                        <span className="tooltip-val">{ev.value}</span>
                      </div>
                    ))
                  ) : (
                    <div className="tooltip-entry">
                      <span className="tooltip-val">Observable Link</span>
                    </div>
                  )}

                  {/* Explicit Review Action (Part 6 & 7) */}
                  <div className="tooltip-review-action">
                    <button
                      type="button"
                      className="edge-review-btn mono sentinel-interactive-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        onReviewEdge?.(edge);
                      }}
                    >
                      [ REVIEW ]
                    </button>
                  </div>
                </div>
              </Html>
            )}
          </group>
        );
      })}
    </group>
  );
}

/* Moving Evidence Telemetry Particles along connected curves */
function EvidenceTelemetryParticles({ edgeCurvesRef, selectedIncident }) {
  const pointsRef = useRef();
  const particleCount = 12;

  const particleData = useMemo(() => {
    return Array.from({ length: particleCount }, (_, idx) => ({
      edgeIndex: idx,
      progress: (idx / particleCount) * 1.0,
      speed: 0.18 + (idx % 3) * 0.08,
    }));
  }, [particleCount]);

  const positions = useMemo(() => new Float32Array(particleCount * 3), [particleCount]);

  useFrame((state, delta) => {
    if (!pointsRef.current || !edgeCurvesRef.current || !edgeCurvesRef.current.length) return;
    const edges = edgeCurvesRef.current;
    const array = pointsRef.current.geometry.attributes.position.array;

    const activeId = selectedIncident?.incident_id || selectedIncident?.id;
    // Prefer active edges if selection exists
    const activeEdges = activeId
      ? edges.filter((e) => e.idA === activeId || e.idB === activeId)
      : edges;

    if (!activeEdges.length) return;

    for (let i = 0; i < particleCount; i++) {
      const p = particleData[i];
      p.progress = (p.progress + delta * p.speed) % 1.0;
      const targetEdge = activeEdges[i % activeEdges.length];
      const pt = targetEdge.curve.getPoint(p.progress);

      const i3 = i * 3;
      array[i3] = pt.x;
      array[i3 + 1] = pt.y;
      array[i3 + 2] = pt.z;
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.030}
        sizeAttenuation
        transparent
        opacity={0.38}
        color="#4A8A9E"
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

/* Camera Controller: Smooth pointer parallax & focus target */
function ParallaxCameraController({ selectedIncident, controlsRef }) {
  const { camera } = useThree();
  const baseTarget = useMemo(() => new THREE.Vector3(0, 0, 0), []);
  const baseCamPos = useMemo(() => new THREE.Vector3(0, 0.2, 9.2), []);

  useEffect(() => {
    if (!controlsRef.current) return;
    if (selectedIncident) {
      const p = getIncident3DPosition(selectedIncident);
      controlsRef.current.target.set(p[0], p[1], p[2]);
    } else {
      controlsRef.current.target.copy(baseTarget);
    }
  }, [selectedIncident, controlsRef, baseTarget]);

  // Gentle pointer parallax on camera position
  useFrame((state, delta) => {
    if (selectedIncident) return; // Freeze parallax when inspecting a focused node
    const targetX = state.pointer.x * 0.12;
    const targetY = state.pointer.y * 0.08;

    camera.position.x = THREE.MathUtils.damp(camera.position.x, baseCamPos.x + targetX, 3.5, delta);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, baseCamPos.y + targetY, 3.5, delta);
  });

  return null;
}

/* Main Dedicated 3D Incident Intelligence Map Panel */
export function IncidentMapPanel({
  incidents = [],
  selectedIncident,
  onSelectIncident,
  loading = false,
  error = null,
  onRetry,
}) {
  const [hoveredNode, setHoveredNode] = useState(null);
  const [authoritativeGraph, setAuthoritativeGraph] = useState(null);
  const [reviewingEdge, setReviewingEdge] = useState(null);
  const controlsRef = useRef();
  const edgeCurvesRef = useRef([]);

  // Fetch authoritative graph contract directly from backend /api/graph
  useEffect(() => {
    let isMounted = true;
    const targetId = selectedIncident?.incident_id || selectedIncident?.id;
    const url = targetId
      ? `http://127.0.0.1:8000/api/graph?incident_id=${targetId}`
      : 'http://127.0.0.1:8000/api/graph';

    fetch(url)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (isMounted && data && data.status === 'success') {
          setAuthoritativeGraph(data);
        }
      })
      .catch((err) => {
        console.warn('[IncidentMapPanel] Authoritative graph fetch failed:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedIncident]);

  // Top anchor incident (highest risk foreground node)
  const topAnchorId = useMemo(() => {
    if (!incidents.length) return null;
    const sorted = [...incidents].sort(
      (a, b) => Number(b.risk_score ?? 0) - Number(a.risk_score ?? 0)
    );
    return sorted[0]?.incident_id || sorted[0]?.id;
  }, [incidents]);

  const activeId = selectedIncident?.incident_id || selectedIncident?.id;

  return (
    <div className="incident-intelligence-panel" aria-label="Incident Intelligence Map">
      {/* Header: Clean Enterprise Typography & Distinct View A / View B Labeling */}
      <div className="map-panel-header flex-between">
        <div className="map-title-group">
          <div className="map-eyebrow-tag mono">
            {selectedIncident ? 'INCIDENT DRILLDOWN' : 'INCIDENT OVERVIEW'}
          </div>
          <div className="map-sub-title">
            {selectedIncident ? `${activeId} FORENSIC ENTITY GRAPH` : '15 PRODUCTION INCIDENTS • CORRELATION TOPOLOGY'}
          </div>
        </div>

        <div className="map-header-right align-center">
          {/* Explicit View Switcher */}
          <div className="map-view-switcher mono">
            <button
              className={`view-toggle-pill ${!selectedIncident ? 'active' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                onSelectIncident?.(null);
              }}
              title="View all 15 production incidents and correlation topology"
            >
              15 INCIDENTS
            </button>
            <button
              className={`view-toggle-pill ${selectedIncident ? 'active' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                if (!selectedIncident && incidents.length > 0) {
                  onSelectIncident?.(incidents[0]);
                }
              }}
              title="Forensic entity drilldown (root incident -> host -> user -> external IP -> correlated alerts)"
            >
              {selectedIncident ? `${activeId} DRILLDOWN` : 'DRILLDOWN'}
            </button>
          </div>

          <div className="map-badge-count mono">
            <span className="live-dot-green" />
            <span>
              {loading
                ? 'SYNCING...'
                : selectedIncident
                ? `DRILLDOWN: ${activeId}`
                : `${incidents.length} PRODUCTION INCIDENTS`}
            </span>
          </div>
        </div>
      </div>

      {/* 3D WebGL Canvas: Isolated to this window */}
      <div className="map-viewport-stage">
        {loading ? (
          <div className="map-status-overlay loading mono">
            <div className="map-loading-spinner" />
            <span>LOADING INCIDENT INTELLIGENCE</span>
          </div>
        ) : error ? (
          <div className="map-status-overlay error mono">
            <span className="error-title">INCIDENT DATA UNAVAILABLE</span>
            <span className="error-desc">{error}</span>
            {onRetry && (
              <button className="map-retry-btn mono" onClick={onRetry}>
                RETRY
              </button>
            )}
          </div>
        ) : incidents.length === 0 ? (
          <div className="map-status-overlay empty mono">
            <span>NO INCIDENTS AVAILABLE</span>
          </div>
        ) : (
          <Canvas
            dpr={[1, 1.5]}
            camera={{
              position: [0, 0.2, 9.2],
              fov: 42,
              near: 0.1,
              far: 40,
            }}
            gl={{
              antialias: true,
              alpha: true,
              powerPreference: 'high-performance',
            }}
            onPointerMissed={() => onSelectIncident?.(null)}
          >
            {/* Atmospheric Depth Fog: Far nodes softly fade into deep graphite */}
            <fog attach="fog" args={['#1E1D1B', 6, 18]} />

            {/* Ambient & Directional Lighting */}
            <ambientLight intensity={0.52} color="#0C2538" />
            <directionalLight position={[3, 8, 5]} intensity={0.75} color="#55C9EA" />

            {/* Secondary Depth Points */}
            <SecondaryTelemetryField count={55} />

            {/* Authoritative Curved 3D Relationship Arcs from backend /api/graph (Shown in View A: 15 Incidents Overview) */}
            {!selectedIncident && (
              <CurvedGraphRelationships
                incidents={incidents}
                authoritativeEdges={authoritativeGraph?.edges || []}
                selectedIncident={selectedIncident}
                hoveredIncident={hoveredNode}
                edgeCurvesRef={edgeCurvesRef}
                onReviewEdge={setReviewingEdge}
              />
            )}

            {/* Evidence Flow Particles (Shown in View A) */}
            {!selectedIncident && (
              <EvidenceTelemetryParticles
                edgeCurvesRef={edgeCurvesRef}
                selectedIncident={selectedIncident}
              />
            )}

            {/* 3-Layer Incident Nodes:
                VIEW A: Render all 15 incidents across depth planes.
                VIEW B: Render the selected root incident at [0,0,0] as the anchor of the forensic entity tree. */}
            {incidents
              .filter((inc) => !selectedIncident || (inc.incident_id || inc.id) === activeId)
              .map((inc) => {
                const id = inc.incident_id || inc.id;
                const pos = selectedIncident ? [0, 0, 0] : getIncident3DPosition(inc);
                const isSel = activeId === id;
                const isHov = (hoveredNode?.incident_id || hoveredNode?.id) === id;
                const isDim = false;
                const isAnchor = id === topAnchorId;

                return (
                  <IncidentGraphNode
                    key={id}
                    incident={inc}
                    position={pos}
                    isSelected={isSel}
                    isHovered={isHov}
                    isDimmed={isDim}
                    isTopAnchor={isAnchor}
                    onSelect={onSelectIncident}
                    onHover={setHoveredNode}
                  />
                );
              })}

            {/* Forensic Drilldown Overlay when an incident is selected (VIEW B) */}
            {selectedIncident && (
              <IncidentDrilldownOverlay
                drilldown={authoritativeGraph?.drilldown}
                selectedIncident={selectedIncident}
              />
            )}

            <ParallaxCameraController
              selectedIncident={selectedIncident}
              controlsRef={controlsRef}
            />
            <OrbitControls
              ref={controlsRef}
              enableDamping
              dampingFactor={0.08}
              rotateSpeed={0.5}
              zoomSpeed={0.7}
              minDistance={3.5}
              maxDistance={16}
            />
          </Canvas>
        )}
      </div>

      {/* Footer Controls & Priority Legend */}
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

      {/* 3D Graph Correlation Human Review Modal (Part 6 & 7) */}
      {reviewingEdge && (
        <CorrelationReviewModal
          edgeData={reviewingEdge}
          onClose={() => setReviewingEdge(null)}
          onCorrelationReviewed={(res) => {
            console.log('[Correlation Review Logged]', res);
          }}
        />
      )}

      <style>{`
        .incident-intelligence-panel {
          position: relative;
          width: 100%;
          height: 100%;
          background: rgba(255, 255, 255, 0.055);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255, 255, 255, 0.11);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.18);
          border-radius: 8px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          pointer-events: auto;
          transition: border-color 220ms ease, box-shadow 220ms ease;
        }

        .incident-intelligence-panel:hover {
          border-color: rgba(255, 255, 255, 0.22);
          box-shadow: 0 24px 70px rgba(0, 0, 0, 0.30);
        }

        .map-panel-header {
          padding: 0.85rem 1.25rem;
          background: rgba(255, 255, 255, 0.045);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          align-items: center;
        }

        .map-eyebrow-tag {
          font-size: 0.64rem;
          font-weight: 700;
          letter-spacing: 0.18em;
          color: #C58A52;
        }

        .map-sub-title {
          font-size: 0.85rem;
          font-weight: 600;
          color: #F3EFE8;
          letter-spacing: -0.01em;
          margin-top: 0.15rem;
        }

        .map-header-right {
          display: flex;
          align-items: center;
          gap: 0.65rem;
        }

        .map-view-switcher {
          display: inline-flex;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 6px;
          padding: 2px;
          gap: 2px;
        }

        .view-toggle-pill {
          background: transparent;
          border: none;
          color: #B9B3AA;
          font-size: 0.60rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          padding: 0.22rem 0.55rem;
          border-radius: 4px;
          cursor: pointer;
          transition: all 160ms ease;
        }

        .view-toggle-pill:hover {
          color: #F3EFE8;
          background: rgba(255, 255, 255, 0.08);
        }

        .view-toggle-pill.active {
          background: #A96B42;
          color: #FFFFFF;
        }

        .map-badge-count {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          font-size: 0.65rem;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.10);
          padding: 0.25rem 0.6rem;
          border-radius: 999px;
          color: #F3EFE8;
        }

        .live-dot-green {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #5F9480;
          box-shadow: 0 0 8px rgba(95, 148, 128, 0.45);
        }

        .map-viewport-stage {
          flex: 1;
          position: relative;
          width: 100%;
          height: 100%;
          background: radial-gradient(circle at center, rgba(45, 43, 40, 0.35) 0%, rgba(36, 35, 33, 0.65) 100%);
        }

        .map-viewport-stage canvas {
          display: block;
          width: 100% !important;
          height: 100% !important;
        }

        .map-status-overlay {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          font-size: 0.72rem;
          letter-spacing: 0.12em;
          color: #C58A52;
          background: rgba(36, 35, 33, 0.90);
        }

        .map-loading-spinner {
          width: 24px;
          height: 24px;
          border: 2px solid rgba(197, 138, 82, 0.2);
          border-top-color: #C58A52;
          border-radius: 50%;
          animation: mapSpin 800ms linear infinite;
        }

        @keyframes mapSpin {
          to { transform: rotate(360deg); }
        }

        .map-status-overlay.error {
          color: #B64A5F;
        }

        .error-title {
          font-weight: 700;
        }

        .error-desc {
          font-size: 0.62rem;
          color: #B9B3AA;
        }

        .map-retry-btn {
          background: rgba(182, 74, 95, 0.15);
          border: 1px solid rgba(182, 74, 95, 0.35);
          color: #F3EFE8;
          padding: 0.35rem 0.85rem;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.65rem;
          font-weight: 700;
          transition: all 140ms ease;
        }

        .map-retry-btn:hover {
          background: #B64A5F;
          color: #ffffff;
        }

        .map-panel-footer {
          padding: 0.65rem 1.25rem;
          background: rgba(255, 255, 255, 0.045);
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          font-size: 0.62rem;
          color: #B9B3AA;
        }

        .map-hints { gap: 0.6rem; }
        .hint-chip b { color: #F3EFE8; font-weight: 600; }
        .hint-sep { opacity: 0.3; }
        .map-prio-legend { gap: 0.85rem; }
        .prio-dot-label { gap: 0.35rem; color: #B9B3AA; }

        .dot { width: 6px; height: 6px; border-radius: 50%; }
        .dot.p1 { background: #B64A5F; }
        .dot.p2 { background: #C58A52; }
        .dot.p3 { background: #5F9480; }
        .dot.p4 { background: #78828A; }

        /* Minimalist Monospace Spatial Node Labels */
        .spatial-node-label {
          background: rgba(45, 43, 40, 0.90);
          border: 1px solid rgba(255, 255, 255, 0.12);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          padding: 0.25rem 0.55rem;
          border-radius: 4px;
          display: flex;
          flex-direction: column;
          gap: 0.1rem;
          white-space: nowrap;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.30);
          transition: border-color 160ms ease, box-shadow 160ms ease;
        }

        .spatial-node-label.hovered {
          border-color: #C58A52;
          box-shadow: 0 0 16px rgba(197, 138, 82, 0.25);
        }

        .spatial-node-label.selected {
          border-color: #C58A52;
          background: rgba(45, 43, 40, 0.98);
          box-shadow: 0 0 20px rgba(197, 138, 82, 0.35);
        }

        .label-id-line {
          display: flex;
          align-items: center;
          gap: 0.3rem;
          font-size: 0.65rem;
        }

        .label-id {
          font-weight: 700;
          color: #F3EFE8;
        }

        .label-sep {
          opacity: 0.35;
          font-size: 0.5rem;
        }

        .label-prio.p1 { color: #B64A5F; font-weight: 700; }
        .label-prio.p2 { color: #C58A52; font-weight: 700; }
        .label-prio.p3 { color: #5F9480; font-weight: 700; }
        .label-prio.p4 { color: #78828A; }

        .label-risk {
          color: #B9B3AA;
          font-weight: 600;
        }

        .label-asset-line {
          font-size: 0.55rem;
          color: #C58A52;
        }

        /* Observable Correlation Evidence Hover Card */
        .edge-evidence-tooltip {
          background: rgba(29, 28, 26, 0.96);
          border: 1px solid rgba(255, 255, 255, 0.18);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.65), 0 0 14px rgba(169, 107, 66, 0.25);
          border-radius: 4px;
          padding: 0.4rem 0.75rem;
          pointer-events: none;
          white-space: nowrap;
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          text-align: left;
          animation: tooltipFadeIn 180ms ease both;
        }

        @keyframes tooltipFadeIn {
          from { opacity: 0; transform: translateY(4px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .edge-evidence-tooltip .tooltip-eyebrow {
          font-size: 0.54rem;
          font-weight: 700;
          letter-spacing: 0.16em;
          color: #A96B42;
          margin-bottom: 2px;
          text-transform: uppercase;
        }

        .edge-evidence-tooltip .tooltip-type {
          font-size: 0.62rem;
          color: #B9B3AA;
          margin-bottom: 2px;
        }

        .edge-evidence-tooltip .tooltip-value {
          font-size: 0.72rem;
          font-weight: 700;
          color: #F3EFE8;
          letter-spacing: -0.01em;
        }

        .tooltip-review-action {
          margin-top: 6px;
          padding-top: 5px;
          border-top: 1px solid rgba(255, 255, 255, 0.12);
          text-align: center;
        }

        .edge-review-btn {
          background: rgba(169, 107, 66, 0.22);
          border: 1px solid #A96B42;
          color: #F3EFE8;
          font-size: 0.60rem;
          font-weight: 800;
          padding: 3px 8px;
          border-radius: 3px;
          cursor: pointer;
          letter-spacing: 0.08em;
          transition: all 140ms ease;
        }

        .edge-review-btn:hover {
          background: #A96B42;
          color: #1D1C1A;
        }

        .map-view-reset-btn {
          background: rgba(184, 77, 97, 0.25);
          border: 1px solid rgba(184, 77, 97, 0.45);
          color: #F3EFE8;
          font-size: 0.55rem;
          padding: 0.15rem 0.45rem;
          border-radius: 3px;
          margin-left: 0.45rem;
          cursor: pointer;
          font-weight: 700;
          letter-spacing: 0.04em;
          transition: all 140ms ease;
        }

        .map-view-reset-btn:hover {
          background: #B84D61;
          color: #FFFFFF;
          border-color: #B84D61;
        }

        /* 3D Drilldown Badges */
        .drilldown-entity-badge {
          background: rgba(29, 28, 26, 0.95);
          border: 1px solid rgba(255, 255, 255, 0.22);
          border-radius: 4px;
          padding: 2px 6px;
          font-size: 0.52rem;
          color: #F3EFE8;
          white-space: nowrap;
          display: flex;
          gap: 4px;
          pointer-events: none;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
        }
        .entity-type-lbl { color: #B9B3AA; }
        .entity-val-lbl { color: #F3EFE8; font-weight: 600; }

        .drilldown-alert-badge {
          background: rgba(24, 23, 21, 0.90);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 3px;
          padding: 1px 4px;
          font-size: 0.48rem;
          color: #B9B3AA;
          white-space: nowrap;
          display: flex;
          gap: 3px;
          pointer-events: none;
        }
        .alt-sev-pill.critical { color: #B84D61; font-weight: 700; }
        .alt-sev-pill.high { color: #C18A4A; font-weight: 700; }
        .alt-sev-pill.medium { color: #5C9480; }
        .alt-sev-pill.low { color: #77818A; }
      `}</style>
    </div>
  );
}

export default IncidentMapPanel;
