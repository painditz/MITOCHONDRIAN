import React, {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html, Line, Sparkles } from "@react-three/drei";

/* ============================================================
   SENTINELOPS SPATIAL 3D SYSTEM
   Original implementation.
   No external site source/assets are used.
   ============================================================ */

const INCIDENT_POSITIONS = {
  "INC-101": [-5.2, 2.2, -1.8],
  "INC-102": [-1.0, 2.8, 0.0],
  "INC-103": [3.8, 2.0, -2.8],
  "INC-105": [5.5, -1.0, -1.0],
  "INC-106": [-3.8, -2.2, 0.8],
  "INC-108": [1.0, -2.2, -2.5],
  "INC-111": [-6.0, 0.0, -3.5],
  "INC-114": [4.8, 3.0, 2.0],
};

const PRIORITY_COLORS = {
  P1: "#ff3b4d",
  P2: "#ffb020",
  P3: "#42d6ff",
  P4: "#8b9aaa",
};

const FALLBACK_INCIDENTS = [
  {
    incident_id: "INC-101",
    priority: "P1",
    risk_score: 92.1,
    alert_count: 14,
    asset_name: "CORP-ENDPOINT",
    asset_criticality: "CRITICAL",
  },
  {
    incident_id: "INC-102",
    priority: "P1",
    risk_score: 96.4,
    alert_count: 10,
    asset_name: "CORP-EXCHANGE-ONLINE",
    asset_criticality: "CRITICAL",
  },
  {
    incident_id: "INC-103",
    priority: "P2",
    risk_score: 78.2,
    alert_count: 18,
    asset_name: "CORP-AD",
    asset_criticality: "HIGH",
  },
  {
    incident_id: "INC-105",
    priority: "P2",
    risk_score: 71.3,
    alert_count: 24,
    asset_name: "CORP-FILE-SERVER",
    asset_criticality: "HIGH",
  },
  {
    incident_id: "INC-106",
    priority: "P3",
    risk_score: 54.7,
    alert_count: 7,
    asset_name: "CORP-WORKSTATION",
    asset_criticality: "MEDIUM",
  },
  {
    incident_id: "INC-108",
    priority: "P1",
    risk_score: 88.5,
    alert_count: 21,
    asset_name: "CORP-IDENTITY",
    asset_criticality: "CRITICAL",
  },
  {
    incident_id: "INC-111",
    priority: "P3",
    risk_score: 46.8,
    alert_count: 8,
    asset_name: "CORP-ENDPOINT",
    asset_criticality: "MEDIUM",
  },
  {
    incident_id: "INC-114",
    priority: "P4",
    risk_score: 15.0,
    alert_count: 1452,
    asset_name: "CORP-TELEMETRY",
    asset_criticality: "MEDIUM",
  },
];

function normalizeIncident(raw) {
  const id =
    raw?.incident_id ||
    raw?.id ||
    raw?.incidentId ||
    raw?.incident?.incident_id;

  if (!id) return null;

  const risk = Number(
    raw?.risk_score ??
      raw?.risk ??
      raw?.score ??
      raw?.riskScore ??
      0
  );

  const priority =
    raw?.priority ||
    raw?.severity_priority ||
    (risk >= 80
      ? "P1"
      : risk >= 60
        ? "P2"
        : risk >= 40
          ? "P3"
          : "P4");

  return {
    ...raw,
    incident_id: id,
    risk_score: Number.isFinite(risk) ? risk : 0,
    priority,
    alert_count: Number(
      raw?.alert_count ??
        raw?.alertCount ??
        raw?.alerts?.length ??
        raw?.count ??
        0
    ),
    asset_name:
      raw?.asset_name ||
      raw?.asset ||
      raw?.asset_id ||
      "UNKNOWN ASSET",
    asset_criticality:
      raw?.asset_criticality ||
      raw?.criticality ||
      "UNKNOWN",
  };
}

function getColor(priority) {
  return PRIORITY_COLORS[priority] || PRIORITY_COLORS.P4;
}

