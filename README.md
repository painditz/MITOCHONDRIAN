# Microsoft Innovate 2026: Problem Statement #25
## "3,000 Alerts, One Analyst" — SentinelOps AI

### Problem Scenario
A Tier-1 analyst at a managed security provider (MSP) faces thousands of security alerts per day (~3,000 daily), most of which are false positives or fragmented signals of common campaigns.

### Official Solution Implemented
An intelligent, explainable SOC alert triage platform that:
1. **Ingests** a batch of 3,000 security alerts.
2. **Normalizes** heterogeneous alert formats into a consistent schema.
3. **Groups** related alerts into cohesive multi-stage incidents with explicit correlation reasoning.
4. **Ranks** incidents by risk and **asset criticality** (ensuring critical enterprise assets outrank low-criticality assets regardless of raw alert count).
5. **Maps** incidents to MITRE ATT&CK techniques with verifiable telemetry evidence.
6. **Writes** a short, evidence-grounded incident handover brief for the next shift.
7. **Keeps a human in the loop** (advisory briefs with Confirm, Reject, Modify, Add Notes, and Mark Investigated controls; no automatic real-world remediation).
8. **Measures** the reduction in mean-time-to-triage (MTTT) through mathematically derived calculations based on actual dataset and session review metrics.

---

### Project Structure
```
MICROSOFT WINNER/
├── backend/
│   ├── app.py                 # FastAPI backend server (port 8000)
│   ├── models.py              # Pydantic schemas (RawAlert, NormalizedAlert, Incident, etc.)
│   ├── ingestion.py           # 3,000 synthetic alert dataset generator with official fields
│   ├── normalization.py       # Heterogeneous schema normalization pipeline
│   ├── correlation.py         # Disjoint-Set Union (DSU) graph clustering & grouping
│   ├── prioritization.py      # Asset criticality driven risk scoring & priority derivation
│   ├── mitre_mapper.py        # Evidence-backed MITRE ATT&CK mapping
│   ├── ai_briefer.py          # Evidence-grounded shift-handover brief generator
│   ├── mttt_calculator.py     # Real mathematical MTTT workload reduction calculator
│   └── tests/
│       └── test_pipeline.py   # Unit test suite verifying all 7 core requirements
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx            # Top navigation for official views & reset controls
│   │   │   ├── SocOverview.jsx       # View A: SOC Overview with live workload metrics
│   │   │   ├── IncidentQueue.jsx     # View B: Prioritized Incident Queue
│   │   │   ├── IncidentDetail.jsx    # View C: Incident Details, Briefs & Review Controls
│   │   │   ├── TriageImpact.jsx      # View D: Triage Impact & MTTT Measurement
│   │   │   └── RawAlertsExplorer.jsx # Raw Telemetry Lake Inspector (3,000 alerts)
│   │   ├── App.jsx                   # Main React view controller
│   │   └── index.css                 # Dark cyber SOC design system (Vanilla CSS)
│   └── index.html
├── start.js                   # Development launcher (starts backend + frontend)
└── package.json
```

---

### Verification & Unit Tests
Run the test suite:
```bash
python backend/tests/test_pipeline.py
```
Output:
```
[PASS] Test 1: Batch Alert Ingestion (3,000 alerts) Passed
[PASS] Test 2: Alert Normalization Passed
[PASS] Test 3: Correlation & Incident Grouping Passed
[PASS] Test 4: Asset Criticality Prioritization Passed
[PASS] Test 5: MITRE ATT&CK Mapping with Evidence Passed
[PASS] Test 6: AI Shift Handover Brief Passed
[PASS] Test 7: Real Mathematical MTTT Calculation Passed

ALL PROBLEM STATEMENT #25 TESTS PASSED SUCCESSFULLY!
```

---

### Running the Application
```bash
node start.js
```
* **Frontend UI**: [http://localhost:5173/](http://localhost:5173/)
* **Backend API**: [http://127.0.0.1:8000/api/overview](http://127.0.0.1:8000/api/overview)
* **API Documentation (Swagger)**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
