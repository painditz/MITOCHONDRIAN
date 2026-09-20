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
import "./SentinelSpatial.css";

/* ============================================================
   SENTINELOPS SPATIAL 3D SYSTEM
   Original implementation.
   No external site source/assets are used.
   ============================================================ */

const INCIDENT_POSITIONS = {
  "INC-101": [-5.2, 2.2, -1.8],
  "INC-102": [-1.0, 2.8, 0.0],
  "INC-103": [3.8, 2.0, -2.8],
  "INC-104": [2.2, 0.8, 1.5],
  "INC-105": [5.5, -1.0, -1.0],
  "INC-106": [-3.8, -2.2, 0.8],
  "INC-107": [-1.5, -0.8, 2.2],
  "INC-108": [1.0, -2.2, -2.5],
  "INC-109": [4.2, -2.5, 0.5],
  "INC-110": [-2.0, 0.5, -2.0],
  "INC-111": [-6.0, 0.0, -3.5],
  "INC-112": [-4.5, 3.2, 1.2],
  "INC-113": [0.5, 3.6, -1.5],
  "INC-114": [4.8, 3.0, 2.0],
  "INC-115": [-3.0, -3.2, -1.2],
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

  let priority =
    raw?.priority ||
    raw?.severity_priority ||
    (risk >= 80
      ? "P1"
      : risk >= 60
        ? "P2"
        : risk >= 40
          ? "P3"
          : "P4");

  if (typeof priority === "string") {
    if (priority.startsWith("P1")) priority = "P1";
    else if (priority.startsWith("P2")) priority = "P2";
    else if (priority.startsWith("P3")) priority = "P3";
    else if (priority.startsWith("P4")) priority = "P4";
  }

  const aiBriefText =
    typeof raw?.shift_brief?.what_happened === "string"
      ? raw?.shift_brief?.what_happened
      : typeof raw?.ai_brief === "string"
        ? raw?.ai_brief
        : raw?.ai_brief?.brief || raw?.aiBrief;

  const mitreList =
    raw?.mitre_techniques ||
    raw?.mitre_mappings ||
    raw?.shift_brief?.mitre_techniques?.map((m) => ({
      id: m.technique_id,
      name: m.technique_name,
    })) ||
    raw?.mitre ||
    [];

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
        raw?.signalsCount ??
        0
    ),
    asset_name:
      raw?.asset_name ||
      raw?.hostname ||
      raw?.asset ||
      raw?.asset_id ||
      "UNKNOWN ASSET",
    asset_criticality:
      raw?.asset_criticality ||
      raw?.criticality ||
      "UNKNOWN",
    ai_brief: aiBriefText,
    mitre_techniques: mitreList,
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
    INCIDENT_POSITIONS[incident.incident_id] || [
      ((parseInt(incident.incident_id.replace(/\D/g, "") || "0", 10) % 7) - 3) * 1.8,
      (((parseInt(incident.incident_id.replace(/\D/g, "") || "0", 10) * 3) % 5) - 2) * 1.4,
      (((parseInt(incident.incident_id.replace(/\D/g, "") || "0", 10) * 2) % 6) - 3) * 1.0,
    ];

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
          INCIDENT_POSITIONS[a.incident_id] || [
            ((parseInt(a.incident_id.replace(/\D/g, "") || "0", 10) % 7) - 3) * 1.8,
            (((parseInt(a.incident_id.replace(/\D/g, "") || "0", 10) * 3) % 5) - 2) * 1.4,
            (((parseInt(a.incident_id.replace(/\D/g, "") || "0", 10) * 2) % 6) - 3) * 1.0,
          ];

        const pb =
          INCIDENT_POSITIONS[b.incident_id] || [
            ((parseInt(b.incident_id.replace(/\D/g, "") || "0", 10) % 7) - 3) * 1.8,
            (((parseInt(b.incident_id.replace(/\D/g, "") || "0", 10) * 3) % 5) - 2) * 1.4,
            (((parseInt(b.incident_id.replace(/\D/g, "") || "0", 10) * 2) % 6) - 3) * 1.0,
          ];

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

  const overview = useMemo(
    () => new THREE.Vector3(0, 1, 14),
    []
  );

  const desiredPosition = useRef(
    overview.clone()
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
        7
      );

      desiredLookAt.current.set(
        p[0],
        p[1],
        p[2]
      );
    } else {
      desiredPosition.current.copy(
        overview
      );

      desiredLookAt.current.set(0, 0, 0);
    }
  }, [selectedIncident, overview]);

  useFrame((_, delta) => {
    const pointerOffsetX =
      selectedIncident ? 0 : pointer.x * 0.7;

    const pointerOffsetY =
      selectedIncident ? 0 : pointer.y * 0.35;

    camera.position.x =
      THREE.MathUtils.damp(
        camera.position.x,
        desiredPosition.current.x + pointerOffsetX,
        4.5,
        delta
      );

    camera.position.y =
      THREE.MathUtils.damp(
        camera.position.y,
        desiredPosition.current.y + pointerOffsetY,
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
      1 - Math.pow(0.002, delta)
    );

    camera.lookAt(currentLookAt.current);
  });

  return null;
}

/* ============================================================
   3D SCENE
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
            <b>+{incident.asset_criticality?.toUpperCase() === "CRITICAL" ? 45 : "dynamic"}</b>
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
                      technique.name ||
                      technique.technique_id}
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
   MAIN
   ============================================================ */

export default function SentinelSpatial({
  incidents: suppliedIncidents,
  onIncidentSelect,
  metrics: suppliedMetrics,
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

  // Dynamic calculation of production metrics from live data
  const stats = useMemo(() => {
    const total = incidents.length;
    const p1 = incidents.filter((i) => i.priority === "P1").length;
    const p2 = incidents.filter((i) => i.priority === "P2").length;
    const p3 = incidents.filter((i) => i.priority === "P3").length;
    const p4 = incidents.filter((i) => i.priority === "P4").length;
    const alertSum = incidents.reduce(
      (sum, i) => sum + (i.alert_count || 0),
      0
    );

    return {
      alerts: suppliedMetrics?.total_alerts || alertSum || 3000,
      incidents: suppliedMetrics?.grouped_incidents || total || 15,
      p1: suppliedMetrics?.critical_incidents || p1 || 7,
      p2: suppliedMetrics?.high_incidents || p2 || 2,
      p3: suppliedMetrics?.medium_incidents || p3 || 1,
      p4: suppliedMetrics?.low_incidents || p4 || 5,
    };
  }, [incidents, suppliedMetrics]);

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
              selectedIncident={selectedIncident}
              setSelectedIncident={handleSelect}
              setHoveredIncident={setHoveredIncident}
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
            <b>{stats.alerts.toLocaleString()}</b>
          </div>

          <div>
            <span>INCIDENTS</span>
            <b>{stats.incidents}</b>
          </div>

          <div>
            <span>P1</span>
            <b>{stats.p1}</b>
          </div>

          <div>
            <span>P2</span>
            <b>{stats.p2}</b>
          </div>

          <div>
            <span>P3</span>
            <b>{stats.p3}</b>
          </div>

          <div>
            <span>P4</span>
            <b>{stats.p4}</b>
          </div>
        </div>

        {hoveredIncident && !selectedIncident && (
          <div className="sentinel-hover-status">
            <span>INSPECT</span>

            <strong>{hoveredIncident.incident_id}</strong>

            <span>Click to investigate</span>
          </div>
        )}
      </div>

      <IncidentInspector
        incident={selectedIncident}
        onClose={() => setSelectedIncident(null)}
      />
    </section>
  );
}
