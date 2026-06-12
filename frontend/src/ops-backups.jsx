import React, { useEffect, useState } from 'react';

export default function Backups() {
  const [backups, setBackups] = useState([]);

  useEffect(() => {
    fetch('/api/backups')
      .then(r => r.json())
      .then(data => setBackups(data.backups || []))
      .catch(() => setBackups([]));
  }, []);

  return (
    <div style={{ padding: 16 }}>
      <h2>Backups (scaffold)</h2>
      {backups.length === 0 ? (
        <p>No backups found. See docs/backup-restore.md for instructions.</p>
      ) : (
        <ul>
          {backups.map(b => (
            <li key={b.name}>
              {b.name} — {b.created_at || 'unknown'} — <a href={`/api/backups/${encodeURIComponent(b.name)}/download`} target="_blank" rel="noreferrer">Download</a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
