# backend/mttt_calculator.py - MTTT Methodology Engine (Simulation vs Measured Test)
from typing import List, Optional
from models import Incident, MTTTMetrics, SimulationEstimate, MeasuredAnalystTest, TriageSessionRecord

# Configurable Industry Assumptions (Strictly labeled as assumptions, NOT measured results)
DEFAULT_ASSUMED_RAW_ALERT_MIN = 10.0
DEFAULT_ASSUMED_INCIDENT_MIN = 3.0

def calculate_simulation_estimate(
    total_raw_alerts: int,
    total_incidents: int,
    assumed_raw_min: float = DEFAULT_ASSUMED_RAW_ALERT_MIN,
    assumed_inc_min: float = DEFAULT_ASSUMED_INCIDENT_MIN
) -> SimulationEstimate:
    """
    Mode 1: SIMULATION / ESTIMATE
    Provides a mathematical projection based purely on configurable industry baseline assumptions.
    Never presents these numbers as field-measured analyst performance.
    """
    sim_base_hours = round((total_raw_alerts * assumed_raw_min) / 60.0, 2)
    sim_asst_hours = round((total_incidents * assumed_inc_min) / 60.0, 2)
    hours_saved = round(max(sim_base_hours - sim_asst_hours, 0.0), 2)
    pct_reduction = round(((sim_base_hours - sim_asst_hours) / sim_base_hours) * 100.0, 1) if sim_base_hours > 0 else 0.0

    return SimulationEstimate(
        assumed_raw_alert_time_min=assumed_raw_min,
        assumed_incident_time_min=assumed_inc_min,
        total_raw_alerts=total_raw_alerts,
        total_incidents=total_incidents,
        simulated_baseline_hours=sim_base_hours,
        simulated_assisted_hours=sim_asst_hours,
        simulated_hours_saved=hours_saved,
        simulated_percentage_reduction=pct_reduction,
        label="Simulated Industry Assumption (Not Field Measured)"
    )

def calculate_measured_analyst_test(
    session_records: List[TriageSessionRecord]
) -> MeasuredAnalystTest:
    """
    Mode 2: MEASURED ANALYST TEST
    Derives MTTT strictly from actual recorded analyst trial sessions with start and end timestamps.
    Displays 'Not evaluated' until actual experimental measurements exist.
    """
    raw_sessions = [s for s in session_records if s.session_type == "raw_alert"]
    assisted_sessions = [s for s in session_records if s.session_type == "assisted_incident"]

    raw_count = len(raw_sessions)
    assisted_count = len(assisted_sessions)

    # If either baseline or assisted sessions are missing, status is strictly "Not evaluated"
    if raw_count == 0 or assisted_count == 0:
        measured_raw_mttt = round(sum(s.duration_seconds for s in raw_sessions) / raw_count, 1) if raw_count > 0 else None
        measured_asst_mttt = round(sum(s.duration_seconds for s in assisted_sessions) / assisted_count, 1) if assisted_count > 0 else None

        return MeasuredAnalystTest(
            evaluation_status="Not evaluated",
            has_measured_data=False,
            total_test_sessions=len(session_records),
            raw_sessions_count=raw_count,
            measured_baseline_mttt_seconds=measured_raw_mttt,
            assisted_sessions_count=assisted_count,
            measured_assisted_mttt_seconds=measured_asst_mttt,
            measured_difference_seconds=None,
            measured_percentage_reduction=None,
            sessions=session_records
        )

    # Both conditions have recorded trials: calculate actual empirical MTTT
    avg_raw_sec = sum(s.duration_seconds for s in raw_sessions) / raw_count
    avg_asst_sec = sum(s.duration_seconds for s in assisted_sessions) / assisted_count

    delta_sec = round(avg_raw_sec - avg_asst_sec, 1)
    pct_reduction = round(((avg_raw_sec - avg_asst_sec) / avg_raw_sec) * 100.0, 1) if avg_raw_sec > 0 else 0.0

    return MeasuredAnalystTest(
        evaluation_status="Evaluated (Empirical Data)",
        has_measured_data=True,
        total_test_sessions=len(session_records),
        raw_sessions_count=raw_count,
        measured_baseline_mttt_seconds=round(avg_raw_sec, 1),
        assisted_sessions_count=assisted_count,
        measured_assisted_mttt_seconds=round(avg_asst_sec, 1),
        measured_difference_seconds=delta_sec,
        measured_percentage_reduction=pct_reduction,
        sessions=session_records
    )

def calculate_mttt_metrics(
    total_raw_alerts: int,
    incidents: List[Incident],
    session_records: List[TriageSessionRecord],
    assumed_raw_min: float = DEFAULT_ASSUMED_RAW_ALERT_MIN,
    assumed_inc_min: float = DEFAULT_ASSUMED_INCIDENT_MIN
) -> MTTTMetrics:
    """
    Master calculator generating both Mode 1 (Simulation) and Mode 2 (Empirical Test).
    """
    total_incidents = len(incidents)
    sim_estimate = calculate_simulation_estimate(total_raw_alerts, total_incidents, assumed_raw_min, assumed_inc_min)
    measured_test = calculate_measured_analyst_test(session_records)

    investigated = sum(1 for inc in incidents if inc.investigation_status in ["Confirmed", "Investigated"])
    pending = total_incidents - investigated

    return MTTTMetrics(
        simulation_estimate=sim_estimate,
        measured_analyst_test=measured_test,
        incidents_investigated=investigated,
        pending_incidents=pending
    )
