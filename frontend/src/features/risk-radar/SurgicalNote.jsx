export default function SurgicalNote({ note }) {
  if (!note) return null;
  return (
    <div className="rr-surgical-note">
      <div className="rr-note-label">Surgical Planning Context</div>
      <p className="rr-note-body">{note}</p>
    </div>
  );
}