/* ============================================================
   TELEMETRY PARTICLES
   ============================================================ */

function TelemetryField({ density = 1200 }) {
  const pointsRef = useRef();

  const { positions, velocities, seeds } = useMemo(() => {
    const pos = new Float32Array(density * 3);
    const vel = new Float32Array(density);
    const seed = new Float32Array(density);

    for (let i = 0; i < density; i++) {
      const i3 = i * 3;

      pos[i3] = (Math.random() - 0.5) * 25;
      pos[i3 + 1] = (Math.random() - 0.5) * 14;
      pos[i3 + 2] = (Math.random() - 0.5) * 18;

      vel[i] = 0.02 + Math.random() * 0.06;
      seed[i] = Math.random() * Math.PI * 2;
    }

    return {
      positions: pos,
      velocities: vel,
      seeds: seed,
    };
  }, [density]);

  useFrame((state, delta) => {
    const points = pointsRef.current;
    if (!points) return;

    const positionAttribute = points.geometry.attributes.position;
    const array = positionAttribute.array;

    const px = state.pointer.x * 8;
    const py = state.pointer.y * 5;

    for (let i = 0; i < density; i++) {
      const i3 = i * 3;

      let x = array[i3];
      let y = array[i3 + 1];
      let z = array[i3 + 2];

      const dx = x - px;
      const dy = y - py;
      const distance = Math.sqrt(dx * dx + dy * dy);

      /* Subtle pointer repulsion */
      if (distance < 3.5) {
        const force = (1 - distance / 3.5) * 0.18;

        x += (dx / Math.max(distance, 0.1)) * force;
        y += (dy / Math.max(distance, 0.1)) * force;
      }

      /* Slow telemetry drift */
      z += velocities[i] * delta;

      if (z > 9) z = -9;

      x += Math.sin(state.clock.elapsedTime * 0.15 + seeds[i]) * 0.0008;
      y += Math.cos(state.clock.elapsedTime * 0.12 + seeds[i]) * 0.0006;

      array[i3] = x;
      array[i3 + 1] = y;
      array[i3 + 2] = z;
    }

    positionAttribute.needsUpdate = true;
  });

  return (
    <points ref={pointsRef} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={density}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>

      <pointsMaterial
        size={0.028}
        sizeAttenuation
        transparent
        opacity={0.38}
        color="#8ca3b8"
        depthWrite={false}
      />
    </points>
  );
}

/* ============================================================
   INCIDENT NODE
   ============================================================ */

