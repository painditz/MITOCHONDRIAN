# backend/ai_brief.py - Alias for ai_briefer.py to support both module naming conventions
from ai_briefer import (
    generate_shift_brief,
    enrich_incidents_with_briefs,
    extract_structured_evidence,
    generate_ai_synopsis,
    MODEL_NAME
)

__all__ = [
    "generate_shift_brief",
    "enrich_incidents_with_briefs",
    "extract_structured_evidence",
    "generate_ai_synopsis",
    "MODEL_NAME"
]
