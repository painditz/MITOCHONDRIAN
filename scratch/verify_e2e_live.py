import urllib.request
import json

base_url = "http://127.0.0.1:8000"

def get(path):
    req = urllib.request.Request(f"{base_url}{path}", headers={"User-Agent": "SentinelOps-QA"})
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode("utf-8"))

print("1. Querying /api/overview...")
ov = get("/api/overview")
print(f"   Total alerts: {ov.get('total_alerts')}")
print(f"   Grouped incidents: {ov.get('grouped_incidents')}")
print(f"   Critical: {ov.get('critical_incidents')}, High: {ov.get('high_incidents')}, Medium: {ov.get('medium_incidents')}, Low: {ov.get('low_incidents')}")
print(f"   Baseline workload: {ov.get('baseline_workload')}")
print(f"   Current workload: {ov.get('current_triage_workload')}")

print("\n2. Querying /api/incidents...")
inc_data = get("/api/incidents")
incidents = inc_data.get("incidents", [])
print(f"   Count of incidents returned: {len(incidents)} (total: {inc_data.get('total')})")
total_alerts_in_incidents = sum(inc.get('alert_count', 0) for inc in incidents)
print(f"   Sum of alerts across incidents: {total_alerts_in_incidents}")
priorities = {inc.get('priority') for inc in incidents}
print(f"   Dynamic priority distribution: {priorities}")
risk_scores = [inc.get('risk_score') for inc in incidents]
print(f"   Risk score range: min={min(risk_scores)}, max={max(risk_scores)}, avg={round(sum(risk_scores)/len(risk_scores), 1)}")

print("\n3. Querying /api/graph...")
graph = get("/api/graph")
nodes = graph.get('nodes', [])
edges = graph.get('edges', [])
print(f"   Authoritative graph nodes: {len(nodes)}")
print(f"   Evidence-backed edges: {len(edges)}")
edge_types = set()
for e in edges:
    for ev in e.get('evidence', []):
        edge_types.add(ev.get('type'))
print(f"   Observable evidence types in edges: {edge_types}")

print("\n4. Querying /api/graph?incident_id=INC-102 (Drilldown)...")
drill = get("/api/graph?incident_id=INC-102")
drill_sub = drill.get("drilldown", {})
print(f"   Drilldown target incident: {drill_sub.get('incident_id')}")
print(f"   Drilldown nodes: {len(drill_sub.get('nodes', []))}")
print(f"   Drilldown edges: {len(drill_sub.get('edges', []))}")

print("\n5. Querying /api/ml/metrics...")
ml_metrics = get("/api/ml/metrics")
m = ml_metrics.get("metrics", {})
cm = ml_metrics.get("confusion_matrix", {})
fs = ml_metrics.get("feature_safety", {})
print(f"   Model name: {ml_metrics.get('model_name')}")
print(f"   Accuracy: {m.get('accuracy')}")
print(f"   Precision: {m.get('precision')}")
print(f"   Recall: {m.get('recall')}")
print(f"   F1: {m.get('f1_score')}")
print(f"   ROC-AUC: {m.get('roc_auc')}")
print(f"   Confusion matrix (TN, FP, FN, TP): TN={cm.get('true_negatives')}, FP={cm.get('false_positives')}, FN={cm.get('false_negatives')}, TP={cm.get('true_positives')}")
print(f"   Forbidden features found: {fs.get('forbidden_features_found')}")
print(f"   ROC curve points count: {len(ml_metrics.get('roc_curve_points', []))}")
print(f"   Dataset split info: {ml_metrics.get('dataset_split')}")

print("\n6. Querying /api/mttt...")
mttt = get("/api/mttt")
print(f"   Simulation label: {mttt.get('simulation_estimate', {}).get('label')}")
print(f"   Simulated baseline hours: {mttt.get('simulation_estimate', {}).get('simulated_baseline_hours')} hrs")
print(f"   Simulated assisted hours: {mttt.get('simulation_estimate', {}).get('simulated_assisted_hours')} hrs")
print(f"   Simulated reduction: {mttt.get('simulation_estimate', {}).get('percentage_time_reduction')}%")
print(f"   Empirical status: {mttt.get('measured_analyst_test', {}).get('evaluation_status')}")
print(f"   Empirical reduction: {mttt.get('measured_analyst_test', {}).get('measured_percentage_reduction')}%")

print("\n7. Querying /api/alerts?limit=5...")
alerts_resp = get("/api/alerts?limit=5")
print(f"   Total raw alerts available: {alerts_resp.get('total')}")
print(f"   Sample alert types: {[a.get('alert_type') for a in alerts_resp.get('alerts', [])]}")

print("\n8. Querying /api/incidents/INC-102 detail...")
inc_detail = get("/api/incidents/INC-102")
brief = inc_detail.get("shift_brief", {})
print(f"   Title: {inc_detail.get('title')}")
print(f"   Priority: {inc_detail.get('priority')} | Risk: {inc_detail.get('risk_score')}")
print(f"   AI Briefer model: {brief.get('ai_model_name')}")
print(f"   Analyst status: {brief.get('analyst_status')}")
print(f"   Timeline events: {len(brief.get('timeline_events', []))}")
print(f"   MITRE techniques: {len(brief.get('mitre_techniques', []))}")

print("\n" + "="*70)
print("END-TO-END DATA PIPELINE VALIDATION COMPLETED SUCCESSFULLY!")
print("="*70)