function IncidentNode({
  incident,
  selected,
  onSelect,
  onHover,
}) {
  const group = useRef();
  const mesh = useRef();
  const [hovered, setHovered] = useState(false);

  const position =
    INCIDENT_POSITIONS[incident.incident_id] || [0, 0, 0];

  const color = getColor(incident.priority);

  const radius = Math.max(
    0.075,
    Math.min(0.22, 0.07 + incident.risk_score / 700)
  );

  useFrame((state, delta) => {
    if (!group.current) return;

    const targetScale =
      selected ? 1.5 :
      hovered ? 1.22 :
      1;

    const next = THREE.MathUtils.damp(
      group.current.scale.x,
      targetScale,
      7,
      delta
    );

    group.current.scale.setScalar(next);

    const pulse =
      1 +
      Math.sin(
        state.clock.elapsedTime * 2.0 +
          position[0]
      ) *
        0.035;

    if (mesh.current) {
      mesh.current.scale.setScalar(
        hovered || selected ? pulse * 1.08 : pulse
      );
    }
  });

  return (
    <group
      ref={group}
      position={position}
      onPointerOver={(event) => {
        event.stopPropagation();
        setHovered(true);
        onHover?.(incident);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={(event) => {
        event.stopPropagation();
        setHovered(false);
        onHover?.(null);
        document.body.style.cursor = "default";
      }}
      onClick={(event) => {
        event.stopPropagation();
        onSelect(incident);
      }}
    >
      {/* Soft halo */}
      <mesh scale={selected ? 2.7 : hovered ? 2.1 : 1.7}>
        <sphereGeometry args={[radius, 16, 16]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={
            selected
              ? 0.12
              : hovered
                ? 0.09
                : 0.045
          }
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Main incident core */}
      <mesh ref={mesh}>
        <sphereGeometry
          args={[radius, 20, 20]}
        />

        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={
            selected ? 4.2 : hovered ? 3.2 : 1.8
          }
          roughness={0.22}
          metalness={0.35}
        />
      </mesh>

      {/* Tiny point light only on selected/hovered nodes */}
      {(hovered || selected) && (
        <pointLight
          color={color}
          intensity={selected ? 1.8 : 0.8}
          distance={3}
        />
      )}

      {/* Compact HTML tooltip */}
      {hovered && !selected && (
        <Html
          center
          distanceFactor={9}
          position={[0, radius + 0.28, 0]}
          style={{
            pointerEvents: "none",
          }}
        >
          <div className="sentinel-node-tooltip">
            <strong>{incident.incident_id}</strong>
            <span>
              {incident.priority} · RISK{" "}
              {Number(incident.risk_score).toFixed(1)}
            </span>
            <span>
              {incident.alert_count} ALERTS
            </span>
            <span>{incident.asset_name}</span>
          </div>
        </Html>
      )}

      {/* Persistent label for selected incident */}
      {selected && (
        <Html
          center
          distanceFactor={9}
          position={[0, radius + 0.38, 0]}
        >
          <div className="sentinel-selected-label">
            {incident.incident_id}
          </div>
        </Html>
      )}
    </group>
  );
}

/* ============================================================
   CORRELATION EDGES
   ============================================================ */

function CorrelationEdges({
  incidents,
  selectedIncident,
}) {
  const edges = useMemo(() => {
    const result = [];

    /*
      Visualization relationships are intentionally conservative.
      We only connect spatially related incidents rather than
      fabricating a dense mesh.
    */

    for (let i = 0; i < incidents.length; i++) {
      for (let j = i + 1; j < incidents.length; j++) {
        const a = incidents[i];
        const b = incidents[j];

        const pa =
          INCIDENT_POSITIONS[a.incident_id];

        const pb =
          INCIDENT_POSITIONS[b.incident_id];

        if (!pa || !pb) continue;

        const distance = new THREE.Vector3(
          ...pa
        ).distanceTo(
          new THREE.Vector3(...pb)
        );

        if (distance < 6.2) {
          result.push({
            a,
            b,
            pa,
            pb,
          });
        }
      }
    }

    return result;
  }, [incidents]);

  return (
    <group>
      {edges.map((edge) => {
        const active =
          !selectedIncident ||
          selectedIncident.incident_id ===
            edge.a.incident_id ||
          selectedIncident.incident_id ===
            edge.b.incident_id;

        return (
          <Line
            key={`${edge.a.incident_id}-${edge.b.incident_id}`}
            points={[edge.pa, edge.pb]}
            color={
              active
                ? "#60788b"
                : "#26323c"
            }
            transparent
            opacity={active ? 0.23 : 0.04}
            lineWidth={active ? 0.7 : 0.4}
          />
        );
      })}
    </group>
  );
}

/* ============================================================
   CAMERA
   ============================================================ */

function CameraController({
  selectedIncident,
}) {
  const { camera, pointer } = useThree();

  const overviewPosition = useMemo(
    () => new THREE.Vector3(0, 1.0, 14),
    []
  );

  const desiredPosition = useRef(
    overviewPosition.clone()
  );

  const desiredLookAt = useRef(
    new THREE.Vector3(0, 0, 0)
  );

  const currentLookAt = useRef(
    new THREE.Vector3(0, 0, 0)
  );

  useEffect(() => {
    if (selectedIncident) {
      const p =
        INCIDENT_POSITIONS[
          selectedIncident.incident_id
        ] || [0, 0, 0];

      desiredPosition.current.set(
        p[0] * 0.58,
        p[1] * 0.58 + 0.7,
        7.0
      );

      desiredLookAt.current.set(
        p[0],
        p[1],
        p[2]
      );
    } else {
      desiredPosition.current.copy(
        overviewPosition
      );

      desiredLookAt.current.set(0, 0, 0);
    }
  }, [selectedIncident, overviewPosition]);

  useFrame((_, delta) => {
    const pointerOffsetX =
      selectedIncident ? 0 : pointer.x * 0.7;

    const pointerOffsetY =
      selectedIncident ? 0 : pointer.y * 0.35;

    const targetX =
      desiredPosition.current.x +
      pointerOffsetX;

    const targetY =
      desiredPosition.current.y +
      pointerOffsetY;

    camera.position.x =
      THREE.MathUtils.damp(
        camera.position.x,
        targetX,
        4.5,
        delta
      );

    camera.position.y =
      THREE.MathUtils.damp(
        camera.position.y,
        targetY,
        4.5,
        delta
      );

    camera.position.z =
      THREE.MathUtils.damp(
        camera.position.z,
        desiredPosition.current.z,
        4.5,
        delta
      );

    currentLookAt.current.lerp(
      desiredLookAt.current,
      1 -
        Math.pow(0.002, delta)
    );

    camera.lookAt(
      currentLookAt.current
    );
  });

  return null;
}

/* ============================================================
   SCENE
   ============================================================ */

function SceneContents({
  incidents,
  selectedIncident,
  setSelectedIncident,
  setHoveredIncident,
}) {
  return (
    <>
      <color
        attach="background"
        args={["#05080b"]}
      />

      <fog
        attach="fog"
        args={["#05080b", 10, 28]}
      />

      <ambientLight intensity={0.18} />

      <directionalLight
        position={[2, 8, 8]}
        intensity={0.4}
      />

      <TelemetryField density={1200} />

      <Sparkles
        count={100}
        scale={[22, 12, 18]}
        size={0.7}
        speed={0.15}
        opacity={0.18}
        color="#7890a2"
      />

      <CorrelationEdges
        incidents={incidents}
        selectedIncident={selectedIncident}
      />

      {incidents.map((incident) => (
        <IncidentNode
          key={incident.incident_id}
          incident={incident}
          selected={
            selectedIncident?.incident_id ===
            incident.incident_id
          }
          onSelect={setSelectedIncident}
          onHover={setHoveredIncident}
        />
      ))}

      <CameraController
        selectedIncident={selectedIncident}
      />
    </>
  );
}

/* ============================================================
   INSPECTOR
   ============================================================ */

function IncidentInspector({
  incident,
  onClose,
}) {
  if (!incident) return null;

  const risk = Number(
    incident.risk_score || 0
  );

  return (
    <aside className="sentinel-inspector">
      <div className="sentinel-inspector-top">
        <div>
          <div className="sentinel-eyebrow">
            INCIDENT INVESTIGATION
          </div>

          <h2>{incident.incident_id}</h2>
        </div>

        <button
          className="sentinel-close"
          onClick={onClose}
        >
          ×
        </button>
      </div>

      <div className="sentinel-risk-row">
        <div>
          <span className="sentinel-priority">
            {incident.priority}
          </span>

          <span className="sentinel-muted">
            {incident.alert_count} alerts
          </span>
        </div>

        <strong>
          {risk.toFixed(1)}
        </strong>
      </div>

      <div className="sentinel-inspector-section">
        <span className="sentinel-label">
          ASSET
        </span>

        <strong>
          {incident.asset_name}
        </strong>

        <span className="sentinel-muted">
          {incident.asset_criticality}
        </span>
      </div>

      <div className="sentinel-inspector-section">
        <span className="sentinel-label">
          RISK CONTRIBUTION
        </span>

        <div className="sentinel-breakdown">
          <div>
            <span>
              Asset Criticality
            </span>
            <b>+{incident.asset_criticality === "CRITICAL" ? 45 : "—"}</b>
          </div>

          <div>
            <span>
              Peak Severity
            </span>
            <b>dynamic</b>
          </div>

          <div>
            <span>
              Kill-Chain Depth
            </span>
            <b>dynamic</b>
          </div>

          <div>
            <span>
              ML Relevance
            </span>
            <b>≤10</b>
          </div>

          <div>
            <span>
              Volume
            </span>
            <b>dynamic</b>
          </div>
        </div>
      </div>

      {(incident.mitre_techniques ||
        incident.mitre ||
        incident.mitre_mappings) && (
        <div className="sentinel-inspector-section">
          <span className="sentinel-label">
            MITRE ATT&CK
          </span>

          <div className="sentinel-mitre">
            {(
              incident.mitre_techniques ||
              incident.mitre ||
              incident.mitre_mappings ||
              []
            )
              .slice(0, 5)
              .map((technique, index) => (
                <span key={index}>
                  {typeof technique === "string"
                    ? technique
                    : technique.id ||
                      technique.technique ||
                      technique.name}
                </span>
              ))}
          </div>
        </div>
      )}

      <div className="sentinel-inspector-section">
        <span className="sentinel-label">
          AI SHIFT HANDOVER
        </span>

        <p className="sentinel-brief">
          {incident.ai_brief ||
            incident.brief ||
            incident.handover_brief ||
            "Evidence-grounded incident brief available in Incident Detail."}
        </p>
      </div>

      <div className="sentinel-review">
        <span className="sentinel-label">
          HUMAN REVIEW
        </span>

        <div className="sentinel-review-buttons">
          <button>Confirm</button>
          <button>Reject</button>
          <button>Modify</button>
          <button>Investigated</button>
        </div>
      </div>
    </aside>
  );
}

/* ============================================================
   MAIN COMPONENT
   ============================================================ */

export default function SentinelSpatial({
  incidents: suppliedIncidents,
  onIncidentSelect,
}) {
  const [selectedIncident, setSelectedIncident] =
    useState(null);

  const [hoveredIncident, setHoveredIncident] =
    useState(null);

  const incidents = useMemo(() => {
    const source =
      Array.isArray(suppliedIncidents) &&
      suppliedIncidents.length
        ? suppliedIncidents
        : FALLBACK_INCIDENTS;

    return source
      .map(normalizeIncident)
      .filter(Boolean);
  }, [suppliedIncidents]);

  const handleSelect = useCallback(
    (incident) => {
      setSelectedIncident(incident);
      onIncidentSelect?.(incident);
    },
    [onIncidentSelect]
  );

  return (
    <section className="sentinel-spatial">
      <div className="sentinel-webgl">
        <Canvas
          dpr={[1, 1.75]}
          camera={{
            position: [0, 1, 14],
            fov: 45,
            near: 0.1,
            far: 100,
          }}
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: "high-performance",
          }}
          onCreated={({ gl }) => {
            gl.setClearColor(
              new THREE.Color("#05080b"),
              1
            );
          }}
          onPointerMissed={() => {
            setSelectedIncident(null);
            onIncidentSelect?.(null);
          }}
        >
          <Suspense fallback={null}>
            <SceneContents
              incidents={incidents}
              selectedIncident={
                selectedIncident
              }
              setSelectedIncident={
                handleSelect
              }
              setHoveredIncident={
                setHoveredIncident
              }
            />
          </Suspense>
        </Canvas>
      </div>

      <div className="sentinel-spatial-content">
        <div className="sentinel-hero-copy">
          <div className="sentinel-eyebrow">
            SENTINELOPS AI · SECURITY OPERATIONS
          </div>

          <h1>
            3,000 ALERTS.
            <br />
            <span>ONE ANALYST.</span>
          </h1>

          <p>
            Turn alert chaos into
            incident intelligence.
          </p>

          <div className="sentinel-live">
            <span className="sentinel-live-dot" />
            TRIAGE CORE ACTIVE
          </div>
        </div>

        <div className="sentinel-system-hud">
          <div>
            <span>ALERTS</span>
            <b>3,000</b>
          </div>

          <div>
            <span>INCIDENTS</span>
            <b>15</b>
          </div>

          <div>
            <span>P1</span>
            <b>7</b>
          </div>

          <div>
            <span>P2</span>
            <b>2</b>
          </div>

          <div>
            <span>P3</span>
            <b>1</b>
          </div>

          <div>
            <span>P4</span>
            <b>5</b>
          </div>
        </div>

        {hoveredIncident &&
          !selectedIncident && (
            <div className="sentinel-hover-status">
              <span>
                INSPECT
              </span>

              <strong>
                {hoveredIncident.incident_id}
              </strong>

              <span>
                Click to investigate
              </span>
            </div>
          )}
      </div>

      <IncidentInspector
        incident={selectedIncident}
        onClose={() =>
          setSelectedIncident(null)
        }
      />

      <style>{`
        .sentinel-spatial {
          position: relative;
          width: 100%;
          height: 100vh;
          min-height: 700px;
          background-color: #05080b;
          color: #e2e8f0;
          overflow: hidden;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }

        .sentinel-webgl {
          position: absolute;
          inset: 0;
          z-index: 1;
        }

        .sentinel-spatial-content {
          position: relative;
          z-index: 2;
          pointer-events: none;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 2.5rem 3rem;
        }

        .sentinel-hero-copy {
          max-width: 480px;
        }

        .sentinel-eyebrow {
          font-size: 0.72rem;
          font-family: monospace;
          letter-spacing: 0.12em;
          color: #64748b;
          margin-bottom: 0.75rem;
        }

        .sentinel-hero-copy h1 {
          font-size: clamp(2.5rem, 5vw, 4.2rem);
          font-weight: 700;
          line-height: 1.05;
          letter-spacing: -0.03em;
          color: #f8fafc;
          margin: 0 0 1rem 0;
        }

        .sentinel-hero-copy h1 span {
          color: #38bdf8;
        }

        .sentinel-hero-copy p {
          font-size: 1.05rem;
          color: #94a3b8;
          margin: 0 0 1.25rem 0;
          line-height: 1.5;
        }

        .sentinel-live {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.70rem;
          font-family: monospace;
          color: #10b981;
          background: rgba(16, 185, 129, 0.08);
          border: 1px solid rgba(16, 185, 129, 0.25);
          padding: 0.25rem 0.65rem;
          border-radius: 9999px;
        }

        .sentinel-live-dot {
          width: 6px;
          height: 6px;
          background: #10b981;
          border-radius: 50%;
          box-shadow: 0 0 8px #10b981;
        }

        .sentinel-system-hud {
          display: flex;
          gap: 1.75rem;
          background: rgba(10, 15, 23, 0.75);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          padding: 0.75rem 1.5rem;
          border-radius: 6px;
          width: fit-content;
        }

        .sentinel-system-hud > div {
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
        }

        .sentinel-system-hud span {
          font-size: 0.62rem;
          font-family: monospace;
          color: #64748b;
          letter-spacing: 0.08em;
        }

        .sentinel-system-hud b {
          font-size: 1.1rem;
          font-family: monospace;
          color: #f1f5f9;
        }

        .sentinel-hover-status {
          position: absolute;
          bottom: 2.5rem;
          right: 3rem;
          background: rgba(15, 23, 42, 0.85);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(56, 189, 248, 0.3);
          padding: 0.65rem 1.25rem;
          border-radius: 6px;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.75rem;
          font-family: monospace;
        }

        .sentinel-hover-status strong {
          color: #38bdf8;
        }

        .sentinel-hover-status span {
          color: #64748b;
        }

        /* Tooltip in 3D Canvas */
        .sentinel-node-tooltip {
          background: rgba(10, 15, 23, 0.94);
          border: 1px solid rgba(255, 255, 255, 0.15);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.6);
          padding: 0.55rem 0.85rem;
          border-radius: 4px;
          color: #f8fafc;
          font-size: 0.68rem;
          font-family: monospace;
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
          white-space: nowrap;
          pointer-events: none;
        }

        .sentinel-node-tooltip strong {
          color: #38bdf8;
          font-size: 0.78rem;
        }

        .sentinel-selected-label {
          background: #38bdf8;
          color: #05080b;
          font-weight: 700;
          font-size: 0.65rem;
          font-family: monospace;
          padding: 0.15rem 0.45rem;
          border-radius: 3px;
          white-space: nowrap;
        }

        /* Inspector Drawer */
        .sentinel-inspector {
          position: absolute;
          top: 0;
          right: 0;
          bottom: 0;
          width: 380px;
          max-width: 90vw;
          background: rgba(7, 11, 17, 0.96);
          backdrop-filter: blur(12px);
          border-left: 1px solid rgba(255, 255, 255, 0.10);
          z-index: 10;
          display: flex;
          flex-direction: column;
          padding: 2rem 1.75rem;
          overflow-y: auto;
          gap: 1.5rem;
          box-shadow: -12px 0 36px rgba(0, 0, 0, 0.5);
          animation: inspectorSlide 220ms ease;
        }

        @keyframes inspectorSlide {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }

        .sentinel-inspector-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .sentinel-inspector-top h2 {
          font-size: 1.6rem;
          font-weight: 700;
          margin: 0;
          color: #f8fafc;
          font-family: monospace;
        }

        .sentinel-close {
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.15);
          color: #94a3b8;
          font-size: 1.25rem;
          width: 28px;
          height: 28px;
          border-radius: 4px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          line-height: 1;
        }

        .sentinel-close:hover {
          color: #f8fafc;
          border-color: rgba(255, 255, 255, 0.4);
        }

        .sentinel-risk-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 1rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .sentinel-risk-row strong {
          font-size: 2rem;
          font-family: monospace;
          color: #ff3b4d;
        }

        .sentinel-priority {
          font-family: monospace;
          font-weight: 700;
          color: #ff3b4d;
          background: rgba(255, 59, 77, 0.12);
          padding: 0.15rem 0.5rem;
          border-radius: 3px;
          margin-right: 0.65rem;
        }

        .sentinel-muted {
          font-size: 0.72rem;
          color: #64748b;
          font-family: monospace;
        }

        .sentinel-inspector-section {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .sentinel-label {
          font-size: 0.65rem;
          font-family: monospace;
          color: #64748b;
          letter-spacing: 0.08em;
        }

        .sentinel-breakdown {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
          font-size: 0.72rem;
          font-family: monospace;
          margin-top: 0.25rem;
        }

        .sentinel-breakdown > div {
          display: flex;
          justify-content: space-between;
          padding: 0.25rem 0;
          border-bottom: 1px dashed rgba(255, 255, 255, 0.06);
        }

        .sentinel-breakdown span {
          color: #94a3b8;
        }

        .sentinel-breakdown b {
          color: #38bdf8;
        }

        .sentinel-mitre {
          display: flex;
          flex-wrap: wrap;
          gap: 0.4rem;
          margin-top: 0.25rem;
        }

        .sentinel-mitre span {
          font-size: 0.65rem;
          font-family: monospace;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.10);
          padding: 0.2rem 0.5rem;
          border-radius: 3px;
          color: #cbd5e1;
        }

        .sentinel-brief {
          font-size: 0.80rem;
          line-height: 1.5;
          color: #cbd5e1;
          margin: 0;
          background: rgba(255, 255, 255, 0.03);
          border-left: 2px solid #38bdf8;
          padding: 0.65rem 0.85rem;
        }

        .sentinel-review {
          margin-top: auto;
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
          padding-top: 1rem;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
        }

        .sentinel-review-buttons {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.5rem;
        }

        .sentinel-review-buttons button {
          padding: 0.6rem 0.5rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.15);
          color: #e2e8f0;
          font-family: monospace;
          font-size: 0.70rem;
          cursor: pointer;
          border-radius: 4px;
          transition: all 140ms ease;
        }

        .sentinel-review-buttons button:first-child {
          background: #10b981;
          border-color: #10b981;
          color: #05080b;
          font-weight: 700;
        }

        .sentinel-review-buttons button:hover {
          filter: brightness(1.15);
        }
      `}</style>
    </section>
  );
}
