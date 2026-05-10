import { useState } from "react";
import { FINDING_STATUS } from "../../state/ValidationContext";

export default function DoctorReviewActions({ finding, onValidate, onFlag, onAddNote }) {
  const [noteOpen, setNoteOpen] = useState(false);
  const [noteText, setNoteText] = useState(finding?.notes || "");

  if (!finding) return null;

  const isVerified = finding.status === FINDING_STATUS.VERIFIED;
  const isFlagged = finding.status === FINDING_STATUS.FLAGGED;

  const handleSaveNote = () => {
    onAddNote?.(finding.id, noteText.trim());
    setNoteOpen(false);
  };

  return (
    <div className="dra-root">
      <div className="dra-row">
        <div className="dra-status">
          {isVerified && (
            <span className="dra-badge dra-verified">
              ✓ Verified by {finding.verifiedBy || "Clinician"}
              {finding.verifiedAt
                ? ` · ${new Date(finding.verifiedAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}`
                : ""}
            </span>
          )}
          {isFlagged && (
            <span className="dra-badge dra-flagged">⚠ Flagged for recheck</span>
          )}
          {!isVerified && !isFlagged && (
            <span className="dra-badge dra-pending">○ Pending Review</span>
          )}
        </div>

        <div className="dra-actions">
          <button
            type="button"
            className="dra-btn dra-btn-validate"
            onClick={() => onValidate?.(finding.id)}
            disabled={isVerified}
          >
            ✓ Validate
          </button>
          <button
            type="button"
            className="dra-btn dra-btn-flag"
            onClick={() => onFlag?.(finding.id)}
            disabled={isFlagged}
          >
            ⚠ Needs Review
          </button>
          <button
            type="button"
            className="dra-btn dra-btn-note"
            onClick={() => setNoteOpen((v) => !v)}
          >
            ✎ {finding.notes ? "Edit Note" : "Add Note"}
          </button>
        </div>
      </div>

      {noteOpen && (
        <div className="dra-note-edit">
          <textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Clinical note that will travel with this finding into the report..."
            rows={3}
          />
          <div className="dra-note-buttons">
            <button
              type="button"
              className="dra-btn dra-btn-secondary"
              onClick={() => {
                setNoteText(finding.notes || "");
                setNoteOpen(false);
              }}
            >
              Cancel
            </button>
            <button type="button" className="dra-btn dra-btn-validate" onClick={handleSaveNote}>
              Save
            </button>
          </div>
        </div>
      )}

      {!noteOpen && finding.notes && (
        <div className="dra-saved-note">
          <span className="dra-saved-note-label">Doctor note:</span>
          <span className="dra-saved-note-body">{finding.notes}</span>
        </div>
      )}
    </div>
  );
}
