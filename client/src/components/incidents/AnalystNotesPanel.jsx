// client/src/components/incidents/AnalystNotesPanel.jsx
// SentinelOps AI - Human-in-the-Loop 2.0 Persistent Analyst Notes
// Chronological notes history without overwriting previous entries.
import React, { useState } from 'react';
import { MessageSquare, Send } from 'lucide-react';

export function AnalystNotesPanel({ incident, onNoteAdded }) {
  const [noteText, setNoteText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!incident) return null;

  const id = incident.incident_id || incident.id;
  const notes = incident.structured_notes || [];

  // Fallback if legacy analyst_notes array has strings not in structured_notes
  const legacyNotes = (incident.shift_brief?.analyst_notes || []).map((text, idx) => ({
    id: `LEGACY-${idx}`,
    author: 'SOC Analyst',
    timestamp: incident.start_time || 'Past session',
    text
  }));

  const allNotes = notes.length > 0 ? notes : legacyNotes;

  const handleSaveNote = async (e) => {
    if (e) e.preventDefault();
    if (!noteText.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/incidents/${id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          note: noteText.trim(),
          author: 'Analyst Marcus (SOC Tier-1)'
        })
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      setNoteText('');
      if (onNoteAdded) onNoteAdded(data);
    } catch (err) {
      console.error('[AnalystNotes Error]', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatNoteTime = (ts) => {
    if (!ts) return '';
    try {
      const d = new Date(ts);
      if (isNaN(d.getTime())) return ts;
      return d.toUTCString().slice(17, 25) + ' UTC';
    } catch {
      return ts;
    }
  };

  return (
    <div className="analyst-notes-panel-root mono">
      <div className="anp-header flex-between align-center">
        <div className="align-center" style={{ gap: '0.45rem' }}>
          <MessageSquare size={13} className="text-copper" />
          <span className="anp-title">ANALYST NOTES</span>
        </div>
        <span className="anp-count">{allNotes.length} PERSISTENT ENTRIES</span>
      </div>

      <div className="anp-notes-list">
        {allNotes.length === 0 ? (
          <div className="no-notes-state">NO ANALYST NOTES YET</div>
        ) : (
          allNotes.map((n, idx) => (
            <div key={n.id || idx} className="note-card">
              <div className="note-meta-row flex-between">
                <span className="note-author">{n.author || 'Analyst'}</span>
                <span className="note-time">{formatNoteTime(n.timestamp)}</span>
              </div>
              <p className="note-content">{n.text}</p>
            </div>
          ))
        )}
      </div>

      {/* Note input form */}
      <form onSubmit={handleSaveNote} className="anp-input-form">
        <textarea
          className="anp-textarea"
          rows={2}
          placeholder="Enter investigation note (e.g. host isolated, user password reset)..."
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
        />
        <div className="form-bottom-row flex-between align-center">
          <span className="author-tag">AUTHOR: Analyst Marcus (SOC Tier-1)</span>
          <button
            type="submit"
            className="save-note-btn align-center"
            disabled={isSubmitting || !noteText.trim()}
          >
            <Send size={11} />
            {isSubmitting ? 'SAVING...' : 'SAVE NOTE'}
          </button>
        </div>
      </form>

      <style>{`
        .analyst-notes-panel-root {
          background: #1D1C1A;
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 6px;
          padding: 1.15rem;
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
          color: #F3EFE8;
        }

        .anp-header {
          padding-bottom: 0.65rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }
        .text-copper {
          color: #A96B42;
        }
        .anp-title {
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          color: #F3EFE8;
        }
        .anp-count {
          font-size: 0.58rem;
          color: #817B73;
        }

        .anp-notes-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          max-height: 200px;
          overflow-y: auto;
          padding-right: 0.35rem;
        }

        .note-card {
          background: #242321;
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 4px;
          padding: 0.55rem 0.75rem;
          display: flex;
          flex-direction: column;
          gap: 0.3rem;
        }

        .note-meta-row {
          font-size: 0.58rem;
        }
        .note-author {
          font-weight: 700;
          color: #A96B42;
        }
        .note-time {
          color: #817B73;
        }

        .note-content {
          font-size: 0.7rem;
          line-height: 1.45;
          color: #F3EFE8;
          margin: 0;
        }

        .no-notes-state {
          text-align: center;
          padding: 1.25rem;
          font-size: 0.65rem;
          color: #817B73;
        }

        .anp-input-form {
          display: flex;
          flex-direction: column;
          gap: 0.45rem;
          padding-top: 0.5rem;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
        }

        .anp-textarea {
          width: 100%;
          background: #242321;
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 4px;
          padding: 0.45rem 0.65rem;
          font-family: inherit;
          font-size: 0.68rem;
          color: #F3EFE8;
          resize: vertical;
        }

        .author-tag {
          font-size: 0.58rem;
          color: #817B73;
        }

        .save-note-btn {
          background: #A96B42;
          color: #1D1C1A;
          border: 1px solid #A96B42;
          border-radius: 3px;
          font-family: inherit;
          font-size: 0.62rem;
          font-weight: 700;
          padding: 0.35rem 0.75rem;
          gap: 0.35rem;
          cursor: pointer;
        }
        .save-note-btn:hover:not(:disabled) {
          background: #C18A4A;
        }
        .save-note-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
